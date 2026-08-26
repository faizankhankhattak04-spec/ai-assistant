export type RiskLevel = 0 | 1 | 2 | 3;

export interface PermissionRequest {
  actor: "user" | "agent" | "device";
  deviceId?: string;
  action: string;
  riskLevel: RiskLevel;
  destructive?: boolean;
}

export interface PermissionDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason: string;
}

export interface PermissionPolicy {
  evaluate(request: PermissionRequest): PermissionDecision;
}
