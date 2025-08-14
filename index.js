#!/usr/bin/env node
const { program } = require('commander');
const packageJson = require('./package.json');
const agent = require('./lib/agent');

program
  .name('cursor-tdd-agent')
  .description('Install Cursor TDD/ATDD agent rules and memory bank templates')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize .cursor/rules and memory-bank templates')
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--skip-memory', 'Do not create/update memory-bank templates', false)
  .action((options) => agent.init(options));

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
    await agent.assessDiff({ baseRef, headRef, write: options.write });
  });

if (process.argv.length === 2) {
  program.help();
}

program.parse();
