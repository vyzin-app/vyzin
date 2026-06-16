/** Applies case-insensitive substring search across multiple entity fields (server-side). */
export function applyTextSearch<T>(
  items: T[],
  search: string | undefined,
  getters: ((item: T) => string | undefined)[],
): T[] {
  if (!search?.trim()) {
    return items;
  }

  const query = search.trim().toLowerCase();
  return items.filter((item) =>
    getters.some((get) => (get(item) ?? '').toLowerCase().includes(query)),
  );
}
