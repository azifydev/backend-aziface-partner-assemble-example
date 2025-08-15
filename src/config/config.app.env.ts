import { envSchema } from './env.validation';

/**
 * Validates the environment variables against the schema.
 * If the validation fails, logs the error and exits the process.
 *
 * @throws {Error} Exits the process with code 1 if environment variables are invalid
 */
export function configAppEnv(): void {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    throw new Error(
      'Invalid environment variables. Please check the configuration.',
    );
  }
}
