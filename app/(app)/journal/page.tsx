import { JournalForm } from "./journal-form";

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Journal du jour</h1>
        <p className="text-muted-foreground mt-1">
          Raconte ce que tu as accompli aujourd&apos;hui et reçois un feedback de ton coach IA.
        </p>
      </div>
      <JournalForm />
    </div>
  );
}
