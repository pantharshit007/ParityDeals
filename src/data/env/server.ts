import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env_server = createEnv({
  emptyStringAsUndefined: true,
  server: {
    CLERK_SECRET_KEY: z.string(),
    DATABASE_URL: z.string().url(),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
