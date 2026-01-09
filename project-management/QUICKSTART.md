# Signal Quick Start Guide

Get Signal up and running in **under 5 minutes** (minimal setup) or **under 30 minutes** (full deployment with history).

## Option 1: Try It Now (5 minutes)

**Just want to see what Signal looks like?**

1. **Open the dashboard:**
   ```bash
   cd project-management
   python -m http.server 8080
   ```

2. **View in browser:**
   ```
   http://localhost:8080/index.html
   ```

3. **See the example data:**
   - The included `backlog-data.json` shows Signal tracking its own development
   - Navigate tabs: Overview, Velocity, Releases, Blockers
   - Click task cards to expand details
   - Try exporting reports

**That's it!** You're seeing a real Signal dashboard tracking a real project.

---

## Option 2: Deploy to Your Project (30 minutes)

**Want Signal tracking your project?**

### Prerequisites

- Git repository with at least 1 commit
- Python or Node.js installed (for local web server)
- Claude Code or similar AI assistant (optional but recommended)

### Quick Deploy (Minimal)

1. **Copy Signal files to your project:**
   ```bash
   # From your project root
   mkdir -p project-management/sessions

   # Copy from Signal repo
   cp path/to/signal/project-management/index.html project-management/
   cp path/to/signal/project-management/backlog-data.json project-management/
   ```

2. **Update project metadata:**
   Edit `project-management/backlog-data.json`:
   ```json
   {
     "metadata": {
       "projectName": "Your Project Name",
       "lastUpdated": "2025-10-17",
       "currentStatus": "Active Development"
     }
   }
   ```

3. **Add your first task:**
   ```json
   {
     "tasks": [
       {
         "id": "P0-0",
         "title": "Your first task",
         "status": "in_progress",
         "priority": "P0",
         "effort": "M",
         "storyPoints": 5
       }
     ]
   }
   ```

4. **Test it:**
   ```bash
   cd project-management
   python -m http.server 8080
   # Open http://localhost:8080/index.html
   ```

**Done!** You have a minimal Signal dashboard.

### Full Deploy with Git History (AI-Assisted)

**Using Claude Code or similar AI assistant:**

```
Deploy Signal to this project with full git history analysis
```

The AI assistant will use the `signal-deployment` skill to:
1. Analyze your git commit history
2. Identify development sessions
3. Calculate velocity metrics
4. Create session documentation
5. Populate the dashboard with real data

**Time**: ~30 minutes
**See**: `.claude/skills/signal-deployment/SKILL.md` for detailed workflow

---

## Option 3: Redeploy/Update Existing Signal

**Already have Signal but want to refresh or redeploy?**

### If you have Claude Code:

```
Update Signal dashboard with latest git history
```

The AI will use the Signal skills to update all tracking data.

### Manual update:

1. **Start your local server:**
   ```bash
   cd project-management
   python -m http.server 8080
   ```

2. **Edit `backlog-data.json`:**
   - Update `metadata.lastUpdated` to today
   - Update task statuses
   - Add new completed work to `completedWork[]`
   - Add data points to `burnUpData.dataPoints[]`

3. **Refresh browser:**
   ```
   http://localhost:8080/index.html?v=timestamp
   ```
   (The `?v=timestamp` prevents caching)

---

## Common Tasks

### Launch Dashboard

```bash
cd project-management
python -m http.server 8080
# Open http://localhost:8080/index.html
```

**Alternative (Node.js):**
```bash
npx http-server -p 8080
```

**Alternative (VS Code):**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Export Reports

1. Open dashboard
2. Click "Export Report" button
3. Choose format:
   - **HTML** (CEO-ready, press Ctrl+P to save as PDF)
   - **Markdown** (for status updates)
   - **CSV** (for spreadsheets)
   - **JSON** (for automation)

### Add New Tasks

Edit `backlog-data.json`, add to `tasks[]` array:

```json
{
  "id": "P1-5",
  "title": "New feature",
  "description": "Description here",
  "status": "not_started",
  "priority": "P1",
  "effort": "M",
  "storyPoints": 5,
  "risk": "Medium",
  "confidence": "High"
}
```

### Update Task Status

Find task in `backlog-data.json` and change `status`:
- `"not_started"` → `"in_progress"` → `"completed"`

Add completion date:
```json
{
  "status": "completed",
  "actualEndDate": "2025-10-17"
}
```

---

## Story Points Guide

Signal uses Fibonacci scale story points:

- **1 pt** = Trivial (< 1 hour, 1 file)
- **2 pts** = Small (1-2 files, straightforward)
- **3 pts** = Medium (2-4 files, moderate complexity)
- **5 pts** = Large (4-8 files, needs research)
- **8 pts** = Very Large (8-15 files, high complexity)
- **13 pts** = Epic (break it down!)

**For AI-assisted estimation**, use the `signal-story-points` skill:
```
Estimate story points for this task: [description]
```

---

## Troubleshooting

### Dashboard shows old data

**Problem:** Browser caching

**Solution:** Hard refresh or add timestamp:
```
http://localhost:8080/index.html?v=12345
```

### Dashboard won't load

**Problem:** Opening via `file://` protocol

**Solution:** Use a web server (see "Launch Dashboard" above)

### JSON errors

**Problem:** Syntax error in `backlog-data.json`

**Solution:** Validate JSON:
```bash
python -c "import json; json.load(open('project-management/backlog-data.json'))"
```

### Charts not displaying

**Problem:** Missing data in arrays

**Solution:** Ensure `historicalFeatures[]` and `burnUpData.dataPoints[]` have at least one entry

---

## Next Steps

1. **Customize your backlog** - Add tasks, set priorities, assign story points
2. **Configure releases** - Define R0-MVP, R1-Production roadmap
3. **Document decisions** - Add ADRs (Architecture Decision Records)
4. **Set up regular updates** - Use "Update Signal" command after each session

---

## Getting Help

- **Full Documentation:** [README.md](README.md)
- **Deployment Guide:** [.claude/skills/signal-deployment/SKILL.md](.claude/skills/signal-deployment/SKILL.md)
- **Data Schema:** See README.md "Data Schema Reference" section
- **Issues:** https://github.com/ubiquitouszero/signal/issues

---

**Philosophy:** Signal extracts project management data from your git commits and development work. The better your commits, the better your tracking. This is a feature, not a bug—Signal works best when you work well.

**Built for AI development by [Bert Carroll](https://askthehuman.com) and [Claude Code](https://claude.ai)**
