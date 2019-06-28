#!/usr/bin/env node
require('source-map-support/register');
import { logger } from '@a8k/common';
import getNpmClient from '@a8k/cli-utils/npm';
import A8k from '../index';
import { A8kOptions } from '../interface';

let debug = false;
if (process.argv.find((arg: string) => arg === '--debug')) {
  logger.setOptions({ debug: true });
  debug = true;
}

const index = process.argv.findIndex((arg: string) => arg === '--npm-client');
if (index >= 0) {
  process.env.NPM_CLIENT = process.argv[index + 1];
  getNpmClient();
}

// 自动版本检测
if (!process.argv.find((arg: string) => arg === '--nochecklatest')) {
  try {
    require('../scripts/check_latest');
  } catch (e) {
    logger.warn('a8k check latest version fail,network or other error.');
    logger.error(e);
  }
}

process.on('unhandledRejection', (err: Error) => {
  throw err;
});

const app = new A8k({ debug } as A8kOptions);
app.run().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
