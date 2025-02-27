"use server";

import { ProductDetailsSchema } from "@/data/types/zod-type";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createProducts } from "@/server/db-queries/products";
import { redirect } from "next/navigation";

export async function createProductAction(
  unsafeData: z.infer<typeof ProductDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = ProductDetailsSchema.safeParse(unsafeData);

  if (!success || !userId) {
    return { error: true, message: "Error in creating product." };
  }

  const res = await createProducts({ ...data, clerkUserId: userId });
  if (res.id === null) {
    return { error: true, message: res.message };
  }

  redirect(`/dashboard/products/${res.id}/edits?tab=countries`);
}
