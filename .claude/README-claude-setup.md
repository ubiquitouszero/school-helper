# Claude Code Setup Guide

This guide helps you configure Claude Code for optimal AI-assisted development.

## Quick Start

1. **Install Claude Code** (if not already installed)
   ```bash
   # Follow official installation instructions
   # https://docs.claude.com/claude-code
   ```

2. **Copy Settings Template**
   ```bash
   mkdir -p .claude
   cp ai-development-starter-kit/templates/claude-code/settings.local.json.template .claude/settings.local.json
   ```

3. **Customize Settings**
   - Update `projectName`
   - Adjust `paths` to match your structure
   - Configure `testCommand` for your framework
   - Add project-specific `autoApprovedCommands`

## Settings Explained

### Auto-Approved Commands

Commands that Claude Code can run without asking for approval:

```json
"autoApprovedCommands": [
  "Read(**)",           // Read any file
  "Bash(git status:*)", // Git status commands
  "Bash(pytest:*)"      // Run tests
]
```

**Recommended additions:**
- Add your test commands
- Add safe git read operations
- Add linting/formatting commands

### Skills

Enable pre-built skills for common tasks:

- **session-documentation**: Auto-generate session docs
- **signal-story-points**: Estimate story points
- **signal-session-ratings**: Rate session quality

### Velocity Tracking

Track story points to measure productivity:

```json
"velocityTracking": {
  "enabled": true,
  "rubric": {
    "complexity": { "trivial": 1, "very_complex": 8 },
    "scope": { "single_file": 1, "system_wide": 5 },
    "risk": { "none": 0, "high": 3 }
  }
}
```

**How to use:**
1. Estimate story points before starting work
2. Use the rubric: Complexity + Scope + Risk = Total SP
3. Track in session documentation
4. Review velocity weekly/monthly

## Best Practices

### Daily Workflow

1. **Start Session**
   - Create session doc: `/session-doc start`
   - Set objectives and estimate SP

2. **Development**
   - Auto-approve safe commands
   - Review destructive operations
   - Commit frequently with co-authorship

3. **End Session**
   - Generate session summary: `/session-doc complete`
   - Rate session on 5 dimensions
   - Update Signal dashboard

### Safety Settings

Always enable these:

```json
"safety": {
  "requireApprovalForDelete": true,
  "requireApprovalForDatabaseMigrations": true,
  "requireApprovalForProductionDeploy": true
}
```

### Git Commits

Use the template for consistent commits:

```json
"commitMessageTemplate": "{message}\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
```

This ensures:
- Clear attribution to AI assistance
- Consistent commit format
- Proper co-authorship tracking

## Advanced Configuration

### Custom Skills

Create project-specific skills in `.claude/skills/`:

```bash
.claude/
  skills/
    my-custom-skill.md
```

### Context Files

Add project context in `.claude/context/`:

```bash
.claude/
  context/
    architecture-overview.md
    coding-standards.md
    common-patterns.md
```

Claude Code will include these in context for better suggestions.

### Hooks

Set up pre-commit hooks for quality:

```bash
# .claude/hooks/pre-commit.sh
#!/bin/bash
black .
isort .
flake8 .
pytest
```

## Troubleshooting

### Issue: Commands require approval every time
**Solution:** Add to `autoApprovedCommands` after verifying they're safe

### Issue: Skills not loading
**Solution:** Check skill file format and restart Claude Code

### Issue: Velocity tracking not working
**Solution:** Ensure session docs include `Story Points: X SP` line

## Resources

- **Claude Code Docs**: https://docs.claude.com/claude-code
- **Skills Library**: See `.claude/skills/` in this repository
- **Community Examples**: [GitHub discussions/examples]

---

**Pro Tip:** Start conservative with auto-approved commands, then gradually add more as you build trust in the workflow.
