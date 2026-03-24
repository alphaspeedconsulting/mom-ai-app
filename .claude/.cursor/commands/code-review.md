# Code Review (4-Pass Architecture Compliance)

Act as a senior staff engineer performing a STRICT multi-pass code review.

You MUST perform **four distinct passes** and clearly separate them in your output.

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

## PASS 4 — Critical Gap Prevention
Reference: `.cursorrules` Section 19 and `docs/WORKFLOW_GAPS_ANALYSIS_AND_PREVENTION.md`

Verify protection against known failure patterns:

### Type Safety (Gaps 1, 9, 23, 31, 37, 38)
- [ ] Step comparisons use `safe_step_comparison()` or type-normalized functions
- [ ] Database column types match data types (TEXT for string steps, INTEGER for int)
- [ ] No `TypeError: '>' not supported between instances of 'str' and 'int'` risk

### Transaction Safety (Gaps 7, 13, 32)
- [ ] All `except DatabaseError` blocks call `await session.rollback()`
- [ ] Recovery commit failures isolated (don't drop emails/drafts)
- [ ] No "idle in transaction" warnings possible

### State Management (Gaps 5, 15, 40)
- [ ] Conditional paths validate required state flags (no implicit defaults)
- [ ] Database-first priority for user-editable fields
- [ ] Data flow consistency (update endpoint saves where detail endpoint reads)

### LLM Extraction (Gaps 11, 16, 17, 22)
- [ ] Uses `model_instance` or `extracted_data.get()`, not dot notation on dict
- [ ] Regex fallback exists for critical extractions
- [ ] None return handling for all parsing functions

### Integration Points (Gaps 2, 4, 6, 24)
- [ ] Database migrations added to `START_APP_RENDER.sh`
- [ ] Template seeding scripts added to startup
- [ ] Frontend `draftSteps` array updated
- [ ] All seeding/migration scripts idempotent

### Test Mock Patterns (Gap 11)
- [ ] LLM extraction mocks use correct structure (dict for extracted_data, model for model_instance)
- [ ] No MagicMock with dot notation for dict fields
- [ ] Both string and int step numbers tested

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

### Gap Prevention Status (Pass 4)
- Type Safety: [PASS/FAIL/N/A] - Evidence
- Transaction Safety: [PASS/FAIL/N/A] - Evidence
- State Management: [PASS/FAIL/N/A] - Evidence
- LLM Extraction: [PASS/FAIL/N/A] - Evidence
- Integration Points: [PASS/FAIL/N/A] - Evidence
- Test Mock Patterns: [PASS/FAIL/N/A] - Evidence

## SUCCESS CRITERIA
A review is complete when:
- ✅ All four passes completed and clearly separated
- ✅ Blocking issues identified and documented with evidence
- ✅ Workflow risks assessed with specific examples
- ✅ Evidence provided for all findings (code locations, examples)
- ✅ Suggested fixes provided for blocking issues
- ✅ Gap prevention checklist completed (Pass 4)

## ANTI-PATTERNS
❌ Skipping passes or combining them (must be four distinct passes)
❌ Vague feedback without evidence (must cite specific code)
❌ Ignoring workflow risks (critical for production safety)
❌ Not checking architecture compliance (Agent Overlay violations)
❌ Missing edge case analysis (PASS 2 requirement)
❌ Not verifying async/idempotency (PASS 2 requirement)
❌ Not checking `.cursorrules` compliance (PASS 1 requirement)
