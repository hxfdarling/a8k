import logger from '@a8k/cli-utils/logger';
import fs from 'fs';
import { Context } from 'koa';
import path from 'path';
import url from 'url';
import render from './utils/render';

export default function(options: { entryDir?: string; viewDir?: string } = {}) {
  const defaultRootDir = path.join(process.cwd(), '.a8k');
  const entryDir = options.entryDir || path.join(defaultRootDir, 'entry');
  const viewDir = options.viewDir || path.join(defaultRootDir, 'view');
  const mapToString = (list: string[], dir: string) => {
    return list.reduce(
      (p, c) => {
        p[c.split('.')[0]] = path.join(dir, c);
        return p;
      },
      {} as { [key: string]: string }
    );
  };
  const entries = mapToString(fs.readdirSync(entryDir), entryDir);
  const views = mapToString(fs.readdirSync(viewDir), viewDir);
  logger.debug('entry', entries);
  logger.debug('views', views);

  return async function(ctx: Context, next: () => void) {
    let { pathname } = url.parse(ctx.url);
    pathname = (pathname || '').replace('/', '');
    if (!/\.html$/.test(pathname)) {
      return next();
    }
    const key = pathname.split('.')[0];
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
