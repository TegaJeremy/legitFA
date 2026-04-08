import React from "react";
import { useI18n } from "@/lib/i18n";
import { useMatches } from "@/hooks/use-data";
import { motion } from "framer-motion";
import { Calendar, Clock, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const MatchesPage: React.FC = () => {
  const { t } = useI18n();
  const { data: matches, isLoading } = useMatches();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-foreground text-center mb-10">{t("matches.title")}</h1>
      {isLoading ? (
        <div className="space-y-4 max-w-2xl mx-auto">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !matches?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">{t("empty.matches")}</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {matches.map((match, i) => {
            const won = match.team_score > match.opponent_score;
            const drew = match.team_score === match.opponent_score;
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-xl border p-5 ${won ? "border-primary/30" : drew ? "border-border" : "border-destructive/30"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(match.date), "MMM d, yyyy")}</span>
                    {match.time && (
                      <>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{match.time}</span>
                      </>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${won ? "bg-primary/10 text-primary" : drew ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>
                    {won ? "W" : drew ? "D" : "L"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="font-heading font-bold text-foreground text-right flex-1">Legit Boys FA</span>
                  <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-muted">
                    <span className="font-heading font-black text-2xl text-foreground">{match.team_score}</span>
                    <span className="text-muted-foreground font-bold">-</span>
                    <span className="font-heading font-black text-2xl text-foreground">{match.opponent_score}</span>
                  </div>
                  <span className="font-heading font-bold text-foreground text-left flex-1">{match.opponent}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
