// apiFetch adjunta el token Bearer al header Authorization y devuelve JSON.
// Lanza Error con el body (texto) si la respuesta no es 2xx.
export async function apiFetch<T = unknown>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const doFetch = async (): Promise<Response> => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('epem_token') : null;
    const headers = new Headers(init.headers);
    if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  let res = await doFetch();
  if (res.status === 401) {
    try {
      const rf = await fetch('/auth/refresh', { method: 'POST' });
      if (rf.ok) {
        const j = await rf.json().catch(() => null);
        const newToken = j?.accessToken as string | undefined;
        if (newToken && typeof window !== 'undefined') {
          window.localStorage.setItem('epem_token', newToken);
        }
        res = await doFetch();
      }
    } catch {}
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  try {
    const data = (await res.json()) as T;
    return data;
  } catch {
    // No JSON body
    return undefined as unknown as T;
  }
}
