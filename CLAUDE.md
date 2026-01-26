# School Helper - Claude Code Context

## Project Overview

**What:** A kids' learning app for math drills, number recognition, and sight words.
**Who:** Built by Bert Carroll with his sons Kaland (9) and Valen (5) as product managers.
**Why:** Family project teaching Kaland software development while building something useful.

## Key Context

### Product Managers Are Kids

- **Kaland (9, 3rd grade)** - Primary product manager. Has strong opinions on UX from his Duolingo experience. Contributed trophy system, difficulty modes, and admin dashboard ideas.
- **Valen (5, Kindergarten)** - Beta tester. Needs adult-assisted mode for younger kids.

When documenting decisions or writing user-facing text:
- Avoid jargon and acronyms
- Define terms when they must be used
- Keep language age-appropriate for a 9-year-old to understand

### Project Goals

1. **Build something the kids will actually use** - Not a toy project
2. **Teach Kaland about software development** - Requirements, problem-solving, shipping
3. **Show how AI helps build software** - Working with Claude Code
4. **Move fast** - Kids need to see results to stay engaged

### Development Philosophy

- **Ship quickly** - Better to have something working than perfect plans
- **Kid-tested** - Kaland and Valen test everything
- **No overengineering** - Simple solutions first
- **Real-world math** - Show how math is useful (e.g., story point addition)

## Technical Decisions

### Stack
- **Frontend:** Astro + React (islands architecture for speed)
- **Database:** Supabase (simple, real-time, auth)
- **Hosting:** Netlify (easy deploys)
- **Styling:** Tailwind CSS

### Key Requirements (from Kaland)

1. **No typing for Easy/Medium modes** - Tapping only (Duolingo frustration)
2. **Trophy system** - Bronze (25%), Silver (50%), Gold (beat record)
3. **Printable trophies** - Link to print achievements
4. **Difficulty modes** - Easy, Medium, Hard, Challenge
5. **Admin dashboard** - See how all players are doing
6. **Progress tracking** - Charts showing improvement over time
7. **Custom goals** - Set your own or pick suggested goals

### Key Requirements (from Valen)

1. **Numbers up to 10,000** - Number recognition
2. **Sight words** - Practice reading common words
3. **Adult-assisted mode** - Adult marks right/wrong for younger kids

## Repository Structure

```
school-helper/
├── .claude/              # Claude Code config and skills
├── .github/workflows/    # CI/CD pipelines
├── docs/                 # Requirements, decisions, planning
│   ├── requirements.md   # Full requirements document
│   ├── mvp-scope.md      # What's in Version 1
│   └── logo-design-worksheet.md  # Logo design exercise
├── project-management/   # Session tracking, backlog
└── src/                  # Application code (coming soon)
```

## Working With This Project

### When Adding Features

1. Check if it's in the MVP scope first
2. Keep it simple - avoid overbuilding
3. Consider: would a 9-year-old understand this UI?
4. Test on tablet (primary device for kids)

### When Writing Code

- Prioritize readability over cleverness
- Add comments that explain "why" not "what"
- Keep components small and focused
- Use Tailwind for styling (consistent, kid-friendly)

### When Making Decisions

- Ask: "What would Kaland want?"
- Prefer tap over type
- Prefer visual feedback over text
- Make mistakes feel okay (gentle, not punishing)

## Key Contacts

- **Bert Carroll** - Dad, developer, teacher
- **Kaland Carroll** - Product manager (9 years old)
- **Valen Carroll** - Beta tester (5 years old)

## Deployment

**Hosting:** Netlify

```bash
npm run build                        # Build to dist/
npx netlify deploy --dir=dist        # Preview deploy
npx netlify deploy --dir=dist --prod # Production deploy
```

If site not linked: `npx netlify link`
If auth errors: `npx netlify login`

See [docs/netlify-deploy.md](docs/netlify-deploy.md) for troubleshooting.

## Related Documentation

- [Requirements](docs/requirements.md)
- [MVP Scope](docs/mvp-scope.md)
- [Logo Design Worksheet](docs/logo-design-worksheet.md)
- [Netlify Deployment](docs/netlify-deploy.md)
