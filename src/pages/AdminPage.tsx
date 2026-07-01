import React, { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import {
  usePlayers, useAddPlayer, useUpdatePlayer, useDeletePlayer,
  useMatches, useAddMatch, useUpdateMatch, useDeleteMatch,
  useCreateTrainingSession, useClearTrainingSession, useTrainingTeams,
  usePlayersWithStats, useAddPlayerStat, useDeletePlayerStat,
  useSeasons, useActiveSeason, useSeasonStats,
  useCreateSeason, useCloseSeason, useAddSeasonStat, useDeleteSeasonStat,
  mergeSeasonStats,
  type Player, type Match, type PlayerWithStats,
} from "@/hooks/use-data";
import {
  useActiveLiveSession,
  useLiveSessionTeams,
  useLiveSessionMatches,
  useClearLiveSession,
} from "@/hooks/use-live-session";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Pencil, Trash2, Plus, Shuffle, User, Target, X,
  Search, AlertCircle, LogOut, Loader2, Eraser, Users, Clock, Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type PlayerFormData = Database["public"]["Tables"]["players"]["Insert"];
type MatchFormData  = Database["public"]["Tables"]["matches"]["Insert"];
type MatchFormState = MatchFormData & { venue?: string };

const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
  <Loader2 className={`animate-spin ${className}`} />
);

function useTakenJerseys(excludeId?: string) {
  const { data: players } = usePlayers();
  return useMemo(
    () => new Set((players ?? []).filter((p) => p.id !== excludeId).map((p) => p.jersey_number)),
    [players, excludeId],
  );
}

// ─── Player Form ──────────────────────────────────────────────────────────────
const PlayerForm: React.FC<{
  player?: Player;
  onSave: (data: PlayerFormData) => void;
  onCancel: () => void;
  saving?: boolean;
}> = ({ player, onSave, onCancel, saving }) => {
  const takenJerseys = useTakenJerseys(player?.id);
  const [form, setForm] = useState({
    name: player?.name || "",
    position: player?.position || "Midfielder",
    jersey_number: player?.jersey_number ?? 0,
    strong_foot: player?.strong_foot || "R",
    state: player?.state || "",
    nationality: (player as Player & { nationality?: string })?.nationality || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(player?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const jerseyTaken = form.jersey_number > 0 && takenJerseys.has(form.jersey_number);
  const isBusy = uploading || !!saving;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", imageFile);
    fd.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd },
      );
      const data = await res.json();
      return (data.secure_url as string) ?? null;
    } catch { return null; }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (jerseyTaken) { toast.error(`Jersey #${form.jersey_number} is already taken`); return; }
    let avatar_url = player?.avatar_url || "";
    if (imageFile) {
      const up = await uploadImage();
      if (!up) { toast.error("Image upload failed"); return; }
      avatar_url = up;
    }
    onSave({ ...form, avatar_url });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      {preview && (
        <div className="flex justify-center">
          <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div>
          <Label>Position</Label>
          <Select value={form.position ?? "Midfielder"} onValueChange={(v) => setForm({ ...form, position: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Goalkeeper", "Defender", "Midfielder", "Attacker"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Jersey #</Label>
          <Input
            type="number"
            value={form.jersey_number ?? 0}
            onChange={(e) => setForm({ ...form, jersey_number: Math.max(0, +e.target.value) })}
            className={jerseyTaken ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {jerseyTaken && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Jersey #{form.jersey_number} is already assigned
            </p>
          )}
        </div>
        <div>
          <Label>Strong Foot</Label>
          <Select value={form.strong_foot ?? "R"} onValueChange={(v) => setForm({ ...form, strong_foot: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="R">Right</SelectItem>
              <SelectItem value="L">Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>State of Origin</Label><Input value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
        <div>
          <Label>Nationality</Label>
          <Input value={form.nationality ?? ""} placeholder="e.g. Nigerian" onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label>Player Photo</Label>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={isBusy || jerseyTaken}>
          {isBusy && <Spinner className="h-4 w-4 mr-2" />}
          {uploading ? "Uploading..." : isBusy ? "Saving..." : player ? "Update Player" : "Add Player"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isBusy}>Cancel</Button>
      </div>
    </div>
  );
};

// ─── Stat Entry Panel ─────────────────────────────────────────────────────────
const StatEntryPanel: React.FC<{ player: PlayerWithStats; onClose: () => void }> = ({ player, onClose }) => {
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const addStat = useAddPlayerStat();
  const deleteStat = useDeletePlayerStat();

  const handleAdd = async () => {
    if (goals === 0 && assists === 0) { toast.error("Enter at least 1 goal or assist"); return; }
    try {
      await addStat.mutateAsync({ player_id: player.id, goals, assists });
      toast.success("Stats logged!");
      setGoals(0); setAssists(0);
    } catch { toast.error("Failed to log stats"); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await deleteStat.mutateAsync(id); }
    catch { toast.error("Failed"); }
    finally { setDeletingId(null); }
  };

  const grouped = player.stat_entries.reduce<Record<string, typeof player.stat_entries>>((acc, entry) => {
    const label = new Date(entry.recorded_at).toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[label]) acc[label] = [];
    acc[label].push(entry);
    return acc;
  }, {});

  return (
    <div className="bg-card border-2 border-primary rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
            {player.avatar_url
              ? <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
              : <User className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div>
            <p className="font-heading font-bold text-foreground">{player.name}</p>
            <p className="text-xs text-muted-foreground">{player.position} · #{player.jersey_number}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { val: player.goals_this_month, label: "Mo. Goals", primary: true },
          { val: player.assists_this_month, label: "Mo. Assists", primary: true },
          { val: player.goals_total, label: "Total Goals", primary: false },
          { val: player.assists_total, label: "Total Assists", primary: false },
        ].map((s) => (
          <div key={s.label} className="bg-muted rounded-lg p-2">
            <p className={`text-xl font-heading font-black ${s.primary ? "text-primary" : "text-foreground"}`}>{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="border border-border rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Log New Entry (today)</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Goals</Label><Input type="number" min={0} value={goals} onChange={(e) => setGoals(Math.max(0, +e.target.value))} /></div>
          <div><Label className="text-xs">Assists</Label><Input type="number" min={0} value={assists} onChange={(e) => setAssists(Math.max(0, +e.target.value))} /></div>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={addStat.isPending}>
          {addStat.isPending ? <Spinner className="h-3 w-3 mr-1" /> : <Target className="h-3 w-3 mr-1" />}
          {addStat.isPending ? "Saving..." : "Save Entry"}
        </Button>
      </div>
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">History</p>
          {Object.entries(grouped).map(([month, entries]) => {
            const mG = entries.reduce((s, e) => s + e.goals, 0);
            const mA = entries.reduce((s, e) => s + e.assists, 0);
            return (
              <div key={month}>
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-bold text-foreground">{month}</p>
                  <p className="text-xs text-muted-foreground">{mG}G · {mA}A</p>
                </div>
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5 text-sm mb-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.recorded_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <span className="font-medium">{entry.goals}G · {entry.assists}A</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6"
                      disabled={deletingId === entry.id}
                      onClick={() => handleDelete(entry.id)}>
                      {deletingId === entry.id ? <Spinner className="h-3 w-3" /> : <Trash2 className="h-3 w-3 text-destructive" />}
                    </Button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Match Form ───────────────────────────────────────────────────────────────
const MatchForm: React.FC<{
  match?: Match;
  onSave: (data: MatchFormData) => void;
  onCancel: () => void;
  saving?: boolean;
}> = ({ match, onSave, onCancel, saving }) => {
  const [form, setForm] = useState<MatchFormState>({
    date: match?.date || new Date().toISOString().split("T")[0],
    time: match?.time || "15:00",
    opponent: match?.opponent || "",
    team_score: match?.team_score ?? 0,
    opponent_score: match?.opponent_score ?? 0,
    venue: (match as Match & { venue?: string })?.venue || "Home",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Date</Label><Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div><Label>Time</Label><Input type="time" value={form.time ?? ""} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        <div><Label>Opponent</Label><Input value={form.opponent ?? ""} onChange={(e) => setForm({ ...form, opponent: e.target.value })} /></div>
        <div>
          <Label>Venue</Label>
          <Select value={form.venue ?? "Home"} onValueChange={(v) => setForm({ ...form, venue: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Away">Away</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Our Score</Label><Input type="number" value={form.team_score ?? 0} onChange={(e) => setForm({ ...form, team_score: +e.target.value })} /></div>
          <div><Label>Opp Score</Label><Input type="number" value={form.opponent_score ?? 0} onChange={(e) => setForm({ ...form, opponent_score: +e.target.value })} /></div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => { const { venue: _v, ...rest } = form; onSave(rest); }} disabled={!!saving}>
          {saving && <Spinner className="h-4 w-4 mr-2" />}
          {saving ? "Saving..." : match ? "Update Match" : "Add Match"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={!!saving}>Cancel</Button>
      </div>
    </div>
  );
};

// ─── Shuffle Tab ──────────────────────────────────────────────────────────────
const ShuffleTab: React.FC<{ players: Player[] | undefined }> = ({ players }) => {
  const [trainingNames, setTrainingNames] = useState("");
  const [teamSize, setTeamSize] = useState(5);
  const createSession = useCreateTrainingSession();
  const clearSession = useClearTrainingSession();
  const { data: activeTeams } = useTrainingTeams();

  const grouped = useMemo(() =>
    (activeTeams ?? []).reduce<Record<number, string[]>>((acc, t) => {
      if (!acc[t.team_number]) acc[t.team_number] = [];
      acc[t.team_number].push(t.player_name);
      return acc;
    }, {}), [activeTeams]);

  const teamNumbers = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const hasActiveSession = teamNumbers.length > 0;
  const expiresAt = activeTeams?.[0]?.expires_at;

  const accentColors = [
    { border: "border-l-green-500",  text: "text-green-600 dark:text-green-400"  },
    { border: "border-l-blue-500",   text: "text-blue-600 dark:text-blue-400"    },
    { border: "border-l-orange-500", text: "text-orange-600 dark:text-orange-400"},
    { border: "border-l-purple-500", text: "text-purple-600 dark:text-purple-400"},
    { border: "border-l-red-500",    text: "text-red-600 dark:text-red-400"      },
  ];

  const handleShuffle = async () => {
    const names = trainingNames.split("\n").map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) { toast.error("Enter at least 2 players"); return; }
    try {
      await createSession.mutateAsync({ players: names, teamSize });
      toast.success("Teams shuffled!");
      setTrainingNames("");
    } catch { toast.error("Failed to create teams"); }
  };

  const handleClear = async () => {
    if (!confirm("Clear the current training session?")) return;
    try { await clearSession.mutateAsync(); toast.success("Session cleared!"); }
    catch { toast.error("Failed to clear session"); }
  };

  return (
    <div className="space-y-5">
      {hasActiveSession && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-sm text-foreground">Active Session</span>
              {expiresAt && (
                <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  expires {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
                </span>
              )}
            </div>
            <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5 flex-shrink-0"
              onClick={handleClear} disabled={clearSession.isPending}>
              {clearSession.isPending ? <Spinner className="h-3 w-3" /> : <Eraser className="h-3 w-3" />}
              {clearSession.isPending ? "Clearing..." : "Clear Teams"}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {teamNumbers.map((num, i) => {
              const accent = accentColors[i % accentColors.length];
              return (
                <div key={num} className={`bg-muted/30 rounded-lg p-3 border-l-4 ${accent.border}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${accent.text}`}>
                    Team {num} · {grouped[num].length}p
                  </p>
                  <ul className="space-y-0.5">
                    {grouped[num].map((name) => (
                      <li key={name} className="text-xs text-foreground truncate">{name}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shuffle className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            {hasActiveSession ? "Reshuffle Teams" : "Create Teams"}
          </h3>
          {hasActiveSession && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
              Replaces current session
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Player Names (one per line)</Label>
            <Button variant="ghost" size="sm" className="text-xs h-7"
              onClick={() => { if (!players?.length) return; setTrainingNames(players.map((p) => p.name).join("\n")); }}>
              Import from roster
            </Button>
          </div>
          <textarea
            className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            value={trainingNames}
            onChange={(e) => setTrainingNames(e.target.value)}
            placeholder={"Player 1\nPlayer 2\nPlayer 3\n..."}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {trainingNames.split("\n").filter((n) => n.trim()).length} players entered
          </p>
        </div>
        <div>
          <Label>Team Size</Label>
          <Select value={String(teamSize)} onValueChange={(v) => setTeamSize(+v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[3, 4, 5, 6, 7, 8, 11].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} players</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleShuffle} disabled={createSession.isPending || clearSession.isPending}>
            {createSession.isPending ? <Spinner className="h-4 w-4 mr-1" /> : <Shuffle className="h-4 w-4 mr-1" />}
            {createSession.isPending ? "Shuffling..." : hasActiveSession ? "Reshuffle" : "Shuffle Teams"}
          </Button>
          <Button variant="outline" onClick={() => setTrainingNames("")} disabled={createSession.isPending}>
            Clear Input
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Live Session Tab ─────────────────────────────────────────────────────────
const LiveSessionTab: React.FC = () => {
  const { data: session, isLoading } = useActiveLiveSession();
  const { data: teams = [] } = useLiveSessionTeams(session?.session_id);
  const { data: matches = [] } = useLiveSessionMatches(session?.session_id);
  const clearSession = useClearLiveSession();

  const handleClear = async () => {
    if (!confirm("End the live session? The standings and match history will be cleared.")) return;
    try { await clearSession.mutateAsync(); toast.success("Live session cleared!"); }
    catch { toast.error("Failed to clear session"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground"><Spinner className="h-5 w-5 mr-2" /> Loading…</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <Trophy className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">No active live session right now.</p>
        <p className="text-xs text-muted-foreground">Sessions are started from the Live Session page.</p>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => b.points - a.points || b.gf - a.gf || a.ga - b.ga);
  const teamA = session.queue[0];
  const teamB = session.queue[1];

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-semibold text-sm text-foreground">Active Live Session</span>
            <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
              <Clock className="h-3 w-3" />
              expires {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
            </span>
          </div>
          <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5 flex-shrink-0"
            onClick={handleClear} disabled={clearSession.isPending}>
            {clearSession.isPending ? <Spinner className="h-3 w-3" /> : <Eraser className="h-3 w-3" />}
            {clearSession.isPending ? "Clearing..." : "End Session"}
          </Button>
        </div>
        <div className="px-5 py-3 flex flex-wrap gap-4 text-sm text-muted-foreground border-b border-border">
          <span>{session.num_teams} teams</span>
          <span>{session.match_duration} min matches</span>
          <span>{matches.length} matches played</span>
        </div>
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Now Playing</p>
          <div className="flex items-center gap-3">
            <Badge>Team {teamA} 🟢</Badge>
            <span className="text-muted-foreground text-xs">vs</span>
            <Badge variant="outline">Team {teamB} 🔵</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Team</th>
                <th className="text-center px-2 py-2">P</th>
                <th className="text-center px-2 py-2">W</th>
                <th className="text-center px-2 py-2">D</th>
                <th className="text-center px-2 py-2">L</th>
                <th className="text-center px-2 py-2">GF</th>
                <th className="text-center px-2 py-2">GA</th>
                <th className="text-center px-2 py-2">GD</th>
                <th className="text-center px-2 py-2 font-bold text-foreground">Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, idx) => {
                const playing = team.team_number === teamA || team.team_number === teamB;
                return (
                  <tr key={team.id} className={`border-b border-border last:border-0 ${playing ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      Team {team.team_number}
                      {playing && <span className="ml-1.5 text-primary text-xs">●</span>}
                    </td>
                    <td className="text-center px-2 py-2.5">{team.played}</td>
                    <td className="text-center px-2 py-2.5">{team.won}</td>
                    <td className="text-center px-2 py-2.5">{team.drawn}</td>
                    <td className="text-center px-2 py-2.5">{team.lost}</td>
                    <td className="text-center px-2 py-2.5">{team.gf}</td>
                    <td className="text-center px-2 py-2.5">{team.ga}</td>
                    <td className="text-center px-2 py-2.5">{team.gf - team.ga}</td>
                    <td className="text-center px-2 py-2.5 font-bold text-foreground">{team.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Seasons Tab ──────────────────────────────────────────────────────────────
const SeasonsTab: React.FC<{ players: Player[] | undefined }> = ({ players }) => {
  const { data: seasons = [], isLoading } = useSeasons();
  const { data: activeSeason } = useActiveSeason();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(undefined);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statPlayerId, setStatPlayerId] = useState<string | null>(null);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createSeason = useCreateSeason();
  const closeSeason = useCloseSeason();
  const addSeasonStat = useAddSeasonStat();
  const deleteSeasonStat = useDeleteSeasonStat();

  const viewingSeasonId = selectedSeasonId ?? activeSeason?.id;
  const viewingSeason = seasons.find((s) => s.id === viewingSeasonId);
  const { data: seasonStats = [] } = useSeasonStats(viewingSeasonId);
  const seasonPlayers = players && seasonStats ? mergeSeasonStats(players, seasonStats) : [];
  const playerSeasonEntries = seasonStats.filter((s) => s.player_id === statPlayerId);

  const handleCreateSeason = async () => {
    if (!newSeasonName.trim()) { toast.error("Season name is required"); return; }
    try {
      await createSeason.mutateAsync(newSeasonName.trim());
      toast.success("Season created!");
      setNewSeasonName("");
      setShowCreateForm(false);
    } catch { toast.error("Failed to create season"); }
  };

  const handleCloseSeason = async () => {
    if (!viewingSeasonId) return;
    if (!confirm(`Close "${viewingSeason?.name}"? No more stats can be added to it.`)) return;
    try { await closeSeason.mutateAsync(viewingSeasonId); toast.success("Season closed!"); }
    catch { toast.error("Failed to close season"); }
  };

  const handleAddStat = async () => {
    if (!statPlayerId || !viewingSeasonId) return;
    if (goals === 0 && assists === 0) { toast.error("Enter at least 1 goal or assist"); return; }
    try {
      await addSeasonStat.mutateAsync({ season_id: viewingSeasonId, player_id: statPlayerId, goals, assists });
      toast.success("Stats logged! All-time record updated too.");
      setGoals(0); setAssists(0);
    } catch { toast.error("Failed to log stats"); }
  };

  const handleDeleteStat = async (id: string) => {
    if (!viewingSeasonId) return;
    setDeletingId(id);
    try { await deleteSeasonStat.mutateAsync({ id, season_id: viewingSeasonId }); }
    catch { toast.error("Failed to delete"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5">

      {/* Season selector + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {seasons.length > 0 && (
          <Select value={viewingSeasonId ?? ""} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.status === "active" ? "🟢" : "🔒"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {viewingSeason?.status === "active" && (
          <Button variant="outline" size="sm" onClick={handleCloseSeason} disabled={closeSeason.isPending}>
            {closeSeason.isPending ? <Spinner className="h-3 w-3 mr-1" /> : null}
            Close Season
          </Button>
        )}
        {!showCreateForm && (
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {activeSeason ? "New Season" : "Create First Season"}
          </Button>
        )}
      </div>

      {/* Create season form */}
      {showCreateForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">New Season</p>
          {activeSeason && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              Creating a new season will automatically close "{activeSeason.name}"
            </p>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Season 1, Summer 2025..."
              value={newSeasonName}
              onChange={(e) => setNewSeasonName(e.target.value)}
            />
            <Button onClick={handleCreateSeason} disabled={createSeason.isPending}>
              {createSeason.isPending ? <Spinner className="h-4 w-4 mr-1" /> : null}
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : seasons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No seasons yet. Create the first one above.</p>
        </div>
      ) : !viewingSeasonId ? null : (
        <div className="space-y-4">

          {/* Stat entry — only for active season */}
          {viewingSeason?.status === "active" && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Log Stats for {viewingSeason.name}</p>
              <div className="flex flex-wrap gap-2">
                {players?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setStatPlayerId(statPlayerId === p.id ? null : p.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      statPlayerId === p.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-foreground border-border hover:border-primary"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {statPlayerId && (
                <div className="border border-border rounded-lg p-3 space-y-3">
                  <p className="text-xs font-semibold text-foreground">
                    {players?.find((p) => p.id === statPlayerId)?.name}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Goals</Label><Input type="number" min={0} value={goals} onChange={(e) => setGoals(Math.max(0, +e.target.value))} /></div>
                    <div><Label className="text-xs">Assists</Label><Input type="number" min={0} value={assists} onChange={(e) => setAssists(Math.max(0, +e.target.value))} /></div>
                  </div>
                  <Button size="sm" onClick={handleAddStat} disabled={addSeasonStat.isPending}>
                    {addSeasonStat.isPending ? <Spinner className="h-3 w-3 mr-1" /> : <Target className="h-3 w-3 mr-1" />}
                    Save — also updates all-time record
                  </Button>

                  {playerSeasonEntries.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-xs text-muted-foreground font-semibold">Entries this season:</p>
                      {playerSeasonEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5 text-xs">
                          <span className="text-muted-foreground">
                            {new Date(entry.recorded_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="font-medium">{entry.goals}G · {entry.assists}A</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={deletingId === entry.id}
                            onClick={() => handleDeleteStat(entry.id)}>
                            {deletingId === entry.id ? <Spinner className="h-3 w-3" /> : <Trash2 className="h-3 w-3 text-destructive" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Season standings */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground text-left border-b border-border">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3 text-center">Goals</th>
                  <th className="px-4 py-3 text-center">Assists</th>
                </tr>
              </thead>
              <tbody>
                {[...seasonPlayers]
                  .sort((a, b) => b.goals_season - a.goals_season || b.assists_season - a.assists_season)
                  .map((p, i) => (
                    <tr key={p.id} className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 text-center font-bold text-primary">{p.goals_season}</td>
                      <td className="px-4 py-3 text-center font-bold text-primary">{p.assists_season}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Admin Page ───────────────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: players } = usePlayers();
  const { data: playersWithStats } = usePlayersWithStats();
  const { data: matches } = useMatches();
  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const addMatch = useAddMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [statPlayerId, setStatPlayerId] = useState<string | null>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null);
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const filteredPlayers = useMemo(() =>
    (players ?? []).filter((p) =>
      p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
      String(p.jersey_number).includes(playerSearch),
    ), [players, playerSearch]);

  const handleSavePlayer = async (data: PlayerFormData) => {
    setSavingPlayer(true);
    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({ id: editingPlayer.id, ...data });
        toast.success("Player updated!");
      } else {
        await addPlayer.mutateAsync(data);
        toast.success("Player added!");
      }
      setShowPlayerForm(false); setEditingPlayer(null);
    } catch { toast.error("Failed to save player"); }
    finally { setSavingPlayer(false); }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Delete this player? Their stats will also be removed.")) return;
    setDeletingPlayerId(id);
    try { await deletePlayer.mutateAsync(id); toast.success("Player deleted"); }
    catch { toast.error("Failed to delete"); }
    finally { setDeletingPlayerId(null); }
  };

  const handleSaveMatch = async (data: MatchFormData) => {
    setSavingMatch(true);
    try {
      if (editingMatch) {
        await updateMatch.mutateAsync({ id: editingMatch.id, ...data });
        toast.success("Match updated!");
      } else {
        await addMatch.mutateAsync(data);
        toast.success("Match added!");
      }
      setShowMatchForm(false); setEditingMatch(null);
    } catch { toast.error("Failed to save match"); }
    finally { setSavingMatch(false); }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    setDeletingMatchId(id);
    try { await deleteMatch.mutateAsync(id); toast.success("Match deleted"); }
    catch { toast.error("Failed to delete"); }
    finally { setDeletingMatchId(null); }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/");
  };

  const activeStatPlayer = playersWithStats?.find((p) => p.id === statPlayerId) ?? null;

  const getResult = (m: Match) => {
    if (m.team_score > m.opponent_score) return { label: "W", cls: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" };
    if (m.team_score < m.opponent_score) return { label: "L", cls: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400" };
    return { label: "D", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" };
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl font-heading font-bold text-foreground text-center flex-1">
          {t("admin.title")}
        </h1>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 flex-shrink-0">
          {loggingOut ? <Spinner className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
          {loggingOut ? "Signing out..." : "Logout"}
        </Button>
      </div>

      <Tabs defaultValue="players" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="training">Shuffle</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
        </TabsList>

        {/* ── Players ── */}
        <TabsContent value="players" className="space-y-4 mt-6">
          <div className="flex items-center gap-3">
            {!showPlayerForm && (
              <Button onClick={() => { setEditingPlayer(null); setShowPlayerForm(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Player
              </Button>
            )}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search players or jersey #..."
                value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} />
            </div>
          </div>
          {showPlayerForm && (
            <PlayerForm
              player={editingPlayer || undefined}
              onSave={handleSavePlayer}
              onCancel={() => { setShowPlayerForm(false); setEditingPlayer(null); }}
              saving={savingPlayer}
            />
          )}
          <div className="text-xs text-muted-foreground">
            {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
          </div>
          <div className="space-y-2">
            {filteredPlayers.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                    : <User className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-heading font-semibold text-foreground">#{p.jersey_number} {p.name}</span>
                  <span className="text-muted-foreground text-sm ml-2">{p.position} · {p.strong_foot === "L" ? "Left" : "Right"}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" disabled={!!deletingPlayerId}
                    onClick={() => { setEditingPlayer(p); setShowPlayerForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={deletingPlayerId === p.id}
                    onClick={() => handleDeletePlayer(p.id)}>
                    {deletingPlayerId === p.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Matches ── */}
        <TabsContent value="matches" className="space-y-4 mt-6">
          {!showMatchForm && (
            <Button onClick={() => { setEditingMatch(null); setShowMatchForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Match
            </Button>
          )}
          {showMatchForm && (
            <MatchForm match={editingMatch || undefined} onSave={handleSaveMatch}
              onCancel={() => { setShowMatchForm(false); setEditingMatch(null); }} saving={savingMatch} />
          )}
          <div className="space-y-2">
            {matches?.map((m) => {
              const result = getResult(m);
              return (
                <div key={m.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                  <span className={`text-xs font-black px-2 py-1 rounded ${result.cls}`}>{result.label}</span>
                  <div className="flex-1">
                    <span className="font-heading font-semibold text-foreground">
                      Legit Boys FA {m.team_score} – {m.opponent_score} {m.opponent}
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">{m.date}{m.time ? ` · ${m.time}` : ""}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={!!deletingMatchId}
                      onClick={() => { setEditingMatch(m); setShowMatchForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={deletingMatchId === m.id}
                      onClick={() => handleDeleteMatch(m.id)}>
                      {deletingMatchId === m.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Stats ── */}
        <TabsContent value="stats" className="space-y-4 mt-6">
          {activeStatPlayer && (
            <StatEntryPanel player={activeStatPlayer} onClose={() => setStatPlayerId(null)} />
          )}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground text-left">
                  <th className="px-4 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 font-semibold text-center">Mo.G</th>
                  <th className="px-4 py-3 font-semibold text-center">Mo.A</th>
                  <th className="px-4 py-3 font-semibold text-center">Tot.G</th>
                  <th className="px-4 py-3 font-semibold text-center">Tot.A</th>
                  <th className="px-4 py-3 font-semibold text-center">Log</th>
                </tr>
              </thead>
              <tbody>
                {playersWithStats?.map((p, i) => (
                  <tr key={p.id}
                    className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} ${statPlayerId === p.id ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {p.avatar_url
                            ? <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                            : <User className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{p.goals_this_month}</td>
                    <td className="px-4 py-3 text-center font-bold">{p.assists_this_month}</td>
                    <td className="px-4 py-3 text-center font-heading font-black text-primary">{p.goals_total}</td>
                    <td className="px-4 py-3 text-center font-heading font-black text-primary">{p.assists_total}</td>
                    <td className="px-4 py-3 text-center">
                      <Button variant={statPlayerId === p.id ? "default" : "outline"} size="sm" className="h-7 text-xs"
                        onClick={() => setStatPlayerId(statPlayerId === p.id ? null : p.id)}>
                        {statPlayerId === p.id ? "Close" : "+ Log"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Shuffle ── */}
        <TabsContent value="training" className="mt-6">
          <ShuffleTab players={players} />
        </TabsContent>

        {/* ── Live Session ── */}
        <TabsContent value="live" className="mt-6">
          <LiveSessionTab />
        </TabsContent>

        {/* ── Seasons ── */}
        <TabsContent value="seasons" className="mt-6">
          <SeasonsTab players={players} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;