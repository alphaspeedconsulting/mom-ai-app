# New Workflow Configuration (Design)

Act as a senior workflow architect responsible for designing a **new production workflow**.

Your task is to CREATE a complete workflow configuration proposal that aligns with
our workflow engine, registry-based system, and architectural standards.

DO NOT cut corners. This workflow must be safe, extensible, and testable.

CONTEXT:
- Workflow requirements: $ARGUMENTS
- Reference Docs:
  - `docs/WORKFLOW_CONFIGURATION_TEMPLATE.md`
  - `docs/WORKFLOW_CONFIGURATION_QUICK_REFERENCE.md`
- Rules: Read `.cursorrules` and `CLAUDE.md` for project standards

## INPUT
The business purpose, work type, and high-level requirements for the new workflow
are provided in context.

---

## HARD RULES (NON-NEGOTIABLE)
- Follow:
  - Registry-based WorkflowPackage pattern
  - Agent Overlay Architecture
  - Service-based architecture
  - `.cursorrules`
- Prefer reuse over new code
- Step 1 MUST follow WAIT-not-FAIL behavior
- No legacy module registration
- No speculative steps or placeholders

---

## DESIGN PROCESS (MANDATORY)

### 1. Workflow Overview
Define:
- Workflow ID (versioned)
- Name and description
- Category (SUBCONTRACTOR or DCR)
- Work type (`project_work_items.work_type`)
- Required entities (customer, project, subcontractor, documents)
- Agent configuration (enabled, can_start, can_advance)
- Initial step name

---

### 2. Step Graph Design
Design the complete step graph:
For EACH step define:
- Step number
- Step key
- Display name and description
- Trigger type (AUTO / MANUAL / EMAIL_RECEIVED / SCHEDULED)
- Auto-advance behavior
- Draft creation behavior
- Next steps
- Pending item behavior
- State data read/write expectations

Validate:
- No orphaned steps
- No cycles
- All steps reachable from initial step

---

### 3. Step 1 (Critical)
Explicitly design Step 1 to:
- Validate required inputs
- WAIT (not FAIL) if data missing
- Create pending items when waiting
- Re-execute cleanly when data arrives
- Return `success=True, auto_advance=False` when waiting

---

### 4. State & Data Model
Define:
- `state_data` structure
- Fallback persistence strategy
- Formatted vs raw data fields
- Idempotency expectations

---

### 5. Email Templates (If Applicable)
For each template define:
- Template key
- Category
- Recipient type
- Step number
- Required variables
- Source documents

---

### 6. Integration Points
Specify:
- WorkflowPackage location
- Registry registration path
- Catalog entry requirements
- Frontend integration points (draftSteps, ordering, colors)

---

### 7. Testing Strategy
Define:
- Unit tests per step
- E2E workflow test
- Missing-data tests
- Corrupted-state tests
- Regression coverage for known failure modes

---

## OUTPUT FORMAT (MANDATORY)

### Workflow Definition Summary
- Metadata
- Work type
- Initial step

### Step Definitions
(List each step with full configuration)

### State & Data Model
(Explicit schema and rules)

### Integration Checklist
(Backend + frontend)

### Testing Plan
(Concrete test cases)

### Open Questions / Risks
(Must be resolved before execution)

---

## FINAL NOTE
This output is a **design artifact**, not an approval.
It MUST be reviewed using `/workflow-config-review` before implementation.
