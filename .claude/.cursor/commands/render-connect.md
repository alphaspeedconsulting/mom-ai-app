# Render Environment Connection

Connect to Render environments for health checks and debugging.

## PURPOSE
Provide quick reference for connecting to Render stage/prod environments using available MCP tools or fallback methods.

CONTEXT:
- Repo: {{repo}}
- Environment: (should be STAGE or PROD)

---

## ENVIRONMENT REFERENCE

### Stage Environment
- **Service ID (Backend)**: srv-d4irmder433s73a8aki0
- **Service ID (Frontend)**: srv-d4is21npm1nc73ct8dn0
- **App URL**: https://roofing-chatbot-stage.onrender.com
- **Health Endpoint**: https://roofing-chatbot-stage.onrender.com/health
- **Diagnostics**: https://roofing-chatbot-stage.onrender.com/health/diagnostics

### Production Environment
- **Service ID (Backend)**: srv-d4qtnmchg0os738h4q40
- **Service ID (Frontend)**: srv-d4qtoo49c44c73bjt5h0
- **App URL**: https://roofing-chatbot.onrender.com
- **Health Endpoint**: https://roofing-chatbot.onrender.com/health
- **Diagnostics**: https://roofing-chatbot.onrender.com/health/diagnostics

---

## MCP TOOL USAGE (PREFERRED METHOD)

If Render MCP is available, use these tools:

### Available Render MCP Tools
- `mcp__render__get_services` - List all services
- `mcp__render__get_service` - Get specific service details
- `mcp__render__list_logs` - Get service logs with filtering
- `mcp__render__get_metrics` - Get performance metrics
- `mcp__render__list_deploys` - Get deployment history
- `mcp__render__get_deploy` - Get specific deployment details

### Connection Pattern

1. **First, verify MCP is available:**
   ```
   List available MCP tools to confirm Render MCP is connected
   ```

2. **Get service information:**
   ```python
   mcp__render__get_service(
       serviceId="srv-d4irmder433s73a8aki0"  # or prod service ID
   )
   ```

3. **Get recent logs:**
   ```python
   mcp__render__list_logs(
       resource=["srv-d4irmder433s73a8aki0"],
       level=["error"],  # or type=["app"] for all logs
       limit=100
   )
   ```

4. **Get performance metrics:**
   ```python
   mcp__render__get_metrics(
       resourceId="srv-d4irmder433s73a8aki0",
       metricTypes=["cpu_usage", "memory_usage", "http_request_count"],
       startTime="2026-01-27T12:00:00Z"  # optional
   )
   ```

5. **Get deployment history:**
   ```python
   mcp__render__list_deploys(
       serviceId="srv-d4irmder433s73a8aki0",
       limit=5
   )
   ```

---

## FALLBACK METHODS (IF MCP NOT AVAILABLE)

### Method 1: WebFetch for Health Endpoints

```python
# Health check
WebFetch(
    url="https://roofing-chatbot-stage.onrender.com/health",
    prompt="Extract and summarize the health status"
)

# Detailed diagnostics
WebFetch(
    url="https://roofing-chatbot-stage.onrender.com/health/diagnostics",
    prompt="Extract database status, Gmail status, and any errors"
)
```

### Method 2: Bash with curl

```bash
# Health check
curl -s https://roofing-chatbot-stage.onrender.com/health | jq

# Detailed diagnostics
curl -s https://roofing-chatbot-stage.onrender.com/health/diagnostics | jq

# Pretty print specific sections
curl -s https://roofing-chatbot-stage.onrender.com/health/diagnostics | jq '.database'
```

### Method 3: Render Dashboard (Manual)

1. Go to https://dashboard.render.com/
2. Navigate to service (backend or frontend)
3. Use "Logs" tab for recent logs
4. Use "Metrics" tab for performance data
5. Use "Events" tab for deployment history

---

## COMMON TASKS

### Task 1: Check Deployment Status

**With MCP:**
```python
# Get recent deployments
deploys = mcp__render__list_deploys(
    serviceId="srv-d4irmder433s73a8aki0",
    limit=5
)

# Get specific deploy details
deploy = mcp__render__get_deploy(
    serviceId="srv-d4irmder433s73a8aki0",
    deployId="dep-xyz123"
)
```

**Without MCP:**
```bash
# Check health endpoint for version info
curl -s https://roofing-chatbot-stage.onrender.com/health | jq '.version'
```

### Task 2: Debug Production Issue

**With MCP (Recommended):**
```python
# 1. Get error logs
logs = mcp__render__list_logs(
    resource=["srv-d4qtnmchg0os738h4q40"],
    level=["error"],
    limit=100
)

# 2. Get performance metrics
metrics = mcp__render__get_metrics(
    resourceId="srv-d4qtnmchg0os738h4q40",
    metricTypes=["cpu_usage", "memory_usage", "http_request_count", "http_latency"]
)

# 3. Get recent deploys to check correlation
deploys = mcp__render__list_deploys(
    serviceId="srv-d4qtnmchg0os738h4q40",
    limit=3
)
```

**Without MCP:**
Use `/render-debug` command or manually check health/diagnostics endpoints.

### Task 3: Environment Comparison (Stage vs Prod)

**With MCP:**
```python
# Get both service details in parallel
stage_service = mcp__render__get_service(serviceId="srv-d4irmder433s73a8aki0")
prod_service = mcp__render__get_service(serviceId="srv-d4qtnmchg0os738h4q40")

# Compare configurations, versions, etc.
```

**Without MCP:**
```bash
# Compare health endpoints
diff <(curl -s https://roofing-chatbot-stage.onrender.com/health) \
     <(curl -s https://roofing-chatbot.onrender.com/health)
```

### Task 4: Monitor Specific Metric

**With MCP:**
```python
# Get CPU usage over time
metrics = mcp__render__get_metrics(
    resourceId="srv-d4irmder433s73a8aki0",
    metricTypes=["cpu_usage"],
    startTime="2026-01-27T12:00:00Z",
    endTime="2026-01-27T13:00:00Z",
    resolution=60  # 1-minute intervals
)
```

---

## TROUBLESHOOTING CONNECTION ISSUES

### Issue: MCP Tools Not Available

**Diagnosis:**
```
List available MCP tools - if Render tools not present, MCP server not connected
```

**Solutions:**
1. Check MCP configuration in Cursor settings
2. Verify Render MCP server is running
3. Fallback to WebFetch/Bash methods
4. Use Render Dashboard manually

### Issue: Health Endpoint Returns Error

**Diagnosis:**
```bash
curl -I https://roofing-chatbot-stage.onrender.com/health
```

**Possible Causes:**
- Service is down or restarting
- Recent failed deployment
- Database connection issues

**Next Steps:**
1. Check Render Dashboard for service status
2. Check recent deployment logs
3. Use `/render-debug` for comprehensive analysis

### Issue: Authentication/Permission Errors

**Diagnosis:**
MCP tools return authentication errors

**Solutions:**
1. Verify Render API key in MCP configuration
2. Check API key has necessary permissions
3. Use Render Dashboard as alternative

---

## BEST PRACTICES

### ✅ DO
- Use MCP tools when available (faster, more reliable)
- Specify environment (STAGE/PROD) explicitly
- Check health endpoints before investigating issues
- Use structured logging (jq) for JSON responses
- Document service IDs in any scripts

### ❌ DON'T
- Make changes to production without approval
- Query logs excessively (use appropriate time ranges)
- Assume stage and prod are identical
- Skip verification of environment before commands

---

## RELATED COMMANDS

- `/render-env-health-check` - Quick operational health check
- `/render-debug` - Comprehensive debugging with full telemetry
- `/production-fix` - Fix production issues with comprehensive review

---

## QUICK REFERENCE CARD

```
STAGE Backend:  srv-d4irmder433s73a8aki0
PROD Backend:   srv-d4qtnmchg0os738h4q40

Health:   https://[app-url]/health
Diag:     https://[app-url]/health/diagnostics

MCP Tools:
  get_service, list_logs, get_metrics, list_deploys

Fallback:
  curl + jq, WebFetch, Render Dashboard
```

---

## EXAMPLES

### Example 1: Quick Health Check (Stage)

```bash
curl -s https://roofing-chatbot-stage.onrender.com/health | jq '{status, database, gmail}'
```

### Example 2: Find Recent Errors (Prod with MCP)

```python
mcp__render__list_logs(
    resource=["srv-d4qtnmchg0os738h4q40"],
    level=["error"],
    startTime="2026-01-27T12:00:00Z",
    limit=50
)
```

### Example 3: Compare CPU Usage (Stage vs Prod)

```python
# Stage CPU
stage_cpu = mcp__render__get_metrics(
    resourceId="srv-d4irmder433s73a8aki0",
    metricTypes=["cpu_usage"],
    startTime="2026-01-27T12:00:00Z"
)

# Prod CPU
prod_cpu = mcp__render__get_metrics(
    resourceId="srv-d4qtnmchg0os738h4q40",
    metricTypes=["cpu_usage"],
    startTime="2026-01-27T12:00:00Z"
)
```
