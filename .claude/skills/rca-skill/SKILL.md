---
name: Root Cause Analysis (RCA) for Production Incidents
description: Systematically analyzes production incidents using Five Whys methodology, generates comprehensive RCA documentation, and recommends mitigation strategies. Use after resolving production incidents to prevent recurrence.
---

# Root Cause Analysis (RCA) Skill

This skill guides you through creating comprehensive Root Cause Analysis (RCA) documentation for production incidents, following the protocol defined in ADR-0037.

## When to Use This Skill

- After resolving a **Critical** or **High** severity production incident
- User says "analyze the incident" or "create an RCA"
- When a production bug requires systematic investigation
- To document lessons learned from outages or failures
- Optionally for **Medium** severity incidents if requested

## Prerequisites

1. Incident has been resolved (production is stable)
2. You have access to:
   - Incident timeline and logs
   - Related git commits and session documentation
   - Error messages and symptoms
3. Session documentation has been created (if applicable)
4. Bug documentation has been created in `docs/bugs.md`

## RCA Process

### Step 1: Gather Incident Information

Ask the user for the following information:

1. **Incident Date & Time**: When did the incident occur?
2. **Severity Level**: Critical / High / Medium / Low
3. **Duration**: How long was the incident?
4. **User Impact**: What did users experience?
5. **Detection Method**: How was the incident discovered?
6. **Resolution Summary**: How was it fixed?

### Step 2: Research the Incident

Use your tools to gather context:

1. **Review session documentation**: Check `project-management/sessions/` for related sessions
2. **Review bug documentation**: Check `docs/bugs.md` for the incident entry
3. **Review git commits**: Use `git log` to find commits around the incident time
4. **Review related code**: Read files mentioned in the incident
5. **Review ADRs**: Check if related architecture decisions exist

### Step 3: Perform Five Whys Analysis

Guide the user through the Five Whys method to identify root cause:

1. Start with the immediate cause (technical failure)
2. Ask "Why did this happen?" and document the answer
3. For each answer, ask "Why did THAT happen?"
4. Continue until you reach a root cause (usually 3-5 levels deep)
5. Root cause should be a systemic/process issue, not just technical

**Example (Session 0114)**:
1. Why did the deployment fail? **Migration conflict error**
2. Why was there a migration conflict? **Two migrations with same number**
3. Why weren't they detected before production? **No staging environment**
4. Why no staging environment? **Cost concerns and perceived complexity**
5. Why perceived as complex? **No clear proposal (ADR) existed**

**Root Cause**: Technical debt - deferred staging environment investment

### Step 4: Identify Mitigation Strategies

For each level of mitigation, identify specific actions:

#### Immediate Actions (Completed)
- Actions that were taken to resolve the incident
- Status: All should be marked as completed

#### Short-term Mitigation (Next Sprint)
- Tactical fixes to prevent immediate recurrence
- Can be implemented quickly (1-5 story points)
- Target: Within 1-2 weeks

#### Long-term Prevention (Next Quarter)
- Strategic/systemic improvements
- May require significant investment (8-13 story points)
- Target: Within 1-3 months

For each mitigation, evaluate:
- **Effectiveness**: Low / Medium / High - How well will this prevent recurrence?
- **Cost**: Time/money to implement (story points or dollars)
- **Priority**: High / Medium / Low - Should we do this?

### Step 5: Generate RCA Document

Create RCA document at: `docs/root-cause-analysis/YYYYMMDD-rca-[brief-description].md`

Use this template:

```markdown
# RCA: [Brief Incident Title]

**Date**: YYYY-MM-DD
**Severity**: Critical/High/Medium/Low
**Duration**: X minutes/hours
**Impact**: [User-facing impact description]
**Status**: Completed

## Executive Summary

[2-3 sentence summary of what happened and how it was resolved]

## Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | [Event description] |
| HH:MM | [Event description] |
| HH:MM | [Event description] |

## Symptoms

**What Users Experienced**:
- [Symptom 1]
- [Symptom 2]

**What Systems Experienced**:
- [System behavior 1]
- [System behavior 2]

**Error Messages**:
```
[Paste relevant error messages]
```

## Root Cause Analysis

### Immediate Cause

[Direct technical cause - e.g., "Migration conflict in Django migrations"]

### Contributing Factors

[Environmental/process factors that allowed it to happen]
- [Factor 1]
- [Factor 2]

### Root Cause (Five Whys)

1. **Why did [immediate cause] happen?** [Answer]
2. **Why did [answer 1] happen?** [Answer]
3. **Why did [answer 2] happen?** [Answer]
4. **Why did [answer 3] happen?** [Answer]
5. **Why did [answer 4] happen?** [Answer]

**Root Cause Identified**: [Systemic/process issue]

### Systemic Issues

[Organizational/process issues that need addressing]
- [Issue 1]
- [Issue 2]

## Resolution

**How the Incident Was Resolved**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Resolution Time**: X minutes/hours from detection to fix

## Impact Assessment

| Metric | Value |
|--------|-------|
| **Users Affected** | [Number/percentage or "All users"] |
| **Revenue Impact** | [$X or "None"] |
| **Reputation Impact** | [Low/Medium/High] |
| **Time to Detect** | [X minutes - how long until we noticed] |
| **Time to Resolve** | [X minutes - how long to fix] |
| **Total Downtime** | [X minutes] |

## Prevention & Mitigation

### Immediate Actions (Completed)

- [x] [Action taken to resolve incident]
  - **Owner**: [Name]
  - **Completed**: YYYY-MM-DD

### Short-term Mitigation (Next Sprint)

- [ ] [Action to prevent immediate recurrence]
  - **Owner**: [Name]
  - **Target**: [Date]
  - **Story Points**: [N SP]
  - **Effectiveness**: High/Medium/Low
  - **Priority**: High/Medium/Low

### Long-term Prevention (Next Quarter)

- [ ] [Systemic improvement to prevent class of incidents]
  - **Owner**: [Name]
  - **Target**: [Date]
  - **Story Points**: [N SP]
  - **Effectiveness**: High/Medium/Low
  - **Priority**: High/Medium/Low
  - **Related ADR**: [Link if applicable]

### Mitigation Evaluation

| Mitigation | Effectiveness | Cost | Priority | Justification |
|------------|---------------|------|----------|---------------|
| [Short-term 1] | High/Med/Low | N SP | High/Med/Low | [Why?] |
| [Long-term 1] | High/Med/Low | N SP | High/Med/Low | [Why?] |

## Lessons Learned

**What Went Well**:
- [Positive aspect 1]
- [Positive aspect 2]

**What Could Be Improved**:
- [Improvement 1]
- [Improvement 2]

**Key Takeaways**:
- [Lesson 1]
- [Lesson 2]

## Action Items

- [ ] **[Action 1]** - Owner: [Name], Due: [Date]
- [ ] **[Action 2]** - Owner: [Name], Due: [Date]
- [ ] **[Action 3]** - Owner: [Name], Due: [Date]

## Related Documentation

- **Session**: [Link to session documentation in project-management/sessions/]
- **Bug Entry**: [Link to entry in docs/bugs.md]
- **Related ADRs**: [Links to relevant ADRs]
- **Related Commits**: [Git commit hashes]

## Appendix: Technical Details

[Optional: Include detailed technical information, logs, code snippets, etc.]

---

**RCA Created By**: [Your name]
**RCA Reviewed By**: [Team members who reviewed]
**Status Updates**:
- YYYY-MM-DD: RCA created
- YYYY-MM-DD: Reviewed by team
- YYYY-MM-DD: Action items completed
```

### Step 6: Update RCA Index

After creating the RCA document, update `docs/root-cause-analysis/README.md`:

```markdown
# Root Cause Analysis (RCA) Index

This directory contains Root Cause Analysis documents for production incidents, following the protocol defined in ADR-0037.

## All RCAs

| Date | Severity | Title | Status | Session |
|------|----------|-------|--------|---------|
| 2025-11-05 | Critical | Migration Conflict | Complete | Session 0114 |

## RCA by Severity

### Critical Incidents
- [2025-11-05: Migration Conflict](./20251105-rca-migration-conflict.md) - 12 min downtime

### High Severity Incidents
- [None yet]

### Medium Severity Incidents
- [None yet]

## Common Patterns

[As more RCAs are created, identify recurring themes]

### Pattern: Infrastructure Gaps
- **Incidents**: Migration conflict (2025-11-05)
- **Root Cause**: Lack of staging environment
- **Status**: ADR-0036 proposed to address

## Mitigation Tracking

### Completed Mitigations
- [None yet]

### In Progress
- [ ] ADR-0036: Staging environment (Proposed)

### Planned
- [None yet]
```

## Execution Steps

When user invokes this skill:

1. **Confirm incident details** with user
2. **Research the incident** using git, sessions, bugs.md
3. **Guide Five Whys analysis** - Ask user to help identify root cause
4. **Identify mitigation strategies** at all three levels
5. **Generate RCA document** using template above
6. **Update RCA index** in docs/root-cause-analysis/README.md
7. **Recommend next steps**:
   - Create ADR if systemic change needed (like ADR-0036)
   - Create story for short-term mitigations
   - Schedule team review of RCA

## Important Notes

### Blameless Culture

- **Focus on systems and processes**, not individuals
- Use passive voice: "The deployment failed" not "Bob deployed bad code"
- Assume everyone acted with good intentions given the information they had
- The goal is learning and improvement, not punishment

### Root Cause Depth

- Don't stop at technical causes (e.g., "bug in code")
- Drill down to process/systemic causes (e.g., "no code review process")
- Root cause should suggest preventive action, not just fixing symptoms

### Mitigation Realism

- Be honest about costs (time/money)
- Some high-cost mitigations may not be worth it
- Prioritize based on likelihood of recurrence and impact

### Documentation Quality

- Be specific: Include error messages, timestamps, commit hashes
- Be complete: Don't skip sections
- Be actionable: Every RCA should produce action items

## Example: Session 0114 RCA

To demonstrate this skill, you should be able to create a complete RCA for Session 0114 (Migration Conflict) by:

1. Reading session documentation in `project-management/sessions/20251105-session-0114-migration-conflict-hotfix.md`
2. Reading bug entry in `docs/bugs.md`
3. Reading related commits (3c98f51)
4. Performing Five Whys analysis (as shown in ADR-0037)
5. Generating complete RCA document
6. Recommending ADR-0036 as long-term mitigation

## Success Criteria

An RCA is complete when:

1. ✅ All template sections are filled out
2. ✅ Five Whys analysis identifies root cause
3. ✅ Mitigation strategies exist at all three levels (immediate/short/long)
4. ✅ Action items have owners and due dates
5. ✅ RCA index is updated
6. ✅ Related documentation is linked
7. ✅ User confirms RCA accurately reflects the incident

## Related Skills

- **session-documentation**: Create session docs before RCA
- **signal-story-points**: Estimate mitigation story points
- **signal-session-ratings**: Rate sessions that include incident response

## ADR Reference

This skill implements the protocol defined in:
- **ADR-0037**: Root Cause Analysis Protocol for Production Incidents
