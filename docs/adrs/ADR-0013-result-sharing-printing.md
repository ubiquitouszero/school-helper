# ADR-0013: Result Sharing & Printing

**Status:** Proposed

**Date:** 2026-01-14

**Context:** Kids want to share their achievements with parents and teachers. Parents want to print homework completion reports. Teachers want to verify that practice happened at home. The existing trophy system needs to support printing. Sharing must respect privacy settings and work without requiring the recipient to have an account.

**Decision Drivers:**
- Kaland wants to print his trophies (existing requirement)
- Kids want to show parents what they accomplished
- Teachers need homework verification
- Parents may not have accounts
- Must work offline (printable PDFs)
- Privacy: sharing must be controlled

## Decision

Implement a **shareable results system** with:

1. **Shareable links** - Time-limited URLs that work without login
2. **Printable formats** - PDF certificates, progress reports, homework logs
3. **Controlled sharing** - Kids can share to parents/teachers, with parent oversight
4. **Multiple formats** - Certificates (trophies), summaries (progress), logs (homework)

### Sharing Flow

```
SHARING OPTIONS
┌─────────────────────────────────────────────────────────────┐
│ What to Share         │ Who Can Receive                    │
├───────────────────────┼─────────────────────────────────────┤
│ Trophy Certificate    │ Anyone (via link or print)         │
│ Progress Summary      │ Parents, Teachers                  │
│ Homework Log          │ Teachers (for verification)        │
│ Tournament Result     │ Friends, Family (via link)         │
└─────────────────────────────────────────────────────────────┘

SHARING METHODS
├── In-App Share    │ Shows result to linked parent/teacher account
├── Shareable Link  │ URL that works without login (expires)
├── Email           │ Sends formatted email (requires parent consent)
└── Print/PDF       │ Downloads printable document
```

## Rationale

### Why Shareable Links?

Parents and grandparents may not have School Helper accounts:
- Grandma wants to see the trophy, doesn't need an account
- Teacher wants to verify homework, may use different system
- Simple URL sharing is familiar pattern

### Why Time-Limited?

Privacy protection:
- Links expire (default 7 days, configurable)
- Can be revoked if shared inappropriately
- Reduces long-term exposure risk

### Why Printable PDFs?

Physical certificates are meaningful to kids:
- Can hang on the fridge
- Bring to school for show-and-tell
- Permanent record that doesn't depend on app access

## Consequences

### Positive
- Kids can proudly share achievements
- Parents stay connected without accounts
- Teachers can verify homework completion
- Physical trophies for motivation

### Negative
- Shareable links could be forwarded inappropriately
- **Mitigation:** Links show only what was explicitly shared, expire

### Neutral
- Need PDF generation capability
- Need email sending capability (future)

## Implementation

**Files Affected:**
- `supabase/migrations/005_tournaments.sql` (sharing tables can go here)
- `supabase/functions/generate-certificate/index.ts`
- Future: `src/components/ShareModal.tsx`, `src/lib/pdf.ts`

**Schema:**

```sql
-- Shareable content records
CREATE TABLE shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- What's being shared
  content_type TEXT NOT NULL CHECK (content_type IN (
    'trophy',           -- Single trophy certificate
    'trophy_collection', -- All trophies
    'progress_summary', -- Progress over time period
    'game_session',     -- Single session result
    'homework_log',     -- Multiple sessions for homework verification
    'tournament_result' -- Tournament placement
  )),

  -- Reference to specific content
  content_id UUID, -- trophy.id, game_session.id, tournament_entry.id, etc.
  content_ids UUID[], -- For collections (homework_log, trophy_collection)

  -- Access control
  share_token TEXT UNIQUE NOT NULL, -- Random token for URL
  expires_at TIMESTAMPTZ NOT NULL,
  max_views INTEGER, -- NULL = unlimited
  view_count INTEGER DEFAULT 0,
  is_revoked BOOLEAN DEFAULT FALSE,

  -- Sharing context
  shared_with_type TEXT CHECK (shared_with_type IN ('anyone', 'parent', 'teacher', 'email')),
  shared_with_id UUID, -- adult_profiles.id if specific person
  shared_with_email TEXT, -- If shared via email

  -- Metadata
  title TEXT, -- Custom title for the share
  message TEXT, -- Optional message from student
  created_by UUID, -- student_id or adult_profiles.id
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email shares (for tracking sent emails)
CREATE TABLE email_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_content_id UUID NOT NULL REFERENCES shared_content(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- PDF generation queue (for async generation)
CREATE TABLE pdf_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_content_id UUID REFERENCES shared_content(id) ON DELETE CASCADE,

  -- Generation status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  pdf_url TEXT, -- Storage URL when complete
  error_message TEXT,

  -- Metadata
  template_type TEXT NOT NULL, -- 'trophy_certificate', 'progress_report', etc.
  template_data JSONB NOT NULL, -- Data for the template
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Homework verification (teacher-specific)
CREATE TABLE homework_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- teacher's adult_profiles.id

  -- Assignment details
  title TEXT NOT NULL,
  description TEXT,
  game_type TEXT NOT NULL,
  difficulty TEXT,
  min_problems INTEGER DEFAULT 10,
  min_accuracy INTEGER, -- Percentage, NULL = any

  -- Timing
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL,

  is_active BOOLEAN DEFAULT TRUE
);

-- Homework submissions (student proof of completion)
CREATE TABLE homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Proof
  game_session_ids UUID[] NOT NULL, -- Sessions that count toward this
  total_problems INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  shared_content_id UUID REFERENCES shared_content(id), -- Link to shareable proof

  -- Status
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID, -- teacher who verified

  UNIQUE(assignment_id, student_id)
);

-- Indexes
CREATE INDEX idx_shared_content_token ON shared_content(share_token) WHERE NOT is_revoked;
CREATE INDEX idx_shared_content_student ON shared_content(student_id, created_at DESC);
CREATE INDEX idx_homework_classroom ON homework_assignments(classroom_id) WHERE is_active;
CREATE INDEX idx_homework_submissions_assignment ON homework_submissions(assignment_id);

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token() RETURNS TEXT AS $$
  SELECT encode(gen_random_bytes(16), 'base64')
    -- Make URL-safe
    |> replace('+', '-')
    |> replace('/', '_')
    |> replace('=', '')
$$ LANGUAGE SQL;

-- Function to create shareable link
CREATE OR REPLACE FUNCTION create_share(
  p_student_id UUID,
  p_content_type TEXT,
  p_content_id UUID DEFAULT NULL,
  p_content_ids UUID[] DEFAULT NULL,
  p_expires_days INTEGER DEFAULT 7,
  p_title TEXT DEFAULT NULL
) RETURNS shared_content AS $$
DECLARE
  v_share shared_content;
BEGIN
  INSERT INTO shared_content (
    student_id,
    content_type,
    content_id,
    content_ids,
    share_token,
    expires_at,
    title,
    created_by
  ) VALUES (
    p_student_id,
    p_content_type,
    p_content_id,
    p_content_ids,
    generate_share_token(),
    NOW() + (p_expires_days || ' days')::INTERVAL,
    p_title,
    p_student_id
  ) RETURNING * INTO v_share;

  RETURN v_share;
END;
$$ LANGUAGE plpgsql;

-- Function to view shared content
CREATE OR REPLACE FUNCTION view_shared_content(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_share shared_content;
  v_content JSONB;
BEGIN
  -- Get and validate share
  SELECT * INTO v_share
  FROM shared_content
  WHERE share_token = p_token
    AND NOT is_revoked
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_views IS NULL OR view_count < max_views);

  IF v_share IS NULL THEN
    RETURN jsonb_build_object('error', 'Share not found or expired');
  END IF;

  -- Increment view count
  UPDATE shared_content SET view_count = view_count + 1 WHERE id = v_share.id;

  -- Get the actual content based on type
  CASE v_share.content_type
    WHEN 'trophy' THEN
      SELECT jsonb_build_object(
        'trophy', row_to_json(t),
        'student', jsonb_build_object('display_name', s.display_name, 'avatar_url', s.avatar_url)
      ) INTO v_content
      FROM trophies t
      JOIN students s ON s.id = t.player_id
      WHERE t.id = v_share.content_id;

    WHEN 'game_session' THEN
      SELECT jsonb_build_object(
        'session', row_to_json(gs),
        'student', jsonb_build_object('display_name', s.display_name)
      ) INTO v_content
      FROM game_sessions gs
      JOIN students s ON s.id = gs.player_id
      WHERE gs.id = v_share.content_id;

    WHEN 'progress_summary' THEN
      -- Aggregate progress data
      SELECT jsonb_build_object(
        'student', jsonb_build_object('display_name', s.display_name),
        'total_sessions', COUNT(gs.id),
        'total_problems', SUM(gs.total_questions),
        'total_correct', SUM(gs.score),
        'accuracy', ROUND(100.0 * SUM(gs.score) / NULLIF(SUM(gs.total_questions), 0), 1),
        'trophies', (SELECT COUNT(*) FROM trophies WHERE player_id = v_share.student_id)
      ) INTO v_content
      FROM students s
      LEFT JOIN game_sessions gs ON gs.player_id = s.id
      WHERE s.id = v_share.student_id
      GROUP BY s.id, s.display_name;

    ELSE
      v_content := jsonb_build_object('error', 'Unknown content type');
  END CASE;

  RETURN jsonb_build_object(
    'share', row_to_json(v_share),
    'content', v_content
  );
END;
$$ LANGUAGE plpgsql;
```

**Certificate Templates:**

```typescript
// Certificate data structure
interface TrophyCertificate {
  studentName: string
  trophyType: 'bronze' | 'silver' | 'gold'
  gameType: string
  earnedAt: string
  shareUrl: string
  qrCode: string // QR to verify authenticity
}

// Generate PDF certificate
async function generateCertificatePDF(data: TrophyCertificate): Promise<Blob> {
  // Using a library like @react-pdf/renderer or pdfkit
  const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape' })

  // Header
  doc.fontSize(36).text('Certificate of Achievement', { align: 'center' })

  // Trophy image
  const trophyImage = await loadTrophyImage(data.trophyType)
  doc.image(trophyImage, 250, 100, { width: 100 })

  // Student name
  doc.fontSize(24).text(data.studentName, { align: 'center' })

  // Achievement
  doc.fontSize(18).text(
    `Earned a ${data.trophyType.toUpperCase()} trophy in ${data.gameType}`,
    { align: 'center' }
  )

  // Date
  doc.fontSize(14).text(`Awarded on ${formatDate(data.earnedAt)}`, { align: 'center' })

  // Verification QR code
  const qrImage = await generateQRCode(data.shareUrl)
  doc.image(qrImage, 50, 400, { width: 80 })
  doc.fontSize(10).text('Scan to verify', 50, 485)

  // Footer
  doc.fontSize(10).text('School Helper - Making Learning Fun!', { align: 'center' })

  return doc.end()
}
```

**Sharing Flow:**

```typescript
// Share a trophy
async function shareTrophy(
  studentId: string,
  trophyId: string,
  options: { title?: string; expiresInDays?: number } = {}
) {
  // 1. Verify student owns this trophy
  const { data: trophy } = await supabase
    .from('trophies')
    .select()
    .eq('id', trophyId)
    .eq('player_id', studentId)
    .single()

  if (!trophy) throw new Error('Trophy not found')

  // 2. Create share record
  const { data: share } = await supabase.rpc('create_share', {
    p_student_id: studentId,
    p_content_type: 'trophy',
    p_content_id: trophyId,
    p_expires_days: options.expiresInDays || 7,
    p_title: options.title || `${trophy.trophy_type} Trophy - ${trophy.game_type}`
  })

  // 3. Generate shareable URL
  const shareUrl = `${APP_URL}/share/${share.share_token}`

  // 4. Optionally queue PDF generation
  if (options.generatePdf) {
    await supabase.from('pdf_generation_queue').insert({
      shared_content_id: share.id,
      template_type: 'trophy_certificate',
      template_data: { trophy, studentId }
    })
  }

  return { share, shareUrl }
}

// Submit homework for verification
async function submitHomework(
  studentId: string,
  assignmentId: string,
  sessionIds: string[]
) {
  // 1. Verify sessions belong to student and match assignment criteria
  const { data: assignment } = await supabase
    .from('homework_assignments')
    .select()
    .eq('id', assignmentId)
    .single()

  const { data: sessions } = await supabase
    .from('game_sessions')
    .select()
    .in('id', sessionIds)
    .eq('player_id', studentId)
    .eq('game_type', assignment.game_type)

  // 2. Calculate totals
  const totalProblems = sessions.reduce((sum, s) => sum + s.total_questions, 0)
  const totalCorrect = sessions.reduce((sum, s) => sum + s.score, 0)
  const accuracy = (totalCorrect / totalProblems) * 100

  // 3. Check requirements
  if (totalProblems < assignment.min_problems) {
    throw new Error(`Need at least ${assignment.min_problems} problems`)
  }
  if (assignment.min_accuracy && accuracy < assignment.min_accuracy) {
    throw new Error(`Need at least ${assignment.min_accuracy}% accuracy`)
  }

  // 4. Create shareable homework log
  const { data: share } = await supabase.rpc('create_share', {
    p_student_id: studentId,
    p_content_type: 'homework_log',
    p_content_ids: sessionIds,
    p_title: `Homework: ${assignment.title}`
  })

  // 5. Create submission
  const { data: submission } = await supabase
    .from('homework_submissions')
    .insert({
      assignment_id: assignmentId,
      student_id: studentId,
      game_session_ids: sessionIds,
      total_problems: totalProblems,
      accuracy,
      shared_content_id: share.id
    })
    .select()
    .single()

  return { submission, shareUrl: `${APP_URL}/share/${share.share_token}` }
}
```

**Migration Steps:**
1. Create `shared_content` table
2. Create `email_shares` table
3. Create `pdf_generation_queue` table
4. Create `homework_assignments` table
5. Create `homework_submissions` table
6. Create share functions
7. Deploy certificate generation Edge Function

**Rollback Plan:**
- Sharing is independent of core progress tracking
- Can disable sharing without losing data
- PDFs are generated on-demand, no critical storage

## Related Decisions

- ADR-0008: Multi-Tenant Hierarchy (sharing scope)
- ADR-0010: FERPA Compliance (sharing requires consent)
- ADR-0012: Tournaments (share tournament results)

## References

- School Helper Requirements: `docs/requirements.md` (Kaland's printable trophies)
- [PDF Generation with Deno](https://deno.land/x/pdf)

---

**Author:** Claude (AI) + Bert Carroll
**Reviewers:** Kaland Carroll (Product Manager)
**Last Updated:** 2026-01-14
