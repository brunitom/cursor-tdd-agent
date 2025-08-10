## Cursor TDD/ATDD Agent

### What this solves

- **Behavior confidence without test overhead**: Developers often skip tests or rely on line coverage. This agent prioritizes behavior-focused, risk-driven tests that deliver confidence quickly.
- **Legacy safety**: Adds tests to untested code via characterization, approval, and seam-based strategies.
- **No instruction drift**: Uses a Memory Bank so guidance, test strategy, and decisions persist across sessions (inspired by Cursor Memory Bank).

Reference: [Cursor Memory Bank digest](https://gitdocs1.s3.amazonaws.com/digests/tacticlaunch-cursor-bank/5fbf150b-675e-4274-9514-97e8846ae3fb.txt)

### How it works

- Installs `.cursor/rules/` that enforce a test-first workflow and structured outputs.
- Creates a `memory-bank/` where the agent reads/writes current context, risks, plans, and progress.
- Operates in three modes:
  - **ASSESS**: Analyze repository, test surface, risks, and (optionally) a git diff.
  - **PLAN**: Produce a Test Matrix (unit/integration/contract), risks/invariants, and a cheapest-first implementation strategy.
  - **ACT**: Generate tests first, then the minimal code to pass, and update the Memory Bank.
- Diff-aware ASSESS: summarize `base..head` changes and append to `memory-bank/assessment.md`.
- Spec ingestion: indexes `.feature`, `.csv`, `.xml`, `.json` in `test-specs/` (or root) and records them in `memory-bank/specSources.md`.

### Install

```bash
npm i
node index.js init
```

### Daily usage

- In Cursor chat:
  - Type "ASSESS" → get repo/stack/test surface, risks, and optional diff summary.
  - Type "PLAN" → get Test Matrix with Must/Should/Could and minimal implementation steps.
  - Type "ACT" → tests-first changes, minimal implementation, then Memory Bank updates.
  - Say "update memory bank" anytime to sync documentation.

- CLI helpers (optional):

```bash
# Append a diff summary to memory-bank/assessment.md
node index.js assess --diff origin/main..HEAD --write
```

### Where to add specs

- Put requirements or test scenarios under `test-specs/` (or project root) as `.feature`, `.csv`, `.xml`, or `.json`.
- ASSESS indexes them into `memory-bank/specSources.md`.
- PLAN maps them to tests: `.feature` → acceptance; `.csv` → parameterized; `.xml/.json` → domain/contract.

### How to use in your 3 cases

1. Change in a project with no tests

- ASSESS: confirm no harness; summarize architecture/boundaries and risks; find any specs.
- PLAN: propose a minimal safety net (characterization/approval tests on critical paths), Test Matrix, and cheapest implementation path.
- ACT: generate tests first, set up minimal runner/fixtures, implement the change, update Memory Bank.

2. Change in a project with some tests but low confidence

- ASSESS: build a `testInventory.md`, highlight `coverageGaps.md`, update `riskMatrix.md`, and index specs.
- PLAN: prioritize missing high-value tests (contract/integration for boundaries, unit for pure logic), order Must/Should/Could.
- ACT: add targeted tests, minimize mocking to boundaries, stabilize flakiness, keep updates documented.

3. New project from scratch

- ASSESS: detect stack and initialize context; index any initial specs.
- PLAN: scaffold the minimal harness and propose a few high-signal acceptance tests plus core unit tests.
- ACT: generate failing tests first, implement the smallest code to pass, document decisions and progress.

### Files created/used

- `.cursor/rules/`: `core.mdc`, `assess.mdc`, `tdd-playbook.mdc`, `generation.mdc`, `memory-bank.mdc`
- `memory-bank/`: `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`, `testPlan.md`, `testInventory.md`, `coverageGaps.md`, `riskMatrix.md`, `assessment.md`, `specSources.md`

### Command cheat sheet

```bash
npm i                     # install dependencies
node index.js init        # install .cursor/rules and memory-bank templates
node index.js assess --diff origin/main..HEAD --write  # append diff summary
```
