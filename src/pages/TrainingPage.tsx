import React from "react";
import { useI18n } from "@/lib/i18n";
import { useTrainingTeams } from "@/hooks/use-data";
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const TrainingPage: React.FC = () => {
  const { t } = useI18n();
  const { data: teams, isLoading } = useTrainingTeams();

  const grouped = teams?.reduce<Record<number, { players: string[]; expiresAt: string }>>((acc, t) => {
    if (!acc[t.team_number]) acc[t.team_number] = { players: [], expiresAt: t.expires_at };
    acc[t.team_number].players.push(t.player_name);
    return acc;
  }, {});

  const teamNumbers = grouped ? Object.keys(grouped).map(Number).sort((a, b) => a - b) : [];
  const teamColors = ["bg-primary", "bg-secondary", "bg-pitch-light", "bg-gold-dark", "bg-destructive"];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-foreground text-center mb-10">{t("training.title")}</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : !teamNumbers.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No active training session</p>
        </div>
      ) : (
        <>
          {grouped && teamNumbers.length > 0 && (
            <div className="text-center mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires {formatDistanceToNow(new Date(grouped[teamNumbers[0]].expiresAt), { addSuffix: true })}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamNumbers.map((num, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className={`${teamColors[i % teamColors.length]} px-5 py-3`}>
                  <h3 className="font-heading font-bold text-primary-foreground">Team {num}</h3>
                  <p className="text-primary-foreground/70 text-xs">{grouped![num].players.length} players</p>
                </div>
                <ul className="p-5 space-y-2">
                  {grouped![num].players.map((name) => (
                    <li key={name} className="flex items-center gap-2 text-foreground text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {name}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TrainingPage;
