---
name: Estimating Signal Story Points
description: Estimates story points for Signal backlog tasks using a standardized rubric. Story points measure task complexity, scope, and risk to enable velocity tracking and session planning. Use when creating or estimating backlog tasks.
---

# Estimating Signal Story Points

This skill provides a standardized rubric for estimating story points on Signal backlog tasks.

## When to Use This Skill

- Creating new backlog tasks
- Estimating effort for planned work
- User asks "How many points is this task?"
- Planning upcoming sessions
- Calculating session velocity

## What Story Points Measure

Story points are a **composite metric** reflecting:
1. **Complexity**: Technical difficulty
2. **Scope**: How much work is involved
3. **Uncertainty**: How well we understand the requirements
4. **Risk**: Likelihood of complications or rework

**Story points do NOT measure:**
- Exact time/hours
- Business value (use priority for that)
- Developer skill level

## Story Point Scale (Fibonacci)

- **1 point**: Trivial
- **2 points**: Small
- **3 points**: Medium
- **5 points**: Large
- **8 points**: Very Large
- **13 points**: Epic (should be broken down)
- **21+ points**: Too large (must be split into smaller tasks)

## Estimation Rubric

### 1 Point - Trivial
**Scope**: Single file, < 50 lines of code
**Complexity**: Simple logic, no edge cases
**Uncertainty**: Fully understood, done it before
**Risk**: Almost zero risk

**Examples:**
- Add a new CSS color variable
- Update a string constant
- Fix a typo in documentation
- Add a simple validation check
- Update a version number

**Signal-Specific Examples:**
- Update project status message
- Add new task to backlog.md
- Change dashboard color scheme
- Fix markdown formatting

### 2 Points - Small
**Scope**: 1-2 files, < 150 lines of code
**Complexity**: Straightforward logic, few edge cases
**Uncertainty**: Clear requirements, minor unknowns
**Risk**: Low risk, unlikely to have complications

**Examples:**
- Add a new field to existing form
- Create a simple utility function
- Write basic unit tests
- Add new section to documentation
- Simple bug fix with known cause

**Signal-Specific Examples:**
- Add markdown parser for bold/italic text (P0-0)
- Add favicon configuration (P0-4)
- Create simple export function
- Add new metric to dashboard header
- Update burn-up chart styling

### 3 Points - Medium
**Scope**: 2-4 files, < 300 lines of code
**Complexity**: Moderate logic, several edge cases
**Uncertainty**: Understood but requires some research
**Risk**: Medium risk, some potential for complications

**Examples:**
- Create new UI component with state
- Implement API endpoint with validation
- Add feature flag system
- Refactor existing function
- Write integration tests

**Signal-Specific Examples:**
- Add project status banner with metadata (P0-1)
- Enhanced CEO reports with new sections (P0-2)
- Dynamic footer with configuration (P0-3)
- Session-based velocity chart
- Add dependency graph visualization

### 5 Points - Large
**Scope**: 4-8 files, < 600 lines of code
**Complexity**: Complex logic, many edge cases
**Uncertainty**: Some unknowns, needs investigation
**Risk**: Medium-high risk, likely complications

**Examples:**
- Build new page/view with multiple components
- Implement authentication system
- Create data migration script
- Complex algorithm implementation
- Multi-step workflow

**Signal-Specific Examples:**
- Configuration file system (P1-0)
- Git history analyzer script (P1-1)
- Session record generator (P1-2)
- AI-powered session summaries (P2-0)
- Task effort estimation AI (P2-1)

### 8 Points - Very Large
**Scope**: 8-15 files, < 1200 lines of code
**Complexity**: Very complex, intricate logic
**Uncertainty**: Significant unknowns, R&D needed
**Risk**: High risk, expect multiple iterations

**Examples:**
- Build major new feature
- Large architectural refactor
- Complex integration with external system
- Performance optimization requiring profiling
- Multi-component feature with dependencies

**Signal-Specific Examples:**
- One-command deployment script (P1-3)
- Backlog prioritization assistant (P2-2)
- Automated velocity predictions (P2-3)
- Real-time git integration (P3-1)

### 13 Points - Epic
**Scope**: 15+ files, > 1200 lines of code
**Complexity**: Extremely complex, system-wide changes
**Uncertainty**: Many unknowns, exploratory work
**Risk**: Very high risk, will require multiple sessions

**Examples:**
- Build entire new subsystem
- Major framework migration
- Complete application redesign
- Large-scale data transformation

**Signal-Specific Examples:**
- Multi-project dashboard (P3-0)
- Custom chart builder (P3-2)
- Full Signal automation suite

**⚠️ Tasks estimated at 13 points should be broken down into smaller tasks!**

## Estimation Process

### Step 1: Understand the Task

Read the task description carefully:
- What is the objective?
- What deliverables are expected?
- Are there acceptance criteria?
- What dependencies exist?

### Step 2: Assess Each Factor

**Complexity** (1-5 scale):
1. Trivial logic
2. Simple logic
3. Moderate logic
4. Complex logic
5. Very complex logic

**Scope** (1-5 scale):
1. Single file, < 50 lines
2. 1-2 files, < 150 lines
3. 2-4 files, < 300 lines
4. 4-8 files, < 600 lines
5. 8+ files, > 600 lines

**Uncertainty** (1-5 scale):
1. Fully understood
2. Mostly understood, minor questions
3. Some unknowns, needs research
4. Many unknowns, R&D required
5. Mostly unknown, exploratory

**Risk** (1-5 scale):
1. Almost zero risk
2. Low risk
3. Medium risk
4. High risk
5. Very high risk

### Step 3: Calculate Composite Score

Average the four factors:
```
Composite = (Complexity + Scope + Uncertainty + Risk) / 4
```

**Mapping to Story Points:**
- 1.0 - 1.5 → **1 point**
- 1.5 - 2.5 → **2 points**
- 2.5 - 3.5 → **3 points**
- 3.5 - 4.25 → **5 points**
- 4.25 - 4.75 → **8 points**
- 4.75+ → **13 points** (break it down!)

### Step 4: Gut Check & Adjust

Compare to known reference tasks:
- "Is this bigger or smaller than Task X which was N points?"
- "Have I done something similar before?"
- "Does this feel right?"

**Adjust if necessary** - The rubric is a guide, not a rule.

### Step 5: Document Estimate

Add story points to task in `backlog-data.json`:

```json
{
  "id": "P1-0",
  "title": "Configuration File",
  "storyPoints": 5,
  "estimatedDays": 1
}
```

## Velocity Calculation

### Session Velocity

After completing a session, sum the story points of completed tasks:

```
Session Velocity = Sum of story points completed in session
```

**Example:**
Session 007 completed:
- Task A: 3 points
- Task B: 5 points
- Task C: 2 points
- **Session Velocity: 10 points**

### Rolling Average Velocity

Track velocity across sessions to predict future throughput:

```
Avg Velocity = Total points completed / Number of sessions
```

**Example:**
- Session 005: 8 points
- Session 006: 12 points
- Session 007: 10 points
- **Average Velocity: 10 points/session**

### Session Planning

Use average velocity to plan sessions:

```
Can I complete Task X (8 points) and Task Y (3 points) in one session?
8 + 3 = 11 points vs 10 point average velocity
→ Probably yes, slightly ambitious
```

## Reference Examples (Signal Backlog)

### Priority 0 Tasks (Quick Wins)

| Task | Points | Rationale |
|------|--------|-----------|
| P0-0: Markdown Parser | **2** | Simple, 1 function, known algorithm |
| P0-1: Status Banner | **3** | UI component, metadata integration |
| P0-2: Enhanced CEO Reports | **3** | Multiple sections, data aggregation |
| P0-3: Dynamic Footer | **2** | Simple templating, minimal logic |
| P0-4: Configurable Favicon | **1** | Trivial, single config option |

### Priority 1 Tasks (Automation)

| Task | Points | Rationale |
|------|--------|-----------|
| P1-0: Configuration File | **5** | Multiple configs, validation, examples |
| P1-1: Git History Analyzer | **5** | Complex parsing, session detection logic |
| P1-2: Session Record Generator | **5** | Template system, git integration |
| P1-3: Deployment Script | **8** | Multi-step orchestration, error handling |
| P1-4: Quick Start Guide | **2** | Documentation, clear scope |

### Priority 2 Tasks (AI Integration)

| Task | Points | Rationale |
|------|--------|-----------|
| P2-0: AI Session Summaries | **5** | API integration, prompt engineering |
| P2-1: Task Effort Estimation | **5** | ML logic, historical data analysis |
| P2-2: Backlog Prioritization | **8** | Complex algorithm, dependencies |
| P2-3: Velocity Predictions | **5** | Statistical analysis, forecasting |

### Priority 3 Tasks (Future Features)

| Task | Points | Rationale |
|------|--------|-----------|
| P3-0: Multi-Project Dashboard | **13** | Epic - should break down |
| P3-1: Real-Time Git Integration | **8** | Webhooks, polling, auto-update |
| P3-2: Custom Chart Builder | **13** | Epic - should break down |

## Common Estimation Mistakes

### Over-Estimating
- **Padding**: Adding "safety buffer" to estimates
- **Solution**: Trust the rubric, velocity averages naturally

### Under-Estimating
- **Forgetting tests**: Not including test writing time
- **Missing edge cases**: Only considering happy path
- **Solution**: Consider full scope including tests, docs, error handling

### Inconsistent Scaling
- **Treating points as hours**: "5 points = 5 hours"
- **Solution**: Points are relative complexity, not time

### Analysis Paralysis
- **Over-thinking**: Spending 20 minutes to estimate a 1-point task
- **Solution**: Use gut feel for small tasks, detailed rubric for large ones

## Integration with Signal Workflow

### Creating New Tasks

When adding tasks to backlog:

1. Write task description
2. Estimate story points using this rubric
3. Generate UUID using nomenclature: `YYMM-DD-descriptive-slug`
   - YYMM = Year and month (e.g., `2511` for November 2025)
   - DD = Day of month (e.g., `04` for the 4th)
   - descriptive-slug = Kebab-case task description (e.g., `superadmin-audit-logging`)
4. Add to `backlog-data.json`:
   ```json
   {
     "id": "P1-5",
     "uuid": "2511-04-new-feature-name",
     "title": "New Feature",
     "storyPoints": 5,
     "status": "not_started",
     "priority": "P1"
   }
   ```

**UUID Examples:**
- `2511-04-superadmin-audit-logging` - Created November 4, 2025
- `2510-19-org-admin-dashboard` - Created October 19, 2025
- `2509-courses-sms-twilio` - Created September 2025 (older format without day)

### Completing Tasks

When marking tasks done:

1. Update task status to "done"
2. Record actual story points if different from estimate
3. Calculate session velocity
4. Update rolling average

### Updating Signal

When running "Update Signal":
- Calculate session velocity (sum of points completed)
- Update average velocity metric
- Use velocity for release forecasting

## Key Principles

1. **Relative Sizing**: Compare to known tasks, not absolute measures
2. **Team Agreement**: If working with others, estimate together
3. **Learn and Adjust**: Track actual vs estimated, calibrate over time
4. **Break Down Large Tasks**: Nothing over 13 points
5. **Consistency**: Use same rubric for all estimates

## Quick Reference Card

```
1 pt  = Trivial      | 1 file, < 1 hour, zero risk
2 pts = Small        | 1-2 files, straightforward, low risk
3 pts = Medium       | 2-4 files, moderate complexity, some risk
5 pts = Large        | 4-8 files, complex, research needed
8 pts = Very Large   | 8-15 files, very complex, high risk
13 pts = Epic        | BREAK IT DOWN!
```

## Tools & Resources

### Estimation Planning Poker

If estimating with a team, use planning poker:
1. Present task to team
2. Everyone estimates independently
3. Reveal estimates simultaneously
4. Discuss differences
5. Re-estimate until consensus

### Historical Data

Use completed tasks as reference points:
- "This is similar to P0-2 which was 3 points"
- "This is twice as complex as P1-4 which was 2 points"

### Estimation Confidence

Add confidence level (optional):
- **High confidence**: Done this before, clear requirements
- **Medium confidence**: Similar tasks, some unknowns
- **Low confidence**: Novel work, many unknowns

Low confidence estimates may need research spike first.

---

**Remember**: Story points measure **complexity and scope**, not business value. Use priority (P0, P1, P2, P3) for value ranking.
