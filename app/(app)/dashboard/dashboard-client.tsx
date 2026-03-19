"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Goal = { id: string; title: string; category?: string };

type Props = {
  streak: number;
  goals: Goal[];
  engagementPercent: number;
  energyChartData: Array<{ date: string; energy: number }>;
  lastEntry: {
    content: string;
    aiFeedback: string | null;
    entryDate: string;
  } | null;
};

export function DashboardClient({
  streak,
  goals,
  engagementPercent,
  energyChartData,
  lastEntry,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Streak</CardTitle>
          <CardDescription>
            Jours consécutifs avec une entrée de journal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold tabular-nums">{streak}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {streak === 0
              ? "Écris une entrée aujourd'hui pour commencer."
              : streak === 1
                ? "Un jour d'affilée. Continue !"
                : `${streak} jours d'affilée. Bravo !`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectifs actifs</CardTitle>
          <CardDescription>
            Engagement sur les 7 derniers jours (entrées journal)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun objectif.{" "}
              <Link href="/onboarding">
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Configurer tes objectifs
                </Button>
              </Link>
            </p>
          ) : (
            goals.map((g) => (
              <div key={g.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{g.title}</span>
                  {g.category && (
                    <span className="text-muted-foreground capitalize">
                      {g.category}
                    </span>
                  )}
                </div>
                <Progress value={engagementPercent} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Énergie de la semaine</CardTitle>
          <CardDescription>
            Niveau d&apos;énergie / motivation (1–10) sur les 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={energyChartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Dernière entrée</CardTitle>
          <CardDescription>
            Aperçu de ton dernier journal et du feedback coach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastEntry ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(lastEntry.entryDate + "T12:00:00").toLocaleDateString(
                    "fr-FR",
                    { dateStyle: "long" }
                  )}
                </p>
                <p className="text-sm whitespace-pre-wrap">{lastEntry.content}</p>
              </div>
              {lastEntry.aiFeedback && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Feedback coach
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {lastEntry.aiFeedback}
                  </p>
                </div>
              )}
              <Link href="/journal">
                <Button variant="outline" size="sm">
                  Écrire une nouvelle entrée
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune entrée pour l&apos;instant.{" "}
              <Link href="/journal">
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Commencer ton journal
                </Button>
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
