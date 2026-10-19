import { collaborators } from '../../lib/mock-data';
import type { Collaborator } from '../../types';

export interface CollaborationAdapter {
  getPresence(): Collaborator[];
  connect(boardId: string): Promise<void>;
  disconnect(): Promise<void>;
}

export const localPresenceAdapter: CollaborationAdapter = {
  getPresence: () => collaborators,
  connect: async () => undefined,
  disconnect: async () => undefined,
};

// Future integration point: create a Y.Doc, attach a WebsocketProvider,
// expose awareness cursors, and map shared objects into the canvas store.
