# ADR-0001: Claude Code AI Collaboration Contract

- Status: Accepted
- Date: 2025-01-10
- Context: Using Claude Code as the primary development environment with direct file access, tool execution, and git integration, requiring updated collaboration patterns.

## Decision

Adopt the following **Claude Code Collaboration Contract** for AI-assisted development. This ADR is versioned; updates require a new ADR (e.g., ADR-0020).

---

## Core Principles

### 1. Repository-Driven Development
**All project management, documentation, and planning live in the repository.**

- **ADRs** (`ADR/*.md`) = Immutable architectural decisions
- **Backlog** (`docs/planning/backlog.md`) = Living product roadmap, feature tracking
- **Technical Docs** (`docs/*.md`) = Implementation guides, runbooks, system architecture
- **No external tools:** No Jira, Asana, Trello - the repo IS the source of truth

**Why:** Keeps all context accessible to AI, enables git-based change tracking, eliminates tool-switching overhead.

---

## Claude Code Workflow

### Phase 1: Context Gathering (ALWAYS START HERE)
Before proposing any changes:

1. **Read relevant ADRs** - Check `ADR/` directory for architectural decisions
2. **Check backlog** - Review `docs/planning/backlog.md` for related tasks
3. **Read architecture docs** - Check `docs/architecture.md` and related technical docs
4. **Scan related files** - Use `Glob` and `Grep` to understand existing implementations
5. **Ask clarifying questions** - If scope is unclear, ask BEFORE coding

**Anti-pattern:** Starting to code without understanding existing architecture.

---

### Phase 2: Planning (Use TodoWrite for non-trivial tasks)

**When to use TodoWrite:**
- Task requires 3+ distinct steps
- Multiple files will be modified
- Changes span backend + frontend
- User explicitly requests task tracking

**Todo structure:**
```markdown
- [ ] Read existing implementation (pending)
- [ ] Update models/views/services (in_progress)
- [ ] Run tests (pending)
- [ ] Update documentation (pending)
```

**Mark completed IMMEDIATELY after finishing each step.**

**Anti-pattern:** Batching todo completions, leaving todos in_progress indefinitely.

---

### Phase 3: Implementation

#### File Operations
- **Read before Edit:** ALWAYS use `Read` tool before `Edit` or `Write`
- **Targeted edits:** Replace exact strings, preserve indentation
- **Use specialized tools:**
  - `Read` for viewing files (NOT `cat`)
  - `Edit` for modifying existing files (NOT `sed`)
  - `Write` for new files only
  - `Glob` for finding files (NOT `find`)
  - `Grep` for searching content (NOT `grep`)

#### Code Standards
- **Django patterns:** Follow existing model/view/service structure
- **Type hints:** Use Python type annotations
- **Docstrings:** Add to all new functions/classes
- **No secrets:** Never commit credentials, use environment variables
- **HIPAA compliance:** No PHI in logs, use proper access controls

#### Testing
- **Local first:** Test changes locally when possible
- **Management commands:** Create commands for one-off tasks (NOT Django admin hacks)
- **Migrations:** Always create for model changes
- **Document new commands:** Add usage examples in docstrings

---

### Phase 4: Git Workflow

#### Commits
- **Meaningful messages:** Describe WHAT changed and WHY
- **Batch related changes:** Don't commit partial work
- **Include context:** Reference ADRs, issues, or backlog items
- **Co-authoring:** Always include Claude Code co-author footer:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

#### What NOT to commit:
- `.env` files
- `db.sqlite3` (local dev database)
- `.claude/settings.local.json`
- `**/node_modules/`
- `__pycache__/`
- Azure log zips

---

## ADR Management

### Creating New ADRs
**When to write an ADR:**
- Choosing between multiple architectural approaches
- Making a decision with long-term impact
- Introducing a new technology/pattern
- Changing a previous ADR decision

**ADR Template:**
```markdown
# ADR XXXX — Title

- Status: Proposed | Accepted | Deprecated | Superseded by ADR-YYYY
- Date: YYYY-MM-DD
- Deciders: [Who made the decision]
- Context: [What problem are we solving? What constraints exist?]

## Decision
[What did we decide to do and why?]

## Consequences
**Positive:**
- [Benefit 1]

**Negative:**
- [Tradeoff 1]

**Neutral:**
- [Change 1]

## Alternatives Considered
1. **Option A:** [Description] - Rejected because [reason]
2. **Option B:** [Description] - Rejected because [reason]

## Implementation Notes
[Technical details, migration plan, rollout strategy]

## Related
- ADR-XXXX
- docs/path/to/related.md
```

**Numbering:** Use next available 4-digit number (e.g., ADR-0015, ADR-0016)

---

## Backlog Management

### Backlog Structure
```markdown
## [DONE] Recently Completed
- [x] Completed item

## [P0] High Priority - Next Sprint
### Feature Name
**Priority:** P0 (Blocker) | P1 (High) | P2 (Medium) | P3 (Low) | P4 (Future)
**Description:** [What is this feature?]
**Requirements:** [Bullet list of needs]
**Acceptance Criteria:** [ ] Checklist items
**Technical Notes:** [Implementation details]
**Related ADRs:** ADR-XXXX

## [TECH-DEBT] Known Issues
## [METRICS] Metrics to Track
## [DOCS] Documentation Needs
```

### Updating Backlog
**When to update:**
- Feature completed → Move to `[DONE]` with `[x]`
- New feature requested → Add to appropriate priority section
- Discovered tech debt → Add to `[TECH-DEBT]`
- Decision made → Link to new ADR

**Anti-pattern:** Letting backlog become stale, not linking ADRs.

---

## Communication Patterns

### Being Concise
- **Match verbosity to task complexity:** Simple fix = 1-2 sentences, complex architecture = detailed explanation
- **No preamble/postamble:** Don't say "Here's what I'll do..." or "I've completed..."
- **Direct answers:** User asks "what is 2+2?" → Answer "4" (NOT "The answer to your question is 4")
- **Explain only when asked:** Show code changes, confirm completion, move on

### Asking for Clarification
**Ask when:**
- Requirements are ambiguous
- Multiple valid approaches exist
- Change impacts existing functionality
- Security/HIPAA implications unclear

**Don't ask when:**
- You can infer from context
- ADRs/docs already answer it
- It's a minor implementation detail

---

## Operating Rules

### DO
1. ✅ Read ADRs before making architectural changes
2. ✅ Check backlog for related work
3. ✅ Use TodoWrite for multi-step tasks
4. ✅ Test locally before pushing to Azure
5. ✅ Create management commands for admin tasks
6. ✅ Write migrations for model changes
7. ✅ Keep commits atomic and well-described
8. ✅ Update backlog when completing features
9. ✅ Link related ADRs in code/commits
10. ✅ Be concise, direct, and helpful

### DON'T
1. ❌ Start coding without reading existing implementation
2. ❌ Commit `.env`, `db.sqlite3`, or local config
3. ❌ Use bash for file operations (use Read/Edit/Write)
4. ❌ Make breaking changes without user confirmation
5. ❌ Create files without reading first (if they might exist)
6. ❌ Leave todos in `in_progress` state
7. ❌ Redesign working systems mid-task
8. ❌ Add emojis unless user requests (encoding issues)
9. ❌ Batch multiple unrelated changes in one commit
10. ❌ Ignore HIPAA/security implications

---

## Tool Usage Guidelines

### File Operations
- **Read:** View file contents (use for ANY file before editing)
- **Edit:** Modify existing files (exact string replacement)
- **Write:** Create NEW files only (fails if file exists and not read)
- **Glob:** Find files by pattern (faster than bash `find`)
- **Grep:** Search file contents (faster than bash `grep`)

### Code Execution
- **Bash:** Run commands (git, python, az cli, npm)
  - Batch independent commands in parallel (single message, multiple tool calls)
  - Chain dependent commands with `&&`
- **Task:** Launch specialized agents for complex searches/analysis
  - Use when multiple rounds of search/exploration needed
  - NOT for simple file reads or direct tasks

### Git Operations
- Always check `git status` before committing
- Stage only relevant files (`git add <specific files>`)
- Use heredoc for multi-line commit messages
- Push after committing (unless user says otherwise)

---

## Azure Deployment

### Testing in Production
1. **Use management commands:** SSH to Azure, run Django commands
2. **Check logs:** Use `az webapp log tail` for errors
3. **Verify migrations:** Run `python manage.py showmigrations`
4. **Test endpoints:** Use `curl` or Django admin to verify

### Deployment Workflow
1. Commit and push to GitHub
2. GitHub Actions builds Docker container
3. Azure pulls new container (takes 5-10 minutes)
4. SSH to Azure for post-deployment tasks (migrations, seed data)

**Anti-pattern:** Editing files directly on Azure (changes will be overwritten).

---

## Definition of Done

### For Features
- [ ] Code implemented and tested locally
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (ADR/backlog/README)
- [ ] Committed with clear message
- [ ] Pushed to GitHub
- [ ] Verified in production (if critical path)
- [ ] Backlog updated (marked `[x]` or moved to `[DONE]`)

### For Bug Fixes
- [ ] Root cause identified
- [ ] Fix implemented and tested
- [ ] No regressions introduced
- [ ] Committed with reference to issue
- [ ] Deployed and verified

### For ADRs
- [ ] Context clearly stated
- [ ] Decision explained with rationale
- [ ] Consequences documented
- [ ] Alternatives considered
- [ ] Implementation notes included
- [ ] Related ADRs/docs linked
- [ ] Backlog updated with ADR reference

---

## Consequences

**Positive:**
- Repository is single source of truth
- AI has full context for every decision
- Git history shows reasoning behind changes
- No external tool dependencies
- Easy onboarding (just clone repo)

**Negative:**
- Non-technical stakeholders need training to use git/markdown
- Large ADR/backlog files may become unwieldy
- Requires discipline to keep docs updated

**Neutral:**
- Need to abstract key info to Notion for non-developers
- May need tooling to visualize backlog/ADRs

---

## Related

- ADR-0005: AI Collaboration Contract (original - superseded)
- ADR-0003: Coding Standards
- ADR-0009: User Hierarchy and RBAC
- ADR-0011: Authentication (SSO + Magic Links)
- `docs/planning/backlog.md`: Product backlog
- `docs/architecture.md`: System architecture
- `docs/technical/how-to-work-with-bertc.md`: Developer playbook

---

## Implementation Plan

1. **Immediate:**
   - [x] Create ADR-0014
   - [x] Update backlog.md to reference ADRs
   - [x] Add "Related ADRs" section to all backlog items
   - [x] Document all management commands (see CONTRIBUTING.md)
   - [x] Create backlog maintenance checklist *(deprecated - replaced by Signal)*

2. **Short-term (this sprint):**
   - [x] Audit existing ADRs, mark deprecated ones (ADR-0005 superseded)
   - [x] Create ADRs for recent architectural decisions (ADR-0011 SSO/magic links, ADR-0015 HIPAA)
   - [x] Create comprehensive CONTRIBUTING.md for developer onboarding

3. **Long-term:**
   - [x] Build Notion sync tool *(deprecated - Signal dashboard built instead, see ADR-0017)*
   - [ ] Create ADR template generator script *(low priority)*
   - [ ] Add pre-commit hook to validate ADR format *(low priority)*

---

## Addendum: Implementation Status (2025-10-13)

### Backlog Management Evolution

**Original Decision:** Use `docs/planning/backlog.md` as single source of truth.

**What Changed:** Built Signal dashboard (ADR-0017) as custom project tracking tool optimized for AI collaboration.

**Current State:**

- ✅ **`docs/planning/backlog.md`** - Still maintained (human-readable format)
- ✅ **`docs/planning/backlog-data.json`** - Machine-readable source (parsed from backlog.md)
- ✅ **Signal Dashboard** (`/dashboard/signal/`) - Production SSO-protected visualization
- ✅ **Dual Metrics:** User Ready % (launch readiness) + Task % (planning)
- ✅ **AI-friendly:** Claude Code edits JSON programmatically (no manual clicking)
- ✅ **Real-time:** Auto-deploys in 2-3 minutes after git push

**Flow:** backlog.md (human) → backlog-data.json (machine) → Signal dashboard (visualization)

**Why:** Signal solved the "activity ≠ results" problem by tracking dual metrics (task completion + user workflow readiness) rather than story points or commits.

### ADR Format Evolution

**Original Template:** Basic ADR structure from ADR-0014.

**Current Template:** Enhanced format from ADR-0017:

- Bullet-point header (Status, Date, Authors, Priority, Related)
- Implementation Status section with checkboxes
- Why NOT alternatives section (explicit rejections)
- Consequences split into Positive/Negative/Accepted Trade-offs
- Migration Decision Criteria tables

**Recent ADRs Following New Format:**

- ADR-0016: Dashboardless AI Assistant for Clinicians
- ADR-0017: Signal Dashboard for Project Tracking

### Reporting Tools

**Status:** ✅ **COMPLETED** (2025-10-13)

Built comprehensive reporting system in `docs/planning/reporting/`:

- ✅ `generate_reports.py` - Automated report generation with dual metrics
- ✅ Color-coded status indicators (🟢 GREEN, 🟡 YELLOW, 🟠 ORANGE, 🔴 RED)
- ✅ CEO-friendly PDF reports (HTML → PDF with status badges)
- ✅ Email summaries with visual status indicators
- ✅ CSV exports for Excel/Sheets analysis
- ✅ Comprehensive README with Signal integration guidance

**Key Features:**

- Dual metrics (User Ready % + Task %)
- Variance-based risk assessment (actual vs expected completion)
- Pace calculation (ahead/on/behind schedule)
- Status breakdown tables showing component health

### Deprecated Decisions

1. **Notion Sync Tool** *(Long-term plan #1)*
   - **Status:** Deprecated
   - **Reason:** Signal dashboard provides real-time SSO-protected access. No need for Notion sync.
   - **Alternative:** Share Signal URL or PDF reports with stakeholders

2. **Manual Backlog Updates Only**
   - **Status:** Enhanced (not deprecated)
   - **Reason:** `backlog.md` is still maintained but now parsed into `backlog-data.json` for Signal visualization
   - **Improvement:** Added machine-readable layer + real-time dashboard while keeping human-readable markdown

3. **Backlog Maintenance Checklist** *(Immediate plan #5)*
   - **Status:** Deprecated
   - **Reason:** Signal dashboard with filters/badges makes manual checklists unnecessary

### What's Still Valid

✅ **Core Principles** - Repository-driven development, no external tools
✅ **Claude Code Workflow** - Context gathering, TodoWrite, implementation patterns
✅ **ADR Management** - Creating ADRs for architectural decisions
✅ **Communication Patterns** - Being concise, asking for clarification appropriately
✅ **Git Workflow** - Meaningful commits, co-authoring, not committing secrets
✅ **Tool Usage Guidelines** - Read/Edit/Write, Bash, Task agent patterns
✅ **Azure Deployment** - Management commands, deployment workflow
✅ **Definition of Done** - Feature/bug/ADR completion checklists

### Open Questions

1. **ADR Template Generator Script** - Low priority, manual creation working fine
2. **Pre-commit Hook for ADR Validation** - Low priority, linting sufficient

---

## Addendum: Data Loss Incident & Lessons Learned (2025-10-13)

### What Happened

During Staff Dashboard development session (October 13, 2025), approximately **3 hours of work was lost** due to uncommitted changes. The sophisticated dashboard features (content type badges, filters, clickable rows, clinician notes, program warnings) were fully implemented and working but never committed to git.

**Timeline:**

1. **Session Start:** Began implementing Discovery 10-17 features (content type visibility, clickable rows, etc.)
2. **Commit Pause:** CTO paused commits to avoid affecting production (no staging environment yet)
3. **Extensive Development:** Built sophisticated dashboard with all P0 features over ~3 hours
4. **Claude Code Crash:** Session context lost, Claude requested `/rewind` command (doesn't exist)
5. **Token Limit Hit:** Ran out of tokens on $100/month plan during recovery attempt (~12 hours of total coding in 24-hour period)
6. **Plan Upgrade:** Upgraded to $200/month Max plan to continue
7. **Data Loss Confirmed:** Features existed in screenshots but were never committed to git
8. **Recovery Required:** Spent additional hours rebuilding from discovery log specifications

### Root Causes

1. **No Staging Environment**
   - Fear of breaking production led to pausing commits
   - Direct production deployment creates pressure to avoid experimental commits
   - No safe space to test changes before production

2. **Insufficient Commit Frequency**
   - Worked for ~3 hours without committing
   - Lost all work when Claude Code session ended
   - No incremental saves of working features

3. **Token Limit Constraints**
   - $100/month plan insufficient for ~12 hours of total coding in 24-hour period
   - Hit limit during critical recovery phase
   - Plan upgrade required to continue work

4. **Missing Recovery Tools**
   - Claude Code requested `/rewind` command that doesn't exist
   - No built-in session recovery for crashed contexts
   - Git was only safety net (but nothing was committed)

### What Was Lost

**Sophisticated Dashboard Features (Discovery 10-17):**
- ✅ Content Type Badges (R/M/A/MC) with color coding
- ✅ Content Type Filter dropdown with JavaScript
- ✅ Status badges (Read/Completed/Delivered/In Stock)
- ✅ Clickable course rows with preview navigation
- ✅ Back button support from course preview
- ✅ Clinician Notes section with timestamps and author
- ✅ Program Progress warning banner
- ✅ Note types (clinical/administrative/followup)
- ✅ Private note flag (RBAC for note visibility)

**Estimated Impact:**

- **3 hours of development time** lost
- **$150 in token costs** (including upgrade to Max plan)
- **Additional 3-4 hours** required to rebuild from discovery log
- **Total Cost:** ~6-7 hours + $150

### Recovery Process

1. **Checked Git Reflog:** No lost commits (work was never committed)
2. **Searched for Backups:** No VSCode backups, temp files, or stashed changes
3. **Used Discovery Log:** Systematically rebuilt features from Discovery 10-17 specifications
4. **Verified Against Screenshots:** User provided screenshots showing expected behavior
5. **Committed Incrementally:** Made commits during rebuild to prevent further loss

**Commits Created During Recovery:**
- `82f41c9` - Rebuild sophisticated dashboard features (templates + models)
- `0d89656` - Complete clinician notes and program warning (backend logic)

### Lessons Learned

#### 1. Commit Early, Commit Often
**Rule:** Commit every 30-60 minutes when actively developing, or after each feature completion.

**Why:** Git is the only recovery mechanism. Uncommitted work is at risk from:
- Claude Code session crashes
- Token limit exhaustion
- Browser crashes
- File corruption
- Accidental overwrites

**Implementation:**
```bash
# Every feature completion
git add <files> && git commit -m "Add <feature>"

# Every 30-60 minutes during active development
git add <files> && git commit -m "WIP: <feature> - <progress note>"
```

#### 2. Token Budget Awareness
**Discovery:** 12 hours of intensive coding in 24-hour period exceeded $100/month plan limits.

**Max Plan Capacity:**
- $200/month provides ~2x token capacity
- Sufficient for multi-day intensive development sessions
- Necessary for recovery scenarios (doubled token usage during rebuild)

**Recommendation:** Maintain Max plan during active development sprints.

#### 3. Staging Environment Is P1, Not P2
**Previous Priority:** No staging environment (implicitly P2+)

**New Priority:** **P1 - High Priority**

**Why Critical:**
- Enables experimentation without production risk
- Allows frequent commits without deployment fear
- Provides realistic testing environment
- Reduces "commit paralysis" from production concerns

**Required Environments:**
1. **Local** - Developer workstation (existing)
2. **Staging/Dev** - Azure App Service clone for testing (MISSING - P1)
3. **Production** - Live environment (existing)

**Implementation Plan:**
- Add to backlog as **P1 task**
- Create Azure App Service staging slot OR separate dev environment
- Configure GitHub Actions for staging deployment
- Document staging URL and access process

#### 4. Discovery Log as Recovery Tool
**Success:** Discovery log (STAFF-DASHBOARD-DISCOVERY-LOG.md) enabled complete feature reconstruction.

**Why It Worked:**
- Detailed specifications for each feature
- Screenshots documenting expected behavior
- Acceptance criteria for verification
- Technical implementation notes

**Best Practice:** Maintain discovery logs for all major features with:
- Feature description and rationale
- Visual mockups or screenshots
- Technical implementation details
- Acceptance criteria checklist

#### 5. Session Continuation Protocols
**What Happened:** Claude Code crash led to `/rewind` request (non-existent command).

**Better Approach:**
1. **Before ending session:** Review `git status` and commit all work
2. **If session crashes:** Create continuation summary with:
   - Current work state
   - Last commit SHA
   - Uncommitted changes (from memory/screenshots)
   - Next steps

**Implementation:** Add to ADR-0014 workflow:
```markdown
### Session End Checklist
- [ ] Run `git status` to check uncommitted work
- [ ] Commit or stash all changes
- [ ] Document any WIP in session notes
- [ ] If crash occurs: Screenshot current state before closing
```

### Action Items

1. **Immediate:**
   - [x] Document incident in ADR-0014 addendum
   - [ ] Add staging environment to backlog as P1 task
   - [ ] Update ADR-0014 with "Session End Checklist"

2. **Short-term:**
   - [ ] Create Azure staging environment (P1)
   - [ ] Configure GitHub Actions for staging deployment
   - [ ] Add pre-commit hook reminder for long sessions (optional)

3. **Long-term:**
   - [ ] Maintain Max plan during active development
   - [ ] Review discovery log quality quarterly
   - [ ] Consider auto-commit tooling for Claude Code sessions

### Updated Operating Rules

**ADD to "DO" list:**

- ✅ **Commit every 30-60 minutes** during active development
- ✅ **Check git status** before ending sessions
- ✅ **Use staging environment** for experimental features (when available)
- ✅ **Document features in discovery logs** with screenshots

**ADD to "DON'T" list:**

- ❌ **Work for 3+ hours** without committing
- ❌ **Pause commits** due to lack of staging environment
- ❌ **Rely on session continuity** across Claude Code restarts
- ❌ **Assume work is safe** without git commits

### Financial Impact Summary

| Item | Cost |
|------|------|
| Initial token usage (12 hrs development) | ~$50 (estimated) |
| Token usage during recovery attempt | ~$50 (hit limit) |
| Max plan upgrade | $100/month increase |
| Token usage for rebuild | ~$50 (estimated) |
| **Total One-Time Cost** | **~$150** |
| **Ongoing Increased Cost** | **$100/month** |

**ROI on Max Plan:** Worth the cost to prevent future data loss and enable intensive development sessions.

**Staging Environment ROI:**
- Prevents production incidents (priceless)
- Eliminates commit paralysis (productivity gain)
- Enables experimentation (innovation enabler)
- **Cost:** ~$50-100/month for Azure staging slot
- **Value:** Prevents future 12-18 hour rebuild scenarios

---

**Date:** 2025-10-13
**Incident Duration:** ~6-7 hours (3 hrs lost + 3-4 hrs rebuild)
**Cost:** $150 + ongoing $100/month Max plan
**Status:** Resolved via discovery log reconstruction
**Prevention:** Staging environment (P1), frequent commits, session checklists

---

## Addendum 3: Consulting Work Model & Story Points (Oct 19, 2025)

### Context
During Session 11 (Signal Dashboard Calendar Redesign), Bert clarified an important principle:

> "Remember that I am going to be using these tools to deliver consulting work in addition to my other work. If I need to document or plan, that is still development time for me."

This surfaced a critical gap: **Sessions 8 and 9 had 0 story points** despite 4-6 hours of work each.

### The Problem: PM/Dev Gap in Traditional Project Management

**Traditional PM Problem:**
- Developers "crack the hood" and find undocumented work (architecture research, UX improvements, planning)
- This work NEVER gets surfaced to PMs from devs
- Story points don't reflect actual effort
- Velocity metrics become meaningless

**What Was Missing:**
- Session 8: Signal UX improvements (2 pts) + critical path documentation (1 pt) = **3 pts undocumented**
- Session 9: ADR-0019 architecture research (3 pts) + R3 release planning (1 pt) + backlog reorder (1 pt) = **5 pts undocumented**

### Solution: Retroactive Estimation & Consulting Time Recognition

**New Practice:**
1. **ALL development time is billable** - planning, documentation, architecture research, UX work
2. **Retroactive story points** when undocumented work surfaces
3. **Track with `retroactiveEstimation` field:**
   ```json
   {
     "storyPoints": 5,
     "estimatedStoryPoints": 0,
     "retroactiveEstimation": {
       "reason": "PM/Dev gap: architecture work not captured",
       "breakdown": {
         "ADR-0019 architecture research": 3,
         "R3 PWA release planning": 1,
         "Backlog reordering": 1
       }
     }
   }
   ```

### Consulting Work = Development Work

**These activities count as story points:**
- Architecture research and ADR writing
- UX/UI design iterations and improvements
- Planning and backlog grooming
- Signal dashboard updates
- Session documentation
- Critical path analysis
- Technology evaluation

**Why This Matters:**
- **Accurate velocity:** 89 pts → 97 pts (8 pts undocumented work found)
- **Honest estimates:** Future work includes architecture/planning time
- **Client billing:** All consulting time is development time
- **Learning:** What actually takes time vs what we think takes time

### Updated Story Points Guidance

**When estimating tasks:**
- Include time for architecture research
- Include time for UX iterations
- Include time for documentation
- Include time for planning/grooming

**Example:**
- ❌ OLD: "Implement feature X: 3 pts (just coding)"
- ✅ NEW: "Implement feature X: 5 pts (1 pt research, 3 pts coding, 1 pt docs)"

### AI Assistant Implications

**Claude Code should:**
1. ✅ Recognize planning/documentation as development work
2. ✅ Estimate story points for ALL work (not just code)
3. ✅ Track time spent on architecture/research
4. ✅ Surface undocumented work retroactively
5. ✅ Update velocity metrics when gaps are found

**Claude Code should NOT:**
6. ❌ Treat documentation as "overhead" separate from development
7. ❌ Assign 0 story points to planning sessions
8. ❌ Assume only coding counts as "real work"

### Outcome

**Velocity Truth:**
- Sessions 1-11: **97 story points** (was 89)
- Avg: **8.8 pts/session** (was 8.1 pts/session)
- Consulting work now visible in metrics

**Client Value:**
- Transparent billing - architecture work is billable
- Accurate project velocity
- Honest estimates for future work

---

**Date:** 2025-10-19
**Status:** Active - applies to all future work
**Impact:** Story point estimates +15-30% to include planning/architecture time
