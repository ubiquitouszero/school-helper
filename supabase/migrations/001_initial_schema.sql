-- School Helper Database Schema
-- Initial setup for MVP

-- Players table (simple for now, will add auth later)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions - tracks each play session
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('math', 'numbers', 'words')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'challenge')),
  mode TEXT, -- For numbers: 'recognize', 'compare', 'count'
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trophies earned
CREATE TABLE trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  trophy_type TEXT NOT NULL CHECK (trophy_type IN ('bronze', 'silver', 'gold')),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, game_type, trophy_type)
);

-- Daily goals (optional feature)
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'problems_completed', 'minutes_practiced', 'accuracy'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(player_id, goal_type, date)
);

-- Streaks tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  UNIQUE(player_id)
);

-- Insert default players (the family!)
INSERT INTO players (name) VALUES
  ('Kaland'),
  ('Valen'),
  ('Mom'),
  ('Dad'),
  ('Guest');

-- Create indexes for common queries
CREATE INDEX idx_sessions_player ON game_sessions(player_id);
CREATE INDEX idx_sessions_date ON game_sessions(created_at);
CREATE INDEX idx_trophies_player ON trophies(player_id);

-- Row Level Security (RLS) - will enable with auth later
-- For now, these are permissive policies

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Permissive policies for MVP (everyone can read/write)
CREATE POLICY "Allow all for players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all for game_sessions" ON game_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for trophies" ON trophies FOR ALL USING (true);
CREATE POLICY "Allow all for daily_goals" ON daily_goals FOR ALL USING (true);
CREATE POLICY "Allow all for streaks" ON streaks FOR ALL USING (true);
