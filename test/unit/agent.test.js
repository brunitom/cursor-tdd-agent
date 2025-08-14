const path = require('path');

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(undefined),
  ensureFile: jest.fn().mockResolvedValue(undefined),
  pathExists: jest.fn(),
  copy: jest.fn().mockResolvedValue(undefined),
  appendFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
}));

jest.mock('simple-git', () => {
  const fetch = jest.fn().mockResolvedValue(undefined);
  const revparse = jest.fn();
  const diff = jest.fn();
  const factory = () => ({ fetch, revparse, diff });
  factory.__mocks = { fetch, revparse, diff };
  return factory;
});

describe('lib/agent public APIs (code-agnostic tests)', () => {
  const fs = require('fs-extra');
  const simpleGit = require('simple-git');
  const { __mocks: gitMocks } = simpleGit;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const agent = require('../../lib/agent');

  describe('formatList', () => {
    it('returns "none" for empty or falsy lists', () => {
      expect(agent.formatList('Source', [])).toBe('- Source: none');
      expect(agent.formatList('Tests', null)).toBe('- Tests: none');
    });

    it('formats non-empty lists with bullets', () => {
      const result = agent.formatList('Files', ['a.js', 'b.js']);
      expect(result).toBe('- Files:\n  - a.js\n  - b.js');
    });
  });

  describe('copyDirectory', () => {
    it('overwrites when destination missing or force=true', async () => {
      fs.pathExists.mockResolvedValueOnce(false);
      const res = await agent.copyDirectory({
        source: '/src',
        destination: '/dest',
        force: false,
      });
      expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname('/dest'));
      expect(fs.copy).toHaveBeenCalledWith('/src', '/dest', { overwrite: true });
      expect(res).toEqual({ created: true });
    });

    it('skips existing files when not forced', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      await agent.copyDirectory({ source: '/src', destination: '/dest', force: false });
      const copyArgs = fs.copy.mock.calls[0];
      expect(copyArgs[0]).toBe('/src');
      expect(copyArgs[1]).toBe('/dest');
      expect(copyArgs[2]).toEqual(
        expect.objectContaining({ filter: expect.any(Function) })
      );
    });
  });

  describe('ensureMemoryCoreFiles', () => {
    it('copies core memory files when they do not exist', async () => {
      fs.pathExists.mockResolvedValue(false);
      await agent.ensureMemoryCoreFiles(false);
      // 12 core files expected
      expect(fs.copy.mock.calls.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('assessDiff (write=false)', () => {
    it('prints a categorized diff report using public CLI observables', async () => {
      gitMocks.fetch.mockResolvedValue(undefined);
      // Simulate base not resolvable; fallback to HEAD~1 success
      gitMocks.revparse
        .mockRejectedValueOnce(new Error('no base'))
        .mockResolvedValueOnce('ok');

      gitMocks.diff
        .mockResolvedValueOnce('M\tsrc/index.js') // name-status
        .mockResolvedValueOnce(' src/index.js | 1 +') // --stat
        .mockResolvedValueOnce('src/index.js'); // name-only

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await agent.assessDiff({ baseRef: undefined, headRef: undefined, write: false });

      const output = logSpy.mock.calls.map((c) => c.join(' ')).join('\n');
      expect(output).toContain('# Change Delta');
      expect(output).toContain('## Categorization');
      expect(output).toContain('- Source:');

      logSpy.mockRestore();
    });
  });

  describe('init (smoke, boundaries mocked)', () => {
    it('installs rules and memory bank with observable CLI output', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await agent.init({ force: false, skipMemory: false });
      const output = logSpy.mock.calls.map((c) => c.join(' ')).join('\n');
      expect(output).toContain('Initializing Cursor TDD/ATDD Agent');
      expect(output).toContain('Rules installed at .cursor/rules');
      expect(output).toContain('Memory bank ready at memory-bank/');
      logSpy.mockRestore();
    });
  });
});


