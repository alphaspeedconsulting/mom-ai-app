# Cursor Slash Commands

This directory (`.cursor/commands/`) contains reusable prompts that can be invoked as slash commands in Cursor 2.2+.

## 🚀 Quick Usage

In Cursor chat, simply type:

```
/architecture-context
/brainstorm
/production-fix
/git-push
/branch
/enhancement-plan
/enhancement-execute
/code-review
/new-workflow-configuration
/workflow-config-review
/ralph-loop
/render-env-health-check
/run-tests
/export-langsmith-traces
```

Cursor will automatically load and execute the prompt with context from your current workspace.

## ⚠️ Important

- Commands must be in `.cursor/commands/` (not `.cursor/prompts/`)
- File names should be kebab-case (e.g., `production-fix.md`)
- Restart Cursor after adding new commands

## 📋 Available Commands

### `/production-fix`
Comprehensive production-grade fix with full review. Ensures:
- No quick fixes
- Similar errors found across workflow steps
- Render MCP logs reviewed
- Architecture compliance

### `/git-push`
Commit and push all changes to remote repository.

### `/branch`
Check current git branch.

### `/brainstorm`
Systematic problem-solving before planning:
- Generate 3-5 solution approaches
- Analyze trade-offs and risks
- Provide structured recommendations
- Use before `/enhancement-plan` for complex features

### `/enhancement-plan`
Create implementation plan for client requests while honoring:
- Agent Overlay Architecture
- Service-based architecture
- .cursorrules standards
- **Enhanced:** Success criteria per phase, timeline estimates, "why this approach" justification

### `/enhancement-execute`
Execute an approved enhancement plan. Strictly follows the plan:
- No scope creep or speculative changes
- Maintains architecture boundaries
- Implements tests as specified
- Validates workflow safety
- **Enhanced:** Phase-by-phase execution format, explicit STOP conditions, comprehensive anti-patterns

### `/code-review`
3-pass comprehensive review:
1. Architecture compliance
2. .cursorrules compliance
3. Workflow safety
- **Enhanced:** Success criteria, anti-patterns section, evidence requirements, structured output format

### `/new-workflow-configuration`
Design a new workflow configuration proposal:
- Creates complete workflow design following registry-based pattern
- Designs step graph with proper state management
- Ensures Step 1 follows WAIT-not-FAIL behavior
- Defines email templates and integration points
- Includes comprehensive testing strategy
- Output must be reviewed with `/workflow-config-review` before implementation

### `/workflow-config-review`
Strict production readiness review of workflow configuration:
- Validates against comprehensive template and critical gaps checklist
- Hard stop rules: Missing metadata, failed gaps, Step 1 violations = REJECTED
- Reviews integration points, step handlers, testing coverage
- Provides final gate decision: APPROVED / APPROVED WITH CONDITIONS / REJECTED

### `/render-env-health-check`
Live environment health check for Render deployment:
- READ-ONLY analysis of operational health (STAGE or PROD)
- Checks deployment, Pub/Sub, polling, errors, LLM calls
- Identifies high-risk patterns (infinite loops, cost amplification)
- Classifies issues by severity (SEV-1/2/3)
- Provides overall health status and monitoring gaps

### `/run-tests`
Run critical test suite including workflow simulator, email validator, and draft operations tests (~48 tests). Focuses on critical workflow functionality, draft advancement, and email processing.

### `/export-langsmith-traces`
Export LangSmith traces for debugging agent behavior:
- Export traces from specified time range (default: 24 hours)
- Filter by errors, agent name, or query text
- Export full run trees with all child spans
- Outputs JSON files for analysis and sharing
- Use for debugging agent failures, routing issues, and tool call sequences

### `/architecture-context`
Quick architectural context for new development work:
- Provides system overview and key capabilities
- Identifies relevant code locations based on task type
- Explains architectural constraints (Agent Overlay, Service Layer, async-first)
- Provides quick reference to key files, concepts, and patterns
- Ensures compliance with .cursorrules and production-grade patterns
- **Use this when**: Starting new features, fixing bugs, or onboarding to understand system context

---

## 🧩 Prompt Engineering & Decision Commands

### `/workflow-analyze`
Analyze a business process and produce an architecture-compliant workflow proposal.

### `/agent-debug`
Systematic debugging for LangGraph agents (prompt vs tool vs state vs workflow).

### `/prompt-optimize`
Optimize runtime prompts for clarity, determinism, and tool-calling accuracy.

### `/prompt-refine`
Systematic prompt refinement with explicit test cases and iteration notes.

### `/product-decision`
Structured product decision framing with options and recommendation.

### `/customer-analysis`
Turn customer data/feedback into insights and prioritized recommendations.

### `/tradeoff-analysis`
Explicit tradeoff analysis using a decision matrix and validation plan.

### `/ralph-loop`
Ralph Wiggum–style autonomous iteration in Cursor:
- Injects a Ralph-style prompt (task + success criteria + completion promise)
- Use in Composer (Cmd+I): paste prompt, Accept All, reply "Continue" until done
- Optional: install [cursor-ralph](https://github.com/hexsprite/cursor-ralph) (macOS) for semi-automated looping
- See `docs/RALPH_WIGGUM_LOOP_GUIDE.md` for Claude Code plugin and full guide

### `/gap-prevention-check`
Pre-implementation gap analysis to prevent known failure patterns:
- Type safety analysis (step comparisons)
- Transaction safety analysis (rollback patterns)
- LLM extraction analysis (dict vs model access)
- State management analysis (database-first)
- Integration artifacts analysis (migrations, templates, frontend)
- **Use BEFORE** implementing significant changes to catch issues proactively

### `/render-debug`
Comprehensive production debugging with Render MCP telemetry:
- Gathers logs, metrics, deployments in parallel
- Analyzes errors, performance, and deployments
- Provides root cause hypothesis with evidence
- Classifies severity (SEV-1/2/3)
- Data-driven recommendations

### `/execute-plan`
Implement approved plans WITHOUT scope creep (obra/superpowers pattern):
- Phase-by-phase execution
- Strict plan adherence
- Tests required per phase
- Blocker escalation protocol

### `/write-plan`
Create detailed implementation plans (obra/superpowers pattern):
- Phased breakdown with dependencies
- Testing strategy per phase
- Risk assessment and success criteria

### `/verify-plan-completion`
Post-implementation audit to verify enhancement plans were fully executed:
- Verifies all tasks, success criteria, tests, artifacts
- Provides completion score and gap analysis
- Creates remediation plan for missing items
- **Use AFTER** `/enhancement-execute` claims completion

### `/render-connect`
Quick reference for connecting to Render environments:
- Service IDs and URLs for STAGE/PROD
- MCP tool usage patterns
- Fallback methods (curl, WebFetch, Dashboard)
- Common tasks with examples

### `/db-connect`
Database connection patterns for production debugging:
- Connection methods (MCP, Dashboard, SSH tunnel)
- Common debug queries (workflow state, pending items, drafts)
- Safety rules and best practices
- SQL modification patterns with transactions

## 🎯 Quick Reference

All commands are ready to use. Simply type `/command-name` in Cursor chat:

**Core Development Flow:**
- `/architecture-context` - **Start here** - Understand system context before new development
- `/brainstorm` - Systematic problem-solving before planning (for complex features)
- `/gap-prevention-check` - Pre-implementation gap analysis
- `/enhancement-plan` or `/write-plan` - Create implementation plan
- `/enhancement-execute` or `/execute-plan` - Execute the plan
- `/verify-plan-completion` - Post-implementation audit
- `/code-review` - Review before committing

**Infrastructure & Debugging:**
- `/render-connect` - Connect to Render environments (STAGE/PROD)
- `/db-connect` - Database connection patterns
- `/render-debug` - Comprehensive production debugging
- `/render-env-health-check` - Quick health check

**Specialized Commands:**
- `/workflow-analyze` - Design workflows from business processes
- `/agent-debug` - Debug agent issues systematically
- `/prompt-optimize` - Optimize runtime prompts
- `/prompt-refine` - Refine prompts with test cases
- `/product-decision` - Product decision framing
- `/customer-analysis` - Customer insights and recommendations
- `/tradeoff-analysis` - Tradeoff matrix + recommendation
- `/production-fix` - For comprehensive bug fixes
- `/code-review` - Before submitting code (enhanced with success criteria)
- `/enhancement-plan` - When planning features (enhanced with phases, success criteria, timelines)
- `/enhancement-execute` - Execute approved enhancement plan (enhanced with phase-by-phase format)
- `/new-workflow-configuration` - Design new workflow configuration
- `/workflow-config-review` - Review workflow config for production readiness
- `/run-tests` - Before deploying
- `/export-langsmith-traces` - Export and analyze LangSmith traces for debugging
- `/gap-prevention-check` - Pre-implementation gap analysis
- `/ralph-loop` - Ralph Wiggum–style loop (task until completion promise)
- `/verify-plan-completion` - Post-implementation audit

## 🔄 Problem-Solving Workflows

**For Complex Features:**
```
/brainstorm → /enhancement-plan → /gap-prevention-check → /enhancement-execute → /verify-plan-completion → /code-review → /git-push
```

**For Simple Features:**
```
/architecture-context → /enhancement-plan → /gap-prevention-check → /enhancement-execute → /code-review → /git-push
```

**For Bug Fixes:**
```
/export-langsmith-traces → /agent-debug → Fix → /run-tests → /code-review → /git-push
```

## 🔧 Adding New Commands

1. Create a new `.md` file in `.cursor/commands/`
2. Use descriptive filename (kebab-case)
3. Follow the format:
   - Title with description
   - GOALS section
   - CONTEXT section (can use {{repo}}, {{files}} variables)
   - REQUIREMENTS/ACTIONS
   - OUTPUT section

4. Restart Cursor to load new commands

## 📝 Prompt Format

```markdown
# Command Name (Description)

Act as [role].

GOALS:
- Goal 1
- Goal 2

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}

REQUIREMENTS:
- Requirement 1
- Requirement 2

OUTPUT:
- Expected output
```

## 🎯 Context Variables

Cursor automatically provides:
- `{{repo}}` - Repository name/path
- `{{files}}` - Currently open files

Use these to make prompts context-aware!

