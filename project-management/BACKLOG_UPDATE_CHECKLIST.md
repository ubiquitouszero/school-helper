# Signal Backlog Update Checklist

**FOR: AI Assistant (Claude)**
**PURPOSE**: Complete checklist to execute when user says "update Signal" or "update the backlog"

**CRITICAL**: When user says "update Signal," this means ALL of the following must be done automatically. Do not wait to be asked for individual pieces.

---

## User Expectation

When user says: **"Update Signal"** or **"Update the backlog and documentation"**

**The AI MUST do ALL of these steps:**
1. ✅ Analyze recent git commits
2. ✅ Update backlog.md with completed work
3. ✅ Update backlog-data.json with ALL required fields
4. ✅ Create/update session documentation files
5. ✅ Validate JSON syntax
6. ✅ Verify all 6 dashboard tabs will display correctly
7. ✅ Provide summary of what was updated

**Do NOT ask the user to verify tabs manually - YOU verify the data is correct for all tabs.**

---

## Quick Validation Steps

After updating `backlog-data.json`, verify these key areas:

### 1. ✅ JSON Validation
```bash
python -c "import json; json.load(open('project-management/backlog-data.json'))" && echo "✅ JSON is valid!"
```

### 2. 🔄 Refresh Dashboard
1. Navigate to http://localhost:8000 (or your dashboard URL)
2. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### 3. 📊 Tab-by-Tab Verification

#### **Header Section** ✅
- [ ] Project name displays correctly
- [ ] Last updated date is current
- [ ] Status banner shows correct status (e.g., "Phase 1: COMPLETE!")
- [ ] Project phase displays (e.g., "Phase 1: Quick Wins ✅ SHIPPED")
- [ ] Velocity stats are up-to-date
- [ ] MVP Status card shows correct percentage

**Data Sources:**
- `metadata.projectName`
- `metadata.lastUpdated`
- `metadata.currentStatus`
- `metadata.projectPhase`
- `metadata.velocity.*`
- `mvpScope.userReadyPercent`

#### **Tab 1: Overview** 📋
- [ ] Task count is accurate
- [ ] Priority chart shows correct distribution
- [ ] Filter buttons work (All/Done/Doing/To Do)
- [ ] Completed tasks show "✓ Done" badge
- [ ] MVP vs Stretch badges display correctly
- [ ] Task descriptions render properly
- [ ] Click-to-expand works for task details

**Data Sources:**
- `tasks[]` - All task data
- Priority distribution calculated from `tasks[].priority`

#### **Tab 2: Blockers & Risks** 🚨
- [ ] Blockers list is current (or shows "No blockers" message)
- [ ] AI Analysis box shows updated insights
- [ ] Risks section reflects current risks
- [ ] Recommendations are relevant to current phase
- [ ] Markdown formatting renders (**bold**, *italic*)

**Data Sources:**
- `currentBlockers[]`
- `velocityInsights.aiAnalysis`
- `velocityInsights.risks[]`
- `velocityInsights.recommendations[]`

#### **Tab 3: Burn-Up Chart** 📈
- [ ] Chart shows all data points (including latest)
- [ ] "Today" label reflects current completion
- [ ] MVP scope line (blue dashed) is visible
- [ ] Actual commits (green line) shows progress
- [ ] Scope metrics box shows correct numbers
- [ ] Percentage complete is accurate

**Data Sources:**
- `burnUpData.dataPoints[]` - Chart timeline
- `burnUpData.totalScope`
- `burnUpData.completedScope`
- `burnUpData.percentComplete`
- `mvpScope.totalCommits` - MVP line

**Critical**: Ensure `burnUpData.dataPoints[]` includes:
- All session data points
- A "Today" data point with current status
- Correct `cumulativeCommits` values

#### **Tab 4: Timeline** 📅
- [ ] Gantt chart renders without errors
- [ ] Tasks with dates show in timeline
- [ ] Active tasks are highlighted
- [ ] P0 and P1 sections organized correctly

**Data Sources:**
- `tasks[]` filtered by `startDate !== null`
- Uses `task.startDate` and `task.targetDate`

**Note**: Only tasks with `startDate` will appear

#### **Tab 5: Dependencies** 🔗
- [ ] Dependency graph renders
- [ ] Arrows show blocking relationships
- [ ] Priority color coding works (P0=red, P1=orange, P2=yellow)
- [ ] Legend displays correctly
- [ ] Shows message if no dependencies

**Data Sources:**
- `tasks[]` filtered by `blockedBy.length > 0`
- Uses `task.blockedBy[]` and `task.blocks[]`

**Note**: Only tasks with dependencies will appear

#### **Tab 6: Velocity Analysis** 🚀
- [ ] Weekly summary cards show all weeks
- [ ] AI summaries display with markdown formatting
- [ ] Key accomplishments list is current
- [ ] Historical features chart shows all sessions
- [ ] Commits per day bars are accurate

**Data Sources:**
- `weeklyAnalysis[]` - Weekly summary cards
- `historicalFeatures[]` - Velocity chart data

---

## Complete Update Workflow

When you complete work and want to update the dashboard:

### Step 1: Analyze Git History
```bash
git log --format="%h|%ai|%s" -10
```

### Step 2: Update `backlog.md`
- Add completed session to "Completed Work"
- Mark completed tasks with ✅ DONE
- Update "Success Metrics"
- Update "Development Velocity"

### Step 3: Update `backlog-data.json`

#### 3a. Update Metadata
```json
{
  "metadata": {
    "lastUpdated": "2025-10-15",              ← Update date
    "currentStatus": "...",                    ← Update status message
    "projectPhase": "...",                     ← Update phase
    "velocity": {
      "avgCommitsPerDay": 2.25,               ← Recalculate
      "totalCommits": 9,                       ← Update count
      "workingDaysTracked": 4,                ← Update days
      "currentSprint": "..."                   ← Update sprint name
    }
  }
}
```

#### 3b. Move Completed Tasks
- Change `status: "not_started"` → `"completed"`
- Add `actualEndDate`
- Add `commits: []` array with commit hashes
- Optionally: Move from P0-X to DONE-X ID

#### 3c. Add Session to Historical Data
Add to `completedWork[]`:
```json
{
  "session": "Session 006: ...",
  "date": "2025-10-15",
  "duration": "2 hours",
  "commits": 4,
  "summary": "..."
}
```

Add to `historicalFeatures[]`:
```json
{
  "name": "Session 006: ...",
  "dates": "Oct 15, 2025",
  "workingDays": 1,
  "commits": 4,
  "commitsPerDay": 4.0,
  "effort": "S",
  "complexity": "Medium"
}
```

#### 3d. Update Burn-Up Data
Add new data point to `burnUpData.dataPoints[]`:
```json
{
  "date": "2025-10-15",
  "cumulativeCommits": 9,
  "label": "Session 6: Description (4 commits)"
}
```

Update final "Today" point:
```json
{
  "date": "2025-10-15",
  "cumulativeCommits": 9,
  "label": "Today - Phase X: Status"
}
```

Update scope metrics:
```json
"totalScope": 9,
"completedScope": 9,
"percentComplete": 100
```

#### 3e. Update Weekly Analysis
Update latest week in `weeklyAnalysis[]`:
```json
{
  "weekNumber": 1,
  "dateRange": "Oct 12-15, 2025",
  "commits": 9,                              ← Update count
  "aiSummary": "...",                        ← Update summary
  "keyAccomplishments": [...]                ← Add new items
}
```

#### 3f. Update Velocity Insights
Update `velocityInsights.aiAnalysis` with current status
Update `velocityInsights.recommendations` with next steps
Update `velocityInsights.risks` if applicable

#### 3g. Update MVP Scope
```json
"mvpScope": {
  "description": "...",                      ← Update description
  "status": "Phase 1: COMPLETE ✅",         ← Update status
  "phase1Complete": true,                    ← Update bool
  "totalCommits": 9,                         ← Update scope
  "completedCommits": 9,                     ← Update progress
  "percentComplete": 100,                    ← Recalculate
  "userReadyPercent": 100                    ← Update MVP %
}
```

### Step 4: Create Session Documentation
Create `project-management/sessions/session-XXX-name.md`:
```markdown
# Session XXX: Title

**Date**: October XX, 2025
**Duration**: ~X hours
**Status**: Completed
**Commits**: X
**Commit Hashes**: abc1234, def5678

## Objective
[What was the goal?]

## Work Completed
[What was done?]

## Decisions Made
[Key decisions?]

## Metrics
- **Total Commits**: X
- **Session Duration**: X hours
- **Commits/Hour**: X.X

## Outcome
[What was delivered?]
```

### Step 5: Validate JSON
```bash
python -c "import json; json.load(open('project-management/backlog-data.json'))" && echo "✅ Valid!"
```

### Step 6: Test Dashboard
1. Refresh dashboard (Ctrl+Shift+R)
2. Go through Tab-by-Tab Verification checklist above
3. Test export reports functionality
4. Verify CEO report includes latest data

### Step 7: Commit Changes
```bash
git add backlog.md project-management/backlog-data.json project-management/sessions/
git commit -m "Update Signal backlog: [summary of changes]"
```

---

## Common Issues & Fixes

### Issue: Dashboard shows old data after refresh
**Fix**: Clear browser cache or use incognito mode

### Issue: JSON validation fails
**Fix**: Check for:
- Missing commas between array items
- Trailing commas at end of arrays/objects
- Unescaped quotes in strings
- Missing closing braces/brackets

### Issue: Burn-up chart doesn't show latest session
**Fix**: Ensure you added data point to `burnUpData.dataPoints[]` and updated scope metrics

### Issue: Velocity tab missing latest week
**Fix**: Check `weeklyAnalysis[]` and `historicalFeatures[]` arrays

### Issue: Task filters not working
**Fix**: Check `tasks[].status` values are exactly: `"completed"`, `"in_progress"`, or `"not_started"`

### Issue: Markdown not rendering (shows **)
**Fix**: Signal should have built-in markdown parser. Check `parseMarkdown()` function exists in index.html

---

## Key JSON Fields Reference

### Critical Fields That Affect Multiple Tabs

| Field | Tabs Affected | Impact |
|-------|---------------|--------|
| `metadata.currentStatus` | Header, Blockers | Status banner |
| `metadata.projectPhase` | Header, Blockers | Phase indicator |
| `metadata.velocity.*` | Header, All tabs | Velocity stats |
| `mvpScope.userReadyPercent` | Header | MVP status card |
| `burnUpData.percentComplete` | Header, Burn-Up | % complete stat |
| `tasks[]` | Overview, Timeline, Dependencies | All task data |
| `burnUpData.dataPoints[]` | Burn-Up | Chart visualization |
| `weeklyAnalysis[]` | Velocity | Weekly summaries |
| `historicalFeatures[]` | Velocity | Velocity chart |
| `velocityInsights.*` | Blockers | AI analysis |
| `currentBlockers[]` | Blockers | Blocker alerts |

---

## Automation Ideas (Future Phase 2)

- **Git analyzer script**: Auto-detect sessions from commit history
- **Session generator**: Auto-create session .md files
- **Metrics calculator**: Auto-calculate velocity and completion %
- **Data validator**: Check JSON for common errors before committing
- **Dashboard tests**: Automated testing of all tabs with sample data

---

**Last Updated**: October 15, 2025
**Maintained By**: Bert Carroll
**For**: Signal Project Management Dashboard
