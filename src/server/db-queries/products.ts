import { db } from "@/drizzle/db";
import { ProductCustomizationTable, ProductsTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export function getProducts(userId: string, { limit }: { limit?: number }) {
  return db.query.ProductsTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    limit,
  });
}

export async function createProducts(data: typeof ProductsTable.$inferInsert) {
  // prettier-ignore
  const [newProd] = await db
    .insert(ProductsTable)
    .values(data)
    .returning({ id: ProductsTable.id });

  try {
    await db
      .insert(ProductCustomizationTable)
      .values({
        productId: newProd.id,
      })
      .onConflictDoNothing({ target: ProductCustomizationTable.productId });
  } catch (error: unknown) {
    console.error("[ERROR-CREATE-PRODUCTS]", error);
    await db.delete(ProductsTable).where(eq(ProductsTable.id, newProd.id));

    return {
      error: true,
      message: error instanceof Error ? error.message : "Something went wrong.",
      id: null,
    };
  }

  return newProd;
}

export async function deleteProducts({ id, userId }: { id: string; userId: string }) {
  try {
    // prettier-ignore
    const {rowCount} = await db
    .delete(ProductsTable)
    .where(and (eq(ProductsTable.id, id), eq(ProductsTable.clerkUserId, userId)))

    return rowCount > 0;
  } catch (error) {
    console.error("[ERROR-DELETE-PRODUCTS]", error);
    return false;
  }
}
