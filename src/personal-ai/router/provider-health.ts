import type { ProviderHealth } from "../types.js";

export interface ProviderHealthTracker {
  snapshot(): readonly ProviderHealth[];
  markSuccess(provider: string): void;
  markFailure(provider: string, now?: number): void;
  markUnavailable(provider: string, now?: number): void;
  reset(provider: string): void;
}

const DEFAULT_FAILURE_THRESHOLD = 3;

export const createProviderHealthTracker = (
  failureThreshold = DEFAULT_FAILURE_THRESHOLD,
): ProviderHealthTracker => {
  const states = new Map<string, ProviderHealth>();

  const ensure = (provider: string): ProviderHealth =>
    states.get(provider) ?? {
      provider,
      available: true,
      consecutiveFailures: 0,
    };

  const set = (state: ProviderHealth): void => states.set(state.provider, state);

  return {
    snapshot: () => [...states.values()],

    markSuccess(provider) {
      set({ provider, available: true, consecutiveFailures: 0 });
    },

    markFailure(provider, now = Date.now()) {
      const current = ensure(provider);
      const consecutiveFailures = current.consecutiveFailures + 1;
      set({
        provider,
        available: consecutiveFailures < failureThreshold,
        consecutiveFailures,
        lastFailureAt: now,
      });
    },

    markUnavailable(provider, now = Date.now()) {
      const current = ensure(provider);
      set({
        provider,
        available: false,
        consecutiveFailures: current.consecutiveFailures,
        lastFailureAt: now,
      });
    },

    reset(provider) {
      set({ provider, available: true, consecutiveFailures: 0 });
    },
  };
};
