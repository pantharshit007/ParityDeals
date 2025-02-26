import { db } from "@/drizzle/db";
import { UserSupscriptionTable } from "@/drizzle/schema";

type DataProps = typeof UserSupscriptionTable.$inferInsert;

export function createSubscription(data: DataProps) {
  return db.insert(UserSupscriptionTable).values(data).onConflictDoNothing({
    target: UserSupscriptionTable.clerkUserId,
  });
}
