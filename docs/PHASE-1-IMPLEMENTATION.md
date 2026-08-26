# Phase 1 — Personal AI Core

## Status

Started on branch `phase-1/personal-ai-core`.

## Completed in this slice

- Created isolated `src/personal-ai/` namespace.
- Added provider-neutral task/model/device contracts.
- Added a pure deterministic model-router implementation.
- Router filters unavailable models, checks required capabilities, considers provider health, and produces a fallback chain.
- No provider-specific HTTP clients were added.
- No OpenClaw Gateway behavior was changed.
- No API secrets are stored.

## Deliberately not integrated yet

The router is currently a pure core abstraction. It has not been wired into OpenClaw's production agent/model dispatch path yet. That integration requires direct inspection of the owning provider/model contracts and their tests, followed by build/typecheck/test verification in a real checkout.

## Next implementation steps

1. Verify the existing model/provider contracts and retry semantics.
2. Add provider-health state using the existing runtime/lifecycle patterns.
3. Add focused router tests for capability filtering, deterministic ranking, unavailable providers, and fallback ordering.
4. Add personal-AI configuration only through an existing configuration seam where possible.
5. Add the device registry and permission policy as pure contracts before connecting to real device nodes.
6. Integrate the router with the real model-selection path only after tests prove the contract.

## Guardrails

- Preserve upstream OpenClaw behavior unless the new personal-AI path is explicitly selected.
- Keep provider-specific behavior inside provider-owned adapters.
- Never log or persist API keys, tokens, passwords, or device secrets.
- High-risk actions require the permission layer and must not be authorized by voice recognition alone.
