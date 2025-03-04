"use server";

import { productCountryDiscountsSchema, ProductDetailsSchema } from "@/data/types/zod-type";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createProducts,
  deleteProducts,
  updateCountryDiscounts,
  updateProducts,
} from "@/server/db-queries/products";
import { redirect } from "next/navigation";
import { insertType } from "@/data/types/type";

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

export async function updateCountryDiscountsAction(
  productId: string,
  unsafeData: z.infer<typeof productCountryDiscountsSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCountryDiscountsSchema.safeParse(unsafeData);

  if (!success || !userId) {
    return { error: true, message: "Error in updating product discounts." };
  }

  const insert: insertType[] = [];
  const deleteId: { countryGroupId: string }[] = [];

  data.groups.forEach((grp) => {
    if (
      grp.coupon != null &&
      grp.coupon.length > 0 &&
      grp.discountPercentage != null &&
      grp.discountPercentage > 0
    ) {
      insert.push({
        countryGroupId: grp.countryGroupId,
        productId,
        coupon: grp.coupon,
        discountPercentage: grp.discountPercentage / 100,
      });
    } else {
      deleteId.push({ countryGroupId: grp.countryGroupId });
    }
  });

  const res = await updateCountryDiscounts(insert, deleteId, { productId, userId });
  if (!res) {
    return { error: true, message: "Error in updating product discounts." };
  }

  return { error: false, message: "Prodcut updated successfully" };
}
