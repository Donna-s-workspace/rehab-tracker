-- Rehab Tracker Database Schema

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('athlete', 'coach')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT CHECK (session_type IN ('rehab', 'gym')) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Exercises (predefined + custom)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  is_rehab BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view exercises"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Users can create custom exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Session Sets
CREATE TABLE IF NOT EXISTS session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  set_number INT NOT NULL,
  reps INT,
  weight_kg NUMERIC(5,2),
  duration_seconds INT,
  pain_level INT CHECK (pain_level BETWEEN 0 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sets for their sessions"
  ON session_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_sets.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sets for their sessions"
  ON session_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_sets.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sets for their sessions"
  ON session_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_sets.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sets for their sessions"
  ON session_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_sets.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- AI Coaching Logs
CREATE TABLE IF NOT EXISTS coaching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coaching_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view their coaching logs"
  ON coaching_logs FOR SELECT
  USING (auth.uid() = athlete_id);

CREATE POLICY "Service role can insert coaching logs"
  ON coaching_logs FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_session_sets_session ON session_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_coaching_logs_athlete ON coaching_logs(athlete_id, created_at DESC);

-- Seed data: Rehab exercises
INSERT INTO exercises (name, category, is_rehab) VALUES
  ('Wall Sit', 'knee_rehab', TRUE),
  ('Reverse Step-Up', 'knee_rehab', TRUE),
  ('ATG Split Squat', 'knee_rehab', TRUE),
  ('Calf Raise', 'knee_rehab', TRUE),
  ('Tibialis Raise', 'knee_rehab', TRUE),
  ('Pogo Hop', 'knee_rehab', TRUE),
  ('Skipping', 'knee_rehab', TRUE)
ON CONFLICT DO NOTHING;
