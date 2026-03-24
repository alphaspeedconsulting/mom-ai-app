# Validate Best Practices (Architecture Compliance)

Act as a senior architect performing strict compliance validation against the Agent Overlay Architecture, tool contracts, and .cursorrules standards.

CONTEXT:
- Codebase path: $ARGUMENTS (defaults to current directory if not specified)
- Architecture: Agent Overlay + Service-based boundaries + Tool Contracts
- Standards: `.cursorrules`, `CLAUDE.md`
- Uses LLM-enhanced analysis for deeper architectural insights

## WHAT THIS DOES

Runs the `validate_best_practices` MCP tool against the specified codebase to validate:

1. **Agent Overlay Architecture** - Agents orchestrate tools (not business logic), clear service boundaries, minimal state
2. **Tool Contract Compliance** - Pydantic input models, extra='forbid', structured dict return, no exceptions, async
3. **.cursorrules Compliance** - Error handling, async patterns, structured logging, input validation, test coverage
4. **Agent Validation** (optional) - BaseAgent inheritance, execute() method, registry registration
5. **LLM Architecture Review** - Deeper coupling analysis, design pattern recommendations

## USAGE

```
/validate-best-practices ./path/to/codebase
/validate-best-practices .
/validate-best-practices src/ai_product_agents_mcp/
```

To validate a specific agent file:
```
/validate-best-practices src/ai_product_agents_mcp/agents/my_agent.py
```

## CHECK TYPES

You can specify a focused check:
- `all` (default) - Run all compliance checks
- `agent_overlay` - Agent Overlay Architecture only
- `tool_contract` - Tool contract compliance only
- `cursorrules` - .cursorrules compliance only
- `agent_validation` - Agent implementation validation only

## COMPLIANCE CRITERIA

### COMPLIANT (Pass)
- Overall score >= 7.0
- Zero blocking issues
- All critical checks pass

### NON-COMPLIANT (Fail)
- Overall score < 7.0
- OR blocking issues found
- OR critical checks fail

## OUTPUT FORMAT

- **Overall Compliant**: true/false
- **Overall Score**: 0-10
- **Blocking Issues**: Must-fix before deployment
- **Non-Blocking Issues**: Should address
- **Agent Overlay Compliance**: 5-point check
- **Tool Contract Compliance**: 6-point check
- **.cursorrules Compliance**: 5-point check
- **Agent Validation**: 7-point check (if agent file specified)
- **Recommendations**: LLM-enhanced architectural suggestions

## INVOKE

Call the `validate_best_practices` MCP tool with:
- `codebase_path`: The path from $ARGUMENTS (or "." if not specified)
- `check_type`: "all"
