import crypto from 'crypto';

export function signGatewayHeaders(params: {
  method: string;
  urlPath: string;
  userId?: string | number;
  role?: string;
}) {
  const shared = process.env.GATEWAY_SHARED_SECRET;
  const ts = Date.now().toString();
  const headers: Record<string, string> = { 'x-gw-ts': ts };
  if (params.userId) headers['x-user-id'] = String(params.userId);
  if (params.role) headers['x-user-role'] = String(params.role);
  if (shared && params.userId && params.role) {
    const base = `${params.method.toUpperCase()}:${params.urlPath}:${params.userId}:${params.role}:${ts}`;
    const sig = crypto.createHmac('sha256', shared).update(base).digest('hex');
    headers['x-gw-sig'] = sig;
  }
  return headers;
}
