#!/usr/bin/env node

const shell = require('shelljs');
const { join } = require('path');
const { fork } = require('child_process');

const { argv } = process;
const isAlpha = argv.includes('-a') || argv.includes('--alpha');
if (isAlpha) {
  argv.splice(argv.indexOf('-a') || argv.indexOf('--alpha'), 1);
}

const registry = ['https://registry.npmjs.org/'];
const configRegistry = 'https://registry.npmjs.org/';
let publishRegistry;

registry.forEach(r => {
  if (configRegistry.includes(r)) {
    publishRegistry = r;
  }
});

console.log(`Publish registry: ${publishRegistry}`);

if (!publishRegistry) {
  console.error(
    'Failed: ',
    `set npm / yarn registry to ${registry.join(
      ' | '
    )} first. You can use [nrm](https://github.com/Pana/nrm).`
  );
  process.exit(1);
}

const cwd = process.cwd();
const updatedRepos = shell
  .exec('yarn run lerna updated')
  .stdout.split('\n')
  .filter(line => /^@lugia\//.test(line));

if (updatedRepos.length === 0) {
  console.log('No package is updated.');
  process.exit(0);
}

const { code: buildCode } = shell.exec('yarn run build -m');
if (buildCode === 1) {
  console.error('Failed: yarn run build -m');
  process.exit(1);
}

const cp = fork(
  join(cwd, './node_modules/lerna/cli.js'),
  ['publish', '--skip-npm'].concat(argv.slice(2)),
  {
    cwd,
  }
);
cp.on('error', err => {
  console.log(err);
});
cp.on('close', code => {
  console.log('code', code);
  if (code === 1) {
    console.error('Failed: lerna publish');
    process.exit(1);
  }

  publishToNpm();
});

function publishToNpm() {
  console.log(`repos to publish: ${updatedRepos.join(', ')}`);
  updatedRepos.forEach(repo => {
    shell.cd(join(cwd, 'packages', repo.replace('@lugia/', '')));
    console.log(`[${repo}] npm publish`);
    shell.exec(`npm publish --registry ${publishRegistry}${isAlpha ? ' --tag alpha' : ''}`);
  });
}
