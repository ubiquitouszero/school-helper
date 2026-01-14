-- School Helper Database Migration
-- 002: Multi-Tenant Foundation
--
-- This migration implements the layered multi-tenant architecture from ADR-0008.
-- It adds support for families, classrooms, schools, and districts while
-- maintaining backward compatibility with existing player data.
--
-- Key changes:
-- - Renames 'players' to 'students'
-- - Adds families and classrooms as parallel group types
-- - Adds optional organizational layers (districts, schools, grades)
-- - Creates junction tables for membership
-- - Migrates existing players to a default "Carroll Family"

-- =============================================================================
-- PART 1: Create Optional Organizational Layers
-- =============================================================================

-- Districts (largest organizational unit, optional)
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools (optional, can exist without a district)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district_id, slug)
);

-- Grades/Pods (optional, disabled by default)
-- Used for organizing classrooms within a school
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "3rd Grade", "Pod A", etc.
  grade_level INTEGER, -- Numeric for sorting/filtering (K=0, 1st=1, etc.)
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PART 2: Create Core Group Tables
-- =============================================================================

-- Classrooms (school context)
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL, -- Optional school
  grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,   -- Optional grade
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  school_year TEXT, -- "2025-2026"
  grade_level INTEGER, -- Can override grade's level
  settings JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families (home context)
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "The Carroll Family"
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PART 3: Rename players to students and add new columns
-- =============================================================================

-- Rename the players table to students
ALTER TABLE players RENAME TO students;

-- Rename the 'name' column to 'display_name' for consistency
ALTER TABLE students RENAME COLUMN name TO display_name;

-- Add new columns for multi-tenant support
ALTER TABLE students ADD COLUMN grade_level INTEGER; -- Current grade (K=0, 1=1, etc.)
ALTER TABLE students ADD COLUMN birth_year INTEGER;  -- For age-appropriate content (FERPA-safe)
ALTER TABLE students ADD COLUMN settings JSONB DEFAULT '{}';

-- Add comments explaining grade_level values
COMMENT ON COLUMN students.grade_level IS 'Kindergarten=0, 1st=1, 2nd=2, etc.';
COMMENT ON COLUMN students.birth_year IS 'Birth year only (not full DOB) for FERPA compliance';

-- =============================================================================
-- PART 4: Create Junction Tables
-- =============================================================================

-- Classroom membership (connects students to classrooms)
CREATE TABLE classroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'aide')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ, -- NULL if still active
  UNIQUE(classroom_id, student_id)
);

-- Family membership (connects students and adults to families)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- NULL for adults
  adult_id UUID, -- References adult_profiles (created in future auth migration)
  role TEXT NOT NULL CHECK (role IN ('child', 'parent', 'guardian')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT member_type CHECK (
    (student_id IS NOT NULL AND adult_id IS NULL AND role = 'child') OR
    (student_id IS NULL AND adult_id IS NOT NULL AND role IN ('parent', 'guardian'))
  )
);

-- =============================================================================
-- PART 5: Create Admin Roles Table
-- =============================================================================

-- Admin roles at each level of the hierarchy
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adult_id UUID NOT NULL, -- References adult_profiles (created in future auth migration)
  scope_type TEXT NOT NULL CHECK (scope_type IN ('district', 'school', 'classroom', 'family')),
  scope_id UUID NOT NULL, -- ID of the district/school/classroom/family
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID, -- Who granted this role
  UNIQUE(adult_id, scope_type, scope_id)
);

-- =============================================================================
-- PART 6: Migrate Existing Data
-- =============================================================================

-- Create the default Carroll Family for existing players
INSERT INTO families (name, slug, settings)
VALUES ('Carroll Family', 'carroll-family', '{"is_default": true}');

-- Add existing students (children only) to the Carroll Family
-- Note: Mom, Dad, and Guest are adults and will be handled in the auth migration
INSERT INTO family_members (family_id, student_id, role)
SELECT
  (SELECT id FROM families WHERE slug = 'carroll-family'),
  s.id,
  'child'
FROM students s
WHERE s.display_name IN ('Kaland', 'Valen');

-- Set grade levels for existing students based on project context
-- Kaland is 9 years old, in 3rd grade (grade_level = 3)
-- Valen is 5 years old, in Kindergarten (grade_level = 0)
UPDATE students SET grade_level = 3 WHERE display_name = 'Kaland';
UPDATE students SET grade_level = 0 WHERE display_name = 'Valen';

-- =============================================================================
-- PART 7: Create Indexes for Common Queries
-- =============================================================================

-- District indexes
CREATE INDEX idx_districts_slug ON districts(slug);

-- School indexes
CREATE INDEX idx_schools_district ON schools(district_id);
CREATE INDEX idx_schools_slug ON schools(slug);

-- Grade indexes
CREATE INDEX idx_grades_school ON grades(school_id);
CREATE INDEX idx_grades_level ON grades(grade_level);

-- Classroom indexes
CREATE INDEX idx_classrooms_school ON classrooms(school_id);
CREATE INDEX idx_classrooms_grade ON classrooms(grade_id);
CREATE INDEX idx_classrooms_year ON classrooms(school_year);
CREATE INDEX idx_classrooms_archived ON classrooms(is_archived) WHERE is_archived = FALSE;

-- Family indexes
CREATE INDEX idx_families_slug ON families(slug);

-- Student indexes (new columns)
CREATE INDEX idx_students_grade_level ON students(grade_level);

-- Classroom member indexes
CREATE INDEX idx_classroom_members_classroom ON classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student ON classroom_members(student_id);
CREATE INDEX idx_classroom_members_active ON classroom_members(classroom_id) WHERE left_at IS NULL;

-- Family member indexes
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_family_members_student ON family_members(student_id);
CREATE INDEX idx_family_members_adult ON family_members(adult_id);

-- Admin role indexes
CREATE INDEX idx_admin_roles_adult ON admin_roles(adult_id);
CREATE INDEX idx_admin_roles_scope ON admin_roles(scope_type, scope_id);

-- =============================================================================
-- PART 8: Enable Row Level Security on New Tables
-- =============================================================================

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PART 9: Permissive Policies for MVP (will be tightened with auth)
-- =============================================================================

-- These policies allow all operations for now. They will be replaced with
-- proper role-based policies when authentication is implemented.
--
-- IMPORTANT: Using "TO public" per Supabase best practices - policies without
-- an explicit TO clause only work for authenticated users. See:
-- C:\Users\bertc\notes\docs\patterns-and-antipatterns\supabase.md

-- Read access (SELECT) - TO public for anonymous access
CREATE POLICY "public_read_districts" ON districts FOR SELECT TO public USING (true);
CREATE POLICY "public_read_schools" ON schools FOR SELECT TO public USING (true);
CREATE POLICY "public_read_grades" ON grades FOR SELECT TO public USING (true);
CREATE POLICY "public_read_classrooms" ON classrooms FOR SELECT TO public USING (true);
CREATE POLICY "public_read_families" ON families FOR SELECT TO public USING (true);
CREATE POLICY "public_read_classroom_members" ON classroom_members FOR SELECT TO public USING (true);
CREATE POLICY "public_read_family_members" ON family_members FOR SELECT TO public USING (true);
CREATE POLICY "public_read_admin_roles" ON admin_roles FOR SELECT TO public USING (true);

-- Write access (INSERT/UPDATE/DELETE) - TO public for MVP, will be tightened
-- Note: Using WITH CHECK for INSERT, USING + WITH CHECK for UPDATE per best practices
CREATE POLICY "public_insert_districts" ON districts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_districts" ON districts FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_districts" ON districts FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_schools" ON schools FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_schools" ON schools FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_schools" ON schools FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_grades" ON grades FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_grades" ON grades FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_grades" ON grades FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_classrooms" ON classrooms FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_classrooms" ON classrooms FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_classrooms" ON classrooms FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_families" ON families FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_families" ON families FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_families" ON families FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_classroom_members" ON classroom_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_classroom_members" ON classroom_members FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_classroom_members" ON classroom_members FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_family_members" ON family_members FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_family_members" ON family_members FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_family_members" ON family_members FOR DELETE TO public USING (true);

CREATE POLICY "public_insert_admin_roles" ON admin_roles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_admin_roles" ON admin_roles FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_admin_roles" ON admin_roles FOR DELETE TO public USING (true);

-- =============================================================================
-- PART 10: Update Foreign Key References in Existing Tables
-- =============================================================================

-- Update the RLS policy name for the renamed table and use proper TO public pattern
-- (The policy "Allow all for players" still works but let's fix it per best practices)
DROP POLICY IF EXISTS "Allow all for players" ON students;
CREATE POLICY "public_read_students" ON students FOR SELECT TO public USING (true);
CREATE POLICY "public_insert_students" ON students FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_update_students" ON students FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_students" ON students FOR DELETE TO public USING (true);

-- Note: The foreign key references in game_sessions, trophies, daily_goals,
-- and streaks tables automatically follow the rename since they reference
-- the table by OID, not by name.

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Summary of changes:
-- 1. Created districts table (optional layer)
-- 2. Created schools table (optional layer)
-- 3. Created grades table (optional layer, disabled by default)
-- 4. Created classrooms table
-- 5. Created families table
-- 6. Renamed players table to students
-- 7. Added grade_level and birth_year columns to students
-- 8. Created classroom_members junction table
-- 9. Created family_members junction table
-- 10. Created admin_roles table
-- 11. Migrated existing player data to "Carroll Family"
-- 12. Created appropriate indexes
-- 13. Enabled RLS with permissive policies for MVP
