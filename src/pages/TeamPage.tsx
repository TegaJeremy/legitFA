import React from "react";
import { useI18n } from "@/lib/i18n";
import { usePlayers } from "@/hooks/use-data";
import { motion } from "framer-motion";
import { User, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Player } from "@/hooks/use-data";

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
const POSITION_LABELS: Record<string, string> = {
  Goalkeeper: "Goalkeepers",
  Defender: "Defenders",
  Midfielder: "Midfielders",
  Attacker: "Attackers",
};

function groupAndSort(players: Player[]): Record<string, Player[]> {
  const groups: Record<string, Player[]> = {};
  for (const pos of POSITION_ORDER) {
    const group = players
      .filter((p) => p.position === pos)
      .sort((a, b) => a.jersey_number - b.jersey_number);
    if (group.length > 0) groups[pos] = group;
  }
  return groups;
}

const PlayerCard: React.FC<{ player: Player; index: number }> = ({ player, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.4 }}
    className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    {/* Photo area */}
    <div className="relative bg-gradient-to-b from-blue-950 to-blue-900 overflow-hidden"
      style={{ height: "220px" }}>
      {player.avatar_url ? (
        <img
          src={player.avatar_url}
          alt={player.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <User className="h-20 w-20 text-blue-700/40" />
        </div>
      )}

      {/* Jersey number bottom right overlay */}
      <div className="absolute bottom-0 right-0 bg-red-600 text-white font-black text-3xl leading-none px-3 py-2"
        style={{ fontFamily: "Georgia, serif" }}>
        {player.jersey_number}
      </div>
    </div>

    {/* Info */}
    <div className="p-4 bg-card">
      <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">
        {player.position}
      </p>
      <h3 className="font-heading font-black text-foreground leading-tight text-lg">
        {player.name}
      </h3>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          {player.strong_foot === "L" ? "Left Foot" : "Right Foot"}
        </span>
        {player.state && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {player.state}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const TeamPage: React.FC = () => {
  const { t } = useI18n();
  const { data: players, isLoading } = usePlayers();

  const grouped = players ? groupAndSort(players) : {};

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-gradient-to-b from-blue-950 to-blue-900 py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
            Season 2024/25
          </p>
          <h1 className="text-5xl md:text-6xl font-heading font-black text-white mb-3">
            {t("team.title")}
          </h1>
          <p className="text-blue-300 text-sm">
            {players?.length ?? 0} registered players
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : !players?.length ? (
          <div className="text-center py-24 text-muted-foreground">
            <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">{t("empty.players")}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {POSITION_ORDER.filter((pos) => grouped[pos]?.length > 0).map((pos) => (
              <section key={pos}>
                {/* Position group header */}
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl md:text-3xl font-heading font-black text-foreground uppercase tracking-wide">
                    {POSITION_LABELS[pos]}
                  </h2>
                  <div className="flex-1 h-px bg-red-600/30" />
                  <span className="text-sm font-bold text-muted-foreground">
                    {grouped[pos].length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {grouped[pos].map((player, i) => (
                    <PlayerCard key={player.id} player={player} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;