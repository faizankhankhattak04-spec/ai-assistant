import type {
  ModelCandidate,
  ProviderHealth,
  RoutingDecision,
  TaskProfile,
} from "../types.js";

export interface ModelRouter {
  route(
    task: TaskProfile,
    candidates: readonly ModelCandidate[],
    health: readonly ProviderHealth[],
  ): RoutingDecision;
}

const healthFor = (
  provider: string,
  health: readonly ProviderHealth[],
): ProviderHealth | undefined => health.find((item) => item.provider === provider);

const supports = (candidate: ModelCandidate, task: TaskProfile): boolean =>
  task.capabilities.size === 0 ||
  [...task.capabilities].every((capability) => candidate.capabilities.has(capability));

/**
 * Pure Phase-1 router. It deliberately depends on existing provider/model
 * contracts supplied by the caller instead of creating provider-specific HTTP clients.
 */
export const createModelRouter = (): ModelRouter => ({
  route(task, candidates, health) {
    const eligible = candidates.filter((candidate) => {
      const providerHealth = healthFor(candidate.provider, health);
      return candidate.available &&
        supports(candidate, task) &&
        (providerHealth?.available ?? true);
    });

    if (eligible.length === 0) {
      throw new Error("No eligible AI model is currently available for this task");
    }

    const ranked = [...eligible].sort((a, b) => {
      const healthA = healthFor(a.provider, health);
      const healthB = healthFor(b.provider, health);
      const failuresA = healthA?.consecutiveFailures ?? 0;
      const failuresB = healthB?.consecutiveFailures ?? 0;

      const latencyA = a.estimatedLatencyMs ?? Number.POSITIVE_INFINITY;
      const latencyB = b.estimatedLatencyMs ?? Number.POSITIVE_INFINITY;
      const costA = a.estimatedCostPerRequest ?? Number.POSITIVE_INFINITY;
      const costB = b.estimatedCostPerRequest ?? Number.POSITIVE_INFINITY;

      const failureScore = failuresA - failuresB;
      if (failureScore !== 0) return failureScore;

      if (task.costPreference === "low") return costA - costB || latencyA - latencyB;
      if (task.costPreference === "quality") return latencyA - latencyB || costA - costB;
      return latencyA - latencyB || costA - costB;
    });

    const primary = ranked[0];
    if (!primary) throw new Error("Router produced no primary model");

    return {
      provider: primary.provider,
      model: primary.model,
      fallbackChain: ranked.slice(1).map((candidate) => `${candidate.provider}/${candidate.model}`),
      reason: `Selected from ${ranked.length} eligible model(s) using task capability, health, latency, and cost policy`,
    };
  },
});
