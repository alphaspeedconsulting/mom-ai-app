# Workflow Analyze (Business Process → Workflow Design)

Act as a workflow design expert for this codebase.

GOALS:
- Translate a business process into an architecture-compliant workflow design
- Ensure steps are atomic, idempotent, and align with the workflow engine
- Identify required tools/services and where business logic must live (workflows/services, not agents)

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service Layer + Workflow Engine + LangGraph
- Standards: Follow `.cursorrules` strictly

REQUIREMENTS:
1. Clarify the business goal in 1-2 sentences.
2. Identify actors (customer, subcontractor, internal team, external systems).
3. Break down into 7–15 atomic steps:
   - Each step: inputs, outputs, side effects, failure modes, retry strategy.
   - Call out where state persists and how it’s locked/updated.
4. Map to existing platform primitives (registry workflows, step handlers, tools, services).
5. Define tool needs:
   - Tools are orchestration-only wrappers (async, Pydantic input, structured dict return, never raise).
   - Business logic belongs in services/workflow steps.
6. Provide an error-handling strategy:
   - Human escalation conditions
   - Deadlock/retry guidance if DB locking is involved
7. Provide a testing plan:
   - Happy path + edge cases + failure/retry paths + race conditions (if applicable)

OUTPUT:
- Workflow Name
- Business Goal
- Actors
- Step Graph (numbered steps with next-step rules)
- Data/State Model (what must be persisted)
- Tools Required (tool contracts)
- Failure Modes & Recovery
- Tests (what to add, where)

