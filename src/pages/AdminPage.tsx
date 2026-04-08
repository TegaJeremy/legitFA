import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  usePlayers, useAddPlayer, useUpdatePlayer, useDeletePlayer,
  useMatches, useAddMatch, useUpdateMatch, useDeleteMatch,
  useCreateTrainingSession, usePlayersWithStats, useAddPlayerStat,
  useDeletePlayerStat,
  type Player, type Match, type PlayerWithStats,
} from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Shuffle, User, Target, X } from "lucide-react";

// ─── Player Form ──────────────────────────────────────────────────────────────

const PlayerForm: React.FC<{
  player?: Player;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ player, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: player?.name || "",
    position: player?.position || "Midfielder",
    jersey_number: player?.jersey_number ?? 0,
    strong_foot: player?.strong_foot || "R",
    state: player?.state || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(player?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      return data.secure_url ?? null;
    } catch { return null; }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    let avatar_url = player?.avatar_url || "";
    if (imageFile) {
      const uploaded = await uploadImage();
      if (!uploaded) { toast.error("Image upload failed"); return; }
      avatar_url = uploaded;
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
          <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Goalkeeper", "Defender", "Midfielder", "Attacker"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Jersey #</Label><Input type="number" value={form.jersey_number} onChange={(e) => setForm({ ...form, jersey_number: +e.target.value })} /></div>
        <div>
          <Label>Strong Foot</Label>
          <Select value={form.strong_foot} onValueChange={(v) => setForm({ ...form, strong_foot: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="R">Right</SelectItem>
              <SelectItem value="L">Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>State of Origin</Label><Input value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
        <div><Label>Player Photo</Label><Input type="file" accept="image/*" onChange={handleFileChange} /></div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={uploading}>
          {uploading ? "Uploading..." : player ? "Update Player" : "Add Player"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

// ─── Stat Entry Panel ─────────────────────────────────────────────────────────

const StatEntryPanel: React.FC<{ player: PlayerWithStats; onClose: () => void }> = ({ player, onClose }) => {
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const addStat = useAddPlayerStat();
  const deleteStat = useDeletePlayerStat();

  const handleAdd = async () => {
    if (goals === 0 && assists === 0) { toast.error("Enter at least 1 goal or assist"); return; }
    try {
      await addStat.mutateAsync({ player_id: player.id, goals, assists });
      toast.success("Stats logged!");
      setGoals(0);
      setAssists(0);
    } catch { toast.error("Failed to log stats"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteStat.mutateAsync(id); toast.success("Entry removed"); }
    catch { toast.error("Failed to remove entry"); }
  };

  const grouped = player.stat_entries.reduce<Record<string, typeof player.stat_entries>>((acc, entry) => {
    const label = new Date(entry.recorded_at).toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[label]) acc[label] = [];
    acc[label].push(entry);
    return acc;
  }, {});

  return (
    <div className="bg-card border-2 border-primary rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-heading font-bold text-foreground">{player.name}</p>
            <p className="text-xs text-muted-foreground">{player.position} · #{player.jersey_number}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      {/* Running totals */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-muted rounded-lg p-2">
          <p className="text-xl font-heading font-black text-primary">{player.goals_this_month}</p>
          <p className="text-xs text-muted-foreground">Mo. Goals</p>
        </div>
        <div className="bg-muted rounded-lg p-2">
          <p className="text-xl font-heading font-black text-primary">{player.assists_this_month}</p>
          <p className="text-xs text-muted-foreground">Mo. Assists</p>
        </div>
        <div className="bg-muted rounded-lg p-2">
          <p className="text-xl font-heading font-black text-foreground">{player.goals_total}</p>
          <p className="text-xs text-muted-foreground">Total Goals</p>
        </div>
        <div className="bg-muted rounded-lg p-2">
          <p className="text-xl font-heading font-black text-foreground">{player.assists_total}</p>
          <p className="text-xs text-muted-foreground">Total Assists</p>
        </div>
      </div>

      {/* Add entry */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Log New Entry (today)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Goals</Label>
            <Input type="number" min={0} value={goals} onChange={(e) => setGoals(Math.max(0, +e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Assists</Label>
            <Input type="number" min={0} value={assists} onChange={(e) => setAssists(Math.max(0, +e.target.value))} />
          </div>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={addStat.isPending}>
          <Target className="h-3 w-3 mr-1" />
          {addStat.isPending ? "Saving..." : "Save Entry"}
        </Button>
      </div>

      {/* History grouped by month */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">History</p>
          {Object.entries(grouped).map(([month, entries]) => {
            const mG = entries.reduce((s, e) => s + e.goals, 0);
            const mA = entries.reduce((s, e) => s + e.assists, 0);
            return (
              <div key={month}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-foreground">{month}</p>
                  <p className="text-xs text-muted-foreground">{mG}G · {mA}A this month</p>
                </div>
                <div className="space-y-1">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5 text-sm">
                      <span className="text-muted-foreground text-xs">
                        {new Date(entry.recorded_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="font-medium text-foreground">{entry.goals}G · {entry.assists}A</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Match Form ───────────────────────────────────────────────────────────────

const MatchForm: React.FC<{ match?: Match; onSave: (data: any) => void; onCancel: () => void }> = ({ match, onSave, onCancel }) => {
  const [form, setForm] = useState({
    date: match?.date || new Date().toISOString().split("T")[0],
    time: match?.time || "15:00",
    opponent: match?.opponent || "",
    team_score: match?.team_score ?? 0,
    opponent_score: match?.opponent_score ?? 0,
  });
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        <div><Label>Opponent</Label><Input value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Our Score</Label><Input type="number" value={form.team_score} onChange={(e) => setForm({ ...form, team_score: +e.target.value })} /></div>
          <div><Label>Opp Score</Label><Input type="number" value={form.opponent_score} onChange={(e) => setForm({ ...form, opponent_score: +e.target.value })} /></div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(form)}>{match ? "Update Match" : "Add Match"}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

// ─── Admin Page ───────────────────────────────────────────────────────────────

const AdminPage: React.FC = () => {
  const { t } = useI18n();
  const { data: players } = usePlayers();
  const { data: playersWithStats } = usePlayersWithStats();
  const { data: matches } = useMatches();
  const addPlayer = useAddPlayer();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const addMatch = useAddMatch();
  const updateMatch = useUpdateMatch();
  const deleteMatch = useDeleteMatch();
  const createSession = useCreateTrainingSession();

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [statPlayerId, setStatPlayerId] = useState<string | null>(null);
  const [trainingNames, setTrainingNames] = useState("");
  const [teamSize, setTeamSize] = useState(5);

  const handleSavePlayer = async (data: any) => {
    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({ id: editingPlayer.id, ...data });
        toast.success("Player updated!");
      } else {
        await addPlayer.mutateAsync(data);
        toast.success("Player added!");
      }
      setShowPlayerForm(false);
      setEditingPlayer(null);
    } catch { toast.error("Failed to save player"); }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    try { await deletePlayer.mutateAsync(id); toast.success("Player deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const handleSaveMatch = async (data: any) => {
    try {
      if (editingMatch) {
        await updateMatch.mutateAsync({ id: editingMatch.id, ...data });
        toast.success("Match updated!");
      } else {
        await addMatch.mutateAsync(data);
        toast.success("Match added!");
      }
      setShowMatchForm(false);
      setEditingMatch(null);
    } catch { toast.error("Failed to save match"); }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try { await deleteMatch.mutateAsync(id); toast.success("Match deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const handleShuffle = async () => {
    const names = trainingNames.split("\n").map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) { toast.error("Enter at least 2 players"); return; }
    try {
      await createSession.mutateAsync({ players: names, teamSize });
      toast.success("Teams shuffled!");
      setTrainingNames("");
    } catch { toast.error("Failed to create teams"); }
  };

  const activeStatPlayer = playersWithStats?.find((p) => p.id === statPlayerId) ?? null;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-foreground text-center mb-10">{t("admin.title")}</h1>

      <Tabs defaultValue="players" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="training">Shuffle</TabsTrigger>
        </TabsList>

        {/* ── Players ── */}
        <TabsContent value="players" className="space-y-4 mt-6">
          {!showPlayerForm && (
            <Button onClick={() => { setEditingPlayer(null); setShowPlayerForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Player
            </Button>
          )}
          {showPlayerForm && (
            <PlayerForm
              player={editingPlayer || undefined}
              onSave={handleSavePlayer}
              onCancel={() => { setShowPlayerForm(false); setEditingPlayer(null); }}
            />
          )}
          <div className="space-y-2">
            {players?.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-heading font-semibold text-foreground">#{p.jersey_number} {p.name}</span>
                  <span className="text-muted-foreground text-sm ml-2">{p.position} · {p.strong_foot === "L" ? "Left" : "Right"}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingPlayer(p); setShowPlayerForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
            <MatchForm
              match={editingMatch || undefined}
              onSave={handleSaveMatch}
              onCancel={() => { setShowMatchForm(false); setEditingMatch(null); }}
            />
          )}
          <div className="space-y-2">
            {matches?.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                <div>
                  <span className="font-heading font-semibold text-foreground">
                    Legit Boys FA {m.team_score} – {m.opponent_score} {m.opponent}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">{m.date}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingMatch(m); setShowMatchForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMatch(m.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
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
                  <tr
                    key={p.id}
                    className={`border-t border-border transition-colors ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} ${statPlayerId === p.id ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-foreground">{p.goals_this_month}</td>
                    <td className="px-4 py-3 text-center font-bold text-foreground">{p.assists_this_month}</td>
                    <td className="px-4 py-3 text-center font-heading font-black text-primary">{p.goals_total}</td>
                    <td className="px-4 py-3 text-center font-heading font-black text-primary">{p.assists_total}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant={statPlayerId === p.id ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setStatPlayerId(statPlayerId === p.id ? null : p.id)}
                      >
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
        <TabsContent value="training" className="space-y-4 mt-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <Label>Player Names (one per line)</Label>
              <textarea
                className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-ring"
                value={trainingNames}
                onChange={(e) => setTrainingNames(e.target.value)}
                placeholder={"Player 1\nPlayer 2\nPlayer 3\n..."}
              />
            </div>
            <div>
              <Label>Team Size</Label>
              <Select value={String(teamSize)} onValueChange={(v) => setTeamSize(+v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} players</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleShuffle} disabled={createSession.isPending}>
              <Shuffle className="h-4 w-4 mr-1" />
              {createSession.isPending ? "Shuffling..." : "Shuffle Teams"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;