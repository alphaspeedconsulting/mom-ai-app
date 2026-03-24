# Ralph Loop (Autonomous Iteration Until Done)

Run a Ralph Wiggum–style loop: keep working on the same task until success criteria are met, then output a completion promise. Use in Composer (Cmd+I) and reply "Continue" each time the agent stops until the promise appears.

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}

---

## INSTRUCTIONS FOR THE USER

1. **Replace the placeholders below** with your actual task, success criteria, and completion promise word.
2. **Open Composer** (Cmd+I / Ctrl+I) and paste the filled prompt.
3. **Loop:** When the agent pauses, click **Accept All**, then reply **"Continue"** or **"Check status and keep going"** in the same thread. Repeat until the agent outputs the completion promise or you decide to stop.
4. **Watch for drift:** If after 5-10 iterations the agent repeats the same fixes or stops making progress, start a **new Composer** (`Cmd+Shift+I`) and ask: "Summarize current state, what's done, what's left, then continue."
5. **Optional:** Install [cursor-ralph](https://github.com/hexsprite/cursor-ralph) (macOS) for semi-automated looping via a stop hook.

See `docs/RALPH_WIGGUM_LOOP_GUIDE.md` for Claude Code plugin, cursor-ralph setup, and best practices.

---

## RALPH-STYLE PROMPT (edit and use in Composer)

```markdown
TASK:
[Describe the task. Examples: "Fix all ESLint errors in src/." | "Implement checkout flow so tests in checkout.test.ts pass." | "Add tests until coverage is ≥80%."]

SUCCESS CRITERIA (must be verifiable by running commands):
- [e.g. "npm run lint" exits 0]
- [e.g. "pytest tests/unit/ -v" all pass]
- [e.g. "npm run typecheck" passes]

MAX ITERATIONS: [e.g. 15] (optional safety cap)

COMPLETION PROMISE:
When ALL success criteria are met, output exactly this line (and only when they are met):
<<promise>>COMPLETE<<</promise>>

(You can use a different word, e.g. DONE or FIXED; use the same word in the line above.)

---

## ITERATION RULES (follow every turn)

1. **STATUS FIRST**: At the START of each turn, output:
   ```
   === ITERATION N ===
   DONE SO FAR: [list files changed, tests fixed, etc.]
   REMAINING: [what's still failing or left to do]
   ```

2. **WORK**: Make progress on the task. Do as much as you can this turn.

3. **VERIFY**: Before ending this turn, RUN the verification commands (lint, tests, typecheck). Show the actual output or summary.

4. **REPORT**: At the END of each turn, output:
   ```
   VERIFICATION RESULT: [PASS / FAIL]
   - [command]: [result]
   NEXT STEP: [what you'll do next turn, or "none—criteria met"]
   ```

5. **COMPLETION**: ONLY output the completion promise (`<<promise>>COMPLETE<<</promise>>`) if:
   - You actually ran the verification commands THIS turn
   - ALL criteria passed (not "should pass" or "likely passes")
   - If ANY criterion fails, do NOT output the promise; instead report what failed

6. **BLOCKERS**: If stuck (same error 3+ times, circular fixes, dependency issue), STOP and report:
   ```
   BLOCKER: [description]
   TRIED: [what you attempted]
   SUGGESTION: [what might help]
   ```
   Do NOT output the completion promise when blocked.

7. **CONTEXT DRIFT**: If you lose track of the original task or repeat work, re-read this prompt and the current file state before continuing.
```

---

## QUICK TEMPLATES

**Lint clean:**
```
TASK: Fix all ESLint errors in src/.
SUCCESS CRITERIA: "npm run lint" exits 0.
MAX ITERATIONS: 10
COMPLETION PROMISE: <<promise>>LINT_CLEAN<<</promise>>
[Include ITERATION RULES from above]
```

**Tests pass (TDD):**
```
TASK: Implement [FEATURE] so all tests in [FILE] pass.
SUCCESS CRITERIA: "pytest [FILE] -v" all pass.
MAX ITERATIONS: 20
COMPLETION PROMISE: <<promise>>TESTS_PASS<<</promise>>
[Include ITERATION RULES from above]
```

**Refactor safe:**
```
TASK: Refactor [COMPONENT] for [GOAL]. No behavior changes.
SUCCESS CRITERIA: All existing tests pass ("pytest tests/ -v").
MAX ITERATIONS: 15
COMPLETION PROMISE: <<promise>>REFACTORED<<</promise>>
[Include ITERATION RULES from above]
```

---

## CONTEXT MANAGEMENT TIPS

- **Start fresh after ~10 iterations** if progress stalls or the agent repeats itself.
- **"Continue" prompt variants:**
  - `"Continue"` – basic, keeps going
  - `"Continue. First summarize what's done and what's left."` – forces state check
  - `"Run verification commands, then continue if not done."` – ensures actual verification
- **Signs of drift:** Agent repeats same fix, "forgets" earlier changes, stops running verification commands, or outputs completion promise without showing command output.
- **Recovery:** Start new Composer: "Read the current state of [files]. Summarize what's complete vs. remaining for [TASK]. Then continue."
