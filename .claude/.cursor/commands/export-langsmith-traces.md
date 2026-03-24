# Export LangSmith Traces

Export and analyze LangSmith traces for debugging agent behavior.

**Usage:** `/export-langsmith-traces` or `/langsmith-traces`

---

## Purpose

Export LangSmith traces via API to analyze agent execution, identify failures, and debug routing issues.

## When to Use

- Debugging agent chat failures
- Analyzing agent routing decisions
- Reviewing tool call sequences
- Identifying error patterns
- Sharing traces with team members or AI assistants

## Available Options

The script supports multiple filtering and export options:

### Basic Usage
```bash
# Export last 24 hours of traces (default)
python3 scripts/export_langsmith_traces.py

# Export with summary only (no JSON file)
python3 scripts/export_langsmith_traces.py --summary-only
```

### Filtering Options
```bash
# Export only errors
python3 scripts/export_langsmith_traces.py --filter-error --hours 48

# Export specific agent traces
python3 scripts/export_langsmith_traces.py --filter-agent supervisor

# Export traces matching query text
python3 scripts/export_langsmith_traces.py --filter-query "show recent customers"

# Export from specific project
python3 scripts/export_langsmith_traces.py --project roofing-chatbot-agents
```

### Export Full Run Tree
```bash
# Export complete trace with all child spans for specific run
python3 scripts/export_langsmith_traces.py --export-tree <run_id>
```

## Required Setup

1. **LangSmith API Key**: Must be set in `.env` file as `LANGCHAIN_API_KEY`
2. **Project Name**: Defaults to `LANGCHAIN_PROJECT` env var (or "roofing-chatbot-agents")

## Output

- **Console Summary**: Prints summary of runs with status, query, and errors
- **JSON Files**: Saved to `langsmith_exports/` directory with timestamps
- **Run Trees**: Full trace trees with all child spans for detailed analysis

## Example Workflow

1. **Find recent failures:**
   ```bash
   python3 scripts/export_langsmith_traces.py --filter-error --hours 6 --summary-only
   ```

2. **Export specific failing run:**
   ```bash
   python3 scripts/export_langsmith_traces.py --export-tree <run_id>
   ```

3. **Share the JSON file** from `langsmith_exports/` directory

## Integration with Analysis

After exporting traces, use the analysis to:
- Identify root causes of agent failures
- Review routing decisions
- Understand tool call sequences
- Create fix plans based on evidence

See `docs/enhancement-plans/AGENT_CHAT_FIX_PLAN.md` for an example of trace-based analysis.

## Troubleshooting

- **"LANGCHAIN_API_KEY not found"**: Make sure `.env` file exists with `LANGCHAIN_API_KEY=your_key`
- **"No runs found"**: Check that `LANGCHAIN_PROJECT` matches your LangSmith project name
- **"langsmith package not installed"**: Run `pip install langsmith`

## Script Location

`scripts/export_langsmith_traces.py`

## Related Documentation

- `scripts/README_LANGSMITH_EXPORT.md` - Detailed usage guide
- `docs/enhancement-plans/AGENT_CHAT_FIX_PLAN.md` - Example trace analysis
