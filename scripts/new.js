/**
 * Created Date: Thursday, May 23rd 2019, 8:08:49 pm
 * Author: hanjingbo@ysstech.com | jingboup@gmail.com
 * -----
 * Last Modified: Thursday, May 23rd 2019, 9:51:54 pm
 * Modified By: hanjingbo <hanjingbo@ysstech.com | jingboup@gmail.com>
 * -----
 * Copyright (c) 2019-present, #Lugia#.
 * ------------------------------------
 * JavaScript will save your soul!
 */

const { fork } = require('child_process');
const { join } = require('path');
const { argv } = process;
const cwd = process.cwd();
const { packagesDirName } = require('./config.json');

function isRelativePath(appName) {
  return /^[./]|(^[a-zA-Z]:)/.test(appName);
}

let appName = argv[2];
if (appName && !isRelativePath(appName)) {
  appName = `./${packagesDirName}/${appName}`;
}

let scaffolding = argv[3];
if (appName && !scaffolding) {
  scaffolding = '@lugia/scaffolding-lerna-package';
}

const cp = fork(
  join(cwd, './node_modules/@lugia/mega/bin/mega.js'),
  ['create'].concat(
    appName ? [appName] : [],
    scaffolding ? [scaffolding, '-p'] : [],
    argv.slice(4),
  ),
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
    console.error('Failed: new package');
    process.exit(1);
  }
});
