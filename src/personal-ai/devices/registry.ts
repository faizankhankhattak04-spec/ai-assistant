import type { DeviceRecord, DeviceRegistry, DeviceStatus } from "./types.js";

export const createDeviceRegistry = (): DeviceRegistry => {
  const devices = new Map<string, DeviceRecord>();
  return {
    register(device) {
      devices.set(device.id, { ...device, capabilities: [...device.capabilities] });
    },
    get(id) {
      return devices.get(id);
    },
    list() {
      return [...devices.values()];
    },
    updateStatus(id, status: DeviceStatus, lastSeenAt = Date.now()) {
      const device = devices.get(id);
      if (!device) return;
      devices.set(id, { ...device, status, lastSeenAt });
    },
    remove(id) {
      devices.delete(id);
    },
  };
};
