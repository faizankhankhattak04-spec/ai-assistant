import type { AuditLog } from "../audit/types.js";
import type { PermissionDecision, PermissionRequest } from "../permissions/types.js";
import { createPermissionPolicy } from "../permissions/policy.js";

export interface ActionGate {
  authorize(request: PermissionRequest): Promise<PermissionDecision>;
}

export const createActionGate = (audit: AuditLog): ActionGate => {
  const policy = createPermissionPolicy();

  return {
    async authorize(request) {
      const decision = policy.evaluate(request);
      await audit.append({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        actor: request.actor,
        action: request.action,
        deviceId: request.deviceId,
        riskLevel: request.riskLevel,
        outcome: decision.allowed
          ? decision.requiresConfirmation
            ? "confirmed"
            : "allowed"
          : "denied",
        reason: decision.reason,
      });
      return decision;
    },
  };
};
