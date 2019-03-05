#!/usr/bin/env node
// 自动版本检测
import 'source-map-support/register';

require('../scripts/check_latest');

process.on('unhandledRejection', err => {
  throw err;
});

const onepack = require('../index').default;

const app = onepack();
app.run().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
