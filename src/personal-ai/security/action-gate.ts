import type { AuditLog } from "../audit/types.js";
import type { PermissionDecision, PermissionRequest } from "../permissions/types.js";
import { evaluatePermission } from "../permissions/policy.js";

export interface ActionGate {
  authorize(request: PermissionRequest): Promise<PermissionDecision>;
}

export const createActionGate = (audit: AuditLog): ActionGate => ({
  async authorize(request) {
    const decision = evaluatePermission(request);
    await audit.append({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      actor: request.actor,
      action: request.action,
      resource: request.resource,
      deviceId: request.deviceId,
      riskLevel: decision.riskLevel,
      outcome: decision.allowed ? (decision.requiresConfirmation ? "confirmed" : "allowed") : "denied",
      reason: decision.reason,
    });
    return decision;
  },
});
