import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { GoalInput } from "./actions";
import { OnboardingForm } from "./onboarding-form";

const PACE_OPTIONS = [
  { value: "gentle", label: "Progressif et doux" },
  { value: "regular", label: "Régulier et constant" },
  { value: "intensive", label: "Intensif et rapide" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "health", label: "Santé" },
  { value: "work", label: "Travail" },
  { value: "learning", label: "Apprentissage" },
  { value: "personal", label: "Perso" },
] as const;

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  const existingGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tes objectifs</h1>
        <p className="text-muted-foreground mt-1">
          Configure 1 à 5 objectifs pour personnaliser ton coaching. Tu pourras les modifier plus tard.
        </p>
      </div>
      <OnboardingForm
        defaultPace={(profile?.pace as "gentle" | "regular" | "intensive") ?? "regular"}
        defaultGoals={
          existingGoals.length > 0
            ? existingGoals.map((g) => ({
                title: g.title ?? "",
                description: g.description ?? "",
                category: (g.category ?? "personal") as GoalInput["category"],
              }))
            : [{ title: "", description: "", category: "personal" as const }]
        }
        paceOptions={PACE_OPTIONS}
        categoryOptions={CATEGORY_OPTIONS}
      />
    </div>
  );
}
