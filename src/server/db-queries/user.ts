import { db } from "@/drizzle/db";
import { ProductsTable, UserSupscriptionTable } from "@/drizzle/schema";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";
import { eq } from "drizzle-orm";

export async function deleteUser(clerkId: string) {
  const [subscription, products] = await db.batch([
    db
      .delete(UserSupscriptionTable)
      .where(eq(UserSupscriptionTable.clerkUserId, clerkId))
      .returning({ id: UserSupscriptionTable.id }),
    db
      .delete(ProductsTable)
      .where(eq(ProductsTable.clerkUserId, clerkId))
      .returning({ id: ProductsTable.id }),
  ]);

  subscription.forEach((sub) => {
    revalidateDbCache({ id: sub.id, userId: clerkId, tag: CACHE_TAGS.SUBSCRIPTION });
  });

  products.forEach((prod) => {
    revalidateDbCache({ id: prod.id, userId: clerkId, tag: CACHE_TAGS.PRODUCTS });
  });

  return [subscription, products];
}
