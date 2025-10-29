import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().optional(),
  USERS_SERVICE_PORT: z.coerce.number().default(3020),
  USERS_SERVICE_DATABASE_URL: z.string().min(1, 'USERS_SERVICE_DATABASE_URL requerido'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET requerido').default('change-me'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET requerido').default('change-me-refresh'),
  ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().default(604800),
  CORS_ORIGIN: z.string().optional(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = schema.safeParse(config);
  if (!parsed.success) {
    const lines = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Config inválida: ${lines}`);
  }
  return parsed.data;
}
