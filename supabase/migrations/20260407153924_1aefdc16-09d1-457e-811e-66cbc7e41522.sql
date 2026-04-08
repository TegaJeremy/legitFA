
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Midfielder',
  jersey_number INTEGER NOT NULL DEFAULT 0,
  strong_foot TEXT NOT NULL DEFAULT 'R' CHECK (strong_foot IN ('L', 'R')),
  state TEXT DEFAULT '',
  goals_month INTEGER NOT NULL DEFAULT 0,
  goals_year INTEGER NOT NULL DEFAULT 0,
  assists_month INTEGER NOT NULL DEFAULT 0,
  assists_year INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME DEFAULT '15:00',
  opponent TEXT NOT NULL,
  team_score INTEGER NOT NULL DEFAULT 0,
  opponent_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  team_number INTEGER NOT NULL,
  session_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 hours')
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read players" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read matches" ON public.matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read training teams" ON public.training_teams FOR SELECT TO anon, authenticated USING (expires_at > now());

CREATE POLICY "Public insert players" ON public.players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update players" ON public.players FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete players" ON public.players FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public insert matches" ON public.matches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update matches" ON public.matches FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public delete matches" ON public.matches FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public insert training teams" ON public.training_teams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public delete training teams" ON public.training_teams FOR DELETE TO anon, authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_teams;
