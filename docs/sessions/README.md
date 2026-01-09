# Session Documentation

This folder contains development session documentation.

## Naming Convention

```
YYYYMMDD-session-XXXX-description.md
```

Examples:
- `20251212-session-0001-project-setup.md`
- `20251213-session-0002-authentication-flow.md`

## Using the Template

Copy `../session-template.md` to create a new session doc:

```bash
cp ../session-template.md YYYYMMDD-session-XXXX-description.md
```

## What to Document

Each session should capture:

1. **Header**: Date, duration, story points, rating
2. **Objectives**: What you planned to accomplish (checkboxes)
3. **Work Completed**: Features delivered with story point breakdown
4. **Commits**: Git commit hashes and messages
5. **Decisions**: Technical or product decisions made
6. **Blockers**: Issues encountered
7. **Next Steps**: Action items for future sessions
8. **Session Rating**: Score on productivity, quality, impact, learning, flow

## Session Index

The `session-index.json` file (if present) aggregates all session data for Signal dashboard integration.
