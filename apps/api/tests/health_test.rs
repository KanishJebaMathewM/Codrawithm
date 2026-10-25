#[test]
fn test_health_response_structure() {
    let response_json = serde_json::json!({
        "status": "ok",
        "service": "codrawithm-api"
    });

    assert_eq!(response_json["status"], "ok");
    assert_eq!(response_json["service"], "codrawithm-api");
}
