import type { PermissionDecision, PermissionPolicy, PermissionRequest } from "./types.js";

export const createPermissionPolicy = (): PermissionPolicy => ({
  evaluate(request: PermissionRequest): PermissionDecision {
    if (request.riskLevel >= 3 || request.destructive) {
      return { allowed: false, requiresConfirmation: true, reason: "High-risk or destructive action requires explicit confirmation." };
    }
    if (request.riskLevel === 2) {
      return { allowed: true, requiresConfirmation: true, reason: "Important external or modifying action requires confirmation." };
    }
    if (request.actor === "device" && request.riskLevel > 0) {
      return { allowed: false, requiresConfirmation: true, reason: "Untrusted device actor cannot perform modifying actions without authorization." };
    }
    return { allowed: true, requiresConfirmation: false, reason: "Action is within the low-risk permission boundary." };
  },
});
