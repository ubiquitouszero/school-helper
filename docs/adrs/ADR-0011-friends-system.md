# ADR-0009: Friends System

**Status:** Proposed

**Date:** 2026-01-14

**Context:** Kids want to connect with friends, see each other's progress, and compete on friends-only leaderboards. However, friend connections involving minors require careful consideration of privacy, parental oversight, and safety. The system must balance social engagement with appropriate guardrails.

**Decision Drivers:**
- Kids are motivated by social features (competing with friends)
- Parents need visibility into who their child is connected with
- COPPA requires parental consent for social features for under-13s
- Teachers should see classroom social dynamics
- Some families/schools will want to restrict friend scope
- Friendship requests can be a vector for unwanted contact

## Decision

Implement a **configurable friends system** with:

1. **Bidirectional friendships** - Both parties must accept
2. **Scope configuration per group** - Admins set who can friend whom
3. **Parental oversight** - Parents see and can manage friends
4. **Age-appropriate restrictions** - Stricter rules for younger kids

### Friendship Scopes

```
SCOPE LEVELS (configurable per family/classroom)
┌────────────────────────────────────────────────────────────┐
│ same_group_only    │ Friends must be in same family/class │
│ same_school        │ Friends can be anyone in same school │
│ any_with_approval  │ Any friend with parent approval      │
│ disabled           │ No friend features                   │
└────────────────────────────────────────────────────────────┘

DEFAULT BY CONTEXT
├── Families: any_with_approval (parents decide)
├── Classrooms: same_group_only (safest default)
└── Schools: same_school (if enabled by admin)
```

## Rationale

### Why Bidirectional?

Unidirectional "following" allows unwanted attention. Requiring both parties to accept:
- Prevents stalking/harassment
- Gives both kids agency
- Matches real-world friendship expectations

### Why Configurable Scope?

Different contexts have different needs:
- **Families:** Parents want control over who their kid connects with
- **Schools:** May have policies about student interactions
- **Classrooms:** Teachers may want to limit to class only

Making scope configurable lets each context set appropriate rules.

### Why Parental Oversight?

For children under 13 (COPPA):
- Parents must consent to social features
- Parents should see who their child is connected with
- Parents can remove inappropriate connections

Even for older kids, parents appreciate visibility.

## Considered Options

### Option 1: No Friends Feature
**Pros:**
- Simplest, safest
- No privacy concerns

**Cons:**
- Misses key motivational feature
- Kids will ask for it

### Option 2: Open Friends (Anyone)
**Pros:**
- Maximum flexibility
- Familiar pattern (most social apps)

**Cons:**
- Safety concerns for minors
- COPPA/FERPA issues
- Schools won't adopt

### Option 3: Configurable Scope (Chosen)
**Pros:**
- Flexibility with safety
- Respects different contexts
- Parental control built-in

**Cons:**
- More complex to implement
- UI needs to explain restrictions

## Consequences

### Positive
- Kids get social motivation they want
- Parents have appropriate oversight
- Schools can adopt with confidence
- Flexible for different use cases

### Negative
- Scope restrictions may frustrate some kids
- Cross-school friendships require extra approval
- **Mitigation:** Clear UI explaining why restrictions exist

### Neutral
- Need friend request/accept UI
- Need parent approval workflow for cross-group

## Implementation

**Files Affected:**
- `supabase/migrations/004_social_features.sql`
- Future: `src/components/FriendsList.tsx`, `src/components/FriendRequest.tsx`

**Schema:**

```sql
-- Friendships between students
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Request sent, waiting for acceptance
    'accepted',   -- Both parties agreed
    'declined',   -- Recipient declined
    'blocked'     -- One party blocked the other
  )),

  -- Approval tracking
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  parent_approval_required BOOLEAN DEFAULT FALSE,
  parent_approved_at TIMESTAMPTZ,
  parent_approved_by UUID, -- adult_profiles.id

  -- Context
  connection_context TEXT, -- 'same_family', 'same_classroom', 'same_school', 'cross_school'

  -- Constraints
  CONSTRAINT different_students CHECK (student_id != friend_id),
  UNIQUE(student_id, friend_id)
);

-- Group-level friend settings
CREATE TABLE group_friend_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_type TEXT NOT NULL CHECK (group_type IN ('family', 'classroom', 'school')),
  group_id UUID NOT NULL,

  -- Scope
  friend_scope TEXT NOT NULL DEFAULT 'same_group_only' CHECK (friend_scope IN (
    'disabled',           -- No friends allowed
    'same_group_only',    -- Only within this group
    'same_school',        -- Anyone in same school
    'any_with_approval'   -- Anyone with parent approval
  )),

  -- Additional restrictions
  require_parent_approval_under_age INTEGER DEFAULT 13, -- Age threshold
  allow_friend_requests BOOLEAN DEFAULT TRUE,  -- Can students initiate?
  show_friend_activity BOOLEAN DEFAULT TRUE,   -- Show friends' progress?

  -- Admin who set this
  updated_by UUID, -- adult_profiles.id
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_type, group_id)
);

-- Friend activity feed (what friends are doing)
CREATE TABLE friend_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'trophy_earned',
    'streak_milestone',
    'personal_best',
    'challenge_completed',
    'tournament_rank'
  )),
  activity_data JSONB NOT NULL, -- Details about the activity
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('private', 'friends', 'classroom', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked students (prevent future requests)
CREATE TABLE blocked_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by UUID, -- adult_profiles.id if parent blocked
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

-- Indexes
CREATE INDEX idx_friendships_student ON friendships(student_id) WHERE status = 'accepted';
CREATE INDEX idx_friendships_friend ON friendships(friend_id) WHERE status = 'accepted';
CREATE INDEX idx_friendships_pending ON friendships(friend_id) WHERE status = 'pending';
CREATE INDEX idx_friend_activity_student ON friend_activity(student_id, created_at DESC);

-- Helper function: Get student's friends
CREATE OR REPLACE FUNCTION get_student_friends(p_student_id UUID)
RETURNS TABLE(friend_id UUID, display_name TEXT, avatar_url TEXT, friendship_id UUID)
AS $$
  SELECT
    CASE
      WHEN f.student_id = p_student_id THEN f.friend_id
      ELSE f.student_id
    END as friend_id,
    s.display_name,
    s.avatar_url,
    f.id as friendship_id
  FROM friendships f
  JOIN students s ON s.id = CASE
    WHEN f.student_id = p_student_id THEN f.friend_id
    ELSE f.student_id
  END
  WHERE (f.student_id = p_student_id OR f.friend_id = p_student_id)
    AND f.status = 'accepted'
$$ LANGUAGE SQL STABLE;

-- Helper function: Check if friendship is allowed
CREATE OR REPLACE FUNCTION can_send_friend_request(
  p_requester_id UUID,
  p_recipient_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_requester_groups JSONB;
  v_recipient_groups JSONB;
  v_shared_group BOOLEAN := FALSE;
  v_shared_school BOOLEAN := FALSE;
  v_scope TEXT;
  v_result JSONB;
BEGIN
  -- Check if already friends or pending
  IF EXISTS (
    SELECT 1 FROM friendships
    WHERE (student_id = p_requester_id AND friend_id = p_recipient_id)
       OR (student_id = p_recipient_id AND friend_id = p_requester_id)
  ) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'already_connected');
  END IF;

  -- Check if blocked
  IF EXISTS (
    SELECT 1 FROM blocked_students
    WHERE (blocker_id = p_recipient_id AND blocked_id = p_requester_id)
  ) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'blocked');
  END IF;

  -- Get requester's family settings
  SELECT gfs.friend_scope INTO v_scope
  FROM family_members fm
  JOIN group_friend_settings gfs ON gfs.group_type = 'family' AND gfs.group_id = fm.family_id
  WHERE fm.student_id = p_requester_id
  LIMIT 1;

  -- Check if they share a group
  v_shared_group := EXISTS (
    SELECT 1 FROM classroom_members cm1
    JOIN classroom_members cm2 ON cm1.classroom_id = cm2.classroom_id
    WHERE cm1.student_id = p_requester_id AND cm2.student_id = p_recipient_id
  ) OR EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.student_id = p_requester_id AND fm2.student_id = p_recipient_id
  );

  -- Determine if allowed based on scope
  CASE v_scope
    WHEN 'disabled' THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'friends_disabled');
    WHEN 'same_group_only' THEN
      IF v_shared_group THEN
        RETURN jsonb_build_object('allowed', true, 'requires_approval', false);
      ELSE
        RETURN jsonb_build_object('allowed', false, 'reason', 'not_in_same_group');
      END IF;
    WHEN 'same_school' THEN
      -- Check same school logic
      RETURN jsonb_build_object('allowed', true, 'requires_approval', NOT v_shared_group);
    WHEN 'any_with_approval' THEN
      RETURN jsonb_build_object('allowed', true, 'requires_approval', NOT v_shared_group);
    ELSE
      RETURN jsonb_build_object('allowed', false, 'reason', 'unknown_scope');
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Friend Request Flow:**

```typescript
// Friend request workflow
async function sendFriendRequest(requesterId: string, recipientId: string) {
  // 1. Check if request is allowed
  const { data: check } = await supabase.rpc('can_send_friend_request', {
    p_requester_id: requesterId,
    p_recipient_id: recipientId
  })

  if (!check.allowed) {
    throw new Error(check.reason)
  }

  // 2. Determine context
  const context = await determineConnectionContext(requesterId, recipientId)

  // 3. Create friendship record
  const { data: friendship } = await supabase
    .from('friendships')
    .insert({
      student_id: requesterId,
      friend_id: recipientId,
      status: 'pending',
      connection_context: context,
      parent_approval_required: check.requires_approval
    })
    .select()
    .single()

  // 4. Notify recipient (and their parents if young)
  await notifyFriendRequest(friendship)

  return friendship
}

async function acceptFriendRequest(friendshipId: string, studentId: string) {
  const { data: friendship } = await supabase
    .from('friendships')
    .select()
    .eq('id', friendshipId)
    .eq('friend_id', studentId) // Only recipient can accept
    .eq('status', 'pending')
    .single()

  if (!friendship) throw new Error('Request not found')

  // If parent approval required and not yet approved, can't accept
  if (friendship.parent_approval_required && !friendship.parent_approved_at) {
    throw new Error('Requires parent approval first')
  }

  await supabase
    .from('friendships')
    .update({
      status: 'accepted',
      responded_at: new Date().toISOString()
    })
    .eq('id', friendshipId)

  // Create activity for both students
  await createFriendActivity(friendship.student_id, 'new_friend', { friend_id: studentId })
  await createFriendActivity(studentId, 'new_friend', { friend_id: friendship.student_id })
}
```

**Migration Steps:**
1. Create `friendships` table
2. Create `group_friend_settings` table
3. Create `friend_activity` table
4. Create `blocked_students` table
5. Create helper functions
6. Set default settings for existing families
7. Create RLS policies

**Rollback Plan:**
- Friend features can be disabled via scope setting
- Tables can be dropped without affecting core functionality
- Activity feed is independent of core progress tracking

## Related Decisions

- ADR-0008: Multi-Tenant Hierarchy (defines groups)
- ADR-0009: Authentication (identifies students)
- ADR-0010: FERPA Compliance (privacy requirements)
- ADR-0012: Tournaments (friends-only leaderboards)

## References

- [COPPA Social Features Guide](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- School Helper Requirements: `docs/requirements.md`

---

**Author:** Claude (AI) + Bert Carroll
**Reviewers:** Kaland Carroll (Product Manager)
**Last Updated:** 2026-01-14
