# ADR-0017: Project Tracking - Signal Dashboard

- **Status:** Accepted
- **Date:** 2025-10-13
- **Authors:** Bert Carroll, Claude Code
- **Related:** ADR-0005 (AI Collaboration Contract)

---

## Context

When building Recovery Ecosystem AI at high velocity with AI assistance, traditional project management tools became bottlenecks:

**The Problem:**
> "We are ahead in commits, but commits ≠ completion. This is the activity ≠ results problem. Results are completion of MVP goals."

**Options Considered:**
- **Notion** - Manual admin, not AI-friendly, no velocity tracking
- **Jira** - Heavy admin, sprint-focused (we don't run sprints), manual updates
- **Linear** - Better than Jira, still manual
- **GitHub Projects** - No velocity/burn-up charts

**Requirements:**
- Track **results** (features shipped) not **activity** (commits/hours)
- AI can update tracking programmatically (JSON in git)
- Dual metrics: task completion % + user-ready workflow %
- Velocity-based forecasting
- Real-time leadership visibility, zero admin overhead

---

## Decision

Build **Signal** - custom project tracking dashboard optimized for AI-assisted development.

**Architecture:**
- Data: `project-management/backlog-data.json` (JSON in git repo)
- Frontend: HTML + Chart.js + Mermaid (no framework)
- Production: Django view at `/dashboard/signal/` (SSO-protected)
- Updates: AI edits JSON → commit → push → auto-deploy (2-3 min)
- Automation: Claude Skills in `.claude/skills/` for automated workflows

**Key Features:**
- Dual metrics (task % + user-ready %)
- Burn-up chart with MVP scope line
- Velocity tracking (commits/day, forecasted completion)
- Foundation work visibility (completed infra tasks)
- AI-friendly (programmatic JSON updates)
- **Story Points Integration** (Fibonacci scale 1-13)
- **Commit Heatmap** (GitHub-style contribution graph)
- **Effort Accuracy Tracker** (learn from estimates vs actuals)
- **Chart Controls** (7/30/All days lookback toggle)
- **Claude Skills** (automated git analysis, session docs, story point estimation)

---

## Implementation Status

### ✅ Core Features - **IMPLEMENTED**

#### 1. Data Model
- ✅ JSON schema (`backlog-data.json`)
- ✅ Task metadata (effort, risk, confidence, blockers, status)
- ✅ Velocity tracking (commits/day, working days)
- ✅ MVP scope tracking (`isMVP` flag per task)
- ✅ User Ready workflow (7-step checklist)
- ✅ Burn-up data points (cumulative commits)

#### 2. Dashboard UI (v2.1)
- ✅ SSO-protected Django view (`/dashboard/signal/`)
- ✅ Burn-up chart (Chart.js) with MVP/stretch lines
- ✅ Velocity cards (avg commits/day, total commits, % complete)
- ✅ MVP Status card (User Ready % + task completion %)
- ✅ Task cards (expandable, with descriptions, MVP/Stretch badges)
- ✅ Mermaid Gantt timeline
- ✅ Mermaid dependency graph
- ✅ WCAG AA accessible (professional-colors.css)
- ✅ Mobile responsive (768px, 480px breakpoints)
- ✅ **NEW: Commit Heatmap** (GitHub-style contribution graph with weekly totals)
- ✅ **NEW: Effort Accuracy Tracker** (compare estimates vs actuals)
- ✅ **NEW: Chart Lookback Controls** (7/30/All days toggle for burn-up chart)
- ✅ **NEW: Story Points Display** (Fibonacci scale integration)
- ✅ **NEW: Full-screen chart modals** (expandable charts for detailed analysis)

#### 3. AI Workflow Integration & Claude Skills
- ✅ Python scripts for bulk updates
- ✅ Git history audit trail (all changes tracked)
- ✅ JSON validation (pre-commit hooks)
- ✅ Programmatic task status updates
- ✅ Automatic metric recalculation
- ✅ **NEW: Claude Skills Framework** (`.claude/skills/`)
  - **signal-deployment**: Deploy Signal to new projects (<30 min)
  - **signal-git-analyzer**: Analyze git history and identify sessions
  - **signal-session-generator**: Auto-generate session documentation
  - **signal-story-points**: AI-powered story point estimation
- ✅ **NEW: Signal Update Protocol** (`.claude/signal-update-protocol.md`)
  - Say "Update Signal" → AI automatically analyzes commits, updates JSON, creates session docs
  - Comprehensive update checklist for all dashboard data sources
  - Session-based productivity tracking (not just commit counts)

#### 4. Export & Reporting
- ✅ Markdown weekly reports
- ✅ CSV export (Excel/Sheets compatible)
- ✅ JSON data dump
- ✅ PDF-ready HTML status reports

#### 5. Open Source
- ✅ Published to GitHub: [github.com/ubiquitouszero/signal](https://github.com/ubiquitouszero/signal)
- ✅ MIT License
- ✅ Anonymized sample data
- ✅ Setup documentation
- ✅ Attribution to askthehuman.com

### ⚠️ Foundation Tasks Tracked - **IN PROGRESS**

**Completed (6/12 MVP tasks):**
- ✅ P0-FOUND-1: Authentication & User Management
- ✅ P0-FOUND-2: Course Delivery & SMS Infrastructure
- ✅ P0-FOUND-3: SOBER Score Calculation Engine
- ✅ P0-FOUND-4: Multi-Tenant User Hierarchy
- ✅ P0-FOUND-5: Azure Production Deployment
- ✅ P0-FOUND-6: Signal Dashboard (meta!)

**In Progress:**
- ⏳ P0-0: Staff Dashboard with Charts/Graphs (started Oct 17)

**Not Started:**
- ❌ P0-1: SOBER Score Threshold Alerts
- ❌ P0-2: Privacy Policy Migration
- ❌ P0-3: SMS Opt-Out Workflow
- ❌ P0-4: Domain Configuration
- ❌ P0-5: Azure OpenAI Approval Request

---

## Metrics (Current as of 2025-10-13)

**Task Completion:** 50.0% (6/12 MVP tasks)
**User Ready:** 75.7% (7-step workflow):
  - ✅ Sign up via SSO: 100%
  - ✅ Add patient: 100%
  - ⚠️ Welcome SMS: 60% (needs auto-trigger)
  - ⚠️ Privacy consent: 50% (policies exist, need checkbox)
  - ✅ Complete course: 100%
  - ⚠️ View SOBER score: 30% (dashboard in progress)
  - ✅ Access chatbot: 90% (just needs embed)

**Velocity:** 7.3 commits/day (163 total commits, 19 working days)
**Days to MVP:** 16 (projected Oct 29)
**On Track:** YES

---

## Consequences

### Positive
- ✅ AI can manage tracking (no manual admin)
- ✅ Git history audit trail
- ✅ Results-focused (task % + user-ready %, not just commits)
- ✅ Foundation work visible (completed infra tracked)
- ✅ Real-time forecasting (velocity-based)
- ✅ Zero context switching (AI works in git repo)
- ✅ Leadership visibility (no status meetings needed)
- ✅ Open source reusable (published to GitHub)

### Negative
- ⚠️ Manual JSON editing (mitigated: Claude Skills + "Update Signal" automation)
- ⚠️ 2-3 min deployment lag (acceptable for daily updates)
- ⚠️ No mobile app (desktop only, but responsive design)
- ⚠️ Custom maintenance (vs vendor support)
- ⚠️ Dual data sources (local + production) must be kept in sync

### Risks
- **JSON schema errors:** Mitigated by pre-commit hooks
- **Signal becomes bottleneck:** Mitigated by keeping it simple (no framework)
- **Leadership stops using it:** Mitigated by SSO integration + professional UI

---

## Why NOT Notion/Jira?

**Notion:**
- ❌ Manual: Every update requires UI clicking
- ❌ Not AI-friendly: Claude can't programmatically update databases
- ❌ No velocity tracking
- ❌ Context switching breaks IDE flow

**Jira:**
- ❌ Heavy admin (sprints, story points, epics)
- ❌ Sprint-focused (we don't run sprints)
- ❌ Manual estimates (not based on actual velocity)
- ❌ Poor AI integration (complex API)

**Signal:**
- ✅ AI edits JSON programmatically
- ✅ Zero admin overhead
- ✅ Velocity-based (actual commits, not guesses)
- ✅ Simple API (JSON file)

**Example AI Workflow:**
```python
# Claude Code does this automatically:
import json
with open('backlog-data.json', 'r') as f:
    data = json.load(f)

# Update task status
data['tasks'][0]['status'] = 'completed'

# Recalculate MVP %
mvp_tasks = [t for t in data['tasks'] if t['isMVP']]
completed = [t for t in mvp_tasks if t['status'] == 'completed']
data['mvpScope']['percentComplete'] = len(completed) / len(mvp_tasks) * 100

with open('backlog-data.json', 'w') as f:
    json.dump(data, f, indent=2)
```

No manual Jira clicking. AI updates JSON, commits, pushes. Dashboard updates in 2 minutes.

---

## Action Items

### ✅ Completed
- [x] Build Signal dashboard
- [x] Deploy to production (`/dashboard/signal/`)
- [x] Add foundation tasks to backlog
- [x] Implement dual metrics (task % + user-ready %)
- [x] Publish to GitHub (MIT license)
- [x] WCAG AA accessibility
- [x] Mobile responsive design

### 🚧 In Progress
- [ ] Track P0-0: Staff Dashboard completion (in progress)
- [ ] Weekly backlog updates (AI-driven)

### 📋 Future Enhancements
- [ ] Automated weekly report generation (cron job)
- [ ] Database-backed (optional, for real-time updates)
- [ ] Webhook notifications (Slack integration)
- [ ] API for programmatic access

---

## Project Structure

Signal is organized in the standard structure:

```
project-management/
├── index.html                    # Signal dashboard (v2.1)
├── backlog-data.json            # Local development data
├── professional-colors.css      # Dashboard styles
├── sessions/                    # Session documentation
├── QUICKSTART.md               # Quick start guide
├── BACKLOG_UPDATE_CHECKLIST.md # Manual update guide
└── README.md                   # Documentation

.claude/
├── signal-update-protocol.md   # "Update Signal" automation
└── skills/                     # Claude Skills
    ├── signal-deployment/
    ├── signal-git-analyzer/
    ├── signal-session-generator/
    └── signal-story-points/

backend/docs/planning/
└── backlog-data.json           # Production data (Django template injects)
```

**Data Sources:**
- **Local**: `project-management/backlog-data.json` (for local testing)
- **Production**: `backend/docs/planning/backlog-data.json` (Django view injects)

**Keep both in sync** when updating tracking data.

---

## References

- Signal GitHub: [github.com/ubiquitouszero/signal](https://github.com/ubiquitouszero/signal)
- Production Dashboard: Your deployed Signal dashboard URL
- Local Dashboard: [project-management/index.html](../project-management/index.html)
- Local Data: [project-management/backlog-data.json](../project-management/backlog-data.json)
- Production Data: [backend/docs/planning/backlog-data.json](../backend/docs/planning/backlog-data.json)
- MVP Launch Plan: [docs/planning/MVP-LAUNCH-END-OF-MONTH.md](../docs/planning/MVP-LAUNCH-END-OF-MONTH.md)
- ADR-0005: AI Collaboration Contract
- Signal Update Protocol: [.claude/signal-update-protocol.md](../.claude/signal-update-protocol.md)

---

## Changelog

- **2025-10-17:** Updated to Signal v2.1 with Claude Skills, commit heatmap, story points, effort tracker
  - Reorganized to standard `project-management/` structure
  - Added Claude Skills (`.claude/skills/`) for automated workflows
  - Added Signal Update Protocol (`.claude/signal-update-protocol.md`)
  - Added chart controls (7/30/All days lookback)
  - Enhanced mobile responsive design
  - Note: Production dashboard needs testing after v2.1 update
- **2025-10-13:** Signal dashboard deployed to production, ADR created
