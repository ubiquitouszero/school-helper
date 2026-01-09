# ADR-0003: Story Points-Based Velocity Tracking

**Status:** Accepted
**Date:** [DATE]
**Authors:** [AUTHOR], Claude Code
**Priority:** P1 (High)
**Related:** ADR-0001 (Claude Code AI Collaboration)

---

## Context

### The Problem

**Activity != Productivity.** Tracking commits-per-day or hours creates perverse incentives:
- Developers make small, frequent commits to inflate velocity
- Large refactors get split into artificial chunks
- Code quality suffers when optimizing for commit count
- Can't compare "this feature" to "similar historical features"

**Drivers:**
1. **Accurate estimation**: Need to predict how long tasks will take
2. **Activity != Productivity**: Commits are activity, story points measure output
3. **Risk mitigation**: Data-driven estimates protect launch timelines
4. **Cross-feature comparison**: "Feature X is similar to Feature Y in complexity"

## Decision

**Use Fibonacci-scale story points (1, 2, 3, 5, 8, 13) as the primary unit for measuring task complexity.**

### Story Points Measure

- **Complexity** (technical difficulty)
- **Scope** (amount of work)
- **Uncertainty** (unknowns)
- **Risk** (potential for issues)

Story points are **independent of**:
- Who's doing the work
- How many commits it takes
- How long it takes (AI acceleration doesn't change complexity)

### Fibonacci Scale

| Points | Category | Scope | Examples |
|--------|----------|-------|----------|
| 1 | Trivial | < 1 hour, single file | Fix typo, update constant |
| 2 | Small | 1-2 files | Add form field, simple bug fix |
| 3 | Medium | 2-4 files | New UI component, API endpoint |
| 5 | Large | 4-8 files | New page, auth system |
| 8 | Very Large | 8-15 files | Major feature, refactor |
| 13 | Epic | 15+ files | **BREAK IT DOWN!** |

### Effort Size Mapping

| Size | Days | Story Points | Examples |
|------|------|--------------|----------|
| XS | 0.5-1 | 1-2 | Bug fixes, config changes |
| S | 1-2 | 3-5 | Small features, simple UI |
| M | 2-4 | 5-8 | Medium features, API integrations |
| L | 3-7 | 8-13 | Large features, complex workflows |
| XL | 7+ | 13+ | Epics - MUST BE SPLIT |

## Four-Factor Assessment Rubric

### 1. Complexity (technical difficulty)
- How hard is the logic?
- How many edge cases?
- How much domain knowledge required?

### 2. Scope (amount of work)
- How many files affected?
- How many components involved?
- How much code to write/modify?

### 3. Uncertainty (unknowns)
- How well do we understand requirements?
- How much research needed?
- How many dependencies?

### 4. Risk (potential for issues)
- How likely are complications?
- How much testing required?
- How likely is rework?

**Composite Score:**
```
Average = (Complexity + Scope + Uncertainty + Risk) / 4
```

**Mapping to Story Points:**
- 1.0 - 1.5 -> **1 point**
- 1.5 - 2.5 -> **2 points**
- 2.5 - 3.5 -> **3 points**
- 3.5 - 4.25 -> **5 points**
- 4.25 - 4.75 -> **8 points**
- 4.75+ -> **13 points** (break it down!)

## Implementation

### Data Schema

**Task Schema:**
```json
{
  "id": "PROJECT-001",
  "title": "Feature Name",
  "effort": "S",
  "storyPoints": 5,
  "status": "in_progress"
}
```

**Session Schema:**
```json
{
  "session": "Session 1: Initial Setup",
  "date": "YYYY-MM-DD",
  "storyPoints": 12,
  "summary": "Brief description of work completed"
}
```

### Velocity Tracking

- Track points per session (not per day)
- Calculate rolling average velocity
- Use variance for confidence intervals

## Consequences

### Positive

1. **Accurate Sprint Planning** - Can confidently estimate completion
2. **Cross-Feature Comparison** - Meaningful complexity comparisons
3. **Prevents Gaming** - Can't inflate story points like commits
4. **Risk Mitigation** - Know variance and plan buffers

### Negative

1. **Learning Curve** - Takes 5-10 tasks to calibrate
2. **Not a Silver Bullet** - Only as good as consistency

## Related

- ADR-0001: Claude Code AI Collaboration
- docs/planning/backlog.json

---

**Author:** [AUTHOR]
**Last Updated:** [DATE]
