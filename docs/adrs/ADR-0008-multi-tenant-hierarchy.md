# ADR-0008: Multi-Tenant Hierarchy Architecture

**Status:** Proposed

**Date:** 2026-01-14

**Context:** School Helper needs to evolve from a single-family app to a multi-tenant platform supporting families, classrooms, schools, and districts. The hierarchy must be flexible enough for home use (single family) and scalable enough for school districts with thousands of students.

**Decision Drivers:**
- Kids need to belong to both home (family) and school (classroom) contexts
- Schools may want optional organizational layers (grades, pods)
- Districts need visibility across multiple schools
- FERPA requires strict data isolation between schools
- System must work simply for families while supporting complex school hierarchies

## Decision

Implement a **layered multi-tenant architecture** with:

1. **Two parallel group types:** Families and Classrooms (separate tables, not unified)
2. **Optional organizational layers:** Districts → Schools → Grades/Pods → Classrooms
3. **Students as the core entity** that can belong to multiple groups
4. **Role-based access** at each layer of the hierarchy

### Hierarchy Structure

```
OPTIONAL LAYERS (disabled by default)
┌─────────────────────────────────────────┐
│ districts                               │
│   └── schools                           │
│        └── grades (pods)                │
│             └── classrooms              │
│                  └── classroom_members  │
└─────────────────────────────────────────┘

ALWAYS AVAILABLE
┌─────────────────────────────────────────┐
│ families                                │
│   └── family_members                    │
└─────────────────────────────────────────┘

CORE ENTITY
┌─────────────────────────────────────────┐
│ students (can belong to both)           │
└─────────────────────────────────────────┘
```

## Rationale

### Why Separate Families and Classrooms?

Families and classrooms have fundamentally different:
- **Membership rules:** Families are permanent; classroom membership changes yearly
- **Admin roles:** Parents vs. Teachers have different permissions
- **Privacy expectations:** Family data is more private than classroom data
- **Lifecycle:** Families persist; classrooms are archived after school year

Unifying them would create complexity handling edge cases and confuse the data model.

### Why Optional Layers?

Not every deployment needs districts or grades:
- **Home use:** Just families, no school hierarchy
- **Single classroom:** Teacher signs up, creates classroom, done
- **Small school:** School + classrooms, no district
- **Large district:** Full hierarchy enabled

Optional layers let the system scale without forcing complexity on simple use cases.

### Why Students Can Belong to Multiple Groups?

A child is both:
- Part of their family (homework, practice at home)
- Part of their classroom (school assignments, tournaments)

Progress and trophies should be visible in both contexts. Parents see everything; teachers see school-related activity.

## Considered Options

### Option 1: Unified Groups Table
**Pros:**
- Single table, simpler queries
- Polymorphic design is flexible

**Cons:**
- Type-specific logic becomes messy
- Different RLS rules per type are complex
- Confuses the domain model

### Option 2: Separate Tables (Chosen)
**Pros:**
- Clear domain boundaries
- Type-specific columns and constraints
- Simpler RLS policies per table
- Easier to reason about

**Cons:**
- More tables to manage
- Some duplication in member junction tables

### Option 3: Nested Set / Closure Table
**Pros:**
- Efficient ancestor/descendant queries
- Flexible depth

**Cons:**
- Complex to maintain
- Overkill for 4-5 levels max
- Hard to understand for maintenance

## Consequences

### Positive
- Clear separation of concerns between home and school contexts
- Flexible deployment from single family to large district
- Students' progress travels with them across contexts
- Each layer has clear admin responsibilities

### Negative
- More tables than a simple unified approach
- Queries spanning both families and classrooms need UNION
- **Mitigation:** Create views for common cross-context queries

### Neutral
- Existing `players` table will be renamed to `students`
- Migration needed for existing data

## Implementation

**Files Affected:**
- `supabase/migrations/002_multi_tenant_foundation.sql`
- Future: `src/lib/supabase/types.ts` (TypeScript types)

**Schema:**

```sql
-- Optional: Districts (largest organizational unit)
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Schools
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

-- Optional: Grades/Pods (disabled by default)
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "3rd Grade", "Pod A", etc.
  grade_level INTEGER, -- Numeric for sorting/filtering (K=0, 1st=1, etc.)
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Students (core entity, renamed from players)
-- Separate migration handles rename + data migration
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  grade_level INTEGER, -- Current grade (K=0, 1=1, etc.)
  birth_year INTEGER,  -- For age-appropriate content, not full DOB (FERPA)
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom membership
CREATE TABLE classroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'aide')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ, -- NULL if still active
  UNIQUE(classroom_id, student_id)
);

-- Family membership
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- NULL for adults
  adult_id UUID, -- References adult_profiles (created in auth migration)
  role TEXT NOT NULL CHECK (role IN ('child', 'parent', 'guardian')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT member_type CHECK (
    (student_id IS NOT NULL AND adult_id IS NULL AND role = 'child') OR
    (student_id IS NULL AND adult_id IS NOT NULL AND role IN ('parent', 'guardian'))
  )
);

-- Admin roles at each level
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adult_id UUID NOT NULL, -- References adult_profiles
  scope_type TEXT NOT NULL CHECK (scope_type IN ('district', 'school', 'classroom', 'family')),
  scope_id UUID NOT NULL, -- ID of the district/school/classroom/family
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID, -- Who granted this role
  UNIQUE(adult_id, scope_type, scope_id)
);
```

**Migration Steps:**
1. Create new tables (districts, schools, grades, classrooms, families)
2. Create junction tables (classroom_members, family_members)
3. Rename `players` to `students` with ALTER TABLE
4. Add new columns to students (grade_level, birth_year)
5. Migrate existing player data
6. Create default family for existing players
7. Create admin_roles table
8. Add indexes for common queries

**Rollback Plan:**
- Keep `players` table as backup during migration
- Script to reverse rename if needed
- Junction tables can be dropped without affecting core data

## Related Decisions

- ADR-0009: Authentication & QR Code Sign-In (how adults/students authenticate)
- ADR-0010: FERPA Compliance Strategy (data isolation requirements)
- ADR-0011: Friends System (cross-group friendships)

## References

- [Supabase Multi-Tenancy Patterns](https://supabase.com/docs/guides/auth/managing-user-data)
- [FERPA Requirements](https://studentprivacy.ed.gov/faq/what-ferpa)
- School Helper Requirements: `docs/requirements.md`

---

**Author:** Claude (AI) + Bert Carroll
**Reviewers:** Kaland Carroll (Product Manager)
**Last Updated:** 2026-01-14
