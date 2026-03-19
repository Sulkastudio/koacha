"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveOnboarding } from "./actions";
import type { GoalInput } from "./actions";

const MAX_GOALS = 5;

type Props = {
  defaultPace: "gentle" | "regular" | "intensive";
  defaultGoals: Array<{
    title: string;
    description?: string;
    category: GoalInput["category"];
  }>;
  paceOptions: ReadonlyArray<{ value: string; label: string }>;
  categoryOptions: ReadonlyArray<{ value: string; label: string }>;
};

export function OnboardingForm({
  defaultPace,
  defaultGoals,
  paceOptions,
  categoryOptions,
}: Props) {
  const router = useRouter();
  const [pace, setPace] = useState(defaultPace);
  const [goals, setGoals] = useState<
    Array<{ title: string; description: string; category: GoalInput["category"] }>
  >(
    defaultGoals.length
      ? defaultGoals.map((g) => ({
          title: g.title,
          description: g.description ?? "",
          category: g.category,
        }))
      : [{ title: "", description: "", category: "personal" as const }]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addGoal() {
    if (goals.length >= MAX_GOALS) return;
    setGoals((prev) => [...prev, { title: "", description: "", category: "personal" }]);
  }

  function removeGoal(i: number) {
    if (goals.length <= 1) return;
    setGoals((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateGoal(
    i: number,
    field: "title" | "description" | "category",
    value: string
  ) {
    setGoals((prev) =>
      prev.map((g, idx) =>
        idx === i ? { ...g, [field]: value } : g
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const toSave = goals
      .map((g) => ({
        title: g.title,
        description: g.description || undefined,
        category: g.category as GoalInput["category"],
      }))
      .filter((g) => g.title.trim());
    if (toSave.length === 0) {
      setError("Ajoute au moins un objectif avec un titre.");
      setLoading(false);
      return;
    }
    try {
      await saveOnboarding({ pace, goals: toSave });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rythme global</CardTitle>
          <CardDescription>
            Comment veux-tu avancer au quotidien ?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={pace} onValueChange={(v) => setPace(v as typeof pace)}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectifs (1 à 5)</CardTitle>
          <CardDescription>
            Titre requis, description optionnelle. Choisis une catégorie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {goals.map((goal, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Objectif {i + 1}</span>
                {goals.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(i)}
                  >
                    Retirer
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={goal.title}
                  onChange={(e) => updateGoal(i, "title", e.target.value)}
                  placeholder="Ex: Faire 3 séances de sport par semaine"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={goal.description}
                  onChange={(e) => updateGoal(i, "description", e.target.value)}
                  placeholder="Détails si besoin"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={goal.category}
                  onValueChange={(v) =>
                    updateGoal(i, "category", v as GoalInput["category"])
                  }
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          {goals.length < MAX_GOALS && (
            <Button type="button" variant="outline" onClick={addGoal}>
              Ajouter un objectif
            </Button>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Enregistrement…" : "Enregistrer et continuer"}
      </Button>
    </form>
  );
}
