import { db } from "@/drizzle/db";
import { ProductsTable, UserSupscriptionTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export function deleteUser(ClerkId: string) {
  return db.batch([
    db.delete(UserSupscriptionTable).where(eq(UserSupscriptionTable.clerkUserId, ClerkId)),
    db.delete(ProductsTable).where(eq(ProductsTable.clerkUserId, ClerkId)),
  ]);
}
