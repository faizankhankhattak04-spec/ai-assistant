import type { ActionGate } from "../security/action-gate.js";
import type { DeviceRegistry } from "./types.js";

export interface DeviceCommand {
  deviceId: string;
  action: string;
  riskLevel: 0 | 1 | 2 | 3;
  destructive?: boolean;
  actor?: "user" | "agent" | "device";
}

export interface DeviceCommandResult {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason: string;
}

export const authorizeDeviceCommand = async (
  registry: DeviceRegistry,
  gate: ActionGate,
  command: DeviceCommand,
): Promise<DeviceCommandResult> => {
  const device = registry.get(command.deviceId);
  if (!device) {
    return { allowed: false, requiresConfirmation: false, reason: "Unknown device." };
  }
  if (!device.authenticated) {
    return { allowed: false, requiresConfirmation: false, reason: "Device is not authenticated." };
  }
  if (device.status !== "online") {
    return { allowed: false, requiresConfirmation: false, reason: "Device is not online." };
  }
  const capability = device.capabilities.find((item) => item.id === command.action);
  if (!capability) {
    return { allowed: false, requiresConfirmation: false, reason: "Device does not advertise this capability." };
  }
  if (command.riskLevel < capability.riskLevel) {
    return { allowed: false, requiresConfirmation: false, reason: "Requested risk level is below the device capability policy." };
  }

  return gate.authorize({
    actor: command.actor ?? "agent",
    action: command.action,
    deviceId: command.deviceId,
    riskLevel: command.riskLevel,
    destructive: command.destructive ?? false,
  });
};
