import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function createURL(
  href: string,
  oldParams: Record<string, string>,
  newParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams(oldParams);
  for (const [key, value] of Object.entries(newParams)) {
    if (value != undefined) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }

  return `${href}?${params.toString()}`;
}
