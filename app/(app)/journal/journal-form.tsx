"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitJournalEntry } from "./actions";

export function JournalForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [energy, setEnergy] = useState(5);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFeedback("");
    setLoading(true);
    try {
      const result = await submitJournalEntry(content.trim(), energy);
      setFeedback(result.aiFeedback);
      setContent("");
      setEnergy(5);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Qu&apos;est-ce que tu as accompli aujourd&apos;hui ?</CardTitle>
          <CardDescription>
            Écris librement. Ton coach te répondra avec un retour personnalisé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="content">Ton entrée</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Aujourd'hui j'ai..."
              rows={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Énergie / motivation du jour (1 à 10)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[energy]}
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  setEnergy(typeof v === "number" ? v : 5);
                }}
                min={1}
                max={10}
                step={1}
                className="flex-1 max-w-xs"
              />
              <span className="text-sm font-medium w-8">{energy}</span>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Envoi en cours…" : "Envoyer et recevoir le feedback"}
          </Button>
        </CardContent>
      </Card>

      {feedback && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Feedback de ton coach</CardTitle>
            <CardDescription>Réponse personnalisée selon tes objectifs et ton rythme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {feedback}
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
