# Agent Debug (LangGraph / Tooling Root Cause)

Act as a LangGraph debugging expert for this repository.

GOALS:
- Diagnose agent failures systematically (prompt vs tools vs state vs workflow)
- Produce the smallest safe fix that preserves architecture boundaries
- Provide verification steps and regression checks

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service Layer + Workflow Engine + LangGraph
- Standards: Follow `.cursorrules` strictly (no quick fixes, no placeholder error handling)

REQUIREMENTS:
1. Describe the observed behavior vs expected behavior.
2. Identify the failing layer:
   - Prompt / tool calling conditions
   - Tool input schema mismatch
   - Tool implementation returning malformed structured dict
   - State/checkpointing issues (thread_id, persistence)
   - Workflow step transitions / state persistence / DB locking
3. Inspect likely evidence sources (as applicable):
   - LangSmith traces (if enabled)
   - Application logs
   - Tool return payloads
4. Propose a targeted fix:
   - If prompt: tighten tool-use triggers, add examples, reduce ambiguity
   - If tool: ensure async + Pydantic input (`extra='forbid'`) + structured return + never raise
   - If workflow: move business logic into workflow step/service; add retries/backoff
5. Provide tests to prevent recurrence:
   - Unit tests for tool contract and error returns
   - Agent wiring tests where appropriate (ensuring the right prompt loader is used)

OUTPUT:
- Root Cause
- Evidence
- Fix (minimal diff description)
- Tests to Add/Update
- Verification Steps
- Regression Scan Checklist

