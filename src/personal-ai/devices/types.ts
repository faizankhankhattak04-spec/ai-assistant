export type DeviceKind = "laptop" | "phone" | "tablet" | "other";
export type DeviceStatus = "online" | "offline" | "unknown";

export interface DeviceCapability {
  id: string;
  description?: string;
  riskLevel: 0 | 1 | 2 | 3;
}

export interface DeviceRecord {
  id: string;
  name: string;
  kind: DeviceKind;
  status: DeviceStatus;
  capabilities: DeviceCapability[];
  lastSeenAt?: number;
  authenticated: boolean;
}

export interface DeviceRegistry {
  register(device: DeviceRecord): void;
  get(id: string): DeviceRecord | undefined;
  list(): DeviceRecord[];
  updateStatus(id: string, status: DeviceStatus, lastSeenAt?: number): void;
  remove(id: string): void;
}
