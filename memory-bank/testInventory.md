# Test Inventory

## Unit Tests

- **test/unit/utils.test.js**: Core utility function logic patterns
  - copyDirectory behavior simulation
  - File categorization logic (source, tests, config, contracts, migrations, specs)
  - formatList function for output formatting
  - Memory bank core files list validation
  - File existence checking patterns
- **Coverage**: Logic patterns and edge cases for file operations

## Integration Tests

- **test/integration/basic-cli.test.js**: CLI command validation
  - Help and version display
  - Init command with file system operations
  - Flag handling (--skip-memory, --force)
  - Error handling for unknown commands/flags
- **Coverage**: End-to-end CLI workflows in real environment

## Contract / E2E Tests

- **GitHub Actions workflows**: CI/CD pipeline testing
  - Multi-platform testing (Ubuntu, Windows, macOS)
  - Multi-Node version testing (16, 18, 20)
  - NPM package installation validation
  - Security audit integration

## Flakiness & Quarantine

- **No flaky tests identified**: All tests are deterministic
- **No quarantined suites**: All tests pass consistently

## Ownership & Reviewers

- **Primary Owner**: Development team
- **Test Strategy**: TDD approach with logic pattern testing
- **Coverage Philosophy**: Focus on business logic over implementation coverage
