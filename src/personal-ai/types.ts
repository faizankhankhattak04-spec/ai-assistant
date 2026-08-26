export type TaskType =
  | "coding"
  | "reasoning"
  | "research"
  | "vision"
  | "audio"
  | "simple"
  | "private"
  | "unknown";

export type RiskLevel = "L0" | "L1" | "L2" | "L3";

export type ModelCapability =
  | "text"
  | "reasoning"
  | "coding"
  | "vision"
  | "audio"
  | "tools";

export interface TaskProfile {
  readonly type: TaskType;
  readonly capabilities: ReadonlySet<ModelCapability>;
  readonly privacyRequired: boolean;
  readonly maxLatencyMs?: number;
  readonly costPreference?: "low" | "balanced" | "quality";
}

export interface ModelCandidate {
  readonly provider: string;
  readonly model: string;
  readonly capabilities: ReadonlySet<ModelCapability>;
  readonly available: boolean;
  readonly estimatedLatencyMs?: number;
  readonly estimatedCostPerRequest?: number;
}

export interface ProviderHealth {
  readonly provider: string;
  readonly available: boolean;
  readonly consecutiveFailures: number;
  readonly lastFailureAt?: number;
}

export interface RoutingDecision {
  readonly provider: string;
  readonly model: string;
  readonly fallbackChain: readonly string[];
  readonly reason: string;
}

export interface Device {
  readonly id: string;
  readonly name: string;
  readonly platform: "windows" | "linux" | "macos" | "android" | "ios" | "unknown";
  readonly capabilities: ReadonlySet<string>;
  readonly online: boolean;
  readonly authenticated: boolean;
  readonly lastSeenAt: number;
  readonly allowedRiskLevel: RiskLevel;
}
