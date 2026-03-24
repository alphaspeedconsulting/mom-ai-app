# Troubleshooting Slash Commands

If slash commands aren't appearing in Cursor, follow these steps:

## ✅ Verification Checklist

1. **Cursor Version**: Must be Cursor 2.2+ (check: Help > About Cursor)
2. **Directory**: Commands must be in `.cursor/commands/` (not `.cursor/prompts/`)
3. **File Format**: Each command is a `.md` file (e.g., `production-fix.md`)
4. **File Names**: Use kebab-case (e.g., `production-fix`, not `production_fix`)
5. **Restart Required**: Restart Cursor after adding/modifying commands

## 🔍 Current Setup

Your commands are located at:
```
.cursor/commands/
  ├── branch.md
  ├── code-review.md
  ├── enhancement-plan.md
  ├── git-push.md
  ├── production-fix.md
  └── run-tests.md
```

## 🧪 Verify Setup

Try typing `/production-fix` in Cursor chat. If it works, the setup is correct.

## 🚨 Common Issues

### Issue: "Create Command" button appears
**Solution**: 
- Restart Cursor completely (quit and reopen)
- Verify files are in `.cursor/commands/` (not `.cursor/prompts/`)
- Check Cursor version is 2.2+

### Issue: Commands don't autocomplete
**Solution**:
- Type the full command: `/production-fix` (don't wait for autocomplete)
- Commands should work even without autocomplete
- Try `/production-fix` to verify setup

### Issue: Command not found
**Solution**:
- Verify file exists: `.cursor/commands/[command-name].md`
- Check file name matches exactly (case-sensitive)
- Restart Cursor

## 📝 Command Format

Each command file should contain:
```markdown
# Command Name

Description or instructions.

CONTEXT:
- Repo: {{repo}}
- Files: {{files}}

ACTION:
What the command should do.
```

## 🔄 Next Steps

1. **Restart Cursor** (most important!)
2. Try typing `/production-fix` in chat
3. If it works, all commands are ready to use
4. If still not working, check Cursor version

