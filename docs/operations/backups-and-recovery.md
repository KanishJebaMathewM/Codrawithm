# Backups and Recovery

**Status:** Proposed  
**Audience:** Engineers, DevOps  
**Last Reviewed:** 2024-01-15

## Overview

Data loss is unacceptable. This document defines the backup strategy, recovery procedures, and recovery time objectives for Codrawithm's production data.

---

## What Needs Backing Up

| Data | Storage | Backup Method |
|------|---------|--------------|
| PostgreSQL database | VPS / Managed DB | Automated daily dumps + WAL archiving |
| User-uploaded assets | S3-compatible storage | S3 versioning + cross-region replication |
| Redis cache | Redis (in-memory) | Not backed up — reconstructable from DB |
| Yjs document state | PostgreSQL (BYTEA) | Covered by PostgreSQL backup |
| Environment secrets | Secrets manager | Platform-level backup (e.g. AWS Secrets Manager) |

---

## PostgreSQL Backup Strategy

### Automated Daily Dumps

```bash
#!/bin/bash
# backup-postgres.sh — run via cron: 0 2 * * *

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="codrawithm_${TIMESTAMP}.sql.gz"
S3_BUCKET="codrawithm-backups"

# Dump and compress
pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE

# Upload to S3
aws s3 cp /tmp/$BACKUP_FILE s3://${S3_BUCKET}/postgres/${BACKUP_FILE}

# Cleanup local file
rm /tmp/$BACKUP_FILE

# Delete backups older than 90 days
aws s3 ls s3://${S3_BUCKET}/postgres/ | \
  awk '{print $4}' | \
  while read key; do
    # Delete if older than 90 days
    ...
  done
```

### Backup Schedule

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Full dump | Daily (02:00 UTC) | 90 days |
| Weekly snapshot | Weekly (Sunday 03:00 UTC) | 1 year |

### Managed Database (Recommended for Production)

When using a managed PostgreSQL service (Supabase, Neon, RDS), enable:
- Automated daily backups (provided by platform)
- Point-in-time recovery (PITR) — restores to any second within the retention window
- Multi-AZ replication for high availability

---

## Asset Backup Strategy

User-uploaded images and files stored in S3-compatible storage:

1. **Versioning:** Enable S3 versioning on the assets bucket — deleted files are soft-deleted, recoverable for 30 days
2. **Cross-region replication:** Replicate the assets bucket to a second region (configured in S3 settings)
3. **Lifecycle policy:** Move old versions to cheaper storage (S3 Glacier) after 30 days

---

## Recovery Procedures

### Restore PostgreSQL from Backup

```bash
# 1. Stop the API to prevent writes during restore
docker compose stop api

# 2. Download the backup
aws s3 cp s3://codrawithm-backups/postgres/codrawithm_20240115_020000.sql.gz /tmp/

# 3. Drop and recreate the database
psql $DATABASE_URL -c "DROP DATABASE codrawithm;"
psql $DATABASE_URL -c "CREATE DATABASE codrawithm;"

# 4. Restore
gunzip -c /tmp/codrawithm_20240115_020000.sql.gz | psql $DATABASE_URL

# 5. Run any pending migrations
sqlx migrate run

# 6. Restart the API
docker compose start api

# 7. Verify health
curl https://api.codrawithm.dev/health/ready
```

### Restore a Single Board (Board-Level Recovery)

The `board_updates` table stores incremental Yjs updates. To restore a board to an earlier state:

1. Query updates before the target timestamp:
```sql
SELECT update_data FROM board_updates
WHERE board_id = $1 AND created_at <= $2
ORDER BY created_at ASC;
```

2. Reconstruct the Yjs document by applying updates in order
3. Write the reconstructed state to `board_documents`

This is surfaced to users as "Version History" in the product.

---

## Recovery Time Objectives

| Scenario | RTO Target | RPO Target |
|----------|-----------|-----------|
| Full database restore | < 2 hours | < 24 hours (daily backup) |
| Single board restore | < 5 minutes | < 5 minutes (continuous updates) |
| Asset restore | < 30 minutes | Near-zero (S3 versioning) |
| Full service restore after VPS failure | < 4 hours | < 24 hours |

> These are targets for planning purposes. Actual values depend on database size, infrastructure, and team availability at time of incident.

---

## Backup Verification

Backups are only useful if they restore correctly. Monthly verification process:

1. Restore the most recent backup to a staging environment
2. Run a smoke test: check row counts, verify a sample of boards load correctly
3. Document the verification result and restoration time
4. Alert if the backup is corrupt or restoration fails

---

## Related Documents

- [Deployment](./deployment.md)
- [Incident Response](./incident-response.md)
- [Database Migrations](./database-migrations.md)
