# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added

- Initial release of cursor-tdd-agent
- CLI tool for installing Cursor TDD/ATDD rules and memory bank templates
- `init` command to set up .cursor/rules and memory-bank directories
- `assess` command for git diff analysis with file categorization
- Support for external spec files (.feature, .csv, .xml, .json)
- Template system for rules and memory bank files
- Cross-platform compatibility (Windows, macOS, Linux)
- Comprehensive test suite with Jest
- ESLint and Prettier configuration for code quality
- GitHub Actions CI/CD pipeline
- NPM package configuration for publication

### Features

- **Template Installation**: Automated setup of Cursor IDE rules and memory bank
- **Git Integration**: Diff analysis with intelligent file categorization
- **Spec Management**: Automatic detection and indexing of specification files
- **Memory Bank**: Persistent context management across TDD/ATDD sessions
- **CLI Interface**: User-friendly command-line interface with help and validation

### Technical

- Node.js >=16.0.0 compatibility
- Dependencies: commander, fs-extra, simple-git, debug
- Test coverage with Jest framework
- Code quality enforcement with ESLint and Prettier
- Automated CI/CD with GitHub Actions
- Multi-platform testing and deployment
