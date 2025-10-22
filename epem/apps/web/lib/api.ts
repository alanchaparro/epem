// apiFetch adjunta el token Bearer al header Authorization y devuelve JSON.
// Lanza Error con el body (texto) si la respuesta no es 2xx.
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('epem_token') : null;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}
