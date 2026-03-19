import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Tu es un coach bienveillant, motivant et honnête. Tu connais parfaitement les objectifs de l'utilisateur. Analyse son entrée du jour, dis-lui s'il est on track, encourage-le sans être condescendant, identifie des patterns si tu en vois, et termine par 1 action concrète pour demain. Sois concis (200 mots max), chaleureux et direct.`;

function buildSystemContext(opts: {
  goals: Array<{ title: string; description: string | null; category: string | null }>;
  pace: string | null;
  lastEntries: Array<{ content: string; energyLevel: number | null; entryDate: string }>;
  todayLabel: string;
  dayOfWeek: string;
}): string {
  const { goals, pace, lastEntries, todayLabel, dayOfWeek } = opts;
  const paceLabel =
    pace === "gentle"
      ? "Progressif et doux"
      : pace === "intensive"
        ? "Intensif et rapide"
        : "Régulier et constant";

  let context = `Date du jour: ${todayLabel} (${dayOfWeek}). Rythme souhaité par l'utilisateur: ${paceLabel}.\n\n`;
  context += `Objectifs de l'utilisateur:\n`;
  goals.forEach((g) => {
    context += `- ${g.title}`;
    if (g.description) context += ` — ${g.description}`;
    if (g.category) context += ` [${g.category}]`;
    context += "\n";
  });
  if (lastEntries.length > 0) {
    context += `\nLes 7 dernières entrées de journal (pour continuité):\n`;
    lastEntries.forEach((e) => {
      context += `[${e.entryDate}] Énergie: ${e.energyLevel ?? "—"}/10. Contenu: ${e.content}\n`;
    });
  }
  return context;
}

export async function getCoachFeedback(opts: {
  goals: Array<{ title: string; description: string | null; category: string | null }>;
  pace: string | null;
  lastEntries: Array<{ content: string; energyLevel: number | null; entryDate: string }>;
  todayContent: string;
  todayEnergy: number | null;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquant");

  const now = new Date();
  const todayLabel = now.toISOString().slice(0, 10);
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const dayOfWeek = dayNames[now.getDay()];

  const systemContext = buildSystemContext({
    goals: opts.goals,
    pace: opts.pace,
    lastEntries: opts.lastEntries,
    todayLabel,
    dayOfWeek,
  });

  const userMessage = `Entrée du jour (énergie ${opts.todayEnergy ?? "non indiquée"}/10):\n\n${opts.todayContent}`;

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\n---\nContexte:\n${systemContext}`,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return "Pas de réponse générée.";
  return textBlock.text;
}
