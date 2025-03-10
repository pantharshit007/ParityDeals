import { subscriptionTiers } from "@/data/subscriptionTiers";
import { db } from "@/drizzle/db";
import { UserSupscriptionTable } from "@/drizzle/schema";
import { CACHE_TAGS, dbCache, getUserTag, revalidateDbCache } from "@/lib/cache";
import { eq, SQL } from "drizzle-orm";

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

export function getUserSubscription(userId: string) {
  const cacheFn = dbCache({
    cb: getUserSubscriptionInternal,
    tags: [getUserTag(userId, CACHE_TAGS.SUBSCRIPTION)],
  });

  return cacheFn(userId);
}

async function getUserSubscriptionInternal(userId: string) {
  const data = await db.query.UserSupscriptionTable.findFirst({
    where: eq(UserSupscriptionTable.clerkUserId, userId),
  });

  return data;
}

export async function getUserSubscriptionTier(userId: string) {
  const cacheFn = dbCache({
    cb: getUserSubscriptionTierInternal,
    tags: [getUserTag(userId, CACHE_TAGS.SUBSCRIPTION)],
  });
  return cacheFn(userId);
}

async function getUserSubscriptionTierInternal(userId: string) {
  try {
    const sub = await getUserSubscription(userId);
    if (!sub) throw new Error("No subscription found");

    return subscriptionTiers[sub.tier];
  } catch (error) {
    console.error("[ERROR-GET-USER-SUBSCRIPTION-TIER]", error);
    return subscriptionTiers["Free"];
  }
}

export async function updateUserSubscription(
  where: SQL,
  data: Partial<typeof UserSupscriptionTable.$inferInsert>
) {
  try {
    const [updatedSub] = await db
      .update(UserSupscriptionTable)
      .set(data)
      .where(where)
      .returning({ id: UserSupscriptionTable.id, userId: UserSupscriptionTable.clerkUserId });

    if (updatedSub != null) {
      revalidateDbCache({
        id: updatedSub.id,
        userId: updatedSub.userId,
        tag: CACHE_TAGS.SUBSCRIPTION,
      });
    }
  } catch (error) {
    console.error("[ERROR-UPDATE-USER-SUBSCRIPTION]", error);
    return;
  }
}
