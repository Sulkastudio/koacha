import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
        <h1 className="text-3xl font-bold">Koacha</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Ton coach personnel IA. Fixe tes objectifs, tiens ton journal, reçois un feedback bienveillant.
        </p>
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button>Se connecter</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline">S&apos;inscrire</Button>
          </Link>
        </div>
      </div>
    );
  }
  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, session.user.id));
  if (userGoals.length === 0) {
    redirect("/onboarding");
  }
  redirect("/dashboard");
}
