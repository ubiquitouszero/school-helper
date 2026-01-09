# Documentation

This folder contains project documentation that lives alongside the code.

## Structure

```
docs/
├── README.md                    # This file
├── sessions/                    # Development session documentation
│   └── session-template.md      # Template for session docs
├── architecture-decisions/      # Architecture Decision Records (ADRs)
│   └── ADR-template.md         # Template for new ADRs
├── planning/                    # Planning documents, roadmaps
├── research/                    # Research notes, competitive analysis
├── meetings/                    # Meeting notes
└── approach/                    # Methodology documentation
```

## Why Document in Git?

1. **Version Control**: Track changes to documentation alongside code
2. **AI-Friendly**: Claude Code can read/write docs directly
3. **Single Source of Truth**: No separate wiki to maintain
4. **Review Process**: PRs can include doc updates
5. **Offline Access**: Always available locally

## Session Documentation

After each development session, create a session doc in `sessions/`:

```
sessions/YYYYMMDD-session-XXXX-description.md
```

Session docs capture:
- Objectives and story points
- Work completed with commits
- Decisions made
- Blockers encountered
- Next steps

## Architecture Decision Records

For significant technical decisions, create an ADR:

```
architecture-decisions/ADR-XXXX-decision-title.md
```

ADRs document:
- Context and problem
- Decision drivers
- Options considered
- Chosen solution
- Consequences

## Best Practices

- **Document as you go** - Don't wait until the end
- **Link to code** - Reference files and line numbers
- **Keep it concise** - Prefer clarity over completeness
- **Update when things change** - Stale docs are worse than no docs
