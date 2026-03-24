# Production-Grade Fix (Comprehensive)

Act as a senior production engineer.

You are applying a **production-grade fix**, not a patch.

## NON-NEGOTIABLE RULES
- Follow `.cursorrules`
- NO quick fixes or one-off conditionals
- Changes must be reusable, testable, and durable

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service-based

## REQUIRED STEPS

### 1. Root Cause Analysis
- Identify the true root cause (not just the symptom)
- Reference relevant workflow steps and agents

### 2. Fix Implementation
- Apply the fix cleanly
- Ensure it aligns with existing abstractions
- Avoid introducing special cases

### 3. Horizontal Scan
You MUST:
- Search for similar patterns across the codebase
- Identify other workflow steps or services that could fail the same way
- Propose fixes or safeguards where appropriate

### 4. Log & Runtime Validation
- Review Render MCP logs and runtime behavior
- Explain how logs confirm the fix works
- Identify any missing observability

### 5. Test Coverage
- Add or update tests that would have caught this issue
- Explicitly state what would fail if the bug regressed

## OUTPUT FORMAT (MANDATORY)
- Root Cause
- Fix Summary
- Related Risk Areas
- Tests Added / Updated
- Confidence Assessment
