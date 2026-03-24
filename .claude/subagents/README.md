# AI Product Agents - Claude Code Subagents

This directory contains subagent configurations that Claude Code can natively detect and use for delegation.

## Available Subagents

### 1. PRD Agent (`prd-agent.jsonl`)
**Expertise:** Product Requirements Document Generation

**Use when you need:**
- Product Requirements Documents
- Requirements documentation
- User stories and acceptance criteria
- Feature specifications

**Functions:**
- `generate_prd()` from `ai_product_agents_mcp.agents_api`
- MCP tool: `@ai-product-agents/generate_prd`

### 2. Architect Agent (`architect-agent.jsonl`)
**Expertise:** Architecture Analysis & Recommendations

**Use when you need:**
- Architecture recommendations
- Build vs. buy decisions
- Cost analysis (TCO calculation)
- Implementation strategy
- Technology stack selection
- Security assessment (STRIDE)

**Functions:**
- `analyze_architecture()` from `ai_product_agents_mcp.agents_api`
- MCP tool: `@ai-product-agents/analyze_architecture`

### 3. Pitch Agent (`pitch-agent.jsonl`)
**Expertise:** Sales Pitch Generation

**Use when you need:**
- Sales pitches for companies
- Outreach materials
- Prospecting research
- Batch pitch generation
- Client proposals

**Functions:**
- `generate_pitch()` from `ai_product_agents_mcp.agents_api`
- `batch_generate_pitches()` from `ai_product_agents_mcp.agents_api`
- MCP tools: `@ai-product-agents/generate_pitch`, `@ai-product-agents/batch_generate_pitches`

### 4. Orchestrator Agent (`orchestrator-agent.jsonl`)
**Expertise:** Multi-Agent Coordination

**Use when you need:**
- End-to-end product development workflows
- Coordinated multi-agent tasks
- Complex project planning

**Functions:**
Coordinates PRD Agent and Architect Agent for complete workflows.

## How Claude Code Uses Subagents

Claude Code will automatically detect these subagents and delegate tasks to them when appropriate:

```
You: I need a complete product specification for a customer follow-up workflow

Claude Code: [Delegates to Orchestrator Agent]
             [Orchestrator uses PRD Agent → Architect Agent]
             [Returns complete specification]
```

## Subagent + MCP Integration

All subagents can access MCP tools! They inherit the MCP tools from the main Claude Code instance:

```python
# Subagents can call MCP tools directly
# or use the Python API
from ai_product_agents_mcp.agents_api import generate_prd

result = await generate_prd(...)
```

## Configuration

Subagents are automatically discovered by Claude Code. No additional configuration needed!

However, if you need to configure which tools subagents can access, you can edit the JSONL files and add a `tools` field:

```json
{
  "role": "assistant",
  "custom_instructions": "...",
  "tools": [
    "@ai-product-agents/generate_prd",
    "@ai-product-agents/analyze_architecture"
  ]
}
```

## Testing Subagents

Try these prompts in Claude Code:

**Test PRD Agent:**
```
Generate a PRD for an automated invoice reminder workflow in the healthcare industry
```

**Test Architect Agent:**
```
Analyze the best architecture for implementing an automated invoice reminder system
```

**Test Pitch Agent:**
```
Research ABC Roofing Company and generate a sales pitch for AI automation services
```

**Test Orchestrator:**
```
I need a complete product specification for a customer onboarding automation feature
```

## Benefits of Subagents

1. **Automatic Delegation**: Claude Code delegates tasks automatically
2. **Specialized Expertise**: Each subagent has focused domain knowledge
3. **MCP Tool Access**: Subagents can use all MCP tools
4. **Python API Access**: Direct access to agent functions
5. **Parallel Processing**: Multiple subagents can work simultaneously

## Comparison: Subagents vs Direct Tool Calls

| Approach | When to Use |
|----------|-------------|
| **Subagent** | Complex multi-step workflows, need delegation and synthesis |
| **Direct MCP Tool** | Simple, single-purpose operations |
| **Python API** | Direct integration, programmatic control |

## Troubleshooting

**Subagents not activating?**
- Ensure JSONL files are properly formatted
- Check Claude Code console for errors
- Try explicitly mentioning the task type (e.g., "I need a PRD")

**Python import errors?**
- Verify package is installed: `pip show ai-product-agents-mcp`
- Check working directory includes project root
- Verify `.env` file is loaded

## See Also

- `docs/claude-integration.md` - Complete Claude integration guide
- `docs/claude-code-agents.md` - Claude Code agents reference
- `docs/skills-subagents-mcp-comparison.md` - Detailed comparison

## Cursor: Use These Agents via MCP as Sub-Agents

In **Cursor**, the same agents are available via MCP as sub-agents:

1. **Configure MCP:** Add the `ai-product-agents` server to **`~/.cursor/mcp.json`** (with `OPENAI_API_KEY`). See **`docs/using-ai-product-agents-as-subagents.md`** for the exact config and checklist.
2. **Sub-agent definitions:** Cursor discovers sub-agents from **`.claude/.cursor/agents/`** (Product, Architecture, Sales, Quality, UI/UX, Orchestrator). Each instructs the assistant to call the corresponding MCP tools.
3. **Usage:** In Cursor chat, say e.g. “Use the Product Agent to generate a PRD for …” or “Use the Orchestrator Agent to produce a full product spec (PRD + architecture) for …”.

**Full guide:** `docs/using-ai-product-agents-as-subagents.md`

---

**Note**: The JSONL files in this directory are **Claude Code-specific**. For Cursor, use MCP + the sub-agents in `.claude/.cursor/agents/` as above.
