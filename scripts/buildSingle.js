/**
 * Created Date: Thursday, June 28th 2018, 11:32:23 am
 * Author: hanjingbo@ysstech.com | jingboup@gmail.com
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * Copyright (c) 2018 Lugia
 * ------------------------------------
 * Javascript will save your soul!
 */

const { buildPkg, watch } = require('./buildUtils');

const arg = process.argv[2];
const isWatch = arg === '-w' || arg === '--watch';

['lerna-package'].forEach(pkg => {
  buildPkg(pkg);
  if (isWatch) watch(pkg);
});
