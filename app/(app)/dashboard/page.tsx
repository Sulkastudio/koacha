import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, journalEntries } from "@/lib/db/schema";
import { desc, eq, and, gte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId));

  const activeGoals = userGoals.filter((g) => g.isActive);

  const entriesLast7 = await db
    .select({
      entryDate: journalEntries.entryDate,
      energyLevel: journalEntries.energyLevel,
    })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        gte(journalEntries.entryDate, sevenDaysAgoStr)
      )
    )
    .orderBy(journalEntries.entryDate);

  const daysWithEntry7 = new Set(entriesLast7.map((e) => String(e.entryDate)));
  const engagementPercent =
    daysWithEntry7.size > 0 ? Math.round((daysWithEntry7.size / 7) * 100) : 0;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const allRecentDates = await db
    .selectDistinct({ entryDate: journalEntries.entryDate })
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        gte(journalEntries.entryDate, oneYearAgo.toISOString().slice(0, 10))
      )
    );
  const allDaysWithEntry = new Set(
    allRecentDates.map((r) => String(r.entryDate))
  );

  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const d = checkDate.toISOString().slice(0, 10);
    if (allDaysWithEntry.has(d)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const energyByDay: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    energyByDay[d.toISOString().slice(0, 10)] = 0;
  }
  entriesLast7.forEach((e) => {
    const d = String(e.entryDate);
    if (energyByDay[d] !== undefined && e.energyLevel != null) {
      energyByDay[d] = e.energyLevel;
    }
  });

  const [lastEntry] = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
    .limit(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue, {session.user.name ?? "toi"}. Voici ta vue d&apos;ensemble.
        </p>
      </div>

      <DashboardClient
        streak={streak}
        goals={activeGoals.map((g) => ({
          id: g.id,
          title: g.title ?? "",
          category: g.category ?? undefined,
        }))}
        engagementPercent={engagementPercent}
        energyChartData={Object.entries(energyByDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, value]) => ({
            date: new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
            }),
            energy: value,
          }))}
        lastEntry={
          lastEntry
            ? {
                content: lastEntry.content,
                aiFeedback: lastEntry.aiFeedback,
                entryDate: String(lastEntry.entryDate),
              }
            : null
        }
      />
    </div>
  );
}
