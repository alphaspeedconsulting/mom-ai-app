# Cursor Sub-agents

This directory contains custom sub-agents for specialized tasks.

## Available Sub-agents

### Phase 1: High-Value Sub-agents

#### Architecture Agent
**File:** `architecture-agent.md`  
**Purpose:** Analyze architecture options and review technical designs  
**MCP Tools:** `analyze_architecture`, `review_architecture`, `profile_performance`, `review_code_security`, `refactor_code`, `track_tech_debt`, `audit_dependencies`, `validate_best_practices`

#### Product Agent
**File:** `product-agent.md`  
**Purpose:** Generate Product Requirements Documents  
**MCP Tools:** `generate_prd`

#### Sales Agent
**File:** `sales-agent.md`  
**Purpose:** Generate customized sales pitches and outreach materials  
**MCP Tools:** `generate_pitch`, `batch_generate_pitches`

#### Quality Agent
**File:** `quality-agent.md`  
**Purpose:** Validate code against best practices and Agent Overlay Architecture compliance  
**MCP Tools:** `validate_best_practices`

#### Code Reviewer Agent
**File:** `code-reviewer-agent.md`  
**Purpose:** Comprehensive code review with structured feedback  
**Based On:** superpowers code-review skill

### Phase 2: Specialized Workflow Sub-agents

#### Debugging Agent
**File:** `debugging-agent.md`  
**Purpose:** Four-phase systematic debugging framework  
**Based On:** superpowers systematic-debugging skill

#### TDD Agent
**File:** `tdd-agent.md`  
**Purpose:** Test-Driven Development workflow (RED-GREEN-REFACTOR)  
**Based On:** superpowers test-driven-development skill

#### UI/UX Agent
**File:** `uiux-agent.md`  
**Purpose:** Analyze frontend code for UI/UX issues, accessibility, and performance  
**MCP Tools:** `analyze_ui_ux`

#### Orchestrator Agent
**File:** `orchestrator-agent.md`  
**Purpose:** End-to-end product spec: PRD → Architecture in one flow  
**MCP Tools:** `generate_prd`, `analyze_architecture` (optionally `orchestrate_pipeline`)

## Usage

Sub-agents are automatically discovered by Cursor Agent. To use them:

1. **Restart Cursor** (required for discovery)
2. **Ask Agent to use sub-agent:**
   ```
   "Use the Architecture Agent to analyze architecture options for SMS notifications"
   "Use the Product Agent to generate a PRD for multi-tenant support"
   "Use the Code Reviewer Agent to review the dashboard implementation"
   ```
3. **Or let Agent decide:**
   ```
   "Analyze architecture options for adding real-time notifications"
   "Generate a PRD for SMS notifications"
   "Review the new customer agent code"
   ```
   Agent will automatically use appropriate sub-agent.

## Parallel Execution Examples

### Feature Planning
```
"Plan SMS notifications feature"
→ Product Agent (PRD) + Architecture Agent (analysis) in parallel
```

### Code Review
```
"Review dashboard implementation"
→ Code Reviewer Agent + Quality Agent + Architecture Agent in parallel
```

### Sales Preparation
```
"Prepare sales materials for ABC Roofing"
→ Sales Agent (pitch) + Product Agent (PRD) in parallel
```

## Creating New Sub-agents

1. Create a `.md` file in this directory
2. Add YAML frontmatter:
   ```markdown
   ---
   name: Agent Name
   description: Agent description
   ---
   
   # Agent Prompt
   [Your prompt here]
   ```
3. Restart Cursor to discover the new sub-agent

## MCP Tool Access

Sub-agents can access MCP tools from configured servers. The Architecture Agent uses tools from the `ai-product-agents` MCP server.

To verify MCP tool access:
1. Ask Architecture Agent to use a tool
2. Check if tool call succeeds
3. If not, main agent can call tools and pass results to sub-agent

## Using AI Product Agents via MCP as Sub-Agents

To use the PRD, Architect, Sales, Quality, UI/UX, and Orchestrator agents **via MCP** in Cursor:

1. Configure the AI Product Agents MCP server in **`~/.cursor/mcp.json`** (see **Using AI Product Agents as Sub-Agents** below).
2. Restart Cursor so it discovers these sub-agents and the MCP tools.
3. In chat: “Use the Product Agent to …”, “Use the Architecture Agent to …”, “Use the Orchestrator Agent to …”, etc.

**Full setup and checklist:** `docs/using-ai-product-agents-as-subagents.md`

## Related Documentation

- **Using AI Product Agents via MCP:** `docs/using-ai-product-agents-as-subagents.md`
- **MCP Server Reference:** `docs/mcp_server_guide.md`
- **POC Verification:** `docs/CURSOR_SUBAGENTS_POC_VERIFICATION.md`
- **Integration Plan:** `docs/enhancement-plans/2026-01-27-cursor-subagents-integration-plan.md`
- **Cursor Docs:** https://cursor.com/docs/context/subagents
