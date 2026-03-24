# Render Debug (Comprehensive Production Debugging)

Act as a **senior production reliability engineer** performing comprehensive debugging
of the Render deployment using live telemetry data.

CONTEXT:
- Environment: (MUST be STAGE or PROD)
- Repo: {{repo}}
- MCP tools available for logs, metrics, deployments, and health checks
- Rules: Read `CLAUDE.md` for project standards

## ENVIRONMENT (MANDATORY)

You MUST first determine which environment is being debugged:
- **STAGE**: srv-d4irmder433s73a8aki0 (backend), srv-d4is21npm1nc73ct8dn0 (frontend)
- **PROD**: srv-d4qtnmchg0os738h4q40 (backend), srv-d4qtoo49c44c73bjt5h0 (frontend)

Explicitly state the environment at the top of your response.
If not provided or ambiguous, STOP and ask for clarification.

---

## HARD RULES (NON-NEGOTIABLE)

- READ-ONLY analysis - do NOT make changes
- Use Render MCP tools to gather ALL data
- Prioritize ERRORS and ANOMALIES
- Focus on user-facing impact and cost implications
- Treat PROD issues as SEVERITY-1 by default
- Be specific: include log timestamps, IDs, stack traces
- NO speculative fixes - only data-driven recommendations

---

## EXECUTION WORKFLOW (MANDATORY STEPS)

### STEP 1: Gather Telemetry Data (Use MCP Tools)

**IMPORTANT:** Execute ALL of these MCP queries in parallel for efficiency.

#### 1.1 Recent Logs (Prioritize Errors)
```python
# Get error logs first
mcp__render__list_logs(
    resource=["<backend-service-id>"],
    level=["error"],
    limit=100
)

# Then get recent application logs
mcp__render__list_logs(
    resource=["<backend-service-id>"],
    type=["app"],
    limit=100
)
```

#### 1.2 Performance Metrics (Last Hour)
```python
mcp__render__get_metrics(
    resourceId="<backend-service-id>",
    metricTypes=["cpu_usage", "memory_usage", "instance_count",
                 "http_request_count", "http_latency"],
    httpLatencyQuantile=0.95
)
```

#### 1.3 Recent Deployments
```python
mcp__render__list_deploys(
    serviceId="<backend-service-id>",
    limit=5
)
```

#### 1.4 Service Status
```python
mcp__render__get_service(
    serviceId="<backend-service-id>"
)
```

---

### STEP 2: Analyze Data for Issues

#### 2.1 Error Analysis
- **Error frequency:** Count unique errors vs total errors
- **Error clustering:** Are errors happening in bursts or steady-state?
- **Error types:** Classification by exception type, workflow, or component
- **New vs recurring:** Compare recent errors to historical patterns
- **User impact:** Which workflows/features are affected?

Flag patterns like:
- Repeated identical errors (potential infinite loop)
- Error rate spikes (deployment issue?)
- Silent failures (errors without proper logging)
- Cascading failures (one error triggering many)

#### 2.2 Performance Analysis
- **CPU usage:** Is it spiking? Sustained high usage?
- **Memory usage:** Growing over time? Memory leak?
- **Request volume:** Normal or unusual?
- **Latency:** p95 > 2s? Increasing trend?
- **Instance count:** Autoscaling behavior normal?

Flag patterns like:
- CPU/Memory approaching limits
- Latency degradation over time
- Request failures (5xx status codes)
- Instance thrashing (rapid scaling up/down)

#### 2.3 Deployment Analysis
- **Recent deploy status:** Successful? Failed? In progress?
- **Deploy correlation:** Do errors coincide with recent deployments?
- **Build issues:** Any build failures or warnings?
- **Rollback needed:** Is current deploy causing issues?

#### 2.4 Workflow & Email Analysis
Look for:
- Draft sync failures
- Gmail API errors or rate limits
- Workflow advancement issues
- Database connection errors
- LLM call failures or retry loops
- Idempotency violations

---

### STEP 3: Health Check Integration

Run application health endpoints (if accessible):
```bash
curl https://<service-url>/health
curl https://<service-url>/health/diagnostics
```

Check:
- Database connectivity
- Gmail API status
- OpenAI configuration
- Background job status

---

### STEP 4: Root Cause Hypothesis

Based on gathered data, formulate hypotheses:
1. **Most likely cause** (with evidence)
2. **Alternative explanations** (if data is ambiguous)
3. **Missing data** (what would confirm/disprove hypothesis)

---

## OUTPUT FORMAT (MANDATORY)

### Environment
- STAGE or PROD
- Service IDs: (list all services checked)
- Time Range: (specify exact timestamps of analysis)

---

### Executive Summary
**Status:** HEALTHY | DEGRADED | UNSTABLE | CRITICAL

**TL;DR:** One-sentence summary of findings.

**User Impact:** Are users affected? If yes, how?

**Immediate Action Required:** YES/NO (with specific action if YES)

---

### Findings

#### 🔴 Critical Issues (SEV-1)
- User-facing failures
- Data corruption risk
- Infinite loops or runaway costs
- Service outages

For each:
- **Issue:** Brief description
- **Evidence:** Specific log entries, metrics, timestamps
- **Impact:** User-facing or cost impact
- **Recommended Action:** Specific, minimal, safe action

---

#### 🟡 Warnings (SEV-2)
- Performance degradation
- Elevated error rates (not user-facing)
- Resource usage trends
- Delayed processing

For each:
- **Issue:** Brief description
- **Evidence:** Specific data points
- **Impact:** Operational impact
- **Recommended Action:** Monitoring or preventive action

---

#### 🟢 Informational (SEV-3)
- Normal operational patterns
- Expected behaviors
- Baseline metrics

---

### Detailed Analysis

#### Error Log Analysis
**Total Errors:** X in last hour
**Unique Errors:** Y distinct error types
**Top 3 Errors:**
1. [Error type] - [Count] occurrences
   - First seen: [timestamp]
   - Last seen: [timestamp]
   - Example stack trace: ```[stack trace]```
   - Affected workflows/projects: [IDs]
   - Root cause hypothesis: [analysis]

#### Performance Metrics
**CPU Usage:** [avg/max/current]%
**Memory Usage:** [avg/max/current] MB
**Request Rate:** [requests/min]
**P95 Latency:** [ms]
**Instance Count:** [count]

**Trends:**
- [Metric] is [increasing/decreasing/stable]
- [Notable patterns or anomalies]

#### Deployment Status
**Latest Deploy:**
- ID: [deploy-id]
- Status: [status]
- Started: [timestamp]
- Duration: [duration]
- Commit: [commit hash/message]

**Deploy Correlation:**
- [Any issues correlating with recent deployments]

#### Workflow Health
Based on logs:
- Draft sync: [OK/ISSUES]
- Gmail integration: [OK/ISSUES]
- Workflow advancement: [OK/ISSUES]
- Database operations: [OK/ISSUES]
- LLM calls: [OK/ISSUES]

---

### Root Cause Analysis

**Primary Hypothesis:**
[Most likely root cause based on evidence]

**Supporting Evidence:**
- [Data point 1]
- [Data point 2]
- [Data point 3]

**Alternative Hypotheses:**
- [Other possible causes if evidence is ambiguous]

**Confidence Level:** HIGH | MEDIUM | LOW

---

### Recommendations

#### Immediate Actions (if any)
1. [Specific action] - [Justification]
2. [Specific action] - [Justification]

**Safety:** All actions are PROD-safe and read-only OR minimal impact

#### Follow-up Actions
1. [Investigation or monitoring tasks]
2. [Long-term improvements]

#### Monitoring Gaps Identified
- [Missing logs or metrics]
- [Blind spots in observability]

---

### Cost & Performance Optimization Opportunities
- [Any patterns suggesting cost reduction opportunities]
- [Performance optimization recommendations]

---

### Next Steps
If issues require code changes:
1. Use `/production-fix` for critical issues
2. Use `/enhancement-plan` for non-critical improvements
3. Update monitoring/alerting if gaps identified

---

## EXAMPLES OF GOOD VS BAD OUTPUT

### ❌ BAD
"There are some errors in the logs. You should fix them."

### ✅ GOOD
"**SEV-1: Infinite loop in draft sync**
- **Evidence:** Draft 704 processed 47 times in last hour (logs show identical workflow_instance_id=204 with draft_id=704 from 02:15:00Z to 03:02:00Z)
- **Impact:** $12 in LLM costs, blocking workflow advancement for project 161
- **Root Cause:** Idempotency check failing - draft marked as sent but workflow not advancing
- **Action:** Investigate idempotency logic in `backend/workflows/draft_sync.py:142`"

---

## REMEMBER

- Use MCP tools to gather ALL data first
- Be specific with evidence (timestamps, IDs, counts)
- Focus on user impact and cost
- Classify severity accurately
- Provide actionable recommendations
- No speculation - only data-driven analysis
