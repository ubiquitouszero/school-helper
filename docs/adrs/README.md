# School Helper - Architecture Decision Records

This directory contains the Architecture Decision Records (ADRs) for the School Helper project. ADRs document significant architectural decisions, their context, and consequences.

## Project Context

**School Helper** is a kids' learning app for math drills, number recognition, and sight words. Built by Bert Carroll with his sons Kaland (9) and Valen (5) as product managers.

**Tech Stack:** Astro + React, Supabase, Netlify, Tailwind CSS

---

## ADR Index

### Development Process (0001-0007)

| ADR | Title | Status | Summary |
|-----|-------|--------|---------|
| 0001 | [Claude Code AI Collaboration](ADR-0001-claude-code-ai-collaboration.md) | Accepted | Core workflow for AI-assisted development with Claude Code |
| 0002 | [Project Tracking - Signal Dashboard](ADR-0002-project-tracking-signal-dashboard.md) | Accepted | JSON-based project tracking optimized for AI development |
| 0003 | [Story Points Velocity Tracking](ADR-0003-story-points-velocity-tracking.md) | Accepted | Fibonacci-scale story points for measuring complexity |
| 0004 | [Mobile Claude Code Workflow](ADR-0004-mobile-claude-code-workflow.md) | Accepted | Safe integration of mobile-developed code |
| 0005 | [Pre-Merge Audit Protocol](ADR-0005-pre-merge-audit-protocol.md) | Accepted | Security and quality checks before merging |
| 0006 | [Dev Environment & CI/CD Pipeline](ADR-0006-dev-environment-and-cicd-pipeline.md) | Accepted | Staging environment and deployment automation |
| 0007 | [Root Cause Analysis Protocol](ADR-0007-root-cause-analysis-protocol.md) | Accepted | Five Whys methodology for incident response |

### Multi-Tenant Architecture (0008-0013)

| ADR | Title | Status | Summary |
|-----|-------|--------|---------|
| 0008 | [Multi-Tenant Hierarchy](ADR-0008-multi-tenant-hierarchy.md) | Proposed | Students → Classrooms/Families → Schools → Districts |
| 0009 | [Authentication & QR Sign-In](ADR-0009-authentication-qr-signin.md) | Proposed | QR codes + session codes for kids, Supabase Auth for adults |
| 0010 | [FERPA Compliance](ADR-0010-ferpa-compliance.md) | Proposed | Privacy-first architecture for student data protection |
| 0011 | [Friends System](ADR-0011-friends-system.md) | Proposed | Configurable friends with parental oversight |
| 0012 | [Tournaments & Leaderboards](ADR-0012-tournaments-leaderboards.md) | Proposed | Grade-based competitions (can play up, not down) |
| 0013 | [Result Sharing & Printing](ADR-0013-result-sharing-printing.md) | Proposed | Shareable links, printable certificates, homework verification |

---

## Key Decisions for School Helper

### Multi-Tenant Design (ADR-0008)
- **Families** and **Classrooms** are separate tables (not unified)
- Students can belong to both home (family) AND school (classroom)
- Optional layers: Districts → Schools → Grades/Pods
- Each layer has admin roles with appropriate permissions

### Kid-Friendly Authentication (ADR-0009)
- Kids sign in via **QR codes** (printed by parents) or **session codes** (like Kahoot)
- No passwords for children under 13 (COPPA compliance)
- Adults use Supabase Auth with email/password or magic links

### Privacy & FERPA (ADR-0010)
- Minimal PII collection (no email for students, just display name)
- Consent-based data access
- Audit logging for compliance
- Data export and deletion on request

### Social Features (ADR-0011)
- Friends are bidirectional (both must accept)
- Scope is configurable per group (same group only, same school, or any with parent approval)
- Parents can view and manage their child's friends

### Competition (ADR-0012)
- Tournaments are grade-based
- Students can compete UP grades (challenge mode) but NOT down
- Multiple leaderboard scopes: classroom, grade, school, friends-only
- Privacy: display names only on leaderboards

---

## Database Migrations

The ADRs are implemented through Supabase migrations:

| Migration | ADR | Description |
|-----------|-----|-------------|
| 001_initial_schema.sql | - | Players, game sessions, trophies, goals, streaks |
| 002_multi_tenant_foundation.sql | 0008 | Renames players→students, adds families, classrooms, schools, districts |
| 003_authentication.sql | 0009, 0010 | Adult profiles, QR tokens, session codes, consent tracking |
| 004_social_features.sql | 0011 | Friendships, group settings, blocked students |
| 005_tournaments.sql | 0012 | Tournaments, entries, leaderboards |
| 006_rls_policies.sql | 0010 | Row-level security for data isolation |

---

## Creating New ADRs

Use the next available number (currently ADR-0014).

**Template:** See `docs/ADR-template.md`

**When to write an ADR:**
- Choosing between multiple architectural approaches
- Making a decision with long-term impact
- Introducing a new technology or pattern
- Changing a previous ADR decision

---

## Related Documentation

- [Requirements](../requirements.md) - Full feature requirements from Kaland and Valen
- [MVP Scope](../mvp-scope.md) - What's in Version 1
- [CLAUDE.md](../../CLAUDE.md) - Project context for Claude Code

---

**Last Updated:** 2026-01-14
