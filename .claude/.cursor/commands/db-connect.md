# Database Connection Patterns

Connect to production PostgreSQL for debugging.

## PURPOSE
Provide patterns and best practices for connecting to Render PostgreSQL databases for debugging and analysis.

CONTEXT:
- Repo: {{repo}}
- Environment: (should be STAGE or PROD)

---

## ⚠️ SAFETY RULES (NON-NEGOTIABLE)

### READ-ONLY First
- **NEVER** run UPDATE/DELETE without WHERE clause
- **ALWAYS** use transactions for modifications
- **PREFER** read-only queries for debugging
- **LOG** any data modifications made
- **TEST** modifications in STAGE before PROD

### Production Database Access
- Require explicit approval for PROD access
- Document reason for database access
- Limit session duration to investigation time
- Use read-only user when possible

---

## CONNECTION METHODS

### Method 1: Render MCP Query Tool (Recommended)

If Render MCP with postgres query support is available:

```python
# Read-only query via MCP
mcp__render__query_render_postgres(
    postgresId="<postgres-instance-id>",
    sql="SELECT id, status, current_step FROM workflow_instances WHERE project_id = 123 ORDER BY updated_at DESC LIMIT 10"
)
```

**Benefits:**
- Read-only by default
- Automatic connection management
- No local setup required

### Method 2: Render Dashboard Connection

1. Go to Render Dashboard: https://dashboard.render.com/
2. Navigate to Postgres database service
3. Click "Connect" > "External Connection"
4. Copy connection string
5. Use with `psql` or database client:

```bash
psql "<connection-string-from-dashboard>"
```

**Connection String Format:**
```
postgresql://user:password@host:port/database
```

### Method 3: SSH Tunnel (Advanced)

**Note:** Requires bastion host or jump server if configured.

```bash
# Step 1: Create SSH tunnel
ssh -L 5433:db-host:5432 user@bastion-host

# Step 2: Connect via tunnel
psql postgresql://user:password@localhost:5433/database
```

### Method 4: Application Shell (Limited)

From Render Dashboard:
1. Go to Web Service
2. Click "Shell" tab
3. Run database query via application code:

```bash
python -c "from backend.database import get_db_url; print(get_db_url())"
```

**Note:** Limited to queries that can be executed via shell commands.

---

## COMMON DEBUG QUERIES

### Query 1: Check Workflow State

```sql
-- Get recent workflow instances for a project
SELECT
    id,
    project_id,
    workflow_id,
    current_step,
    status,
    created_at,
    updated_at
FROM workflow_instances
WHERE project_id = <PROJECT_ID>
ORDER BY updated_at DESC
LIMIT 10;
```

### Query 2: Check Pending Items

```sql
-- Get pending items for a project
SELECT
    id,
    project_id,
    step,
    status,
    metadata,
    created_at
FROM pending_items
WHERE project_id = <PROJECT_ID>
ORDER BY created_at DESC;
```

### Query 3: Check Email Drafts

```sql
-- Get email drafts for a project
SELECT
    id,
    project_id,
    step_number,
    status,
    subject,
    created_at,
    updated_at,
    sent_at
FROM email_drafts
WHERE project_id = <PROJECT_ID>
ORDER BY created_at DESC;
```

### Query 4: Check Work Items

```sql
-- Get work items with metadata
SELECT
    id,
    project_id,
    work_type,
    status,
    meta_data,
    created_at,
    updated_at
FROM project_work_items
WHERE project_id = <PROJECT_ID>;
```

### Query 5: Find Projects by Email

```sql
-- Find projects by customer email
SELECT
    id,
    name,
    customer_email,
    status,
    created_at
FROM projects
WHERE customer_email = '<EMAIL>'
ORDER BY created_at DESC;
```

### Query 6: Analyze Workflow Step Distribution

```sql
-- Count projects by workflow step
SELECT
    current_step,
    COUNT(*) as count
FROM workflow_instances
WHERE workflow_id = <WORKFLOW_ID>
    AND status = 'active'
GROUP BY current_step
ORDER BY current_step;
```

### Query 7: Find Stuck Workflows

```sql
-- Find workflows stuck for > 7 days
SELECT
    wi.id,
    wi.project_id,
    wi.workflow_id,
    wi.current_step,
    wi.status,
    wi.updated_at,
    EXTRACT(epoch FROM (NOW() - wi.updated_at))/86400 as days_stuck
FROM workflow_instances wi
WHERE wi.status = 'active'
    AND wi.updated_at < NOW() - INTERVAL '7 days'
ORDER BY wi.updated_at ASC
LIMIT 20;
```

### Query 8: Check Email Thread Associations

```sql
-- Check email threads for a project
SELECT
    id,
    gmail_thread_id,
    subject,
    created_at
FROM email_threads
WHERE project_id = <PROJECT_ID>
ORDER BY created_at DESC;
```

---

## SAFE MODIFICATION PATTERNS

### Pattern 1: Update with Transaction

```sql
-- Start transaction
BEGIN;

-- Check current state
SELECT id, status, current_step
FROM workflow_instances
WHERE id = <INSTANCE_ID>;

-- Make modification
UPDATE workflow_instances
SET current_step = '<NEW_STEP>',
    updated_at = NOW()
WHERE id = <INSTANCE_ID>;

-- Verify change
SELECT id, status, current_step
FROM workflow_instances
WHERE id = <INSTANCE_ID>;

-- Commit if correct, ROLLBACK if wrong
COMMIT;
-- Or: ROLLBACK;
```

### Pattern 2: Conditional Update

```sql
-- Only update if condition met
UPDATE workflow_instances
SET status = 'active'
WHERE id = <INSTANCE_ID>
    AND status = 'paused'  -- Safety: only update if currently paused
RETURNING id, status, updated_at;
```

### Pattern 3: Safe Delete with Backup

```sql
-- First, backup the record
CREATE TEMP TABLE backup_drafts AS
SELECT * FROM email_drafts WHERE id = <DRAFT_ID>;

-- Then delete
DELETE FROM email_drafts WHERE id = <DRAFT_ID>;

-- Verify backup exists
SELECT * FROM backup_drafts;

-- To restore (if needed):
-- INSERT INTO email_drafts SELECT * FROM backup_drafts;
```

---

## TROUBLESHOOTING

### Issue: Connection Timeout

**Diagnosis:**
```bash
# Test connection
psql "<connection-string>" -c "SELECT 1"
```

**Possible Causes:**
- Database is restarting
- Connection string is incorrect
- Firewall blocking connection

**Solutions:**
1. Verify connection string from Render Dashboard
2. Check database status in Render Dashboard
3. Try Render MCP method instead

### Issue: Permission Denied

**Diagnosis:**
```sql
SELECT current_user, session_user;
```

**Possible Causes:**
- User doesn't have necessary permissions
- Read-only user trying to modify data

**Solutions:**
1. Verify user permissions
2. Use appropriate user for operation
3. Request elevated access if needed

### Issue: Query Too Slow

**Diagnosis:**
```sql
EXPLAIN ANALYZE <your-query>;
```

**Optimizations:**
1. Add WHERE clause to limit rows
2. Add appropriate indexes
3. Use LIMIT for exploration queries
4. Query specific columns, not SELECT *

---

## BEST PRACTICES

### ✅ DO
- Start with SELECT queries to understand data
- Use transactions for modifications
- Test queries in STAGE first
- Document queries and results
- Use LIMIT for exploratory queries
- Verify changes before committing

### ❌ DON'T
- Run UPDATE/DELETE without WHERE
- Modify PROD without testing in STAGE
- Leave long-running transactions open
- Share database credentials
- Run expensive queries during peak hours
- Assume schema matches expectations

---

## DATABASE SCHEMA QUICK REFERENCE

### Key Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `projects` | Customer projects | id, customer_email, status |
| `workflow_instances` | Workflow state | id, project_id, workflow_id, current_step, status |
| `pending_items` | User actions required | id, project_id, step, status |
| `email_drafts` | Gmail drafts | id, project_id, step_number, status, sent_at |
| `project_work_items` | Work items (measurements, installs) | id, project_id, work_type, meta_data |
| `email_threads` | Gmail thread tracking | id, project_id, gmail_thread_id |

### Common Joins

```sql
-- Project with workflow state
SELECT
    p.id,
    p.customer_email,
    wi.current_step,
    wi.status as workflow_status
FROM projects p
LEFT JOIN workflow_instances wi ON wi.project_id = p.id
WHERE p.id = <PROJECT_ID>;

-- Project with pending items
SELECT
    p.id,
    p.customer_email,
    pi.step,
    pi.status as pending_status
FROM projects p
LEFT JOIN pending_items pi ON pi.project_id = p.id
WHERE p.id = <PROJECT_ID>;
```

---

## ENVIRONMENT-SPECIFIC NOTES

### STAGE Database
- **Purpose**: Testing and debugging
- **Safety**: More permissive for experimentation
- **Data**: May contain test data

### PROD Database
- **Purpose**: Live customer data
- **Safety**: Maximum caution required
- **Data**: Real customer information (PII concerns)

---

## RELATED COMMANDS

- `/render-connect` - Environment connection patterns
- `/render-debug` - Comprehensive production debugging
- `/production-fix` - Fix production issues

---

## QUICK REFERENCE CARD

```
Connection Methods:
1. Render MCP (mcp__render__query_render_postgres)
2. Render Dashboard > Connect
3. SSH Tunnel (if bastion available)

Safety:
- READ-ONLY first
- Use transactions
- WHERE clause mandatory for UPDATE/DELETE
- Test in STAGE first

Common Tables:
- projects
- workflow_instances
- pending_items
- email_drafts
- project_work_items
```

---

## EXAMPLES

### Example 1: Debug Stuck Project

```sql
-- Check project state
SELECT * FROM projects WHERE id = 123;

-- Check workflow instance
SELECT * FROM workflow_instances WHERE project_id = 123;

-- Check pending items
SELECT * FROM pending_items WHERE project_id = 123;

-- Check email drafts
SELECT * FROM email_drafts WHERE project_id = 123 ORDER BY created_at DESC;
```

### Example 2: Fix Draft Status (With Safety)

```sql
BEGIN;

-- Check current state
SELECT id, status, step_number FROM email_drafts WHERE id = 456;

-- Update status
UPDATE email_drafts
SET status = 'sent',
    sent_at = NOW()
WHERE id = 456
    AND status = 'pending';  -- Only if currently pending

-- Verify
SELECT id, status, step_number, sent_at FROM email_drafts WHERE id = 456;

COMMIT;
```

### Example 3: Investigate Email Thread Issue

```sql
-- Find all threads for project
SELECT
    et.id,
    et.gmail_thread_id,
    et.subject,
    ed.id as draft_id,
    ed.status as draft_status
FROM email_threads et
LEFT JOIN email_drafts ed ON ed.project_id = et.project_id
WHERE et.project_id = 123
ORDER BY et.created_at DESC;
```
