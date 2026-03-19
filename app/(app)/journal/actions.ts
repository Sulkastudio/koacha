"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, journalEntries, profiles } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { getCoachFeedback } from "@/lib/coach";

export async function submitJournalEntry(content: string, energyLevel: number | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Non connecté");

  const userId = session.user.id;
  const today = new Date().toISOString().slice(0, 10);

  const [existing] = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        eq(journalEntries.entryDate, today)
      )
    )
    .limit(1);
  if (existing) {
    throw new Error("Tu as déjà une entrée pour aujourd'hui. Tu peux la modifier depuis le tableau de bord.");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  const userGoals = await db
    .select({ title: goals.title, description: goals.description, category: goals.category })
    .from(goals)
    .where(eq(goals.userId, userId));
  const lastSeven = await db
    .select({
      content: journalEntries.content,
      energyLevel: journalEntries.energyLevel,
      entryDate: journalEntries.entryDate,
    })
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.entryDate))
    .limit(7);

  const aiFeedback = await getCoachFeedback({
    goals: userGoals,
    pace: profile?.pace ?? null,
    lastEntries: lastSeven.map((r) => ({
      content: r.content,
      energyLevel: r.energyLevel,
      entryDate: String(r.entryDate),
    })),
    todayContent: content.trim(),
    todayEnergy: energyLevel,
  });

  await db.insert(journalEntries).values({
    userId,
    content: content.trim(),
    energyLevel: energyLevel ?? null,
    aiFeedback,
    entryDate: today,
  });

  return { aiFeedback };
}
