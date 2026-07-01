import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePlayersWithStats, useSeasons, useActiveSeason, useSeasonStats, mergeSeasonStats } from "@/hooks/use-data";
import { usePlayers } from "@/hooks/use-data";
import { motion } from "framer-motion";
import { TrendingUp, User, ChevronUp, ChevronDown, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AllTimeSortKey = "goals_total" | "assists_total" | "goals_this_month" | "assists_this_month";
type SeasonSortKey = "goals_season" | "assists_season";

const StatsPage: React.FC = () => {
  const { t } = useI18n();
  const { data: players, isLoading: playersLoading } = usePlayersWithStats();
  const { data: allPlayers } = usePlayers();
  const { data: seasons = [] } = useSeasons();
  const { data: activeSeason } = useActiveSeason();

  const [allTimeSortKey, setAllTimeSortKey] = useState<AllTimeSortKey>("goals_total");
  const [allTimeSortDir, setAllTimeSortDir] = useState<"desc" | "asc">("desc");
  const [seasonSortKey, setSeasonSortKey] = useState<SeasonSortKey>("goals_season");
  const [seasonSortDir, setSeasonSortDir] = useState<"desc" | "asc">("desc");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(undefined);

  const viewingSeasonId = selectedSeasonId ?? activeSeason?.id;
  const viewingSeason = seasons.find((s) => s.id === viewingSeasonId);

  const { data: seasonStats = [], isLoading: seasonLoading } = useSeasonStats(viewingSeasonId);
  const seasonPlayers = allPlayers && seasonStats ? mergeSeasonStats(allPlayers, seasonStats) : [];

  const handleAllTimeSort = (key: AllTimeSortKey) => {
    if (allTimeSortKey === key) setAllTimeSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setAllTimeSortKey(key); setAllTimeSortDir("desc"); }
  };

  const handleSeasonSort = (key: SeasonSortKey) => {
    if (seasonSortKey === key) setSeasonSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSeasonSortKey(key); setSeasonSortDir("desc"); }
  };

  const sortedAllTime = players
    ? [...players].sort((a, b) => {
        const diff = (b[allTimeSortKey] as number) - (a[allTimeSortKey] as number);
        return allTimeSortDir === "desc" ? diff : -diff;
      })
    : [];

  const sortedSeason = [...seasonPlayers].sort((a, b) => {
    const diff = (b[seasonSortKey] as number) - (a[seasonSortKey] as number);
    return seasonSortDir === "desc" ? diff : -diff;
  });

  const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => {
    if (!active) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return dir === "desc" ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronUp className="h-3 w-3 text-primary" />;
  };

  const RankBadge = ({ i }: { i: number }) => (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
      i === 0 ? "bg-yellow-400 text-yellow-900" :
      i === 1 ? "bg-gray-300 text-gray-700" :
      i === 2 ? "bg-amber-600 text-white" :
      "bg-muted text-muted-foreground"
    }`}>{i + 1}</span>
  );

  const PlayerCell = ({ player }: { player: { name: string; position: string; jersey_number: number; avatar_url: string | null } }) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
        {player.avatar_url
          ? <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
          : <User className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div>
        <p className="font-heading font-semibold text-foreground leading-tight">{player.name}</p>
        <p className="text-xs text-muted-foreground">{player.position} · #{player.jersey_number}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-foreground text-center mb-2">
        {t("stats.title")}
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-8">
        Click any column header to sort
      </p>

      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="season">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="season">
              <Trophy className="h-4 w-4 mr-2" /> Season
            </TabsTrigger>
            <TabsTrigger value="alltime">
              <TrendingUp className="h-4 w-4 mr-2" /> All Time
            </TabsTrigger>
          </TabsList>

          {/* ── Season Tab ── */}
          <TabsContent value="season">
            {seasons.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No seasons yet</p>
                <p className="text-sm mt-1">An admin can create a season from the admin dashboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Season selector */}
                <div className="flex items-center gap-3">
                  <Select
                    value={viewingSeasonId ?? ""}
                    onValueChange={(v) => setSelectedSeasonId(v)}
                  >
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
                  {viewingSeason && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      viewingSeason.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {viewingSeason.status === "active" ? "Active" : "Closed"}
                    </span>
                  )}
                </div>

                {seasonLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-x-auto rounded-xl border border-border shadow-sm"
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted text-muted-foreground text-left border-b border-border">
                          <th className="px-4 py-3 font-semibold w-8 text-center">#</th>
                          <th className="px-4 py-3 font-semibold">Player</th>
                          <th
                            className="px-4 py-3 font-semibold text-center cursor-pointer hover:text-foreground"
                            onClick={() => handleSeasonSort("goals_season")}
                          >
                            <span className="inline-flex items-center gap-1 justify-center">
                              Goals <SortIcon active={seasonSortKey === "goals_season"} dir={seasonSortDir} />
                            </span>
                          </th>
                          <th
                            className="px-4 py-3 font-semibold text-center cursor-pointer hover:text-foreground"
                            onClick={() => handleSeasonSort("assists_season")}
                          >
                            <span className="inline-flex items-center gap-1 justify-center">
                              Assists <SortIcon active={seasonSortKey === "assists_season"} dir={seasonSortDir} />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedSeason.map((player, i) => (
                          <motion.tr
                            key={player.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.025 }}
                            className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} hover:bg-muted/40`}
                          >
                            <td className="px-4 py-3 text-center"><RankBadge i={i} /></td>
                            <td className="px-4 py-3"><PlayerCell player={player} /></td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-heading font-black text-lg ${player.goals_season > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                {player.goals_season}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-heading font-black text-lg ${player.assists_season > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                {player.assists_season}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── All Time Tab ── */}
          <TabsContent value="alltime">
            {playersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : !sortedAllTime.length ? (
              <div className="text-center py-20 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t("empty.players")}</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto rounded-xl border border-border shadow-sm"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-left">
                      <th className="px-4 py-3 font-semibold w-8 text-center">#</th>
                      <th className="px-4 py-3 font-semibold">Player</th>
                      <th
                        colSpan={2}
                        className="px-4 py-2 text-center text-xs font-semibold text-primary border-b border-primary/30"
                      >
                        This Month
                      </th>
                      <th
                        colSpan={2}
                        className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground border-b border-border"
                      >
                        All Time
                      </th>
                    </tr>
                    <tr className="bg-muted/60 text-muted-foreground border-b border-border">
                      <th /><th className="px-4 py-2 font-medium text-left">Name · Position</th>
                      <th
                        className="px-4 py-3 text-center cursor-pointer hover:text-foreground"
                        onClick={() => handleAllTimeSort("goals_this_month")}
                      >
                        <span className="inline-flex items-center gap-1 justify-center">
                          Goals <SortIcon active={allTimeSortKey === "goals_this_month"} dir={allTimeSortDir} />
                        </span>
                      </th>
                      <th
                        className="px-4 py-3 text-center cursor-pointer hover:text-foreground"
                        onClick={() => handleAllTimeSort("assists_this_month")}
                      >
                        <span className="inline-flex items-center gap-1 justify-center">
                          Assists <SortIcon active={allTimeSortKey === "assists_this_month"} dir={allTimeSortDir} />
                        </span>
                      </th>
                      <th
                        className="px-4 py-3 text-center cursor-pointer hover:text-foreground"
                        onClick={() => handleAllTimeSort("goals_total")}
                      >
                        <span className="inline-flex items-center gap-1 justify-center">
                          Goals <SortIcon active={allTimeSortKey === "goals_total"} dir={allTimeSortDir} />
                        </span>
                      </th>
                      <th
                        className="px-4 py-3 text-center cursor-pointer hover:text-foreground"
                        onClick={() => handleAllTimeSort("assists_total")}
                      >
                        <span className="inline-flex items-center gap-1 justify-center">
                          Assists <SortIcon active={allTimeSortKey === "assists_total"} dir={allTimeSortDir} />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAllTime.map((player, i) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} hover:bg-muted/40`}
                      >
                        <td className="px-4 py-3 text-center"><RankBadge i={i} /></td>
                        <td className="px-4 py-3"><PlayerCell player={player} /></td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-heading font-bold text-base ${player.goals_this_month > 0 ? "text-primary" : "text-muted-foreground"}`}>
                            {player.goals_this_month}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-heading font-bold text-base ${player.assists_this_month > 0 ? "text-primary" : "text-muted-foreground"}`}>
                            {player.assists_this_month}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-heading font-black text-lg text-foreground">{player.goals_total}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-heading font-black text-lg text-foreground">{player.assists_total}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StatsPage;