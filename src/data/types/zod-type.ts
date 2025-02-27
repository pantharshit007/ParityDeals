import { removeTrailingSlash } from "@/lib/utils";
import { z } from "zod";

export const ProductDetailsSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().transform(removeTrailingSlash),
  description: z.string().optional(),
});
