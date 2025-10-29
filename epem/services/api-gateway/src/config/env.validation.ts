import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().optional(),
  API_GATEWAY_PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().optional(),
  DEFAULT_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET requerido').default('change-me'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET requerido').default('change-me-refresh'),
  ACCESS_TOKEN_TTL: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().default(604800),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.string().optional(),
  COOKIE_SAMESITE: z.string().optional(),
  GATEWAY_SHARED_SECRET: z.string().optional(),
  GATEWAY_SIGNATURE_MAX_SKEW_SEC: z.coerce.number().default(300),
  HTTP_TIMEOUT_MS: z.coerce.number().default(5000),
  HTTP_RETRY_MAX: z.coerce.number().default(2),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = schema.safeParse(config);
  if (!parsed.success) {
    const lines = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Config inválida: ${lines}`);
  }
  return parsed.data;
}

