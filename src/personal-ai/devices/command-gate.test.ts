import { describe, expect, it } from "vitest";
import { createActionGate } from "../security/action-gate.js";
import { createInMemoryAuditLog } from "../audit/in-memory-log.js";
import { createDeviceRegistry } from "./registry.js";
import { authorizeDeviceCommand } from "./command-gate.js";

describe("authorizeDeviceCommand", () => {
  const setup = () => {
    const registry = createDeviceRegistry();
    registry.register({
      id: "laptop",
      name: "Laptop",
      kind: "laptop",
      status: "online",
      authenticated: true,
      capabilities: [{ id: "browser.open", riskLevel: 1 }],
    });
    const audit = createInMemoryAuditLog();
    return { registry, gate: createActionGate(audit), audit };
  };

  it("rejects unknown or unauthenticated devices", async () => {
    const { registry, gate } = setup();
    expect((await authorizeDeviceCommand(registry, gate, { deviceId: "phone", action: "browser.open", riskLevel: 1 })).allowed).toBe(false);
  });

  it("rejects actions the device does not advertise", async () => {
    const { registry, gate } = setup();
    const result = await authorizeDeviceCommand(registry, gate, { deviceId: "laptop", action: "files.delete", riskLevel: 2 });
    expect(result.reason).toContain("does not advertise");
  });

  it("passes approved commands through the action gate", async () => {
    const { registry, gate, audit } = setup();
    const result = await authorizeDeviceCommand(registry, gate, { deviceId: "laptop", action: "browser.open", riskLevel: 1 });
    expect(result.allowed).toBe(true);
    expect(await audit.query()).toHaveLength(1);
  });
});
