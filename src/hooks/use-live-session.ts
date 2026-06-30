import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface LiveTeam {
  id: string;
  session_id: string;
  team_number: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  expires_at: string;
}

export interface LiveMatch {
  id: string;
  session_id: string;
  team_a: number;
  team_b: number;
  result: "a" | "b" | "draw";
  expires_at: string;
  created_at: string;
}

export interface LiveSessionState {
  id: string;
  session_id: string;
  num_teams: number;
  queue: number[];
  expires_at: string;
  match_duration: number;
}

export function useActiveLiveSession() {
  return useQuery({
    queryKey: ["live_session_state"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await db
        .from("live_session_state")
        .select("*")
        .gt("expires_at", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as LiveSessionState | null;
    },
    refetchInterval: 60_000,
  });
}

export function useLiveSessionTeams(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["live_session_teams", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await db
        .from("live_session_teams")
        .select("*")
        .eq("session_id", sessionId)
        .order("points", { ascending: false })
        .order("gf", { ascending: false });
      if (error) throw error;
      return data as LiveTeam[];
    },
    enabled: !!sessionId,
  });
}

export function useLiveSessionMatches(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["live_session_matches", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await db
        .from("live_session_matches")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LiveMatch[];
    },
    enabled: !!sessionId,
  });
}

export function useCreateLiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      numTeams,
      matchDuration,
    }: {
      numTeams: number;
      matchDuration: number;
    }) => {
      await db.from("live_session_teams").delete().not("id", "is", null);
      await db.from("live_session_matches").delete().not("id", "is", null);
      await db.from("live_session_state").delete().not("id", "is", null);

      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const teams = Array.from({ length: numTeams }, (_, i) => ({
        session_id: sessionId,
        team_number: i + 1,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, points: 0,
        expires_at: expiresAt,
      }));

      const { error: teamsError } = await db.from("live_session_teams").insert(teams);
      if (teamsError) throw teamsError;

      const queue = Array.from({ length: numTeams }, (_, i) => i + 1);
      const { error: stateError } = await db.from("live_session_state").insert({
        session_id: sessionId,
        num_teams: numTeams,
        match_duration: matchDuration,
        queue,
        expires_at: expiresAt,
      });
      if (stateError) throw stateError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live_session_state"] });
      qc.invalidateQueries({ queryKey: ["live_session_teams"] });
      qc.invalidateQueries({ queryKey: ["live_session_matches"] });
    },
  });
}

export function useRecordResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      state,
      result,
    }: {
      state: LiveSessionState;
      result: "a" | "b" | "draw";
    }) => {
      const { session_id, queue, expires_at } = state;
      const teamA = queue[0];
      const teamB = queue[1];

      const { error: matchError } = await db.from("live_session_matches").insert({
        session_id,
        team_a: teamA,
        team_b: teamB,
        result,
        expires_at,
      });
      if (matchError) throw matchError;

      const { data: teams, error: fetchError } = await db
        .from("live_session_teams")
        .select("*")
        .eq("session_id", session_id)
        .in("team_number", [teamA, teamB]);
      if (fetchError) throw fetchError;

      const tA = teams.find((t: LiveTeam) => t.team_number === teamA);
      const tB = teams.find((t: LiveTeam) => t.team_number === teamB);
      const aWon = result === "a";
      const bWon = result === "b";
      const draw = result === "draw";

      await db.from("live_session_teams").update({
        played: tA.played + 1,
        won: tA.won + (aWon ? 1 : 0),
        drawn: tA.drawn + (draw ? 1 : 0),
        lost: tA.lost + (bWon ? 1 : 0),
        gf: tA.gf + (aWon ? 1 : 0),
        ga: tA.ga + (bWon ? 1 : 0),
        points: tA.points + (aWon ? 3 : draw ? 1 : 0),
      }).eq("id", tA.id);

      await db.from("live_session_teams").update({
        played: tB.played + 1,
        won: tB.won + (bWon ? 1 : 0),
        drawn: tB.drawn + (draw ? 1 : 0),
        lost: tB.lost + (aWon ? 1 : 0),
        gf: tB.gf + (bWon ? 1 : 0),
        ga: tB.ga + (aWon ? 1 : 0),
        points: tB.points + (bWon ? 3 : draw ? 1 : 0),
      }).eq("id", tB.id);

      let newQueue: number[];
      if (aWon) {
        newQueue = [teamA, ...queue.slice(2), teamB];
      } else if (bWon) {
        newQueue = [teamB, ...queue.slice(2), teamA];
      } else {
        newQueue = [...queue.slice(2), teamA, teamB];
      }

      const { error: stateError } = await db
        .from("live_session_state")
        .update({ queue: newQueue })
        .eq("session_id", session_id);
      if (stateError) throw stateError;
    },
    onSuccess: (_, { state }) => {
      qc.invalidateQueries({ queryKey: ["live_session_state"] });
      qc.invalidateQueries({ queryKey: ["live_session_teams", state.session_id] });
      qc.invalidateQueries({ queryKey: ["live_session_matches", state.session_id] });
    },
  });
}

export function useClearLiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await db.from("live_session_teams").delete().not("id", "is", null);
      await db.from("live_session_matches").delete().not("id", "is", null);
      await db.from("live_session_state").delete().not("id", "is", null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live_session_state"] });
      qc.invalidateQueries({ queryKey: ["live_session_teams"] });
      qc.invalidateQueries({ queryKey: ["live_session_matches"] });
    },
  });
}