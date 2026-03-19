import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ensureProfile } from "@/lib/ensure-profile";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }
  await ensureProfile(session.user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-lg">
          Koacha
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Tableau de bord
            </Button>
          </Link>
          <Link href="/journal">
            <Button variant="ghost" size="sm">
              Journal
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button variant="ghost" size="sm">
              Objectifs
            </Button>
          </Link>
          <SignOutButton />
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
