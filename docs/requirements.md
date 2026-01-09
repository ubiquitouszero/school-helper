# School Helper App - Requirements

**Project Leads:** Bert Carroll & Kaland Carroll (age 9)
**Created:** January 8, 2026
**Status:** Requirements Gathering

---

## Vision

A school helper app that makes learning fun for kids of different ages. Built by a dad and his 3rd grader, for kids everywhere.

---

## Why We're Building This

This isn't just an app—it's a learning project for Kaland.

**Goals:**

1. **Learn software development** - Real-world problem solving, not just tutorials
2. **Work with AI** - Learn how to collaborate with AI tools to build things
3. **Create something to show** - A portfolio piece Kaland can be proud of
4. **Solve a real problem** - Make learning more fun for himself and his brother

**Roles:**

| Person | Role | Responsibilities |
|--------|------|------------------|
| Kaland | Product Manager & Tester | Requirements, ideas, testing, feedback |
| Dad | Developer & Teacher | Code, architecture, teaching along the way |
| Valen | Beta Tester | Try it out, give feedback |

**Learning Topics:**

- How to gather requirements (what are we building?)
- How to break big problems into small pieces
- How to work with AI to write code
- How to test and improve software
- How to ship something real

---

## Users

| User | Age | Grade | Needs |
|------|-----|-------|-------|
| Kaland | 9 | 3rd Grade | Math drills, science, social studies, English, fractions |
| Valen | 5 | Kindergarten | Number recognition, sight words, basic addition/subtraction |
| Other Kids | Various | K-5 | Age-appropriate content for their grade level |

---

## Subjects

- [ ] Math
- [ ] Science
- [ ] Social Studies
- [ ] English
- [ ] Fractions (separate focus area)

---

## Core Features

### 1. User Selection

- Kid picks their name from a list (no login required for now)
- Name links to their grade level and progress
- Simple, kid-friendly interface

### 2. Topic Selection

- After picking name, choose what to work on
- Topics are age-appropriate based on grade level
- Visual/colorful topic cards

### 3. Math Drills (Timed Exercises)

Based on the "math columns" the kids do at school.

| Grade | Operations | Number Range |
|-------|------------|--------------|
| Kindergarten | Addition, Subtraction | 0-20 |
| 1st Grade | Addition, Subtraction | 0-100 |
| 2nd Grade | Addition, Subtraction, Intro Multiplication | 0-100 |
| 3rd Grade | Addition, Subtraction, Multiplication, Division | See below |

**3rd Grade Number Ranges:**

| Operation | Number Range | Notes |
|-----------|--------------|-------|
| Addition | Up to 4 digits | e.g., 2,345 + 1,678 |
| Subtraction | Up to 4 digits | e.g., 5,432 - 2,187 |
| Multiplication | 2-3 digits | Whole number results only |
| Division | 2-3 digits | Whole number results only (no remainders) |

**Features:**
- Timed mode (like school)
- Practice mode (no timer)
- Track correct/incorrect

### Progress Tracking (Kaland's Feature)

Show how you're improving over time:

- **Daily score history** - How many right/wrong each day
- **Speed improvement** - Are you getting faster?
- **Accuracy trends** - Are you making fewer mistakes?
- **Streak tracking** - How many days in a row practiced
- **Charts/graphs** - Visual way to see progress over weeks/months
- **Personal bests** - Celebrate when you beat your record!

### 4. Number Recognition (Valen's Request)

- Show a number, kid identifies it
- Range: 0 to 10,000
- Start easy, get harder as they progress
- Adult marks right/wrong for younger kids

### 5. Sight Words (Valen's Request)

- Show a word
- Kid reads it out loud
- Adult helper marks right or wrong
- Track which words they know vs. need practice

### 6. Difficulty Modes & Input Types (Kaland's Design)

| Mode | Input Type | Description |
|------|------------|-------------|
| Easy | Tap to select | Multiple choice, no typing |
| Medium | Tap to select | Multiple choice, no typing |
| Hard | Type the answer | Keyboard input required |
| Challenge | Tap or Type | Try problems from a higher grade level |

**Why this matters:** Typing on tablets/phones is frustrating for kids (Kaland's Duolingo feedback). Tapping keeps the flow going. Typing is only for kids who want the extra challenge.

### 7. Question Formats by Age

| Grade Level | Format |
|-------------|--------|
| Kindergarten | Adult-assisted (adult marks right/wrong) |
| 3rd Grade+ | Multiple choice OR fill in the blank (based on mode) |

---

## Platforms

- [ ] Tablet (iPad, Android tablet)
- [ ] Phone (iPhone, Android)
- [ ] Computer (web browser)

**Approach:** Responsive web app (works on all devices)

---

## Technical Stack (Proposed)

| Component | Technology |
|-----------|------------|
| Frontend | Astro + React (or Svelte) |
| Database | Supabase |
| Hosting | Netlify or Fly.io |
| Auth | Simple name selection (no passwords for kids) |
| AI Content | Claude API or OpenAI for on-the-fly questions |

---

## Content Strategy

Two options (can do both):

1. **Pre-built content** - Curated question banks for each subject/grade
2. **AI-generated** - Generate questions on the fly based on topic and difficulty

**For MVP:** Start with Math (pre-built) + AI for variety

---

## Open Questions

1. **Progress tracking** - How do we save progress? Per device? Need parent login?
2. **Rewards/Gamification** - Stars? Badges? Streaks?
3. **Sound effects** - Kids love feedback sounds. Include them?
4. **Themes** - Let kids pick colors/themes?
5. **Curriculum alignment** - Follow Common Core standards?

---

## Kaland's Ideas

*Space for Kaland to add his own ideas:*
- It needs to have an easy, medium, and hard mode
- We need to have a choice if we want to have fractions in his drill or not.
- It needs to have a bronze, silver, and a gold trophy. If you get a bronze, you got a quarter of the way, silver is half of the way, and gold is you surpassed your record.
- Want a link to print out his trophies.
- Want to be able to create his own math problems.
- He also wants to be able to create his own goal. It would help if the app gave him hard, medium, and easy goals to start with or he could choose his own (custom).
- **Admin mode** - See how all the players are doing (unprompted idea!)
- **Logo** - The app needs a logo 


---

## Valen's Ideas

*Space for Valen to add his own ideas:*

- Numbers up to 10,000
- Sight words practice

---

## Next Steps

1. [ ] Kaland reviews and adds ideas
2. [ ] Pick a name for the app
3. [ ] Sketch out what screens look like
4. [ ] Build math drill MVP first
5. [ ] Test with Kaland and Valen
