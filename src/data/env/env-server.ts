import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env_server = createEnv({
  emptyStringAsUndefined: true,
  server: {
    CLERK_SECRET_KEY: z.string(),
    DATABASE_URL: z.string().url(),
    CLERK_WEBHOOK_SECRET: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_BASIC_PLAN_STRIPE_PRICE_ID: z.string(),
    STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID: z.string(),
    STRIPE_PREMIUM_PLAN_STRIPE_PRICE_ID: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    TEST_COUNTRY_CODE: z.string(),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_BASIC_PLAN_STRIPE_PRICE_ID: process.env.STRIPE_BASIC_PLAN_STRIPE_PRICE_ID,
    STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID: process.env.STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID,
    STRIPE_PREMIUM_PLAN_STRIPE_PRICE_ID: process.env.STRIPE_PREMIUM_PLAN_STRIPE_PRICE_ID,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TEST_COUNTRY_CODE: process.env.TEST_COUNTRY_CODE,
  },
});
