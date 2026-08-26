# Phase 2 — Shared Memory + Device Registry + Permission System

## Status

**Foundation implementation complete** on `phase-2/shared-memory-devices-permissions`.

## Implemented

- Provider-independent shared memory contracts with scopes and sensitivity.
- In-memory memory store for deterministic development/testing.
- Authenticated device registry contracts and implementation.
- Device capability declarations with risk levels.
- Conservative permission policy with confirmation gates.
- Phase 2 public exports.

## Architecture

```text
                    Personal AI
                        |
          +-------------+-------------+
          |             |             |
        Memory       Devices      Permissions
          |             |             |
       session       laptop       risk 0-3
       personal      phone        confirm
       project       tablet       destructive
       task          other
```

## Memory rules

- Secrets are represented as a sensitivity class but are not automatically persisted.
- The Phase 2 in-memory store is a development adapter, not the final persistent database.
- The final store should support encryption/access control before sensitive memory is enabled.

## Device rules

- A device is not trusted merely because it is registered.
- `authenticated` is explicit state and must eventually be backed by real device authentication/cryptographic identity.
- Capabilities carry a risk level so the agent can request the minimum required permission.

## Permission rules

- L0: safe/read-only actions can proceed.
- L1: reversible low-risk actions can proceed for authorized actors.
- L2: important modifications/external effects require confirmation.
- L3 or destructive actions are denied until explicit confirmation/authorization is supplied.
- Voice recognition alone must never authorize high-risk operations.

## Not yet production-ready

This phase intentionally provides contracts and deterministic local implementations. It does **not** yet connect arbitrary remote devices, persist memory in a database, encrypt memory, or authorize OS-level actions.

## Next integration targets

1. Connect memory to OpenClaw session/task lifecycle.
2. Replace in-memory persistence with a durable encrypted store.
3. Connect the device registry to OpenClaw's authenticated node/device layer.
4. Enforce permission evaluation at tool execution boundaries.
5. Add audit events for permission decisions and device actions.
6. Add integration tests with real OpenClaw tool/runtime paths.
