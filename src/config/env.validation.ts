import { z } from 'zod';

/**
 * Schema for validating environment variables.
 *
 * @remarks
 * This schema uses Zod for validation and transformation of environment variables.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65_535).default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CORS_ORIGIN: z.string(),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
});

export type EnvVars = z.infer<typeof envSchema>;
