import type { AuditEvent, AuditLog } from "./types.js";

export const createInMemoryAuditLog = (): AuditLog => {
  const events: AuditEvent[] = [];
  return {
    async append(event) {
      events.push({ ...event });
    },
    async query(limit = 100) {
      return events.slice(Math.max(0, events.length - Math.max(0, limit))).reverse();
    },
  };
};
