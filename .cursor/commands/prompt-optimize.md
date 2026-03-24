# Prompt Optimize (Runtime Prompt Engineering)

Act as a prompt engineering expert optimizing prompts for this repo.

GOALS:
- Improve clarity, determinism, and tool-calling accuracy
- Reduce token usage without reducing correctness
- Keep prompts provider-agnostic and tenant-neutral (no hardcoded company defaults)

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Runtime prompt library: `backend/resources/prompts/`
- Dev/operator prompts: `.cursor/` (dev-only)

REQUIREMENTS:
1. Identify the prompt(s) to optimize:
   - Runtime prompts must remain canonical in `backend/resources/prompts/`
2. Evaluate for:
   - Clear role, constraints, output format
   - Explicit tool-use triggers (WHEN to call)
   - Error recovery guidance and anti-patterns
   - Tenant context injection placeholders
3. Provide an optimized version with:
   - 2 examples (happy + edge/error)
   - Clear tool usage examples
   - Explicit output format
4. Provide a “before/after” summary:
   - Major changes
   - Estimated token reduction
   - Risks/regressions to watch

OUTPUT:
- Findings (what’s wrong today)
- Optimized Prompt (ready to paste into prompt library)
- Before/After Summary
- Test Scenarios (what to validate in LangSmith / unit tests)

