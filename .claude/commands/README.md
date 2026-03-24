# Claude Commands

**Location:** `.claude/commands/`  
**Purpose:** Reusable prompts for Claude Code (slash commands)  
**Usage:** Type `/command-name` in Claude Code conversations

---

## Available Commands

### Planning & Design

#### `/brainstorm`
**Pattern:** obra/superpowers brainstorming  
**Purpose:** Break down complex problems and generate solution approaches  
**Use when:** Starting new features or working through ambiguity

#### `/write-plan`
**Pattern:** obra/superpowers planning  
**Purpose:** Create a detailed implementation plan  
**Use when:** A scoped feature needs an execution roadmap

#### `/enhancement-plan`
**Pattern:** Architecture-compliant planning  
**Purpose:** Create enhancement plans that honor Agent Overlay and service boundaries  
**Use when:** A request needs phased implementation planning  
**Key behavior:** Requires saving the plan artifact to `docs/enhancement-plans/`

#### `/tradeoff-analysis`
**Purpose:** Compare implementation options with explicit tradeoffs  
**Use when:** Multiple valid approaches exist and the choice should be justified

#### `/product-decision`
**Purpose:** Frame product and technical decisions using options, constraints, and risks  
**Use when:** A roadmap or product direction decision needs structure

---

### Execution

#### `/execute-plan`
**Pattern:** obra/superpowers execution discipline  
**Purpose:** Implement approved plans without scope creep  
**Use when:** A plan is approved and ready for execution

#### `/enhancement-execute`
**Pattern:** Strict plan execution  
**Purpose:** Execute enhancement plans with phase checkoffs and final audit  
**Use when:** An enhancement plan is approved and open questions are resolved

#### `/verify-plan-completion`
**Purpose:** Audit whether a plan was fully implemented  
**Use when:** You want a post-implementation verification pass before merge or deployment

---

### Debugging & Analysis

#### `/agent-debug`
**Pattern:** LangGraph systematic debugging  
**Purpose:** Diagnose agent issues involving prompts, tools, or state  
**Use when:** Agent behavior is incorrect or inconsistent

#### `/workflow-analyze`
**Pattern:** Business process design  
**Purpose:** Analyze processes and design workflow configurations  
**Use when:** A new workflow is needed or an existing workflow needs changes

#### `/production-fix`
**Pattern:** Comprehensive bug fixes  
**Purpose:** Apply durable fixes with root-cause analysis, horizontal scan, and gap-prevention checks  
**Use when:** Production issues or critical bugs need rigorous treatment

---

### Optimization

#### `/prompt-optimize`
**Pattern:** Prompt engineering best practices  
**Purpose:** Optimize prompts for clarity and efficiency  
**Use when:** Prompts are unclear or token-heavy

#### `/prompt-refine`
**Purpose:** Iterate prompts with explicit test cases and guardrails  
**Use when:** A prompt needs structured improvement rather than light optimization

#### `/code-review`
**Pattern:** 4-pass review  
**Purpose:** Review code for architecture, correctness, maintainability, and repo-specific gap prevention  
**Use when:** Before commit, PR, or merge

---

### Architecture & Configuration

#### `/architecture-context`
**Purpose:** Get a quick architectural overview before starting work  
**Use when:** Onboarding to a task or locating relevant code

#### `/new-workflow-configuration`
**Purpose:** Design workflow configuration proposals  
**Use when:** A new workflow needs a full design

#### `/workflow-config-review`
**Purpose:** Review workflow configurations for production readiness  
**Use when:** A workflow configuration is complete and needs validation

---

### Quality & Compliance

#### `/analyze-ui-ux`
**Purpose:** Analyze frontend code for UI, UX, responsiveness, and accessibility issues  
**Use when:** Reviewing frontend implementation quality

#### `/validate-best-practices`
**Purpose:** Validate Agent Overlay, tool contracts, and `.cursorrules` compliance  
**Use when:** Reviewing agents, tools, or other architecture-sensitive code

---

### Utilities

#### `/git-push`
**Purpose:** Commit and push to remote  
**Use when:** Changes are ready to publish

#### `/branch`
**Purpose:** Check the current git branch  
**Use when:** Verifying branch context before making changes

#### `/run-tests`
**Purpose:** Run repo-specific test tiers from critical pipelines to full coverage  
**Use when:** Before merging, after substantial edits, or while debugging regressions

#### `/render-env-health-check`
**Purpose:** Live environment health check (STAGE/PROD)  
**Use when:** Investigating deployment or runtime issues

---

## Quick Reference

**Most Used Commands:**
1. `/architecture-context` - Start here for new work
2. `/brainstorm` - Generate solution approaches
3. `/enhancement-plan` - Create an artifact-backed implementation plan
4. `/enhancement-execute` - Execute the approved plan with explicit checkoffs
5. `/run-tests` - Validate changes by test tier
6. `/code-review` - Review before commit

**Typical Delivery Flow:**
```text
/brainstorm → /enhancement-plan → /enhancement-execute → /run-tests → /code-review → /git-push
```

**Decision Flow:**
```text
/tradeoff-analysis → /product-decision → /enhancement-plan
```

**Audit Flow:**
```text
/enhancement-execute → /verify-plan-completion → /code-review
```

---

## Related Resources

### Claude Skills
- **Location:** `.claude/skills/`
- **Usage:** Auto-loaded by Claude Code when relevant

### Runtime Prompts
- **Location:** `src/ai_product_agents_mcp/prompts/`
- **Purpose:** Production prompt assets, distinct from dev-only slash commands

### Documentation
- **Architecture:** `ARCHITECTURE_REFERENCE_GUIDE.md`
- **Standards:** `.cursorrules`
- **Project guide:** `CLAUDE.md`

---

## Adding New Commands

### 1. Create Command File
```bash
touch .claude/commands/my-command.md
```

### 2. Follow Format
```markdown
# Command Name

Act as [role].

## GOALS
- Goal 1
- Goal 2

## CONTEXT
- Files/context: $ARGUMENTS

## REQUIREMENTS
- Requirement 1

## OUTPUT
- Expected output
```

### 3. Test Command
```text
/my-command
```

### 4. Document in README
Update this file with command description and intended use

---

## Command Usage Guidelines

### Do
- Use `/architecture-context` when starting unfamiliar work
- Use `/enhancement-plan` for non-trivial features and fixes
- Use `/enhancement-execute` only with an approved plan
- Use `/run-tests` before claiming completion
- Use `/code-review` before every commit

### Don't
- Skip planning for complex work
- Use `/enhancement-execute` without a clear plan artifact
- Introduce runtime behavior into `.claude/commands`
- Ignore test or audit failures because a change is "small"

---

## Troubleshooting

### Command Not Found
**Cause:** Typo in command name  
**Fix:** Check available commands in this README

### Command Not Working
**Cause:** Claude Code not recognizing command  
**Fix:** Restart Claude Code and verify the file exists in `.claude/commands/`

### Wrong Output
**Cause:** Command format or requirements are underspecified  
**Fix:** Review the command file and strengthen context, requirements, or output format

---

## Command Statistics

**Total Commands:** 23  
**Categories:** Planning (5), Execution (3), Debugging (3), Optimization (3), Architecture (3), Quality (2), Utilities (4)

---

**Last Updated:** 2026-03-08  
**Maintained by:** Development Team  
**Version:** 3.0
