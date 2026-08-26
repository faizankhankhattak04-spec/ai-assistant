import { describe, expect, it } from "vitest";
import { createModelRouter } from "./model-router.js";
import type { ModelCandidate, ProviderHealth, TaskProfile } from "../types.js";

const task = (overrides: Partial<TaskProfile> = {}): TaskProfile => ({
  type: "coding",
  capabilities: new Set(["text", "coding"]),
  privacyRequired: false,
  ...overrides,
});

const models: ModelCandidate[] = [
  {
    provider: "openai",
    model: "coding-fast",
    capabilities: new Set(["text", "coding"]),
    available: true,
    estimatedLatencyMs: 900,
    estimatedCostPerRequest: 0.02,
  },
  {
    provider: "deepseek",
    model: "coding-cheap",
    capabilities: new Set(["text", "coding"]),
    available: true,
    estimatedLatencyMs: 500,
    estimatedCostPerRequest: 0.005,
  },
  {
    provider: "vision-only",
    model: "vision",
    capabilities: new Set(["text", "vision"]),
    available: true,
  },
];

describe("ModelRouter", () => {
  it("filters models that cannot satisfy the task", () => {
    const decision = createModelRouter().route(task(), models, []);
    expect(decision.provider).not.toBe("vision-only");
  });

  it("prefers the lower-cost eligible model for low-cost tasks", () => {
    const decision = createModelRouter().route(task({ costPreference: "low" }), models, []);
    expect(decision.provider).toBe("deepseek");
    expect(decision.fallbackChain).toContain("openai/coding-fast");
  });

  it("skips unhealthy providers", () => {
    const health: ProviderHealth[] = [
      { provider: "deepseek", available: false, consecutiveFailures: 3, lastFailureAt: 123 },
    ];
    const decision = createModelRouter().route(task({ costPreference: "low" }), models, health);
    expect(decision.provider).toBe("openai");
  });

  it("fails clearly when no model is eligible", () => {
    expect(() =>
      createModelRouter().route(task({ capabilities: new Set(["audio"]) }), models, []),
    ).toThrow("No eligible AI model is currently available");
  });
});
