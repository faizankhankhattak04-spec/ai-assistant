# Personal AI — Technical Architecture

**Status:** Architecture baseline  
**Foundation:** OpenClaw  
**Repository:** `faizankhankhattak04-spec/ai-assistant`  
**Target devices:** Dell Latitude E7470 (16 GB RAM, 500 GB SSD), Android phone, Android tablet  

## 1. Vision

Build a personal, multi-device AI assistant on top of OpenClaw rather than rebuilding its Gateway, agent, provider, browser, voice, and plugin foundations.

The system should provide one consistent AI experience across laptop, phone, and tablet, use multiple cloud AI providers, fall back intelligently when a provider is unavailable, support voice commands, control approved device capabilities, maintain shared memory, and execute multi-step tasks with verification.

## 2. High-Level Architecture

```text
                         USER
                    Voice / Text / UI
                            |
                            v
                    +---------------+
                    |    Gateway    |
                    | Auth / Routing|
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Agent Runtime |
                    +-------+-------+
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
   +-------------+   +-------------+   +-------------+
   | Model Router|   |    Memory   |   | Permissions |
   +------+------+   +------+------+   +------+------+
          |                 |                 |
          +-----------------+-----------------+
                            |
                            v
                     +-------------+
                     |   Tool Bus  |
                     +------+------+ 
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
      Browser           Computer          Device Nodes
       Tools             Tools          Laptop/Phone/Tablet
```

## 3. Components

### 3.1 Gateway — KEEP

OpenClaw Gateway remains the central control plane. It owns sessions, networking, authentication, remote connections, and operator/device communication.

**Policy:** Extend it only where necessary. Do not create a competing backend unless a concrete requirement cannot be met by the existing Gateway.

### 3.2 Agent Runtime — KEEP + EXTEND

The existing agent runtime is the execution brain. It receives a task, maintains context, selects tools, calls models, executes actions, and returns results.

Our extensions will add stronger task planning, verification, autonomous continuation, and structured failure recovery.

### 3.3 Model Router — NEW / MAJOR EXTENSION

Create a provider-neutral routing layer above the existing model/provider infrastructure.

Responsibilities:

- classify task type
- consider model capability
- consider context requirements
- consider latency
- consider estimated cost
- check provider availability
- select primary model
- retry/fallback to another provider
- record routing decisions and failures

Initial providers:

1. OpenAI
2. Anthropic/Claude
3. DeepSeek
4. Google/Gemini
5. Local model provider such as Ollama when available

The router must never expose API secrets to the model or client.

### 3.4 Shared Memory — EXTEND

Provide a unified memory layer usable by all devices and sessions.

Memory classes:

- short-term conversation/session state
- long-term user preferences
- project/workflow memory
- device registry and capabilities
- task history
- model/provider health history

Sensitive secrets must not be stored as ordinary memory.

### 3.5 Tool Bus — KEEP + EXTEND

Treat capabilities as explicit tools instead of embedding device behavior directly inside model code.

Examples:

- browser.open
- browser.click
- browser.type
- browser.read
- browser.screenshot
- computer.open_app
- computer.read_file
- computer.write_file
- device.status
- device.notify
- github.read
- github.modify
- task.run

Every tool must declare permissions and risk level.

### 3.6 Device Manager — NEW

Create a unified device registry.

```text
Device Manager
  |- Laptop       online/offline
  |- Phone        online/offline
  `- Tablet       online/offline
```

Each device runs a lightweight authenticated agent/node. The central AI decides which device should execute an action.

Device communication must use authenticated and encrypted channels.

### 3.7 Voice Layer — EXTEND

Use OpenClaw's existing realtime voice/TTS/STT infrastructure where possible.

Target flow:

```text
Microphone -> Speech/Realtime -> Agent -> Tool -> Result -> TTS
```

Voice is an interface, not a separate AI brain. Voice requests enter the same agent/tool pipeline as text requests.

### 3.8 Browser Control — KEEP + EXTEND

Use the existing browser infrastructure as the browser tool layer.

The model should request explicit browser actions through tools rather than receive unrestricted browser access.

### 3.9 Security & Permissions — MAJOR EXTENSION

Use defense in depth:

- authenticated devices
- encrypted transport
- scoped credentials
- least-privilege tools
- per-tool permissions
- audit logging
- confirmation for sensitive/destructive actions

Suggested risk levels:

- **L0:** read-only/safe
- **L1:** reversible local actions
- **L2:** external communication or important modifications; confirmation normally required
- **L3:** destructive, financial, account-security, or production actions; explicit confirmation required

Voice authentication alone must never be treated as sufficient authorization for high-risk operations.

## 4. Autonomous Task Engine

The personal AI should eventually support this loop:

```text
Goal
  -> Understand
  -> Plan
  -> Execute
  -> Observe
  -> Verify
  -> Repair/retry if needed
  -> Complete
  -> Report
```

The agent should continue through safe intermediate steps without requesting approval for every tiny operation. High-risk actions remain gated by the permission system.

## 5. Model Routing Policy

Example:

```text
Task
 |
 +-- coding/complex reasoning -> strongest suitable model
 +-- high-volume/simple task -> lower-cost suitable model
 +-- private/offline task -> local model when capable
 +-- vision/audio task -> compatible multimodal model
 +-- provider failure -> fallback provider
```

Routing should be configurable and observable.

## 6. Cross-Device Operation

The Gateway is the coordination point; devices are authenticated execution nodes.

```text
                 Gateway
               /    |    \
              /     |     \
          Laptop   Phone   Tablet
```

A command such as `open my project` should be routed to the device that owns the requested resource or capability.

## 7. Data & Secrets

Use a database for structured state and memory. Use secure secret handling for API keys, OAuth credentials, device keys, and other credentials.

Never put API keys, passwords, tokens, or private credentials into Git, ordinary memory, prompts, logs, or task history.

`.env.example` may document variable names but must never contain real credentials.

## 8. Development Strategy

### Phase 0 — Baseline

- preserve upstream OpenClaw behavior
- document architecture
- establish tests and build checks
- create backup/tag before major modifications

### Phase 1 — Personal Core

- personal configuration layer
- provider health tracking
- model router
- shared memory foundation
- unified device registry

### Phase 2 — Voice + Devices

- voice-first interaction
- laptop agent
- Android phone agent
- Android tablet agent
- secure device pairing

### Phase 3 — Tools & Automation

- browser control
- computer control
- GitHub/project tools
- file tools
- autonomous task engine

### Phase 4 — Reliability

- automated fallback
- health checks
- retries
- audit logs
- security hardening
- integration tests

### Phase 5 — Advanced Personal AI

- richer long-term memory
- proactive workflows
- project-aware coding agent
- offline/local fallback
- advanced multi-agent workflows

## 9. What We Will NOT Rewrite

Unless testing proves a concrete reason:

- OpenClaw Gateway foundation
- existing agent runtime foundation
- existing model provider adapters
- credential mechanisms
- existing browser infrastructure
- existing voice infrastructure
- existing plugin/tool framework

## 10. Engineering Rules

1. Prefer extension points over invasive rewrites.
2. Keep upstream functionality working.
3. Add tests with every significant feature.
4. Never commit secrets.
5. Default to least privilege.
6. Separate planning from execution.
7. Make risky actions explicit and auditable.
8. Keep device agents lightweight.
9. Keep provider-specific logic behind adapters/router interfaces.
10. Every autonomous task must have a bounded execution context and a verification step.

## 11. First Implementation Targets

The first code changes should be limited to:

1. architecture/config scaffolding
2. provider health and routing abstraction
3. shared device registry abstraction
4. permission/risk model
5. tests for these foundations

No broad refactor should happen before these foundations are tested.

## 12. Success Criteria

The project is considered successful when one authenticated user can:

- speak to the AI from an authorized device
- receive a response using the best available configured model
- automatically fall back when a provider fails
- access shared task/session context across devices
- ask the AI to perform an approved laptop/browser action
- route an approved action to phone or tablet
- see clear confirmation/results
- prevent unauthorized or destructive actions
- inspect logs/history for important operations

---

**This document is the architecture baseline. Implementation decisions should update this document when the real code reveals a better or safer approach.**
