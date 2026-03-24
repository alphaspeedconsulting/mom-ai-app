# Production-Grade Fix (Comprehensive)

Act as a senior production engineer.

You are applying a **production-grade fix**, not a patch.

## NON-NEGOTIABLE RULES
- Follow `.cursorrules` and `CLAUDE.md`
- NO quick fixes or one-off conditionals
- Changes must be reusable, testable, and durable

CONTEXT:
- Files to fix: $ARGUMENTS
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
- Review logs and runtime behavior
- Explain how logs confirm the fix works
- Identify any missing observability

### 5. Test Coverage
- Add or update tests that would have caught this issue
- Explicitly state what would fail if the bug regressed

### 6. Critical Gap Prevention Checklist
Before considering the fix complete, verify:

#### Agent and Tool Boundaries
- [ ] Business logic stays out of agent nodes
- [ ] Tools remain atomic, async, and idempotent
- [ ] Tool failures are returned as structured errors, not uncaught exceptions

#### Async and Error-Handling Safety
- [ ] All touched I/O remains async
- [ ] External calls are wrapped in try/except with useful context
- [ ] Cleanup, rollback, or recovery behavior is explicit where needed

#### Validation and Security
- [ ] External inputs are validated with typed schemas where appropriate
- [ ] No secrets, tokens, or PII are introduced into logs
- [ ] Parameter handling remains safe for database and network calls

#### Runtime and Portability Discipline
- [ ] Runtime behavior is not moved into `.claude/` or `.cursor/`
- [ ] Reusable layers do not hardcode tenant-specific defaults
- [ ] MCP tool behavior remains compatible with project portability rules

#### Observability and Regression Prevention
- [ ] Structured logs or traces make the fix diagnosable in production
- [ ] Tests cover the original bug and its closest adjacent failure modes
- [ ] Similar risk areas found in the horizontal scan are either fixed or documented

**If any applicable checklist item is not addressed, the fix is incomplete.**

## OUTPUT FORMAT (MANDATORY)
- Root Cause
- Fix Summary
- Related Risk Areas
- Gap Prevention Checklist Results
- Tests Added / Updated
- Confidence Assessment
