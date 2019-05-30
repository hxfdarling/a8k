#!/usr/bin/env node
import 'source-map-support/register';
import logger from '@a8k/cli-utils/logger';
import A8k from '../index';
import { A8kOptions } from '../interface';

// 自动版本检测
if (!process.argv.find(arg => arg === '--nochecklatest')) {
  try {
    require('../scripts/check_latest');
  } catch (e) {
    logger.warn('a8k check latest version fail,network or other error.');
    logger.error(e);
  }
}
let debug = false;
if (process.argv.find(arg => arg === '--debug')) {
  logger.setOptions({ debug: true });
  debug = true;
}
process.on('unhandledRejection', err => {
  throw err;
});

const app = new A8k({ debug } as A8kOptions);
app.run().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
