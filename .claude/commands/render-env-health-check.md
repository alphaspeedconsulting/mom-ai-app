# Render Environment Health Check (Live Analysis)

Act as a senior production reliability engineer performing a **live environment health check**
for our Render deployment.

The system is already deployed and live.
Your task is to **assess operational health**, not to deploy or change code.

CONTEXT:
- Environment: $ARGUMENTS (specify STAGE or PROD)
- MCP tools available for log analysis (if configured)
- Rules: Read `CLAUDE.md` for project standards

## ENVIRONMENT (MANDATORY)

You MUST first determine which environment is being reviewed:
- **STAGE**
- **PROD**

Explicitly state the environment at the top of your response.
If it is ambiguous, STOP and ask for clarification.

---

## HARD RULES (NON-NEGOTIABLE)

- READ-ONLY analysis only
- DO NOT suggest redeploys unless explicitly required
- DO NOT propose speculative refactors
- Focus on runtime behavior, logs, and patterns
- Treat PROD issues as SEVERITY-1 if user-facing or cost-amplifying

---

## INPUT CONTEXT
You may use:
- Render MCP logs (if available)
- Application logs
- Error traces
- Repo context (pollers, workers, cron jobs, agents)
- Known workflow and agent behavior

---

## HEALTH CHECK AREAS (MANDATORY)

### 1. Deployment & Process Health
Verify:
- Services are running and stable
- No crash loops or frequent restarts
- No abnormal memory or CPU churn inferred from logs
- Correct services running for the selected environment

---

### 2. Database Health (CRITICAL)
Inspect database connection health via `/api/troubleshooting/database-health`:
- **Total connections** - Monitor connection pool usage
- **Idle connections** - Normal idle connections
- **Idle in transaction** (CRITICAL - should be 0) - Indicates connection leaks or uncommitted transactions blocking operations
- **Waiting on locks** (CRITICAL - should be 0) - Queries blocked by locks, can cause deadlocks
- **Long-running queries** (> 60 seconds) - Queries that may be blocking other operations

Flag:
- Any `idle_in_transaction` connections (SEV-1) - Can block workflow operations
- Any `waiting_on_lock` connections (SEV-1) - Indicates deadlock risk
- Long-running queries (SEV-2) - May indicate performance issues
- Connection pool exhaustion (SEV-2) - Too many connections

Explicitly identify:
- Problematic connection PIDs
- Query text causing issues
- Duration of problematic states
- Which operations may be blocked

---

### 3. Pub/Sub Health
Inspect:
- Subscription processing frequency
- Message ACK behavior
- Re-delivery or retry storms
- Dead-letter or poison-message patterns

Flag:
- Messages processed repeatedly
- Same payload reappearing
- Missing idempotency protection

---

### 4. Polling & Background Jobs
Inspect:
- Polling intervals
- Evidence of tight loops or runaway polling
- Jobs executing more frequently than designed
- Jobs that never complete or constantly reschedule

Explicitly identify:
- Which pollers/jobs
- Expected vs observed behavior

---

### 5. Error Patterns & Signals
Analyze:
- Error frequency and clustering
- Repeated stack traces
- Silent failures masked by retries
- Missing `exc_info=True` where errors occur

Classify errors as:
- Transient
- Persistent
- Escalating

---

### 6. LLM Call Behavior (CRITICAL)
Inspect for:
- Repeated identical prompts
- Retry loops without backoff
- Same workflow step triggering LLM calls repeatedly
- Cost-amplifying patterns

Explicitly call out:
- Which workflows / agents
- Which steps
- Why repetition is happening (if evident)

---

### 7. Environment-Specific Drift (Stage vs Prod)
Verify:
- Config differences that could affect behavior
- Feature flags
- Queue/subscription names
- Credentials or limits

Highlight:
- Issues present in PROD but not STAGE
- Issues masked in STAGE

---

## SEVERITY CLASSIFICATION (MANDATORY)

For each issue found, assign:
- **SEV-1**: User-facing, data corruption, infinite loops, or runaway cost
- **SEV-2**: Degraded performance, delayed processing
- **SEV-3**: No immediate impact but concerning signals

---

## OUTPUT FORMAT (MANDATORY)

### Environment
- STAGE or PROD

### Overall Health Status
- **Healthy**
- **Degraded**
- **Unstable**
- **Critical**

### Findings by Area
#### Deployment
#### Database
#### Pub/Sub
#### Polling & Jobs
#### Errors
#### LLM Calls

(Each finding must include evidence from logs or behavior)

---

### High-Risk Patterns Detected
- Infinite loops
- Duplicate processing
- Cost amplification
- Silent retries

---

### Immediate Actions (If Any)
- MUST be minimal and safe
- No speculative changes
- PROD-safe only

---

### Monitoring Gaps
- Missing logs
- Missing metrics
- Missing alerts

---

### Confidence Level
- High / Medium / Low
