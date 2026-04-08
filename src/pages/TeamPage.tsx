import React from "react";
import { useI18n } from "@/lib/i18n";
import { usePlayers } from "@/hooks/use-data";
import { motion } from "framer-motion";
import { User, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TeamPage: React.FC = () => {
  const { t } = useI18n();
  const { data: players, isLoading } = usePlayers();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-foreground text-center mb-10">
        {t("team.title")}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : !players?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t("empty.players")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* ── Photo / Fallback header ── */}
              <div className="relative h-48 w-full bg-pitch-gradient">
                {player.avatar_url ? (
                  <img
                    src={player.avatar_url}
                    alt={player.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-heading font-bold text-primary-foreground/80">
                      #{player.jersey_number}
                    </span>
                  </div>
                )}

                {/* Jersey number badge over the image */}
                {player.avatar_url && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    #{player.jersey_number}
                  </span>
                )}
              </div>

              {/* ── Info ── */}
              <div className="p-4">
                <h3 className="font-heading font-bold text-lg text-foreground leading-tight">
                  {player.name}
                </h3>
                <p className="text-primary text-sm font-medium mt-0.5">{player.position}</p>

                <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                  <span>Jersey #{player.jersey_number}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {player.strong_foot === "L" ? "Left" : "Right"}
                  </span>
                </div>

                {player.state && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{player.state}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;