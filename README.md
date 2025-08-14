## Cursor TDD/ATDD Agent

![CI](https://github.com/brunitom/cursor-tdd-agent/actions/workflows/ci.yml/badge.svg)
![Publish](https://github.com/brunitom/cursor-tdd-agent/actions/workflows/publish.yml/badge.svg)

### Quick Start

Prerequisites:

- Node.js >= 18
- Git installed

Install and initialize in 30 seconds:

```bash
npm i
node index.js init

# Optional: append a git diff summary into memory-bank/assessment.md
node index.js assess --diff origin/main..HEAD --write
```

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
 - Cross-model compatibility: `.cursor/rules/compatibility.mdc` enforces concise outputs, avoids chain-of-thought, favors citations over long code pastes, and adds post-edit test/lint discipline with soft length caps.

### Install

Use locally in a repository (recommended for first run):

```bash
npm i
node index.js init
```

Global install for system-wide CLI:

```bash
npm install -g cursor-tdd-agent
cursor-tdd-agent init
```

### Daily usage

- In Cursor chat:
  - Say your requirement in natural language → the agent enters PLAN, evaluates it, proposes tests, and asks for confirmation.
  - Type "ASSESS" → get repo/stack/test surface, risks, and optional diff summary.
  - Type "PLAN" → get Test Matrix with Must/Should/Could and minimal implementation steps.
  - Type "ACT" or "CONFIRM TEST PLAN" → agent generates tests first (RED), then minimal code to pass (GREEN), and can propose refactors.
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

Command recipe:

```bash
# 1) Install the agent and initialize
node index.js init

# 2) Summarize current delta and write results
node index.js assess --diff HEAD~3..HEAD --write

# 3) In Cursor chat: PLAN → ACT (guided changes)
```

2. Change in a project with some tests but low confidence

- ASSESS: build a `testInventory.md`, highlight `coverageGaps.md`, update `riskMatrix.md`, and index specs.
- PLAN: prioritize missing high-value tests (contract/integration for boundaries, unit for pure logic), order Must/Should/Could.
- ACT: add targeted tests, minimize mocking to boundaries, stabilize flakiness, keep updates documented.

Command recipe:

```bash
node index.js assess --diff origin/main..feature-branch --write
# Review memory-bank/assessment.md, coverageGaps.md, riskMatrix.md
# In Cursor chat: PLAN to derive the Test Matrix and steps
```

3. New project from scratch

- ASSESS: detect stack and initialize context; index any initial specs.
- PLAN: scaffold the minimal harness and propose a few high-signal acceptance tests plus core unit tests.
- ACT: generate failing tests first, implement the smallest code to pass, document decisions and progress.

Command recipe:

```bash
mkdir new-service && cd new-service
git init && npm init -y
npm i cursor-tdd-agent --save-dev
node node_modules/.bin/cursor-tdd-agent init
```

### Files created/used

- `.cursor/rules/`: `core.mdc`, `assess.mdc`, `tdd-playbook.mdc`, `generation.mdc`, `memory-bank.mdc`, `compatibility.mdc`, `self-evaluation.mdc`
- `memory-bank/`: `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`, `testPlan.md`, `testInventory.md`, `coverageGaps.md`, `riskMatrix.md`, `assessment.md`, `specSources.md`

### Command cheat sheet

```bash
npm i                     # install dependencies
node index.js init        # install .cursor/rules and memory-bank templates
node index.js assess --diff origin/main..HEAD --write  # append diff summary
```

### CLI ↔ Chat mapping

| Chat mode | What it does                                     | Closest CLI                                        |
| --------- | ------------------------------------------------ | -------------------------------------------------- |
| ASSESS    | Analyze repo/test surface and optional diff      | `node index.js assess --diff base..head [--write]` |
| PLAN      | Propose Test Matrix, risks, cheapest-first steps | n/a (produces docs in memory bank)                 |
| ACT       | Tests-first edits, minimal implementation, docs  | `node index.js init` + guided changes              |

### Example output (assess diff)

```text
# Change Delta origin/main..HEAD

## Summary
<git --stat output>

## Changed Files (name-status)
<git --name-status output>

## Categorization
- Source:
  - src/index.js
- Tests:
  - test/unit/utils.test.js
- Contracts/Schemas: none
- Config/CI:
  - .github/workflows/ci.yml
- Migrations: none
- External Specs:
  - test-specs/login.feature
```

### CI/CD and publishing

- CI runs on pushes and PRs: lint, format check, tests on Node 16/18/20 and 3 OSes
- Publishing to NPM is automated via `Publish` workflow
  - Add `NPM_TOKEN` in GitHub → Settings → Secrets and variables → Actions
  - Create a GitHub Release with tag `vX.Y.Z` to publish
  - Or run the workflow manually and choose patch/minor/major

### Troubleshooting

- Node version errors (commander >= v12 requires Node 18+): upgrade Node
- Git push auth errors: prefer SSH; add your SSH key and set remote to `git@github.com:...`
- assess errors in non-git dirs: run `git init` and commit at least once
- macOS permissions: avoid protected system paths; run in a project directory

### License and contributions

MIT License. PRs welcome: tests-first, keep changes focused, update the memory bank docs where relevant.
