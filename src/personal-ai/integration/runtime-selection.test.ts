import { describe, expect, it } from "vitest";
import { selectRuntimeModel } from "./runtime-selection.js";

describe("selectRuntimeModel", () => {
  it("returns an OpenClaw-compatible provider/model reference", () => {
    const result = selectRuntimeModel({
      task: {
        type: "coding",
        capabilities: new Set(["text", "coding"]),
        privacyRequired: false,
        costPreference: "quality",
      },
      candidates: [
        {
          provider: "openai",
          model: "gpt-5",
          capabilities: new Set(["text", "coding"]),
          available: true,
          estimatedLatencyMs: 700,
          estimatedCostPerRequest: 0.02,
        },
      ],
      health: [],
    });

    expect(result.modelRef).toBe("openai/gpt-5");
    expect(result.decision.provider).toBe("openai");
  });
});
