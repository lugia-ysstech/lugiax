#!/usr/bin/env node

const shell = require('shelljs');
const { join } = require('path');
const { fork } = require('child_process');
const { packagesDirName, scope, igronPkgs } = require('./config.json');


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
  ['publish', '--skip-npm'].concat(process.argv.slice(2)),
  {
    cwd,
  },
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
  updatedRepos
    .map(repo => repo.replace(`${scope}/`, ''))
    .filter(repo => !igronPkgs.includes(repo))
    .forEach(repo => {
      shell.cd(join(cwd, packagesDirName, repo));
      console.log(`[${repo}] npm publish`);
      shell.exec('npm publish');
    });
}
