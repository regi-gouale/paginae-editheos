import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectStats {
  todo: number;
  inProgress: number;
  blocked: number;
  dueSoon: number;
}

interface ProjectGlobalProgressBarProps {
  stats: ProjectStats;
  completionRate: number;
}

export function ProjectGlobalProgressBar({
  stats,
  completionRate,
}: ProjectGlobalProgressBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Avancement des projets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
            <div className="text-muted-foreground">À faire</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.inProgress}
            </div>
            <div className="text-muted-foreground">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.blocked}
            </div>
            <div className="text-muted-foreground">Bloqués</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
