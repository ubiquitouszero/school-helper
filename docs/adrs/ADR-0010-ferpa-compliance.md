# ADR-0008: FERPA Compliance Strategy

**Status:** Proposed

**Date:** 2026-01-14

**Context:** School Helper will be used in educational settings where student data is protected by FERPA (Family Educational Rights and Privacy Act). We must design the system to protect student privacy, ensure proper consent, enable data portability, and provide audit trails. While initially a family app, the architecture must support FERPA compliance from day one to enable school adoption.

**Decision Drivers:**
- Schools cannot adopt software that violates FERPA
- Parents have rights to access and control their child's data
- Students have privacy rights that increase with age
- Data breaches of student information have serious consequences
- Must support "directory information" opt-out
- Need audit trails for compliance verification

## Decision

Implement a **privacy-first architecture** with:

1. **Minimal PII Collection** - Only collect what's necessary
2. **Consent-Based Access** - All data sharing requires explicit consent
3. **Role-Based Data Isolation** - Schools can't see other schools' data
4. **Audit Logging** - Track all data access for compliance
5. **Data Portability** - Export and deletion on request

### FERPA Data Categories

```
NEVER COLLECTED (Student PII we don't need)
├── Social Security Number
├── Full Date of Birth (only birth year for age-gating)
├── Home Address
├── Parent Employment Info
├── Medical Records
└── Biometric Data

COLLECTED WITH CONSENT (Educational Records)
├── Display Name (can be nickname)
├── Grade Level
├── Birth Year (for age-appropriate content)
├── Learning Progress
├── Scores and Achievements
└── Participation Records

DIRECTORY INFORMATION (Opt-out available)
├── Display Name
├── Grade Level
├── Participation in Activities
└── Awards/Trophies Earned
```

## Rationale

### Why Minimal PII?

The best way to protect data is to not collect it:
- No email addresses for students (use parent's email for account recovery)
- No full DOB (birth year is sufficient for age-gating)
- No addresses (not needed for an educational app)
- Display names can be nicknames (real names optional)

### Why Consent-Based Architecture?

FERPA requires parental consent for:
- Sharing data with third parties
- Displaying student information publicly
- Cross-school data access

Building consent into the data model ensures we can't accidentally violate these requirements.

### Why Audit Logging?

Schools must demonstrate FERPA compliance during audits:
- Who accessed what data and when
- What was the legitimate educational purpose
- How was consent obtained

## Consequences

### Positive
- Schools can confidently adopt the platform
- Parents trust that their children's data is protected
- Legal liability is minimized
- Clear audit trail for any questions

### Negative
- More complex data access patterns
- Some features require consent workflow first
- **Mitigation:** Make consent flow smooth and educational

### Neutral
- Need to train users on privacy features
- Additional storage for audit logs

## Implementation

**Files Affected:**
- `supabase/migrations/003_authentication.sql` (consent tables)
- `supabase/migrations/006_rls_policies.sql` (data isolation)
- Future: `src/lib/audit.ts`, `src/components/ConsentFlow.tsx`

**Schema Additions:**

```sql
-- Privacy settings per student
CREATE TABLE student_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Directory information opt-out
  show_in_directory BOOLEAN DEFAULT TRUE,
  show_display_name BOOLEAN DEFAULT TRUE,
  show_grade_level BOOLEAN DEFAULT TRUE,
  show_achievements BOOLEAN DEFAULT TRUE,

  -- Leaderboard visibility
  leaderboard_display_name TEXT, -- Override display name for leaderboards
  show_on_classroom_leaderboard BOOLEAN DEFAULT TRUE,
  show_on_school_leaderboard BOOLEAN DEFAULT FALSE, -- Opt-in
  show_on_grade_leaderboard BOOLEAN DEFAULT FALSE,  -- Opt-in

  -- Data sharing
  allow_progress_sharing_teachers BOOLEAN DEFAULT TRUE,
  allow_progress_sharing_parents BOOLEAN DEFAULT TRUE, -- Always true for < 18

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID, -- adult_profiles.id who changed settings

  UNIQUE(student_id)
);

-- Audit log for data access
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  actor_type TEXT NOT NULL CHECK (actor_type IN ('adult', 'student', 'system', 'api')),
  actor_id UUID, -- adult_profiles.id or students.id
  actor_ip INET,

  -- What
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'export', 'share'
  resource_type TEXT NOT NULL, -- 'student', 'game_session', 'trophy', etc.
  resource_id UUID,

  -- Context
  purpose TEXT, -- 'educational_review', 'parent_monitoring', 'admin_audit'
  details JSONB, -- Additional context

  -- When
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data export requests (GDPR-style rights)
CREATE TABLE data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL, -- adult_profiles.id (parent)
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- For exports
  export_url TEXT,
  export_expires_at TIMESTAMPTZ,

  -- For deletions
  deletion_scheduled_at TIMESTAMPTZ,
  deletion_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Consent records (expanded from ADR-0011)
-- parental_consents table already defined, adding more consent types:
-- consent_type IN (
--   'account_creation',      -- Initial account setup
--   'data_collection',       -- Basic data collection
--   'cross_group_friends',   -- Friends outside family/classroom
--   'leaderboard_display',   -- Show on public leaderboards
--   'email_sharing',         -- Share results via email
--   'school_data_access',    -- Allow school to see family data
--   'third_party_sharing',   -- Future: integrations
--   'research_participation' -- Future: anonymized research
-- )

-- Data retention policy
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('district', 'school', 'family')),
  scope_id UUID NOT NULL,

  -- Retention periods (in days, NULL = forever)
  game_sessions_retention INTEGER DEFAULT 365 * 3, -- 3 years
  audit_log_retention INTEGER DEFAULT 365 * 7,     -- 7 years (compliance)
  deleted_student_retention INTEGER DEFAULT 30,    -- 30 days before permanent delete

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX idx_audit_log_actor ON audit_log(actor_type, actor_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_time ON audit_log(created_at);
```

**RLS Policy Examples:**

```sql
-- Students can only see their own data
CREATE POLICY "students_own_data" ON students
  FOR SELECT
  USING (
    id = current_student_id() -- Custom function from session
  );

-- Parents can see their children's data
CREATE POLICY "parents_see_children" ON students
  FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM family_members
      WHERE adult_id = current_adult_id()
      AND role IN ('parent', 'guardian')
    )
  );

-- Teachers can see their classroom's students
CREATE POLICY "teachers_see_classroom" ON students
  FOR SELECT
  USING (
    id IN (
      SELECT cm.student_id FROM classroom_members cm
      JOIN classrooms c ON cm.classroom_id = c.id
      JOIN admin_roles ar ON ar.scope_type = 'classroom' AND ar.scope_id = c.id
      WHERE ar.adult_id = current_adult_id()
    )
  );

-- School admins can see their school's students
CREATE POLICY "school_admin_see_students" ON students
  FOR SELECT
  USING (
    id IN (
      SELECT cm.student_id FROM classroom_members cm
      JOIN classrooms c ON cm.classroom_id = c.id
      JOIN admin_roles ar ON ar.scope_type = 'school' AND ar.scope_id = c.school_id
      WHERE ar.adult_id = current_adult_id()
    )
  );

-- Audit logging trigger
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (actor_type, actor_id, action, resource_type, resource_id)
  VALUES (
    current_setting('app.actor_type', true),
    current_setting('app.actor_id', true)::uuid,
    TG_OP,
    TG_TABLE_NAME,
    CASE TG_OP
      WHEN 'DELETE' THEN OLD.id
      ELSE NEW.id
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

**Data Export Function:**

```typescript
// supabase/functions/export-student-data/index.ts
async function exportStudentData(studentId: string, requestedBy: string) {
  // Verify requester is parent/guardian
  const { data: membership } = await supabase
    .from('family_members')
    .select()
    .eq('student_id', studentId)
    .eq('adult_id', requestedBy)
    .in('role', ['parent', 'guardian'])
    .single()

  if (!membership) throw new Error('Unauthorized')

  // Gather all student data
  const exportData = {
    student: await supabase.from('students').select().eq('id', studentId).single(),
    game_sessions: await supabase.from('game_sessions').select().eq('player_id', studentId),
    trophies: await supabase.from('trophies').select().eq('player_id', studentId),
    daily_goals: await supabase.from('daily_goals').select().eq('player_id', studentId),
    streaks: await supabase.from('streaks').select().eq('player_id', studentId),
    friendships: await supabase.from('friendships').select().or(`student_id.eq.${studentId},friend_id.eq.${studentId}`),
    privacy_settings: await supabase.from('student_privacy_settings').select().eq('student_id', studentId),
    exported_at: new Date().toISOString()
  }

  // Generate secure download link
  const filename = `student-data-${studentId}-${Date.now()}.json`
  const { data: upload } = await supabase.storage
    .from('exports')
    .upload(filename, JSON.stringify(exportData, null, 2))

  // Create signed URL (expires in 24 hours)
  const { data: signedUrl } = await supabase.storage
    .from('exports')
    .createSignedUrl(filename, 60 * 60 * 24)

  return signedUrl
}
```

**Migration Steps:**
1. Create `student_privacy_settings` table
2. Create `audit_log` table
3. Create `data_export_requests` table
4. Create `data_retention_policies` table
5. Add audit logging triggers to sensitive tables
6. Create helper functions for RLS policies
7. Create Edge Functions for export/delete

**Rollback Plan:**
- Privacy settings can default to most restrictive
- Audit logging can be disabled via trigger drop
- Export functionality is independent

## Related Decisions

- ADR-0008: Multi-Tenant Hierarchy (defines data boundaries)
- ADR-0009: Authentication (consent tracking)
- ADR-0011: Friends System (privacy implications)
- ADR-0012: Tournaments (leaderboard privacy)

## References

- [FERPA Regulations](https://studentprivacy.ed.gov/)
- [COPPA Rule](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)
- [Student Privacy Compass](https://studentprivacycompass.org/)
- [PTAC Best Practices](https://studentprivacy.ed.gov/resources/ptac-best-practices)

---

**Author:** Claude (AI) + Bert Carroll
**Reviewers:** Kaland Carroll (Product Manager)
**Last Updated:** 2026-01-14
