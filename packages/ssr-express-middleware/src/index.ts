import logger from '@a8k/common/lib/logger';
import { mapToString, render } from '@a8k/ssr-utils';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import url from 'url';

function middleware(options: { entryPath?: string; viewPath?: string } = {}) {
  const defaultRootDir = path.join(process.cwd(), '.a8k/server');
  const entryPath = options.entryPath || path.join(defaultRootDir, 'entry');
  const viewPath = options.viewPath || path.join(defaultRootDir, 'view');
  let entries = {};
  let views = {};
  try {
    entries = mapToString(fs.readdirSync(entryPath), entryPath);
    views = mapToString(fs.readdirSync(viewPath), viewPath);
  } catch (e) {
    logger.warn('entry or view direction is empty');
  }

  logger.debug('entry', entries);
  logger.debug('views', views);

  return async (req: Request, res: Response, next: () => void) => {
    let { pathname } = url.parse(req.url);
    pathname = (pathname || '').replace('/', '');
    if (!/\.html$/.test(pathname)) {
      return next();
    }
    const key = pathname.split('.')[0];

    if (process.env.A8K_ENV === 'development') {
      views = mapToString(fs.readdirSync(viewPath), viewPath);
      entries = mapToString(fs.readdirSync(entryPath), entryPath);
    }

    if (views[key]) {
      const entry = require(entries[key]);
      // tslint:disable-next-line: no-empty
      const { default: element, bootstrap = async () => {} } = entry;
      const { state, element: newElement, ...renderOptions } =
        (await bootstrap({ res, req })) || ({} as any);
      const html = await render(views[key], newElement || element, state, renderOptions);
      res.statusCode = 200;
      res.statusMessage = 'ok';
      res.send(html);
    } else {
      return next();
    }
  };
}
module.exports = middleware;
export default middleware;
