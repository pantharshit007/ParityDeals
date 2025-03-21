import { ViewsCountryChartType } from "@/data/types/type";
import { db } from "@/drizzle/db";
import { CountryGroupTable, CountryTable, ProductsTable, ProductViewTable } from "@/drizzle/schema";
import {
  CACHE_TAGS,
  dbCache,
  getGlobalTag,
  getIdTag,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { startOfDay } from "date-fns";
import { tz } from "@date-fns/tz";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { DashboardAccessOutSerializer } from "svix/dist/models/dashboardAccessOut";

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

export async function createProductView({
  productId,
  countryId,
  userId,
}: {
  productId: string;
  countryId?: string;
  userId: string;
}) {
  try {
    const [newRow] = await db
      .insert(ProductViewTable)
      .values({
        productId,
        countryId,
        visitedAt: new Date(),
      })
      .returning({ id: ProductViewTable.id });

    if (newRow != null) revalidateDbCache({ id: newRow.id, userId, tag: CACHE_TAGS.PRODUCT_VIEWS });

    return;
  } catch (err) {
    console.error("[ERROR-CREATE-PRODUCT-VIEW]", err);
    return;
  }
}

export async function getViewsByCountryChartData({
  timezone,
  productId,
  userId,
  interval,
}: ViewsCountryChartType) {
  const cacheFn = dbCache({
    cb: getViewsByCountryChartDataInternal,
    tags: [
      getUserTag(userId, CACHE_TAGS.PRODUCT_VIEWS),
      productId == null
        ? getUserTag(userId, CACHE_TAGS.PRODUCTS)
        : getIdTag(productId, CACHE_TAGS.PRODUCTS),
      getGlobalTag(CACHE_TAGS.COUNTRIES),
    ],
  });

  return cacheFn({ timezone, productId, userId, interval });
}

async function getViewsByCountryChartDataInternal({
  timezone,
  productId,
  userId,
  interval,
}: ViewsCountryChartType) {
  try {
    const startDate = startOfDay(interval.startDate, { in: tz(timezone) });
    const productsSQ = getProductSubQuery(userId, productId);
    return await db
      .with(productsSQ)
      .select({
        views: count(ProductViewTable.visitedAt),
        countryCode: CountryTable.code,
        countryName: CountryTable.name,
      })
      .from(ProductViewTable)
      .innerJoin(productsSQ, eq(ProductViewTable.productId, productsSQ.id))
      .innerJoin(CountryTable, eq(CountryTable.id, ProductViewTable.countryId))
      .where(
        // prettier-ignore
        gte(
          sql`${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`.inlineParams(),
          startDate
        )
      )
      .groupBy(({ countryCode, countryName }) => [countryCode, countryName])
      .orderBy(({ views }) => desc(views))
      .limit(25);
  } catch (error) {
    console.error("[ERROR-GET-VIEWS-BY-DAY-CHART-DATA]", error);
    return [];
  }
}

function getProductSubQuery(userId: string, productId: string | undefined) {
  return db.$with("products").as(
    db
      .select()
      .from(ProductsTable)
      .where(
        and(
          eq(ProductsTable.clerkUserId, userId),
          productId == null ? undefined : eq(ProductsTable.id, productId)
        )
      )
  );
}

export async function getViewsByPPPChartData({
  timezone,
  productId,
  userId,
  interval,
}: ViewsCountryChartType) {
  const cacheFn = dbCache({
    cb: getViewsByPPPChartDataInternal,
    tags: [
      getUserTag(userId, CACHE_TAGS.PRODUCT_VIEWS),
      productId == null
        ? getUserTag(userId, CACHE_TAGS.PRODUCTS)
        : getIdTag(productId, CACHE_TAGS.PRODUCTS),
      getGlobalTag(CACHE_TAGS.COUNTRY_GROUPS),
    ],
  });
  return cacheFn({ timezone, productId, userId, interval });
}

async function getViewsByPPPChartDataInternal({
  timezone,
  productId,
  userId,
  interval,
}: ViewsCountryChartType) {
  try {
    const startDate = startOfDay(interval.startDate, { in: tz(timezone) });
    const productsSQ = getProductSubQuery(userId, productId);
    const productViewSQ = db.$with("productViews").as(
      db
        .with(productsSQ)
        .select({
          visitedAt: sql`${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
            .inlineParams()
            .as("visitedAt"),
          countryGroupId: CountryTable.countryGroupId,
        })
        .from(ProductViewTable)
        .innerJoin(productsSQ, eq(ProductViewTable.productId, productsSQ.id))
        .innerJoin(CountryTable, eq(CountryTable.id, ProductViewTable.countryId))
        .where(({ visitedAt }) => gte(visitedAt, startDate))
    );

    return await db
      .with(productViewSQ)
      .select({
        views: count(productViewSQ.visitedAt),
        pppName: CountryGroupTable.name,
      })
      .from(CountryGroupTable)
      .leftJoin(productViewSQ, eq(CountryGroupTable.id, productViewSQ.countryGroupId))
      .groupBy(({ pppName }) => [pppName])
      .orderBy(({ pppName }) => pppName);
  } catch (error) {
    console.error("[ERROR-GET-VIEWS-BY-DAY-CHART-DATA]", error);
    return [];
  }
}

export async function getViewsByDayChartData({
  timezone,
  productId,
  userId,
  interval,
}: ViewsCountryChartType) {
  const cacheFn = dbCache({
    cb: getViewsByDayChartDataInternal,
    tags: [
      getUserTag(userId, CACHE_TAGS.PRODUCT_VIEWS),
      productId == null
        ? getUserTag(userId, CACHE_TAGS.PRODUCTS)
        : getIdTag(productId, CACHE_TAGS.PRODUCTS),
    ],
  });

  return cacheFn({ timezone, productId, userId, interval });
}

async function getViewsByDayChartDataInternal({
  timezone,
  productId,
  userId,
  interval,
}: ViewsCountryChartType) {
  try {
    const productsSQ = getProductSubQuery(userId, productId);
    const productViewSQ = db.$with("productViews").as(
      db
        .with(productsSQ)
        .select({
          visitedAt: sql`${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
            .inlineParams()
            .as("visitedAt"),
          productId: productsSQ.id,
        })
        .from(ProductViewTable)
        .innerJoin(productsSQ, eq(ProductViewTable.productId, productsSQ.id))
    );

    return await db
      .with(productViewSQ)
      .select({
        views: count(productViewSQ.visitedAt),
        date: interval
          .dateGrouper(sql.raw("series"))
          .mapWith((dateString) => interval.dateFormatter(new Date(dateString))),
      })
      .from(interval.sql)
      .leftJoin(productViewSQ, ({ date }) =>
        eq(interval.dateGrouper(productViewSQ.visitedAt), date)
      )
      .groupBy(({ date }) => [date])
      .orderBy(({ date }) => date);
  } catch (error) {
    console.error("[ERROR-GET-VIEWS-BY-DAY-CHART-DATA]", error);
    return [];
  }
}
