"use server";

import { ProductDetailsSchema } from "@/data/types/zod-type";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createProducts, deleteProducts, updateProducts } from "@/server/db-queries/products";
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

export async function updateProductAction(
  id: string,
  unsafeData: z.infer<typeof ProductDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = ProductDetailsSchema.safeParse(unsafeData);

  if (!success || !userId) {
    return { error: true, message: "Error in creating product." };
  }

  const res = await updateProducts(data, { id, userId });
  if (!res) {
    return { error: true, message: "Error in updating product." };
  }

  return { error: false, message: "Prodcut updated successfully" };
}

export async function deleteProduct(id: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: true, message: "Error in deleting product." };
  }

  const isSuccess = await deleteProducts({ id, userId });

  return {
    success: isSuccess,
    message: isSuccess ? "Product deleted successfully." : "Error in deleting product.",
  };
}
