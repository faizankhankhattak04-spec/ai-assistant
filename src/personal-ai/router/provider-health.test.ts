import { describe, expect, it } from "vitest";
import { createProviderHealthTracker } from "./provider-health.js";

describe("ProviderHealthTracker", () => {
  it("starts unknown providers as healthy", () => {
    const tracker = createProviderHealthTracker();
    expect(tracker.snapshot()).toEqual([]);
    tracker.markSuccess("openai");
    expect(tracker.snapshot()).toEqual([
      { provider: "openai", available: true, consecutiveFailures: 0 },
    ]);
  });

  it("marks a provider unavailable after the failure threshold", () => {
    const tracker = createProviderHealthTracker(2);
    tracker.markFailure("deepseek", 100);
    expect(tracker.snapshot()[0]?.available).toBe(true);
    tracker.markFailure("deepseek", 200);
    expect(tracker.snapshot()[0]).toEqual({
      provider: "deepseek",
      available: false,
      consecutiveFailures: 2,
      lastFailureAt: 200,
    });
  });

  it("success resets failures", () => {
    const tracker = createProviderHealthTracker(2);
    tracker.markFailure("claude", 100);
    tracker.markFailure("claude", 200);
    tracker.markSuccess("claude");
    expect(tracker.snapshot()).toEqual([
      { provider: "claude", available: true, consecutiveFailures: 0 },
    ]);
  });

  it("supports explicit unavailability and reset", () => {
    const tracker = createProviderHealthTracker();
    tracker.markUnavailable("gemini", 300);
    expect(tracker.snapshot()[0]?.available).toBe(false);
    tracker.reset("gemini");
    expect(tracker.snapshot()[0]).toEqual({
      provider: "gemini",
      available: true,
      consecutiveFailures: 0,
    });
  });
});
