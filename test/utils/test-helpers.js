const fs = require('fs-extra');
const path = require('path');
const os = require('os');

/**
 * Create a temporary directory for testing
 */
async function createTempDir() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cursor-tdd-test-'));
  return tempDir;
}

/**
 * Clean up temporary directory
 */
async function cleanupTempDir(tempDir) {
  if (tempDir && tempDir.includes('cursor-tdd-test-')) {
    await fs.remove(tempDir);
  }
}

/**
 * Mock console methods for testing output
 */
function mockConsole() {
  const originalLog = console.log;
  const originalError = console.error;
  const logs = [];
  const errors = [];

  console.log = (message) => logs.push(message);
  console.error = (message) => errors.push(message);

  return {
    logs,
    errors,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
    },
  };
}

/**
 * Create a mock git repository structure
 */
async function createMockGitRepo(tempDir) {
  await fs.ensureDir(path.join(tempDir, '.git'));
  await fs.writeFile(path.join(tempDir, 'README.md'), '# Test Repo');
  await fs.writeFile(path.join(tempDir, 'src/index.js'), 'console.log("test");');
}

module.exports = {
  createTempDir,
  cleanupTempDir,
  mockConsole,
  createMockGitRepo,
};
