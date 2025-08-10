#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const simpleGit = require('simple-git');
const debug = require('debug')('cursor-tdd-agent');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const RULES_SRC = path.join(TEMPLATES_DIR, 'rules');
const MEMORY_SRC = path.join(TEMPLATES_DIR, 'memory-bank');

const RULES_DEST = path.join(process.cwd(), '.cursor', 'rules');
const MEMORY_DEST = path.join(process.cwd(), 'memory-bank');
const git = simpleGit();

function logInfo(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

function logError(message) {
  // eslint-disable-next-line no-console
  console.error(message);
}

async function copyDirectory({ source, destination, force }) {
  await fs.ensureDir(path.dirname(destination));
  const exists = await fs.pathExists(destination);
  if (exists && !force) {
    await fs.copy(source, destination, {
      filter: async (src, dest) => {
        const destExists = await fs.pathExists(dest);
        return !destExists; // skip files that already exist
      },
    });
    return { created: false };
  }
  await fs.copy(source, destination, { overwrite: true });
  return { created: true };
}

async function ensureMemoryCoreFiles(force) {
  await fs.ensureDir(MEMORY_DEST);
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
  for (const fileName of coreFiles) {
    const src = path.join(MEMORY_SRC, fileName);
    const dest = path.join(MEMORY_DEST, fileName);
    const exists = await fs.pathExists(dest);
    if (!exists || force) {
      await fs.copy(src, dest, { overwrite: true });
    }
  }
}

function formatList(title, items) {
  if (!items || items.length === 0) return `- ${title}: none`;
  const bullet = items.map((i) => `  - ${i}`).join('\n');
  return `- ${title}:\n${bullet}`;
}

async function assessDiff({ baseRef, headRef, write }) {
  const base = baseRef || 'origin/main';
  const head = headRef || 'HEAD';
  await git.fetch();
  const changedNames = await git.diff(['--name-status', `${base}..${head}`]);
  const changedStats = await git.diff(['--stat', `${base}..${head}`]);
  const changedFiles = await git.diff(['--name-only', `${base}..${head}`]);
  const files = changedFiles.split('\n').filter(Boolean);

  const buckets = {
    source: files.filter(
      (f) => f.startsWith('src/') || f.startsWith('app/') || f.startsWith('lib/')
    ),
    tests: files.filter((f) => /(^|\/)tests?\//.test(f) || /\.(spec|test)\./.test(f)),
    contracts: files.filter((f) => /(^|\/)(openapi|proto|contracts)\//.test(f)),
    config: files.filter((f) =>
      /(package\.json|pyproject\.toml|pom\.xml|go\.mod|dockerfile|docker-compose\.ya?ml|\.github\/workflows\/)/i.test(
        f
      )
    ),
    migrations: files.filter((f) => /(^|\/)migrations?\//i.test(f)),
    specs: files.filter(
      (f) => /(^|\/)test-specs\//.test(f) || /\.(feature|csv|xml|json)$/i.test(f)
    ),
  };

  const report = [
    `# Change Delta ${base}..${head}`,
    '',
    '## Summary',
    '```',
    changedStats,
    '```',
    '',
    '## Changed Files (name-status)',
    '```',
    changedNames,
    '```',
    '',
    '## Categorization',
    formatList('Source', buckets.source),
    formatList('Tests', buckets.tests),
    formatList('Contracts/Schemas', buckets.contracts),
    formatList('Config/CI', buckets.config),
    formatList('Migrations', buckets.migrations),
    formatList('External Specs', buckets.specs),
    '',
    '## Suggested Focus Areas',
    '- Add/Update tests for changed public APIs and critical paths',
    '- Prefer integration/contract tests for boundary changes; unit tests for pure logic',
    '- If migrations/config changed, include smoke checks and rollback paths',
  ].join('\n');

  if (write) {
    await fs.ensureDir(MEMORY_DEST);
    const assessmentPath = path.join(MEMORY_DEST, 'assessment.md');
    const specsIndexPath = path.join(MEMORY_DEST, 'specSources.md');
    const exists = await fs.pathExists(assessmentPath);
    const header = exists ? '\n\n---\n' : '';
    await fs.appendFile(assessmentPath, header + report, 'utf8');
    logInfo(`assessment.md updated with Change Delta ${base}..${head}`);

    // Update specSources index with changed spec files, if any
    if (buckets.specs.length > 0) {
      await fs.ensureFile(specsIndexPath);
      const specsHeader = (await fs.readFile(specsIndexPath, 'utf8').catch(() => ''))
        ? '\n'
        : '# Spec Sources\n\n## Index\n';
      const block = [
        specsHeader,
        '### Added/Changed (from diff)',
        ...buckets.specs.map((p) => `- ${p}`),
        '',
      ].join('\n');
      await fs.appendFile(specsIndexPath, block, 'utf8');
      logInfo(`specSources.md updated with ${buckets.specs.length} spec file(s)`);
    }
  } else {
    logInfo(report);
  }
}

async function init({ force, skipMemory }) {
  try {
    logInfo('Initializing Cursor TDD/ATDD Agent...');
    debug('Templates dir: %s', TEMPLATES_DIR);

    // Copy rules
    logInfo('Installing .cursor/rules...');
    await copyDirectory({ source: RULES_SRC, destination: RULES_DEST, force });
    logInfo('Rules installed at .cursor/rules');

    // Copy memory bank templates
    if (!skipMemory) {
      logInfo('Creating memory-bank with TDD templates...');
      await ensureMemoryCoreFiles(force);
      logInfo('Memory bank ready at memory-bank/');
    } else {
      logInfo('Skipping memory-bank initialization by request.');
    }

    logInfo('\n✅ Setup complete!');
    logInfo('- Use PLAN to draft test plans and ACT to apply changes');
    logInfo('- Start by filling memory-bank/projectbrief.md and testPlan.md');
  } catch (error) {
    logError('Initialization failed:');
    logError(error && error.stack ? error.stack : String(error));
    process.exit(1);
  }
}

program
  .name('cursor-tdd-agent')
  .description('Install Cursor TDD/ATDD agent rules and memory bank templates')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize .cursor/rules and memory-bank templates')
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--skip-memory', 'Do not create/update memory-bank templates', false)
  .action((options) => init(options));

program
  .command('assess')
  .description(
    'Assess repository; optionally summarize diff and write to memory-bank/assessment.md'
  )
  .option('--diff <base..head>', 'Git range to assess (default origin/main..HEAD)')
  .option('--write', 'Write results into memory-bank/assessment.md', false)
  .action(async (options) => {
    const range = options.diff || 'origin/main..HEAD';
    const [baseRef, headRef] = range.split('..');
    await assessDiff({ baseRef, headRef, write: options.write });
  });

if (process.argv.length === 2) {
  program.help();
}

program.parse();
