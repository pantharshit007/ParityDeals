import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

interface CacheOptions<T extends (...args: any[]) => Promise<any>> {
  cb: Parameters<typeof unstable_cache<T>>[0];
  tags: ValidTags[];
}

interface revalidateCacheOptions {
  id?: string;
  userId?: string;
  tag: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
}

export type ValidTags =
  | ReturnType<typeof getGlobalTag>
  | ReturnType<typeof getUserTag>
  | ReturnType<typeof getIdTag>;

export const CACHE_TAGS = {
  PRODUCTS: "products",
  PRODUCT_VIEWS: "productViews",
  SUBSCRIPTION: "subscription",
  COUNTRIES: "countries",
  COUNTRY_GROUPS: "countryGroups",
} as const;

export function getGlobalTag(tag: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]) {
  return `global:${tag}` as const;
}

export function getUserTag(userId: string, tag: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]) {
  return `user:${userId}:${tag}` as const;
}

export function getIdTag(id: string, tag: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]) {
  return `id:${id}:${tag}` as const;
}

export function clearFullCache() {
  revalidateTag("*");
}

export function dbCache<T extends (...args: any[]) => Promise<any>>({ cb, tags }: CacheOptions<T>) {
  return cache(unstable_cache<T>(cb, undefined, { tags: [...tags, "*"] }));
}

export function revalidateDbCache({ id, userId, tag }: revalidateCacheOptions) {
  revalidateTag(getGlobalTag(tag));
  if (userId) revalidateTag(getUserTag(userId, tag));
  if (id) revalidateTag(getIdTag(id, tag));
}
