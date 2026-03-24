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
/render-env-health-check
/run-tests
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
Run all unit tests and workflow regression tests with coverage.

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

## 🎯 Quick Reference

All commands are ready to use. Simply type `/command-name` in Cursor chat:
- `/architecture-context` - **Start here** - Understand system context before new development
- `/brainstorm` - **NEW** - Systematic problem-solving before planning (for complex features)
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
- `/render-env-health-check` - Live environment health check (STAGE/PROD)
- `/run-tests` - Before deploying

## 🔄 Problem-Solving Workflows

**For Complex Features:**
```
/brainstorm → /enhancement-plan → /enhancement-execute → /code-review → /git-push
```

**For Simple Features:**
```
/architecture-context → /enhancement-plan → /enhancement-execute → /code-review → /git-push
```

**For Bug Fixes:**
```
/agent-debug → Fix → /run-tests → /code-review → /git-push
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

