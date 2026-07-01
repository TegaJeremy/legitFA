import React, { useState, useEffect, useRef } from "react";
import { Trophy, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCurrentAdmin } from "@/hooks/use-auth";
import {
  useActiveLiveSession,
  useLiveSessionTeams,
  useLiveSessionMatches,
  useCreateLiveSession,
  useRecordResult,
  useClearLiveSession,
  type LiveSessionState,
} from "@/hooks/use-live-session";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

const SetupView: React.FC<{
  onCreate: (numTeams: number, matchDuration: number) => void;
  loading: boolean;
}> = ({ onCreate, loading }) => {
  const [numTeams, setNumTeams] = useState("");
  const [duration, setDuration] = useState("10");
  const n = parseInt(numTeams);
  const d = parseInt(duration) || 10;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-center">
        <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-heading font-bold text-foreground">Live Session</h1>
        <p className="text-muted-foreground mt-1">King-of-the-pitch · 3pts win · 1pt draw</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Number of Teams</label>
          <Input
            type="number"
            min={2}
            max={20}
            placeholder="e.g. 6"
            value={numTeams}
            onChange={(e) => setNumTeams(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">How many teams are playing today?</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Match Duration (minutes)</label>
          <Input
            type="number"
            min={1}
            max={60}
            placeholder="10"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">Standard is 10 — adjust if needed.</p>
        </div>

        <Button
          className="w-full"
          onClick={() => onCreate(n, d)}
          disabled={!numTeams || n < 2 || loading}
        >
          <Play className="h-4 w-4 mr-2" />
          {loading ? "Starting…" : "Start Session"}
        </Button>
      </div>
    </div>
  );
};

// ─── Timer ────────────────────────────────────────────────────────────────────

const MatchTimer: React.FC<{
  resetKey: number;
  durationSeconds: number;
  onTimeUp: () => void;
}> = ({ resetKey, durationSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (ref.current) clearInterval(ref.current);
    setRunning(false);
    setTimeLeft(durationSeconds);
  }, [resetKey, durationSeconds]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(ref.current!);
          setRunning(false);
          onTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const pct = ((durationSeconds - timeLeft) / durationSeconds) * 100;
  const warn = timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Match Timer</p>
      <div className={`text-5xl font-mono font-bold ${warn ? "text-destructive" : "text-foreground"}`}>
        {formatTime(timeLeft)}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${warn ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant={running ? "outline" : "default"}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : timeLeft === durationSeconds ? "Start Timer" : "Resume"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (ref.current) clearInterval(ref.current);
            setRunning(false);
            setTimeLeft(durationSeconds);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

// ─── Active session ───────────────────────────────────────────────────────────

const ActiveSession: React.FC<{ state: LiveSessionState }> = ({ state }) => {
  const { data: teams = [], isLoading } = useLiveSessionTeams(state.session_id);
  const { data: matches = [] } = useLiveSessionMatches(state.session_id);
  const recordResult = useRecordResult();
  const clearSession = useClearLiveSession();
  const { isAdmin } = useCurrentAdmin();
  const [timeUpBanner, setTimeUpBanner] = useState(false);

  const { queue } = state;
  const teamA = queue[0];
  const teamB = queue[1];
  const durationSeconds = state.match_duration * 60;

  const handleResult = (result: "a" | "b" | "draw") => {
    recordResult.mutate({ state, result });
    setTimeUpBanner(false);
  };

  const sortedTeams = [...teams].sort(
    (a, b) => b.points - a.points || b.gf - a.gf || a.ga - b.ga
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Live Session</h1>
          <p className="text-xs text-muted-foreground">
            {state.match_duration} min matches · {state.num_teams} teams
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm("End this session? All data will be cleared.")) {
                clearSession.mutate();
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> End Session
          </Button>
        )}
      </div>

      {/* Current match card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now Playing</p>

        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <div className="text-4xl font-heading font-bold text-primary">Team {teamA}</div>
          </div>
          <div className="text-xl font-bold text-muted-foreground">vs</div>
          <div className="flex-1 text-center">
            <div className="text-4xl font-heading font-bold text-primary">Team {teamB}</div>
          </div>
        </div>

        {timeUpBanner && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2.5 text-center text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            ⏱ Time's up — record the result below
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:text-green-400"
            onClick={() => handleResult("a")}
            disabled={recordResult.isPending}
          >
            Team {teamA} ⚽
          </Button>
          <Button
            variant="outline"
            onClick={() => handleResult("draw")}
            disabled={recordResult.isPending}
          >
            Draw
          </Button>
          <Button
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:text-green-400"
            onClick={() => handleResult("b")}
            disabled={recordResult.isPending}
          >
            ⚽ Team {teamB}
          </Button>
        </div>
      </div>

      {/* Timer */}
      <MatchTimer
        resetKey={matches.length}
        durationSeconds={durationSeconds}
        onTimeUp={() => setTimeUpBanner(true)}
      />

      {/* Queue */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Queue</p>
        <div className="flex flex-wrap gap-2">
          {queue.map((tn, i) => (
            <Badge key={tn} variant={i < 2 ? "default" : "outline"}>
              Team {tn}{i === 0 ? " 🟢" : i === 1 ? " 🔵" : ""}
            </Badge>
          ))}
        </div>
      </div>

      {/* League table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Standings</span>
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Loading…</div>
        ) : (
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
                    <tr
                      key={team.id}
                      className={`border-b border-border last:border-0 ${playing ? "bg-primary/5" : ""}`}
                    >
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
        )}
      </div>

      {/* Match history */}
      {matches.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Match History</p>
          <div className="space-y-1">
            {matches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
              >
                <span className={m.result === "a" ? "font-bold text-foreground" : "text-muted-foreground"}>
                  Team {m.team_a}
                </span>
                <Badge variant={m.result === "draw" ? "secondary" : "outline"} className="mx-2 text-xs">
                  {m.result === "draw" ? "0 – 0" : m.result === "a" ? "1 – 0" : "0 – 1"}
                </Badge>
                <span className={m.result === "b" ? "font-bold text-foreground" : "text-muted-foreground"}>
                  Team {m.team_b}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const LiveSessionPage: React.FC = () => {
  const { data: session, isLoading } = useActiveLiveSession();
  const createSession = useCreateLiveSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <SetupView
        onCreate={(n, d) => createSession.mutate({ numTeams: n, matchDuration: d })}
        loading={createSession.isPending}
      />
    );
  }

  return <ActiveSession state={session} />;
};

export default LiveSessionPage;