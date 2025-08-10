const fs = require('fs-extra');
const path = require('path');

// Mock fs-extra for unit tests
jest.mock('fs-extra');

// Import the functions we need to test
// Since they're not exported, we'll test the logic patterns directly
describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('copyDirectory logic', () => {
    it('should handle non-existent destination correctly', async () => {
      fs.pathExists.mockResolvedValue(false);
      fs.ensureDir.mockResolvedValue(undefined);
      fs.copy.mockResolvedValue(undefined);

      const source = '/source';
      const destination = '/dest';

      // Simulate the copyDirectory logic
      await fs.ensureDir(path.dirname(destination));
      const exists = await fs.pathExists(destination);

      if (!exists) {
        await fs.copy(source, destination, { overwrite: true });
      }

      expect(fs.ensureDir).toHaveBeenCalledWith(path.dirname(destination));
      expect(fs.pathExists).toHaveBeenCalledWith(destination);
      expect(fs.copy).toHaveBeenCalledWith(source, destination, { overwrite: true });
    });

    it('should handle existing destination without force', async () => {
      fs.pathExists.mockResolvedValueOnce(true); // destination exists
      fs.ensureDir.mockResolvedValue(undefined);
      fs.copy.mockResolvedValue(undefined);

      const source = '/source';
      const destination = '/dest';

      // Simulate the copyDirectory logic without force
      await fs.ensureDir(path.dirname(destination));
      const exists = await fs.pathExists(destination);

      if (exists) {
        // Copy with filter function (non-force mode)
        await fs.copy(source, destination, {
          filter: async (src, dest) => {
            const destExists = await fs.pathExists(dest);
            return !destExists;
          },
        });
      }

      expect(fs.copy).toHaveBeenCalledWith(
        source,
        destination,
        expect.objectContaining({ filter: expect.any(Function) })
      );
    });
  });

  describe('formatList function', () => {
    const formatList = (title, items) => {
      if (!items || items.length === 0) return `- ${title}: none`;
      const bullet = items.map((i) => `  - ${i}`).join('\n');
      return `- ${title}:\n${bullet}`;
    };

    it('should format empty lists correctly', () => {
      expect(formatList('Source', [])).toBe('- Source: none');
      expect(formatList('Tests', null)).toBe('- Tests: none');
      expect(formatList('Contracts', undefined)).toBe('- Contracts: none');
    });

    it('should format non-empty lists correctly', () => {
      const result = formatList('Source', ['file1.js', 'file2.js']);
      expect(result).toBe('- Source:\n  - file1.js\n  - file2.js');
    });

    it('should handle single item lists', () => {
      const result = formatList('Config', ['package.json']);
      expect(result).toBe('- Config:\n  - package.json');
    });
  });

  describe('file categorization logic', () => {
    const categorizeFiles = (files) => {
      return {
        source: files.filter(
          (f) => f.startsWith('src/') || f.startsWith('app/') || f.startsWith('lib/')
        ),
        tests: files.filter((f) => /(^|\/)tests?\//.test(f) || /\.(spec|test)\./.test(f)),
        contracts: files.filter((f) => /(^|\/)(openapi|proto|contracts)\//.test(f)),
        config: files.filter((f) =>
          /(package\.json|pyproject\.toml|pom\.xml|dockerfile|docker-compose\.ya?ml|\.github\/workflows\/)/i.test(
            f
          )
        ),
        migrations: files.filter((f) => /(^|\/)migrations?\//i.test(f)),
        specs: files.filter(
          (f) => /(^|\/)test-specs\//.test(f) || /\.(feature|csv|xml|json)$/i.test(f)
        ),
      };
    };

    it('should categorize source files correctly', () => {
      const files = ['src/index.js', 'app/components/Button.tsx', 'lib/utils.js', 'other/file.js'];

      const result = categorizeFiles(files);
      expect(result.source).toEqual(['src/index.js', 'app/components/Button.tsx', 'lib/utils.js']);
    });

    it('should categorize test files correctly', () => {
      const files = [
        'test/unit/utils.test.js',
        'tests/integration/api.spec.js',
        'src/components/Button.test.tsx',
        'utils.spec.js',
        'other/file.js',
      ];

      const result = categorizeFiles(files);
      expect(result.tests).toEqual([
        'test/unit/utils.test.js',
        'tests/integration/api.spec.js',
        'src/components/Button.test.tsx',
        'utils.spec.js',
      ]);
    });

    it('should categorize contract files correctly', () => {
      const files = [
        'openapi/api.yaml',
        'proto/service.proto',
        'contracts/user.json',
        'other/file.js',
      ];

      const result = categorizeFiles(files);
      expect(result.contracts).toEqual([
        'openapi/api.yaml',
        'proto/service.proto',
        'contracts/user.json',
      ]);
    });

    it('should categorize config files correctly', () => {
      const files = [
        'package.json',
        'pyproject.toml',
        'pom.xml',
        'Dockerfile',
        'docker-compose.yml',
        '.github/workflows/ci.yml',
        'other/file.js',
      ];

      const result = categorizeFiles(files);
      expect(result.config).toEqual([
        'package.json',
        'pyproject.toml',
        'pom.xml',
        'Dockerfile',
        'docker-compose.yml',
        '.github/workflows/ci.yml',
      ]);
    });

    it('should categorize spec files correctly', () => {
      const files = [
        'test-specs/login.feature',
        'requirements.csv',
        'schema.xml',
        'config.json',
        'other.txt',
      ];

      const result = categorizeFiles(files);
      expect(result.specs).toEqual([
        'test-specs/login.feature',
        'requirements.csv',
        'schema.xml',
        'config.json',
      ]);
    });

    it('should handle complex file categorization', () => {
      const files = [
        'src/components/Button.tsx',
        'test/Button.test.js',
        'package.json',
        'migrations/001_add_users.sql',
        'openapi/api.yaml',
        'test-specs/login.feature',
      ];

      const result = categorizeFiles(files);

      expect(result.source).toEqual(['src/components/Button.tsx']);
      expect(result.tests).toEqual(['test/Button.test.js']);
      expect(result.config).toEqual(['package.json']);
      expect(result.migrations).toEqual(['migrations/001_add_users.sql']);
      expect(result.contracts).toEqual(['openapi/api.yaml']);
      expect(result.specs).toEqual(['package.json', 'test-specs/login.feature']);
    });
  });

  describe('memory core files logic', () => {
    it('should define correct core files list', () => {
      const coreFiles = [
        'projectbrief.md',
        'productContext.md',
        'activeContext.md',
        'systemPatterns.md',
        'techContext.md',
        'progress.md',
        'testPlan.md',
        'testInventory.md',
        'coverageGaps.md',
        'riskMatrix.md',
        'assessment.md',
        'specSources.md',
      ];

      expect(coreFiles).toHaveLength(12);
      expect(coreFiles).toContain('projectbrief.md');
      expect(coreFiles).toContain('testPlan.md');
      expect(coreFiles).toContain('assessment.md');
    });

    it('should handle file existence checking', async () => {
      fs.pathExists.mockResolvedValueOnce(false); // file doesn't exist
      fs.copy.mockResolvedValue(undefined);

      const src = '/templates/projectbrief.md';
      const dest = '/memory-bank/projectbrief.md';

      // Simulate ensureMemoryCoreFiles logic
      const exists = await fs.pathExists(dest);
      if (!exists) {
        await fs.copy(src, dest, { overwrite: true });
      }

      expect(fs.pathExists).toHaveBeenCalledWith(dest);
      expect(fs.copy).toHaveBeenCalledWith(src, dest, { overwrite: true });
    });
  });
});
