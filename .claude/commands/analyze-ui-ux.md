# Analyze UI/UX (Frontend Quality & Accessibility)

Act as a senior UI/UX engineer performing a comprehensive frontend code analysis.

CONTEXT:
- Codebase path: $ARGUMENTS (defaults to current directory if not specified)
- Analysis covers: Frontend framework, accessibility (WCAG 2.1), responsive design, UX flows
- Uses LLM-enhanced design thinking analysis for deeper insights

## WHAT THIS DOES

Runs the `analyze_ui_ux` MCP tool against the specified codebase to evaluate:

1. **Frontend Analysis** - Framework detection, component structure, performance issues, code smells
2. **Accessibility Audit** - WCAG 2.1 compliance (7 rules: 1.1.1, 1.3.1, 2.1.1, 2.4.3, 2.4.4, 3.2.4, 4.1.2)
3. **Responsive Design** - Viewport, breakpoints, mobile-first, touch targets
4. **UX Analysis** - Loading states, error handling, empty states, destructive action confirmations
5. **LLM Design Review** - Aesthetics, typography, color, anti-pattern detection

## USAGE

```
/analyze-ui-ux ./path/to/frontend
/analyze-ui-ux .
/analyze-ui-ux src/
```

## ANALYSIS TYPES

You can specify a focused analysis type:
- `all` (default) - Run all analyses
- `frontend` - Framework and component analysis only
- `accessibility` - WCAG 2.1 compliance only
- `responsive` - Responsive design validation only
- `ux` - User experience flow analysis only

## OUTPUT FORMAT

- **Overall Score**: 0-10 with A-F grade
- **Critical Issues**: Must-fix accessibility/UX problems
- **Frontend Analysis**: Framework, components, performance
- **Accessibility Audit**: WCAG level achieved, issues by severity
- **Responsive Design**: Mobile-first, viewport, breakpoints, touch targets
- **UX Analysis**: Flow issues, form validation, error handling, navigation
- **Recommendations**: LLM-enhanced design suggestions

## INVOKE

Call the `analyze_ui_ux` MCP tool with:
- `codebase_path`: The path from $ARGUMENTS (or "." if not specified)
- `analysis_type`: "all"
