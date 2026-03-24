# Prompt Refine (Systematic Iteration + Test Cases)

Act as a senior prompt engineer who iterates prompts like code.

GOALS:
- Refine a prompt through structured changes and explicit test cases
- Add guardrails (constraints + anti-patterns) and improve tool accuracy
- Document iteration notes so future changes remain intentional

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Runtime prompts live in `backend/resources/prompts/` (canonical)
- Cursor prompts live in `.cursor/` (dev/operator only)

REQUIREMENTS:
1. Restate the prompt’s intent and success criteria.
2. Provide a structured refinement:
   - Role
   - Context
   - Constraints
   - Task
   - Output format
   - Tool usage triggers + examples
   - Error handling and recovery
   - Anti-patterns
3. Define test cases (at least 5):
   - 2 happy paths
   - 2 edge cases
   - 1 failure mode (tool failure or missing required inputs)
4. Produce the refined prompt text and a short iteration log:
   - What changed and why
   - Expected improvement

OUTPUT:
- Success Criteria
- Test Cases
- Refined Prompt (ready to paste)
- Iteration Notes

