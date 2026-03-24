# Code Review (3-Pass Architecture Compliance)

Act as a senior staff engineer performing a STRICT multi-pass code review.

You MUST perform **three distinct passes** and clearly separate them in your output.

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service-based + LangGraph

## PASS 1 — Architecture & System Integrity
- Validate alignment with:
  - Agent Overlay Architecture
  - Service-based boundaries
  - Workflow engine assumptions
  - `.cursorrules`
- Identify architectural drift, leaky abstractions, or coupling
- Flag anything that could break existing workflows or agents

## PASS 2 — Correctness, Safety & Workflow Risk
- Validate logic correctness and edge cases
- Review workflow transitions, side effects, async behavior, and idempotency
- Identify failure modes that would NOT be caught by existing tests
- Explicitly call out workflow regression risks

## PASS 3 — Code Quality & Maintainability
- Naming, structure, readability
- Duplication or missed reuse opportunities
- Long-term maintainability concerns

## OUTPUT FORMAT (MANDATORY)

### Blocking Issues (must fix before merge)
For each issue:
- File path and line number
- Issue description
- Why it's blocking
- Suggested fix

### Non-Blocking Issues
- File path and line number
- Issue description
- Why it's non-blocking
- Suggested improvement

### Workflow Risk Summary
- Workflows affected
- Regression risks identified
- Mitigation recommendations

### Suggested Improvements
- Code quality improvements
- Architecture improvements
- Testing improvements

## SUCCESS CRITERIA
A review is complete when:
- ✅ All three passes completed and clearly separated
- ✅ Blocking issues identified and documented with evidence
- ✅ Workflow risks assessed with specific examples
- ✅ Evidence provided for all findings (code locations, examples)
- ✅ Suggested fixes provided for blocking issues

## ANTI-PATTERNS
❌ Skipping passes or combining them (must be three distinct passes)
❌ Vague feedback without evidence (must cite specific code)
❌ Ignoring workflow risks (critical for production safety)
❌ Not checking architecture compliance (Agent Overlay violations)
❌ Missing edge case analysis (PASS 2 requirement)
❌ Not verifying async/idempotency (PASS 2 requirement)
❌ Not checking `.cursorrules` compliance (PASS 1 requirement)
