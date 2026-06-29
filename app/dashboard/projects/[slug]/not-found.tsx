import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Projet introuvable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Le projet demandé n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link href="/dashboard/projects">Retour aux projets</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
