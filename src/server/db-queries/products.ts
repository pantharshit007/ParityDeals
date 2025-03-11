import { insertType } from "@/data/types/type";
import { db } from "@/drizzle/db";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import {
  CountryGroupDiscountTable,
  ProductCustomizationTable,
  ProductsTable,
} from "@/drizzle/schema";
import {
  CACHE_TAGS,
  dbCache,
  getGlobalTag,
  getIdTag,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { BatchItem } from "drizzle-orm/batch";
import { removeTrailingSlash } from "@/lib/utils";

export function getProducts(userId: string, limit?: number) {
  const cacheFn = dbCache({
    cb: getProductsInternal,
    tags: [getUserTag(userId, CACHE_TAGS.PRODUCTS)],
  });
  return cacheFn(userId, { limit });
}

function getProductsInternal(userId: string, { limit }: { limit?: number }) {
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
    .returning({ id: ProductsTable.id, userId: ProductsTable.clerkUserId });

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

  // revalidate cache: products
  revalidateDbCache({ id: newProd.id, userId: newProd.userId, tag: CACHE_TAGS.PRODUCTS });
  return newProd;
}

export async function updateProducts(
  data: Partial<typeof ProductsTable.$inferInsert>,
  { id, userId }: { id: string; userId: string }
) {
  try {
    const { rowCount } = await db
      .update(ProductsTable)
      .set(data)
      .where(and(eq(ProductsTable.id, id), eq(ProductsTable.clerkUserId, userId)));

    // revalidate cache: products
    rowCount > 0 && revalidateDbCache({ id, userId, tag: CACHE_TAGS.PRODUCTS });
    return rowCount > 0;
  } catch (error) {
    console.error("[ERROR-UPDATE-PRODUCTS]", error);
    return false;
  }
}

export async function deleteProducts({ id, userId }: { id: string; userId: string }) {
  try {
    // prettier-ignore
    const {rowCount} = await db
    .delete(ProductsTable)
      .where(and(eq(ProductsTable.id, id), eq(ProductsTable.clerkUserId, userId)))

    // revalidate cache: products
    rowCount > 0 && revalidateDbCache({ id, userId, tag: CACHE_TAGS.PRODUCTS });

    return rowCount > 0;
  } catch (error) {
    console.error("[ERROR-DELETE-PRODUCTS]", error);
    return false;
  }
}

export async function getSingleProduct(id: string, userId: string) {
  const cacheFn = dbCache({
    cb: getSingleProductInternal,
    tags: [getIdTag(id, CACHE_TAGS.PRODUCTS)],
  });
  return cacheFn(id, userId);
}

function getSingleProductInternal(id: string, userId: string) {
  return db.query.ProductsTable.findFirst({
    where: and(eq(ProductsTable.id, id), eq(ProductsTable.clerkUserId, userId)),
  });
}

export async function getProductCountryGroups({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const cacheFn = dbCache({
    cb: getProductCountryGroupsInternal,
    tags: [
      getIdTag(productId, CACHE_TAGS.PRODUCTS),
      getGlobalTag(CACHE_TAGS.COUNTRIES),
      getGlobalTag(CACHE_TAGS.COUNTRY_GROUPS),
    ],
  });
  return cacheFn(productId, userId);
}

async function getProductCountryGroupsInternal(productId: string, userId: string) {
  const product = await getSingleProduct(productId, userId);
  if (!product) return [];

  const data = await db.query.CountryGroupTable.findMany({
    with: {
      countries: { columns: { name: true, code: true } },
      countryGroupDiscounts: {
        columns: { coupon: true, discountPercentage: true },
        where: eq(CountryGroupDiscountTable.productId, productId),
        limit: 1,
      },
    },
  });

  return data.map((grp) => ({
    id: grp.id,
    name: grp.name,
    recommendedDiscountPercentage: grp.recommendedDiscountPercentage,
    countries: grp.countries,
    discount: grp.countryGroupDiscounts.at(0),
  }));
}

export async function updateCountryDiscounts(
  insert: insertType[],
  deleteId: { countryGroupId: string }[],
  { productId, userId }: { productId: string; userId: string }
) {
  try {
    const product = await getSingleProduct(productId, userId);
    if (!product) return false;

    const statements: BatchItem<"pg">[] = [];
    if (deleteId.length > 0) {
      statements.push(
        db.delete(CountryGroupDiscountTable).where(
          and(
            eq(CountryGroupDiscountTable.productId, productId),
            inArray(
              CountryGroupDiscountTable.countryGroupId,
              deleteId.map((grp) => grp.countryGroupId)
            )
          )
        )
      );
    }

    if (insert.length > 0) {
      statements.push(
        db
          .insert(CountryGroupDiscountTable)
          .values(insert)
          .onConflictDoUpdate({
            target: [CountryGroupDiscountTable.productId, CountryGroupDiscountTable.countryGroupId],
            set: {
              coupon: sql.raw(`excluded.${CountryGroupDiscountTable.coupon.name}`),
              discountPercentage: sql.raw(
                `excluded.${CountryGroupDiscountTable.discountPercentage.name}`
              ),
            },
          })
      );
    }

    if (statements.length > 0) {
      await db.batch(statements as [BatchItem<"pg">]);
    }

    // revalidate cache: products
    revalidateDbCache({ id: productId, userId, tag: CACHE_TAGS.PRODUCTS });
    return true;
  } catch (error) {
    console.error("[ERROR-UPDATE-COUNTRY-DISCOUNTS]", error);
    return false;
  }
}

export async function getProductCustomization({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const cacheFn = dbCache({
    cb: getProductCustomizationInternal,
    tags: [getIdTag(productId, CACHE_TAGS.PRODUCTS), getUserTag(userId, CACHE_TAGS.PRODUCTS)],
  });
  return cacheFn(productId, userId);
}

async function getProductCustomizationInternal(productId: string, userId: string) {
  const data = await db.query.ProductsTable.findFirst({
    where: and(eq(ProductsTable.id, productId), eq(ProductsTable.clerkUserId, userId)),
    with: {
      productCustomization: true,
    },
  });

  return data?.productCustomization;
}

export async function updateProductCustomization(
  data: Partial<typeof ProductCustomizationTable.$inferInsert>,
  { productId, userId }: { productId: string; userId: string }
) {
  try {
    const product = await getSingleProduct(productId, userId);
    if (!product) return false;

    const { rowCount } = await db
      .update(ProductCustomizationTable)
      .set(data)
      .where(and(eq(ProductCustomizationTable.productId, productId)));

    // revalidate cache: products
    rowCount > 0 && revalidateDbCache({ id: productId, userId, tag: CACHE_TAGS.PRODUCTS });

    return rowCount > 0;
  } catch (error) {
    console.error("[ERROR-UPDATE-PRODUCT-CUSTOMIZATION]", error);
    return false;
  }
}

export async function getProductCount(userId: string) {
  const cacheFn = dbCache({
    cb: getProductCountInternal,
    tags: [getUserTag(userId, CACHE_TAGS.PRODUCTS)],
  });
  return cacheFn(userId);
}

async function getProductCountInternal(userId: string) {
  const counts = await db
    .select({ productCount: count() })
    .from(ProductsTable)
    .where(eq(ProductsTable.clerkUserId, userId));

  return counts[0]?.productCount ?? 0;
}

export async function getProductBanner(productId: string, countryCode: string, url: string) {
  const cacheFn = dbCache({
    cb: getProductBannerInternal,
    tags: [
      getIdTag(productId, CACHE_TAGS.PRODUCTS),
      getGlobalTag(CACHE_TAGS.COUNTRIES),
      getGlobalTag(CACHE_TAGS.COUNTRY_GROUPS),
    ],
  });

  return cacheFn(productId, countryCode, url);
}

async function getProductBannerInternal(productId: string, countryCode: string, url: string) {
  try {
    const data = await db.query.ProductsTable.findFirst({
      where: and(eq(ProductsTable.id, productId), eq(ProductsTable.url, removeTrailingSlash(url))),
      columns: { id: true, clerkUserId: true },
      with: {
        productCustomization: true,
        countryGroupDiscounts: {
          columns: { coupon: true, discountPercentage: true },
          with: {
            countryGroup: {
              columns: {},
              with: {
                countries: {
                  columns: { id: true, name: true },
                  limit: 1,
                  where: ({ code }, { eq }) => eq(code, countryCode),
                },
              },
            },
          },
        },
      },
    });

    const discount = data?.countryGroupDiscounts.find(
      (discount) => discount.countryGroup.countries.length > 0
    );
    const country = discount?.countryGroup.countries[0];
    const product =
      !data || !data.productCustomization
        ? undefined
        : {
            id: data.id,
            clerkUserId: data.clerkUserId,
            customization: data.productCustomization,
          };

    const disc = !discount
      ? undefined
      : { coupon: discount.coupon, percentage: discount.discountPercentage };

    return { product, discount: disc, country };
  } catch (err) {
    console.error("[ERROR-GET-PRODUCT-BANNER]", err);
    return { product: undefined, discount: undefined, country: undefined };
  }
}
