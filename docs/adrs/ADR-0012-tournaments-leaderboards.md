# ADR-0010: Tournaments & Leaderboards

**Status:** Proposed

**Date:** 2026-01-14

**Context:** Competition motivates learning. Kids want to compete with classmates and see how they rank. However, leaderboards must be designed carefully to encourage growth without discouraging struggling students. Tournaments should be grade-appropriate, with the option to "play up" but not down (preventing older kids from dominating younger ones).

**Decision Drivers:**
- Competition motivates kids (Kaland's feedback from Duolingo)
- Must be grade-appropriate (3rd graders shouldn't compete with kindergartners)
- Allow kids to challenge themselves by playing up a grade
- Protect struggling students from public embarrassment
- Teachers want classroom competitions
- Privacy: display names only, not real names

## Decision

Implement a **grade-based tournament system** with:

1. **Grade-locked competitions** - Can compete at your grade or higher, never lower
2. **Multiple leaderboard scopes** - Classroom, grade, school, friends-only
3. **Opt-in public visibility** - Students choose their exposure level
4. **Time-boxed tournaments** - Daily, weekly, monthly challenges

### Competition Rules

```
GRADE RESTRICTIONS
┌─────────────────────────────────────────────────────────────┐
│ Student Grade │ Can Compete In                             │
├───────────────┼─────────────────────────────────────────────┤
│ Kindergarten  │ K, 1st, 2nd, 3rd, 4th, 5th (all grades up) │
│ 3rd Grade     │ 3rd, 4th, 5th (own grade and up)           │
│ 5th Grade     │ 5th only (highest elementary grade)        │
└─────────────────────────────────────────────────────────────┘

LEADERBOARD SCOPES (in order of visibility)
├── Friends Only    │ Just my friends (always available)
├── Classroom       │ My class (default, opt-out available)
├── Grade           │ All students in my grade at school (opt-in)
├── School          │ All students at school (opt-in, admin enabled)
└── Global          │ Not implemented (privacy concerns)
```

## Rationale

### Why Grade-Locked?

Older students have an unfair advantage:
- More developed math skills
- More practice time
- Better fine motor control

Allowing play "up" rewards ambitious students. Blocking play "down" prevents discouraging younger kids.

### Why Multiple Scopes?

Different students are motivated differently:
- **Shy students:** Friends-only is safe and motivating
- **Competitive students:** Grade/school leaderboards provide challenge
- **Teachers:** Classroom scope for class competitions

### Why Opt-In for Broader Scopes?

Public leaderboards can:
- Embarrass struggling students
- Create unwanted pressure
- Violate privacy expectations

Making broader visibility opt-in respects student agency.

## Considered Options

### Option 1: No Leaderboards
**Pros:**
- No comparison anxiety
- Complete privacy

**Cons:**
- Misses major motivational tool
- Kids will compare informally anyway

### Option 2: Classroom Only
**Pros:**
- Simple implementation
- Teacher control

**Cons:**
- Limited competition scope
- Can't compete with friends in other classes

### Option 3: Tiered Scopes (Chosen)
**Pros:**
- Flexibility for different comfort levels
- Respects privacy while enabling competition
- Teachers can encourage opt-in

**Cons:**
- More complex UI
- Need to explain visibility levels

## Consequences

### Positive
- Kids get healthy competition they want
- Struggling students aren't publicly embarrassed
- Teachers can run classroom competitions
- Grade-appropriate difficulty

### Negative
- Some kids may feel left out of broader competitions
- Complexity in explaining scope levels
- **Mitigation:** Clear UI showing who can see your scores

### Neutral
- Need tournament creation UI for teachers
- Need leaderboard display components

## Implementation

**Files Affected:**
- `supabase/migrations/005_tournaments.sql`
- Future: `src/components/Leaderboard.tsx`, `src/components/TournamentCard.tsx`

**Schema:**

```sql
-- Tournament definitions
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- Scope
  scope_type TEXT NOT NULL CHECK (scope_type IN ('classroom', 'grade', 'school', 'district', 'friends')),
  scope_id UUID, -- classroom_id, grade_id, school_id, or NULL for friends

  -- Grade restrictions
  min_grade_level INTEGER NOT NULL DEFAULT 0,  -- K = 0
  max_grade_level INTEGER NOT NULL DEFAULT 12, -- Allow up to 12th

  -- Game configuration
  game_type TEXT NOT NULL CHECK (game_type IN ('math', 'numbers', 'words')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'challenge', 'any')),
  operation TEXT, -- For math: 'addition', 'subtraction', etc. or NULL for any

  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'custom')),

  -- Rules
  max_attempts INTEGER, -- NULL = unlimited
  scoring_method TEXT DEFAULT 'best' CHECK (scoring_method IN ('best', 'average', 'total', 'last')),
  min_questions INTEGER DEFAULT 10, -- Minimum questions to qualify

  -- Admin
  created_by UUID NOT NULL, -- adult_profiles.id
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_grades CHECK (max_grade_level >= min_grade_level)
);

-- Tournament entries (each attempt)
CREATE TABLE tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Score data
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy DECIMAL(5,2), -- Percentage
  time_seconds INTEGER,

  -- Session reference
  game_session_id UUID REFERENCES game_sessions(id),

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate submissions per session
  UNIQUE(tournament_id, game_session_id)
);

-- Calculated leaderboard positions (materialized for performance)
CREATE TABLE leaderboard_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Calculated fields
  best_score INTEGER NOT NULL,
  total_attempts INTEGER NOT NULL,
  average_score DECIMAL(10,2),
  rank INTEGER NOT NULL,
  percentile DECIMAL(5,2), -- Top X%

  -- Timestamps
  last_entry_at TIMESTAMPTZ NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tournament_id, student_id)
);

-- Standing leaderboards (not tournament-specific)
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,

  -- Scope
  scope_type TEXT NOT NULL CHECK (scope_type IN ('classroom', 'grade', 'school', 'friends')),
  scope_id UUID, -- classroom_id, etc.

  -- What's being tracked
  metric TEXT NOT NULL CHECK (metric IN (
    'total_score',      -- Sum of all scores
    'problems_solved',  -- Total questions answered correctly
    'streak_days',      -- Current streak
    'trophies_earned',  -- Trophy count
    'accuracy',         -- Overall accuracy percentage
    'speed'             -- Average time per problem
  )),

  -- Game filter (optional)
  game_type TEXT,
  difficulty TEXT,

  -- Time period
  period TEXT NOT NULL CHECK (period IN ('all_time', 'this_month', 'this_week', 'today')),

  -- Settings
  min_activity INTEGER DEFAULT 10, -- Minimum problems to appear
  max_display INTEGER DEFAULT 100, -- How many to show

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard entries (calculated periodically)
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Data
  value DECIMAL(15,2) NOT NULL, -- The metric value
  rank INTEGER NOT NULL,
  display_name TEXT NOT NULL, -- Cached for privacy

  -- Timestamps
  period_start DATE NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(leaderboard_id, student_id, period_start)
);

-- Tournament participation check
CREATE OR REPLACE FUNCTION can_join_tournament(
  p_student_id UUID,
  p_tournament_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_tournament tournaments%ROWTYPE;
  v_student students%ROWTYPE;
  v_entry_count INTEGER;
BEGIN
  -- Get tournament and student
  SELECT * INTO v_tournament FROM tournaments WHERE id = p_tournament_id;
  SELECT * INTO v_student FROM students WHERE id = p_student_id;

  IF v_tournament IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'tournament_not_found');
  END IF;

  IF v_student IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'student_not_found');
  END IF;

  -- Check if active
  IF NOT v_tournament.is_active THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'tournament_inactive');
  END IF;

  -- Check timing
  IF NOW() < v_tournament.start_date THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'tournament_not_started');
  END IF;

  IF NOW() > v_tournament.end_date THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'tournament_ended');
  END IF;

  -- Check grade level (can play UP but not DOWN)
  IF v_student.grade_level < v_tournament.min_grade_level THEN
    -- This is playing UP, which is allowed
    -- But we return a warning
    RETURN jsonb_build_object('allowed', true, 'warning', 'playing_above_grade');
  END IF;

  IF v_student.grade_level > v_tournament.max_grade_level THEN
    -- This is playing DOWN, which is NOT allowed
    RETURN jsonb_build_object('allowed', false, 'reason', 'grade_too_high');
  END IF;

  -- Check max attempts
  IF v_tournament.max_attempts IS NOT NULL THEN
    SELECT COUNT(*) INTO v_entry_count
    FROM tournament_entries
    WHERE tournament_id = p_tournament_id AND student_id = p_student_id;

    IF v_entry_count >= v_tournament.max_attempts THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'max_attempts_reached');
    END IF;
  END IF;

  -- Check scope membership
  CASE v_tournament.scope_type
    WHEN 'classroom' THEN
      IF NOT EXISTS (
        SELECT 1 FROM classroom_members
        WHERE classroom_id = v_tournament.scope_id AND student_id = p_student_id
      ) THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'not_in_classroom');
      END IF;
    WHEN 'school' THEN
      IF NOT EXISTS (
        SELECT 1 FROM classroom_members cm
        JOIN classrooms c ON cm.classroom_id = c.id
        WHERE c.school_id = v_tournament.scope_id AND cm.student_id = p_student_id
      ) THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'not_in_school');
      END IF;
    ELSE
      -- Grade-level or friends tournaments have different checks
      NULL;
  END CASE;

  RETURN jsonb_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update leaderboard rankings after new entry
CREATE OR REPLACE FUNCTION update_tournament_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate rankings for this tournament
  WITH ranked AS (
    SELECT
      student_id,
      MAX(score) as best_score,
      COUNT(*) as total_attempts,
      AVG(score) as average_score,
      MAX(submitted_at) as last_entry_at,
      ROW_NUMBER() OVER (ORDER BY MAX(score) DESC, MIN(submitted_at) ASC) as rank
    FROM tournament_entries
    WHERE tournament_id = NEW.tournament_id
    GROUP BY student_id
  )
  INSERT INTO leaderboard_rankings (tournament_id, student_id, best_score, total_attempts, average_score, rank, last_entry_at)
  SELECT
    NEW.tournament_id,
    student_id,
    best_score,
    total_attempts,
    average_score,
    rank,
    last_entry_at
  FROM ranked
  ON CONFLICT (tournament_id, student_id) DO UPDATE SET
    best_score = EXCLUDED.best_score,
    total_attempts = EXCLUDED.total_attempts,
    average_score = EXCLUDED.average_score,
    rank = EXCLUDED.rank,
    last_entry_at = EXCLUDED.last_entry_at,
    calculated_at = NOW();

  -- Calculate percentiles
  UPDATE leaderboard_rankings lr
  SET percentile = (
    SELECT 100.0 * (COUNT(*) - lr.rank + 1) / COUNT(*)
    FROM leaderboard_rankings lr2
    WHERE lr2.tournament_id = NEW.tournament_id
  )
  WHERE lr.tournament_id = NEW.tournament_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rankings
AFTER INSERT ON tournament_entries
FOR EACH ROW EXECUTE FUNCTION update_tournament_rankings();

-- Indexes
CREATE INDEX idx_tournaments_active ON tournaments(scope_type, scope_id) WHERE is_active = TRUE;
CREATE INDEX idx_tournament_entries_tournament ON tournament_entries(tournament_id, score DESC);
CREATE INDEX idx_leaderboard_rankings_tournament ON leaderboard_rankings(tournament_id, rank);
CREATE INDEX idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id, rank);
```

**Tournament Flow:**

```typescript
// Submit a game session to a tournament
async function submitToTournament(
  tournamentId: string,
  studentId: string,
  gameSessionId: string
) {
  // 1. Check if can join
  const { data: check } = await supabase.rpc('can_join_tournament', {
    p_student_id: studentId,
    p_tournament_id: tournamentId
  })

  if (!check.allowed) {
    throw new Error(check.reason)
  }

  // 2. Get game session data
  const { data: session } = await supabase
    .from('game_sessions')
    .select()
    .eq('id', gameSessionId)
    .eq('player_id', studentId) // Verify ownership
    .single()

  if (!session) throw new Error('Session not found')

  // 3. Submit entry
  const { data: entry } = await supabase
    .from('tournament_entries')
    .insert({
      tournament_id: tournamentId,
      student_id: studentId,
      score: session.score,
      total_questions: session.total_questions,
      accuracy: (session.score / session.total_questions) * 100,
      time_seconds: session.time_seconds,
      game_session_id: gameSessionId
    })
    .select()
    .single()

  // 4. Get updated ranking
  const { data: ranking } = await supabase
    .from('leaderboard_rankings')
    .select()
    .eq('tournament_id', tournamentId)
    .eq('student_id', studentId)
    .single()

  return { entry, ranking, warning: check.warning }
}
```

**Migration Steps:**
1. Create `tournaments` table
2. Create `tournament_entries` table
3. Create `leaderboard_rankings` table
4. Create `leaderboards` table
5. Create `leaderboard_entries` table
6. Create helper functions and triggers
7. Create default leaderboards for existing classrooms

**Rollback Plan:**
- Tournaments can be deactivated individually
- Leaderboards are separate from core progress data
- All tournament data is supplementary

## Related Decisions

- ADR-0008: Multi-Tenant Hierarchy (defines scopes)
- ADR-0010: FERPA Compliance (display name privacy)
- ADR-0011: Friends System (friends-only leaderboards)
- ADR-0013: Result Sharing (share tournament results)

## References

- School Helper Requirements: `docs/requirements.md` (Kaland's trophy system)
- [Gamification Best Practices](https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/)

---

**Author:** Claude (AI) + Bert Carroll
**Reviewers:** Kaland Carroll (Product Manager)
**Last Updated:** 2026-01-14
