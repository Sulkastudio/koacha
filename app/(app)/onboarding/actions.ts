"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export type GoalInput = {
  title: string;
  description?: string;
  category: "health" | "work" | "learning" | "personal";
};

export type OnboardingInput = {
  pace: "gentle" | "regular" | "intensive";
  goals: GoalInput[];
};

export async function saveOnboarding(data: OnboardingInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Non connecté");

  const userId = session.user.id;
  const { pace, goals: goalsList } = data;

  if (!goalsList.length || goalsList.length > 5)
    throw new Error("Entre 1 et 5 objectifs.");
  const valid = goalsList.every((g) => g.title.trim());
  if (!valid) throw new Error("Chaque objectif doit avoir un titre.");

  await db.update(profiles).set({ pace }).where(eq(profiles.id, userId));

  await db.delete(goals).where(eq(goals.userId, userId));

  await db.insert(goals).values(
    goalsList.map((g) => ({
      userId,
      title: g.title.trim(),
      description: g.description?.trim() || null,
      category: g.category,
      isActive: true,
    }))
  );
}
