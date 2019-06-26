import logger from '@a8k/cli-utils/logger';
import { mapToString, render } from '@a8k/ssr-utils';
import fs from 'fs';
import { Context } from 'koa';
import path from 'path';
import url from 'url';

function middleware(options: { entryDir?: string; viewDir?: string } = {}) {
  const defaultRootDir = path.join(process.cwd(), '.a8k/server');
  const entryDir = options.entryDir || path.join(defaultRootDir, 'entry');
  const viewDir = options.viewDir || path.join(defaultRootDir, 'view');
  let entries = {};
  let views = {};
  try {
    entries = mapToString(fs.readdirSync(entryDir), entryDir);
    views = mapToString(fs.readdirSync(viewDir), viewDir);
  } catch (e) {
    logger.warn('entry or view direction is empty');
  }

  logger.debug('entry', entries);
  logger.debug('views', views);

  return async (ctx: Context, next: () => void) => {
    let { pathname } = url.parse(ctx.url);
    pathname = (pathname || '').replace('/', '');
    if (!/\.html$/.test(pathname)) {
      return next();
    }
    const key = pathname.split('.')[0];

    if (process.env.A8K_ENV === 'development') {
      views = mapToString(fs.readdirSync(viewDir), viewDir);
      entries = mapToString(fs.readdirSync(entryDir), entryDir);
    }

    if (views[key]) {
      const entry = require(entries[key]);
      // tslint:disable-next-line: no-empty
      const { default: element, bootstrap = async () => {} } = entry;
      const { state, element: newElement, ...renderOptions } =
        (await bootstrap(ctx)) || ({} as any);
      const html = await render(views[key], newElement || element, state, renderOptions);
      ctx.status = 200;
      ctx.body = html;
    } else {
      return next();
    }
  };
}
module.exports = middleware;
export default middleware;
