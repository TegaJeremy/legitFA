import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePlayersWithStats } from "@/hooks/use-data";
import { motion } from "framer-motion";
import { TrendingUp, User, ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SortKey = "goals_this_month" | "assists_this_month" | "goals_total" | "assists_total";

const MONTH = new Date().toLocaleString("default", { month: "long", year: "numeric" });

const StatsPage: React.FC = () => {
  const { t } = useI18n();
  const { data: players, isLoading } = usePlayersWithStats();
  const [sortKey, setSortKey] = useState<SortKey>("goals_total");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = players
    ? [...players].sort((a, b) => {
        const diff = (b[sortKey] as number) - (a[sortKey] as number);
        return sortDir === "desc" ? diff : -diff;
      })
    : [];

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === "desc"
      ? <ChevronDown className="h-3 w-3 text-primary" />
      : <ChevronUp className="h-3 w-3 text-primary" />;
  };

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="px-4 py-3 font-semibold text-center cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-1 justify-center">
        {label}
        <SortIcon col={col} />
      </span>
    </th>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-foreground text-center mb-2">
        {t("stats.title")}
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-8">
        Click any column header to sort · Monthly stats reset each month
      </p>

      {isLoading ? (
        <div className="space-y-3 max-w-3xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : !sorted.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t("empty.players")}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto overflow-x-auto rounded-xl border border-border shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-left">
                <th className="px-4 py-3 font-semibold w-8 text-center">#</th>
                <th className="px-4 py-3 font-semibold">Player</th>
                {/* Monthly columns */}
                <th
                  colSpan={2}
                  className="px-4 py-2 text-center text-xs font-semibold text-primary border-b border-primary/30"
                >
                  {MONTH}
                </th>
                {/* Total columns */}
                <th
                  colSpan={2}
                  className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground border-b border-border"
                >
                  All Time
                </th>
              </tr>
              <tr className="bg-muted/60 text-muted-foreground border-b border-border">
                <th />
                <th className="px-4 py-2 font-medium text-left">Name · Position</th>
                <Th col="goals_this_month" label="Goals" />
                <Th col="assists_this_month" label="Assists" />
                <Th col="goals_total" label="Goals" />
                <Th col="assists_total" label="Assists" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, i) => (
                <motion.tr
                  key={player.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className={`border-t border-border transition-colors ${i % 2 === 0 ? "bg-card" : "bg-muted/20"} hover:bg-muted/40`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      i === 0 ? "bg-yellow-400 text-yellow-900" :
                      i === 1 ? "bg-gray-300 text-gray-700" :
                      i === 2 ? "bg-amber-600 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                  </td>

                  {/* Player */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-foreground leading-tight">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.position} · #{player.jersey_number}</p>
                      </div>
                    </div>
                  </td>

                  {/* Monthly */}
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

                  {/* All-time */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-heading font-black text-lg text-foreground">
                      {player.goals_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-heading font-black text-lg text-foreground">
                      {player.assists_total}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default StatsPage;