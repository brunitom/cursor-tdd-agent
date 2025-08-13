const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const pkg = require('../../package.json');

describe('Basic CLI Tests', () => {
  const originalCwd = process.cwd();

  afterEach(() => {
    // Clean up any created files in the test directory
    const testFiles = ['.cursor', 'memory-bank'];
    testFiles.forEach((file) => {
      const fullPath = path.join(originalCwd, file);
      if (fs.pathExistsSync(fullPath)) {
        fs.removeSync(fullPath);
      }
    });
  });

  describe('help and version', () => {
    it('should show help when no arguments provided', () => {
      const output = execSync('node index.js', {
        encoding: 'utf8',
        cwd: originalCwd,
      });

      expect(output).toContain('Usage: cursor-tdd-agent');
      expect(output).toContain('Commands:');
      expect(output).toContain('init');
      expect(output).toContain('assess');
    });

    it('should show version when --version flag is used', () => {
      const output = execSync('node index.js --version', {
        encoding: 'utf8',
        cwd: originalCwd,
      });

      expect(output.trim()).toBe(pkg.version);
    });

    it('should show help when --help flag is used', () => {
      const output = execSync('node index.js --help', {
        encoding: 'utf8',
        cwd: originalCwd,
      });

      expect(output).toContain('Usage: cursor-tdd-agent');
      expect(output).toContain('Commands:');
    });
  });

  describe('init command', () => {
    it('should create .cursor/rules and memory-bank directories', () => {
      const output = execSync('node index.js init', {
        encoding: 'utf8',
        cwd: originalCwd,
      });

      expect(output).toContain('Initializing Cursor TDD/ATDD Agent');
      expect(output).toContain('Setup complete');

      // Verify directories were created
      expect(fs.pathExistsSync('.cursor/rules')).toBe(true);
      expect(fs.pathExistsSync('memory-bank')).toBe(true);

      // Verify some key files exist
      expect(fs.pathExistsSync('.cursor/rules/core.mdc')).toBe(true);
      expect(fs.pathExistsSync('memory-bank/projectbrief.md')).toBe(true);
    });

    it('should handle skip-memory flag', () => {
      const output = execSync('node index.js init --skip-memory', {
        encoding: 'utf8',
        cwd: originalCwd,
      });

      expect(output).toContain('Skipping memory-bank initialization');

      // Rules should exist, memory bank should not
      expect(fs.pathExistsSync('.cursor/rules')).toBe(true);
      expect(fs.pathExistsSync('memory-bank')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle unknown commands', () => {
      expect(() => {
        execSync('node index.js unknown-command', {
          encoding: 'utf8',
          cwd: originalCwd,
        });
      }).toThrow();
    });

    it('should handle unknown flags', () => {
      expect(() => {
        execSync('node index.js init --unknown-flag', {
          encoding: 'utf8',
          cwd: originalCwd,
        });
      }).toThrow();
    });
  });
});
