#[test]
fn test_migrations_exist() {
    let migration_files = [
        "0001_initial.sql",
        "0002_assets.sql",
        "0003_comments.sql",
        "0004_snapshots.sql",
        "0005_plugins.sql",
        "0006_ai_audit.sql",
    ];

    for file in migration_files {
        let path = std::path::Path::new("migrations").join(file);
        assert!(
            path.exists(),
            "Migration file {} must exist in migrations directory",
            file
        );
    }
}
