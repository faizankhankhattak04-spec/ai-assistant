# Phase 1 — Personal AI Core

## Status

**Phase 1 core implementation complete** on branch `phase-1/personal-ai-core`.

## Completed

- Created isolated `src/personal-ai/` namespace.
- Added provider-neutral task/model/device contracts.
- Added deterministic model routing based on capability, health, latency, and cost preference.
- Added provider-health tracking with failure threshold, unavailable state, recovery, and reset.
- Added focused Vitest coverage for routing, health transitions, fallback ordering, and runtime selection.
- Added `selectRuntimeModel()` as the provider-neutral runtime selection boundary.
- Exported the Personal AI router, health tracker, and runtime selection API.
- Verified the design against OpenClaw's existing runtime-plan and LLM provider contracts.
- Kept provider-specific HTTP/auth/streaming logic inside OpenClaw's existing provider machinery.
- Added no API clients and stored no secrets.

## OpenClaw integration boundary

The integration is intentionally an **adapter boundary**, not a replacement for OpenClaw's model runtime.

`src/personal-ai/integration/runtime-selection.ts` converts a Personal AI task plus already-registered OpenClaw model candidates into an OpenClaw-compatible `provider/model` reference. OpenClaw remains responsible for credential resolution, model materialization, provider plugins, streaming, tool calling, transport, retries, and runtime policy.

This keeps the personal router from bypassing OpenClaw's existing security and provider contracts.

## Runtime flow

```text
Task
  -> Personal AI router
  -> provider/model decision
  -> OpenClaw runtime-plan/model materialization
  -> existing provider adapter
  -> model request
```

## Provider health

The health tracker is deliberately independent from provider credentials. It records operational state only:

- consecutive failures
- last failure timestamp
- availability
- explicit reset/recovery

No API keys, tokens, or credential payloads are recorded.

## Test coverage

The added tests cover:

1. capability filtering
2. low-cost routing
3. unhealthy-provider exclusion
4. no-eligible-model failure
5. health threshold transitions
6. successful recovery
7. explicit unavailable/reset behavior
8. runtime provider/model reference creation

## Verification limitation

The GitHub integration available to this session can inspect and write repository files but cannot execute the repository's Node/pnpm toolchain locally. Therefore this phase is **code-complete but execution-verified only when the project is run in a real checkout/CI environment**.

Recommended local verification:

```bash
pnpm install
pnpm exec vitest run src/personal-ai
pnpm exec tsc --noEmit
```

If the repository's package scripts define a stricter canonical check, use those checks as the final gate.

## Guardrails

- Preserve upstream OpenClaw behavior unless the Personal AI path is explicitly selected.
- Keep provider-specific behavior inside provider-owned adapters.
- Never log or persist API keys, tokens, passwords, or device secrets.
- High-risk actions require the permission layer and must not be authorized by voice recognition alone.
- Do not replace OpenClaw's existing auth, streaming, tool-calling, or model-materialization machinery with duplicate implementations.

## Next phase

Phase 2 should build the **shared memory + authenticated device registry + permission policy** on top of these contracts.
