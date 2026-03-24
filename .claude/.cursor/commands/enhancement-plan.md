# Enhancement Plan (Architecture-Compliant)

Act as a senior software architect.

Your task is to **CREATE A PLAN ONLY** — do NOT implement code.

## INPUT
Client enhancement requests are provided in context.

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service-based + LangGraph

## REQUIREMENTS
- Honor:
  - Agent Overlay Architecture
  - Service-based architecture
  - Workflow engine constraints
  - `.cursorrules`
- Prefer **reuse over new code**
- Minimize changes to existing workflows

## PLAN STRUCTURE (MANDATORY)

### 1. Enhancement Breakdown
For each request:
- What is being added or changed
- Which services, agents, or workflows are affected
- **Why this approach was chosen** (justification for architectural decisions)

### 2. Reuse vs New Code Analysis
- What can be reused as-is
- What needs extension
- What (if anything) must be net-new
- **Justification for new code** (why reuse isn't possible)

### 3. Workflow Impact Analysis
- Workflow steps affected
- State transitions or side effects introduced
- Regression risk level (Low / Medium / High)
- **Mitigation strategies** (how to prevent regressions)

### 4. Implementation Phases
Break work into sequenced phases with clear boundaries:
- **Phase 1: [Description] (X days)**
  - Tasks (specific, actionable)
  - Dependencies (what must be done first)
  - Success criteria:
    - ✅ Done when: [Specific, measurable outcome]
    - ✅ Verified by: [Tests, checks, validation]
    - ✅ Risk level: [Low/Med/High]
- **Phase 2: [Description] (Y days)**
  - Tasks
  - Dependencies
  - Success criteria
  - ...

### 5. Testing Strategy
- Unit tests required (what coverage, which functions)
- Integration tests required
- E2E or workflow tests required
- What existing tests must be updated
- **Test data requirements** (if any)

### 6. Open Questions / Risks
- Assumptions that need validation
- Unknowns requiring investigation
- Architectural risks
- **Deployment considerations** (migrations, rollback plan)

## OUTPUT (MANDATORY)

### 1. Plan Document
A comprehensive implementation plan following the structure above. Do NOT write code - only the plan.

### 2. Save Plan to File (REQUIRED)
**You MUST save the plan to a markdown file in `docs/enhancement-plans/`**

File naming convention: `YYYY-MM-DD-{short-descriptive-name}.md`

Example: `docs/enhancement-plans/2026-01-27-add-conditional-step-handling.md`

The saved file must include:
- Full plan content (all 6 sections above)
- Metadata header:
  ```markdown
  # Enhancement Plan: {Title}

  **Created:** {Date}
  **Status:** Draft | Approved | In Progress | Complete
  **Author:** Claude
  **Related Files:** {list of affected files}

  ---
  ```

### 3. Confirmation
After saving, confirm:
- File path where plan was saved
- Summary of phases and estimated effort

## ANTI-PATTERNS
❌ Vague phases like "implement feature" (must be specific)
❌ Missing dependencies (all prerequisites must be listed)
❌ No testing strategy (every phase needs test coverage)
❌ Ignoring .cursorrules standards (must comply)
❌ Scope creep or "nice to haves" (stick to requirements)
❌ Skipping success criteria (every phase needs measurable outcomes)
❌ No timeline estimates (each phase needs time estimate)
❌ Missing "why this approach" justification (architectural decisions must be explained)
