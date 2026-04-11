// src/hooks/use-data.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Player = Database["public"]["Tables"]["players"]["Row"];
type Match = Database["public"]["Tables"]["matches"]["Row"];
type TrainingTeam = Database["public"]["Tables"]["training_teams"]["Row"];

export type { Player, Match, TrainingTeam };

export interface PlayerStatEntry {
  id: string;
  player_id: string;
  goals: number;
  assists: number;
  recorded_at: string;
}

export interface PlayerWithStats extends Player {
  goals_total: number;
  assists_total: number;
  goals_this_month: number;
  assists_this_month: number;
  stat_entries: PlayerStatEntry[];
}

function isSameMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function mergeStats(players: Player[], stats: PlayerStatEntry[]): PlayerWithStats[] {
  return players.map((p) => {
    const entries = stats.filter((s) => s.player_id === p.id);
    const goals_total = entries.reduce((sum, s) => sum + s.goals, 0);
    const assists_total = entries.reduce((sum, s) => sum + s.assists, 0);
    const goals_this_month = entries.filter((s) => isSameMonth(s.recorded_at)).reduce((sum, s) => sum + s.goals, 0);
    const assists_this_month = entries.filter((s) => isSameMonth(s.recorded_at)).reduce((sum, s) => sum + s.assists, 0);
    return { ...p, goals_total, assists_total, goals_this_month, assists_this_month, stat_entries: entries };
  });
}

// ─── Players ──────────────────────────────────────────────────────────────────

export const usePlayers = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").order("jersey_number");
      if (error) throw error;
      return data as Player[];
    },
  });

export const usePlayerStats = () =>
  useQuery({
    queryKey: ["player_stats"],
    queryFn: async () => {
      const { data, error } = await db.from("player_stats").select("*").order("recorded_at", { ascending: false });
      if (error) throw error;
      return data as PlayerStatEntry[];
    },
  });

export const usePlayersWithStats = () => {
  const players = usePlayers();
  const stats = usePlayerStats();
  return {
    isLoading: players.isLoading || stats.isLoading,
    data: players.data && stats.data ? mergeStats(players.data, stats.data) : undefined,
  };
};

export const useAddPlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (player: Database["public"]["Tables"]["players"]["Insert"]) => {
      const { data, error } = await supabase.from("players").insert(player).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
};

export const useUpdatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Database["public"]["Tables"]["players"]["Update"] & { id: string }) => {
      const { data, error } = await supabase.from("players").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
};

export const useDeletePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
};

export const useAddPlayerStat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ player_id, goals, assists }: { player_id: string; goals: number; assists: number }) => {
      const { data, error } = await db.from("player_stats").insert({ player_id, goals, assists }).select().single();
      if (error) throw error;
      return data as PlayerStatEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["player_stats"] }),
  });
};

export const useDeletePlayerStat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("player_stats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["player_stats"] }),
  });
};

// ─── Matches ──────────────────────────────────────────────────────────────────

export const useMatches = () =>
  useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("matches").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAddMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (match: Database["public"]["Tables"]["matches"]["Insert"]) => {
      const { data, error } = await supabase.from("matches").insert(match).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
};

export const useUpdateMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Database["public"]["Tables"]["matches"]["Update"] & { id: string }) => {
      const { data, error } = await supabase.from("matches").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
};

export const useDeleteMatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("matches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
};

// ─── Training ─────────────────────────────────────────────────────────────────

export function useTrainingTeams() {
  return useQuery({
    queryKey: ["training_teams"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("training_teams")
        .select("*")
        .gt("expires_at", now)          // only rows whose expiry is in the future
        .order("team_number", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 60_000, // re-check every minute so expired rows disappear automatically
  });
}

export function useCreateTrainingSession() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async ({
      players,
      teamSize,
    }: {
      players: string[];
      teamSize: number;
    }) => {
      // ── Step 1: wipe all existing rows ──────────────────────────────────
      const { error: clearError } = await supabase
        .from("training_teams")
        .delete()
        .not("id", "is", null);
      if (clearError) throw clearError;
 
      // ── Step 2: shuffle the names randomly ──────────────────────────────
      const shuffled = [...players].sort(() => Math.random() - 0.5);
 
      // ── Step 3: build rows ───────────────────────────────────────────────
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(); // +5 hrs
 
      const rows = shuffled.map((name, idx) => ({
        player_name: name,
        team_number: Math.floor(idx / teamSize) + 1,
        session_id:  sessionId,
        expires_at:  expiresAt,
      }));
 
      // ── Step 4: insert new rows ──────────────────────────────────────────
      const { error: insertError } = await supabase
        .from("training_teams")
        .insert(rows);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training_teams"] });
    },
  });
}

export function useClearTrainingSession() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async () => {
      // Delete ALL rows (no WHERE clause needed — we always want a full wipe)
      const { error } = await supabase
        .from("training_teams")
        .delete()
        .not("id", "is", null); // this condition is always true → deletes everything
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate so every component using useTrainingTeams re-fetches immediately
      queryClient.invalidateQueries({ queryKey: ["training_teams"] });
    },
  });
}