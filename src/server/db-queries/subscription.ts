import { db } from "@/drizzle/db";
import { UserSupscriptionTable } from "@/drizzle/schema";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";

type DataProps = typeof UserSupscriptionTable.$inferInsert;

export async function createSubscription(data: DataProps) {
  const [newSub] = await db
    .insert(UserSupscriptionTable)
    .values(data)
    .onConflictDoNothing({
      target: UserSupscriptionTable.clerkUserId,
    })
    .returning({ id: UserSupscriptionTable.id, userId: UserSupscriptionTable.clerkUserId });

  // revalidate cache: subscription
  if (newSub.id) {
    revalidateDbCache({ id: newSub.id, userId: newSub.userId, tag: CACHE_TAGS.SUBSCRIPTION });
  }
  return newSub;
}
