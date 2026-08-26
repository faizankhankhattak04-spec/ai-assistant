import type {
  ModelCandidate,
  ProviderHealth,
  RoutingDecision,
  TaskProfile,
} from "../types.js";
import { createModelRouter } from "../router/model-router.js";

/**
 * Provider-neutral runtime selection boundary.
 *
 * OpenClaw remains responsible for resolving credentials, provider adapters,
 * streaming, tool calling, and model materialization. This adapter only decides
 * which already-registered provider/model tuple should be requested.
 */
export interface RuntimeModelSelectionInput {
  readonly task: TaskProfile;
  readonly candidates: readonly ModelCandidate[];
  readonly health: readonly ProviderHealth[];
}

export interface RuntimeModelSelection {
  readonly decision: RoutingDecision;
  readonly modelRef: string;
}

export function selectRuntimeModel(
  input: RuntimeModelSelectionInput,
): RuntimeModelSelection {
  const decision = createModelRouter().route(input.task, input.candidates, input.health);
  return {
    decision,
    modelRef: `${decision.provider}/${decision.model}`,
  };
}
