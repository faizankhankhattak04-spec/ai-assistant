export type AuditOutcome = "allowed" | "denied" | "confirmed" | "failed";

export interface AuditEvent {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  resource?: string;
  deviceId?: string;
  riskLevel: "L0" | "L1" | "L2" | "L3";
  outcome: AuditOutcome;
  reason?: string;
}

export interface AuditLog {
  append(event: AuditEvent): Promise<void>;
  query(limit?: number): Promise<AuditEvent[]>;
}
