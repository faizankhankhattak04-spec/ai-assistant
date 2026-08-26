export type MemoryScope = "session" | "personal" | "project" | "device" | "task";
export type MemorySensitivity = "normal" | "sensitive" | "secret";

export interface MemoryRecord {
  id: string;
  scope: MemoryScope;
  key: string;
  value: unknown;
  sensitivity: MemorySensitivity;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  source?: string;
}

export interface MemoryQuery {
  scope?: MemoryScope;
  key?: string;
  limit?: number;
}

export interface MemoryStore {
  put(record: MemoryRecord): Promise<void>;
  get(id: string): Promise<MemoryRecord | undefined>;
  query(query?: MemoryQuery): Promise<MemoryRecord[]>;
  delete(id: string): Promise<void>;
}
