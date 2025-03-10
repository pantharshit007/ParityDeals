import { db } from "@/drizzle/db";
import { ProductsTable, ProductViewTable } from "@/drizzle/schema";
import { CACHE_TAGS, dbCache, getUserTag } from "@/lib/cache";
import { and, count, eq, gte } from "drizzle-orm";

export async function getProductViewCount(userId: string, date: Date) {
  const cacheFn = dbCache({
    cb: getProductViewCountInternal,
    tags: [getUserTag(userId, CACHE_TAGS.PRODUCT_VIEWS)],
  });
  return cacheFn(userId, date);
}

async function getProductViewCountInternal(userId: string, startDate: Date) {
  try {
    const counts = await db
      .select({ productViewCount: count() })
      .from(ProductViewTable)
      .innerJoin(ProductsTable, eq(ProductsTable.id, ProductViewTable.productId))
      .where(
        and(eq(ProductsTable.clerkUserId, userId), gte(ProductViewTable.visitedAt, startDate))
      );

    return counts[0]?.productViewCount ?? 0;
  } catch (error) {
    console.error("[ERROR-GET-PRODUCT-VIEW-COUNT]", error);
    return 0;
  }
}
