import type { MemoryQuery, MemoryRecord, MemoryStore } from "./types.js";

export const createInMemoryStore = (): MemoryStore => {
  const records = new Map<string, MemoryRecord>();

  return {
    async put(record) {
      records.set(record.id, { ...record, updatedAt: Date.now() });
    },
    async get(id) {
      return records.get(id);
    },
    async query(query = {}) {
      const now = Date.now();
      return [...records.values()]
        .filter((record) => !record.expiresAt || record.expiresAt > now)
        .filter((record) => !query.scope || record.scope === query.scope)
        .filter((record) => !query.key || record.key === query.key)
        .slice(0, query.limit ?? 100);
    },
    async delete(id) {
      records.delete(id);
    },
  };
};
