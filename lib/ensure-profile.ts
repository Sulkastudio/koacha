import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function ensureProfile(userId: string): Promise<void> {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (!existing) {
    await db.insert(profiles).values({ id: userId });
  }
}
