export class TTLCache<V> {
  private store = new Map<string, { v: V; exp: number }>();
  constructor(private readonly defaultTtlMs: number = 5000) {}
  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.exp < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.v;
  }
  set(key: string, value: V, ttlMs?: number) {
    const exp = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { v: value, exp });
  }
  del(prefix?: string) {
    if (!prefix) return this.store.clear();
    for (const k of Array.from(this.store.keys())) if (k.startsWith(prefix)) this.store.delete(k);
  }
}

