# Starter ADRs for AI-Assisted Development

This directory contains five foundational Architecture Decision Records (ADRs) that establish best practices for AI-assisted software development with Claude Code.

## Included ADRs

### ADR-0001: Claude Code AI Collaboration Contract
**Purpose**: Establishes the core workflow for AI-assisted development
**Key Topics**:
- Repository-driven development (all docs in git)
- Context gathering before coding
- TodoWrite for task tracking
- File operation best practices
- Commit workflow and git practices
- Definition of done checklists

**When to use**: Copy this ADR at project start to establish collaboration patterns between human developers and Claude Code.

---

### ADR-0002: Project Tracking with Signal Dashboard
**Purpose**: Custom project tracking optimized for AI development
**Key Topics**:
- JSON-based backlog in git (AI-editable)
- Dual metrics: task completion % + user-ready workflow %
- Velocity tracking and forecasting
- Burn-up charts and progress visualization
- Zero admin overhead

**When to use**: Adopt when you need lightweight project tracking without Jira/Linear overhead. Signal is AI-friendly and lives entirely in your repository.

---

### ADR-0003: Story Points Velocity Tracking
**Purpose**: Measure productivity with story points, not commits
**Key Topics**:
- Fibonacci scale story point estimation (1, 2, 3, 5, 8, 13)
- Multi-factor rubric: complexity + scope + uncertainty + risk
- Velocity measurement (points/day or points/session)
- Cross-feature comparison
- Effort size mapping (XS/S/M/L/XL)

**When to use**: Implement when you need accurate estimation and want to track "results delivered" instead of "activity performed."

---

### ADR-0004: Mobile Claude Code Integration Workflow
**Purpose**: Safely integrate mobile-developed code into main branch
**Key Topics**:
- Mobile development in isolated branches
- Desktop integration preparation (fetch, review, diff)
- Self-review checklist (security, quality, testing)
- Automated checks (Django check, pre-commit, tests)
- Merge and monitor process

**When to use**: Adopt when using Claude Code mobile for development and need a quality gate before merging to production.

---

### ADR-0005: Pre-Merge Audit Protocol
**Purpose**: Standardized security and quality checks before merging
**Key Topics**:
- 9-point security checklist (CSRF, auth, XSS, SQL injection, etc.)
- System checks and test suite validation
- Code quality review criteria
- Audit report template
- Merge approval process

**When to use**: Enforce on all feature/mobile branch merges to prevent security vulnerabilities and maintain code quality.

---

## Adoption Guide

### For New Projects

1. **Copy all 5 ADRs** to your `docs/architecture-decisions/` directory
2. **Customize ADR-0001** with your:
   - Project-specific file paths
   - Tech stack (replace Django/PostgreSQL examples)
   - Deployment platform (replace Azure examples)
3. **Decide on ADR-0002** (Signal Dashboard):
   - If you want Signal: Copy `/templates/project-management/` to your project
   - If using existing PM tool: Skip or adapt for your tool
4. **Adopt ADR-0003** (Story Points):
   - Calibrate rubric for your team's experience level
   - Start with 5-10 tasks before trusting velocity metrics
5. **Enable ADR-0004** (Mobile Workflow) if using Claude Code mobile
6. **Enforce ADR-0005** (Pre-Merge Audit) by creating a pre-commit skill

### For Existing Projects

1. **Read ADR-0001** and identify gaps in your current workflow
2. **Cherry-pick practices**:
   - Add TodoWrite for multi-step tasks
   - Adopt "read before edit" file operations
   - Implement session-based work tracking
3. **Evaluate Signal Dashboard** (ADR-0002) vs your current PM tool
4. **Retrofit story points** (ADR-0003) to historical work for calibration
5. **Create merge audit skill** (ADR-0005) to prevent security issues

---

## Customization Notes

These ADRs reference:
- **Your Project** (example project name)
- **Django/PostgreSQL/Astro** (example tech stack)
- **Azure** (example deployment platform)
- **Signal Dashboard** (custom project tracking tool)

**Replace these with your project specifics**:
- Project name → Your project name
- Django → Your backend framework
- Azure → Your cloud provider
- Signal → Your PM tool (Jira/Linear/custom)

---

## Cross-References

ADRs reference each other:
- ADR-0001 references ADR-0002 (Signal) and ADR-0003 (Story Points)
- ADR-0002 references ADR-0001 (Collaboration) and ADR-0003 (Story Points)
- ADR-0003 references ADR-0002 (Signal Dashboard)
- ADR-0004 references ADR-0001 (Workflow) and ADR-0005 (Audit)
- ADR-0005 works standalone but complements ADR-0004

**Recommendation**: Adopt ADR-0001 → ADR-0003 → ADR-0005 as your core set. ADR-0002 (Signal) and ADR-0004 (Mobile) are optional based on your tools and workflow.

---

## Templates vs Examples

These are **example ADRs** from a production project, not abstract templates. They contain:
- ✅ Real implementation details
- ✅ Lessons learned from actual use
- ✅ Metrics and outcomes
- ❌ Not project-agnostic boilerplate

**How to use**:
1. Copy the ADR
2. Strip out project-specific details
3. Replace with your project context
4. Keep the principles and structure

**Or**: Use `/templates/docs/ADR-template.md` for generic ADR structure and refer to these for AI development-specific patterns.

---

## Success Metrics

Projects using these ADRs have achieved:
- **6-9x faster development** vs traditional methods
- **11+ story points/day** sustained velocity
- **0 critical security issues** in production
- **90-95% cost savings** on development

See the case study in `docs/approach/white-paper-ai-assisted-development.md` (if included in your starter kit).

---

## Questions?

These ADRs are battle-tested from building a HIPAA-compliant healthcare SaaS in 60 days with Claude Code. They represent proven practices, not theoretical ideals.

**Adapt them to your context** - the principles matter more than the specifics.
