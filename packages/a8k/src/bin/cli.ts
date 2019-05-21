#!/usr/bin/env node
import 'source-map-support/register';
import A8k from '../index';

// 自动版本检测
if (!process.argv.find(arg => arg === '--nochecklatest')) {
  require('../scripts/check_latest');
}

process.on('unhandledRejection', err => {
  throw err;
});

const app = new A8k();
app.run().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
