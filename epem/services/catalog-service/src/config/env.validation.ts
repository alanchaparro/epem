import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().optional(),
  CATALOG_SERVICE_PORT: z.coerce.number().default(3030),
  CATALOG_SERVICE_DATABASE_URL: z.string().min(1, 'CATALOG_SERVICE_DATABASE_URL requerido'),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(1).default('change-me'),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = schema.safeParse(config);
  if (!parsed.success) {
    const lines = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Config inválida: ${lines}`);
  }
  return parsed.data;
}

