# Phase 0 — Baseline & Code-Level Implementation Plan

**Project:** Personal AI built on OpenClaw  
**Branch:** `main`  
**Baseline commit:** `dea09f015ee94bcca7aae5f1aab0f72506322842`  
**OpenClaw package version:** `2026.8.1`  
**License:** MIT  

## 1. Baseline rule

This phase does **not** refactor the OpenClaw runtime. The current OpenClaw behavior is the reference baseline. New personal-AI functionality must be additive and testable.

The baseline commit above includes the architecture document and is the first project-specific documentation checkpoint.

## 2. Current repository facts

- `package.json` identifies the project as `openclaw` version `2026.8.1`.
- The project is TypeScript/Node-based and exposes the `openclaw` CLI entry point.
- The repository has `src/`, `extensions/`, `packages/`, `ui/`, `docs/`, and test infrastructure.
- The existing provider/plugin surface is broad and already includes provider, model, memory, node-host, browser, realtime voice, speech, tool, sandbox, and security-related SDK/runtime contracts.
- Root `AGENTS.md` requires existing-solution preflight, direct dependency inspection where feasible, live verification for user-facing behavior, and scoped `AGENTS.md` review before subtree changes.
- `main` is currently unprotected; CI/review protection should be considered before substantial production work.

## 3. Target architecture mapping

| Capability | Existing owner | Phase 1 action |
|---|---|---|
| Gateway/control plane | `src/gateway/**` | Keep; extend only through existing seams |
| Agent runtime | `src/agents/**` | Keep; add orchestration hooks only where needed |
| Provider/model adapters | provider/plugin surfaces + `extensions/**` | Keep; introduce provider-neutral routing policy |
| Memory | memory/runtime + plugin SDK | Reuse; add personal-memory policy/index where needed |
| Browser | browser runtime/tool surfaces | Reuse; expose controlled actions through tools |
| Voice | realtime voice/speech/TTS surfaces | Reuse; unify voice and text through same agent path |
| Device/node control | node-host/node-selection/device surfaces | Reuse; add unified personal device registry |
| Permissions | auth/approval/exec/sandbox surfaces | Reuse; define personal-AI risk policy |
| Autonomous tasks | agent/tool/task infrastructure | Add bounded planner/executor/verification layer |

## 4. Phase 1 code targets

### 4.1 Personal AI namespace

Create a clearly isolated namespace for project-specific logic rather than scattering changes through core OpenClaw files.

Proposed area:

```text
src/personal-ai/
  router/
  memory/
  devices/
  permissions/
  tasks/
  health/
  config/
```

Exact placement may change after inspecting existing owner boundaries and scoped guides. Do not create these directories blindly.

### 4.2 Model router

Introduce interfaces first:

```text
TaskProfile
  - task type
  - required capabilities
  - context requirement
  - latency preference
  - cost preference
  - privacy requirement

ProviderHealth
  - availability
  - recent failures
  - latency
  - rate-limit state

RoutingDecision
  - provider
  - model
  - reason
  - fallback chain
```

The router should call existing provider contracts rather than implement provider-specific HTTP clients.

### 4.3 Device registry

Represent each authorized device with:

```text
Device
  id
  name
  platform
  capabilities
  connection status
  authentication state
  last seen
  allowed tools
```

Do not store device secrets in this registry.

### 4.4 Permission policy

Every new tool/action should have a declared risk level:

- `L0` safe/read-only
- `L1` reversible local action
- `L2` external communication or important modification
- `L3` destructive, financial, credential, or production action

The policy engine decides whether the current authenticated user/device may execute the action and whether confirmation is required.

### 4.5 Task engine

Add a bounded task state machine only after the tool and permission contracts are stable:

```text
requested -> planned -> executing -> verifying -> completed
                              |              |
                              +-> failed <--+
```

The task engine must have time/step limits and must preserve a visible outcome.

## 5. Model routing behavior

Initial routing policy:

1. Filter models by required capability.
2. Remove unavailable/unhealthy providers.
3. Respect privacy requirements.
4. Score remaining models by capability, reliability, latency, and cost.
5. Execute through the existing provider contract.
6. On retryable provider failure, move to the next permitted fallback.
7. Record the decision and outcome without recording secrets.

Provider-specific selection rules must remain configurable rather than hardcoded into agent prompts.

## 6. Testing strategy

Before Phase 1 is considered complete:

- Existing OpenClaw tests must remain green for touched areas.
- New router tests cover capability filtering, provider failure, fallback, and deterministic selection.
- Device tests cover registration, authentication state, offline state, and capability filtering.
- Permission tests cover all risk levels and confirmation boundaries.
- Task tests cover success, retryable failure, permanent failure, timeout, and verification failure.
- At least one integration path must exercise the real project flow rather than only mocks when feasible.

## 7. Safety baseline

Never commit:

- API keys
- OAuth tokens
- passwords
- private device keys
- session secrets
- personal private data

Keep `.env.example` as documentation only.

High-risk device control must require explicit authorization. Voice recognition is an input method, not sufficient proof for destructive or security-sensitive operations.

## 8. Git workflow

Before significant implementation:

1. Keep the baseline commit immutable as a reference.
2. Create a feature branch for Phase 1.
3. Make small coherent commits.
4. Run formatting/typecheck/tests before merging.
5. Review production-vs-test LOC change.
6. Update architecture documentation when an implementation decision changes the design.

## 9. First implementation order

```text
A. Repository/build verification
        ↓
B. Existing provider contract verification
        ↓
C. Personal-AI config/schema seam
        ↓
D. Provider health abstraction
        ↓
E. Model router
        ↓
F. Device registry
        ↓
G. Permission/risk policy
        ↓
H. Tests + integration verification
        ↓
I. Voice/device execution
        ↓
J. Autonomous task engine
```

Do **not** start with autonomous PC control. Establish provider routing, device identity, and permission boundaries first.

## 10. Definition of done for Phase 0

Phase 0 is complete when:

- the OpenClaw baseline is identified by commit SHA;
- license and project version are recorded;
- project-specific architecture is documented;
- existing owner boundaries are identified;
- the first implementation seams are defined;
- security and testing rules are explicit;
- no production runtime behavior has been changed solely for Phase 0.

**Next phase:** Phase 1 — Personal AI Core, beginning with build/test verification and the provider-routing seam.
