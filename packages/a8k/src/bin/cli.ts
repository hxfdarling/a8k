#!/usr/bin/env node
import getNpmClient from '@a8k/cli-utils/npm';
import { logger } from '@a8k/common';
import A8k from '../index';
import { A8kOptions } from '../interface';
require('source-map-support/register');

function getParam(key: string) {
  const index = process.argv.findIndex((arg: string) => arg === key);
  if (index >= 0) {
    const value = (process.argv[index + 1] || '').trim();
    if (!/^-/.test(value) && value) {
      return value;
    } else {
      return true;
    }
  }
  return undefined;
}

let debug = false;
if (getParam('--debug')) {
  logger.setOptions({ debug: true });
  debug = true;
}

const npmClient = getParam('--npm-client');
if (npmClient) {
  if (npmClient !== true) {
    process.env.NPM_CLIENT = npmClient;
    getNpmClient();
  } else {
    logger.error('npm-client not have vale');
    process.exit(-1);
  }
}
const configFile = getParam('--config');
if (configFile !== undefined) {
  if (configFile === true) {
    logger.error('config path not found');
    process.exit(-1);
  }
}
// 自动版本检测
if (getParam('--nochecklatest')) {
  try {
    require('../scripts/check_latest');
  } catch (e) {
    logger.warn('a8k check latest version fail,network or other error.');
    logger.error(e);
  }
}

process.on('unhandledRejection' as any, (err: Error) => {
  throw err;
});

const app = new A8k({ debug, configFile } as A8kOptions);
app.run().catch((err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
