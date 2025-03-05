import { removeTrailingSlash } from "@/lib/utils";
import { z } from "zod";

export const ProductDetailsSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().transform(removeTrailingSlash),
  description: z.string().optional(),
});

export const productCountryDiscountsSchema = z.object({
  groups: z.array(
    z
      .object({
        countryGroupId: z.string().min(1, "Required"),
        coupon: z.string().optional(),
        discountPercentage: z
          .number()
          .min(1)
          .max(100)
          .or(z.nan())
          .transform((n) => (isNaN(n) ? undefined : n))
          .optional(),
      })
      .refine(
        (value) => {
          const hasCoupon = value.coupon != null && value.coupon.length > 0;
          const hasDiscount = value.discountPercentage != null;

          return !(hasCoupon && !hasDiscount); // false: coupon:true, discount:false
        },
        { message: "A discount is required if coupon is provided!", path: ["root"] }
      )
  ),
});

export const productCustomizationSchema = z.object({
  classPrefix: z.string().optional(),
  backgroundColor: z.string().min(1, "Required"),
  textColor: z.string().min(1, "Required"),
  fontSize: z.string().min(1, "Required"),
  locationMessage: z.string().min(1, "Required"),
  bannerContainer: z.string().min(1, "Required"),
  isSticky: z.boolean(),
});
