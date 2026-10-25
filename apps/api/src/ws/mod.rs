use crate::middleware::AppState;
use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tokio::sync::broadcast;
use uuid::Uuid;

type RoomMap = Arc<Mutex<HashMap<Uuid, broadcast::Sender<Message>>>>;

#[derive(Clone)]
pub struct WsManager {
    rooms: RoomMap,
}

impl WsManager {
    pub fn new() -> Self {
        Self {
            rooms: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn get_or_create_room(&self, board_id: Uuid) -> broadcast::Sender<Message> {
        let mut rooms = self.rooms.lock().unwrap();
        rooms
            .entry(board_id)
            .or_insert_with(|| {
                let (tx, _rx) = broadcast::channel(100);
                tx
            })
            .clone()
    }
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Path(board_id): Path<Uuid>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, board_id, state))
}

async fn handle_socket(socket: WebSocket, board_id: Uuid, state: AppState) {
    let (mut sender, mut receiver) = socket.split();

    // Send initial board CRDT state to the client
    let initial_state: Option<(Vec<u8>,)> = sqlx::query_as(
        "SELECT crdt_state FROM board_states WHERE board_id = $1"
    )
    .bind(board_id)
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None);

    if let Some((crdt_bytes,)) = initial_state {
        if !crdt_bytes.is_empty() {
            let _ = sender.send(Message::Binary(crdt_bytes)).await;
        }
    }

    // Connect to room broadcast channel
    let static_manager = get_ws_manager().get_or_create_room(board_id);
    let mut rx = static_manager.subscribe();
    let tx = static_manager.clone();

    // Spawn task to forward broadcast messages to this client
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // Spawn task to receive messages from client and broadcast to other peers
    let pool = state.pool.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match &msg {
                Message::Binary(bin) => {
                    // Save latest binary state to database
                    let _ = sqlx::query(
                        r#"
                        UPDATE board_states
                        SET crdt_state = $1, version = version + 1, updated_at = now()
                        WHERE board_id = $2
                        "#,
                    )
                    .bind(bin)
                    .bind(board_id)
                    .execute(&pool)
                    .await;

                    // Broadcast to other peers in room
                    let _ = tx.send(msg);
                }
                Message::Text(_) => {
                    // Broadcast cursor / awareness text message
                    let _ = tx.send(msg);
                }
                Message::Ping(p) => {
                    let _ = tx.send(Message::Pong(p.clone()));
                }
                Message::Close(_) => {
                    break;
                }
                _ => {}
            }
        }
    });

    // Wait until either sending or receiving fails/completes
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}

static WS_MANAGER: std::sync::OnceLock<WsManager> = std::sync::OnceLock::new();

fn get_ws_manager() -> &'static WsManager {
    WS_MANAGER.get_or_init(WsManager::new)
}

