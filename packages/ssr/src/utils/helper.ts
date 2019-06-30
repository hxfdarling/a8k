import { existsSync, readdirSync } from 'fs-extra';
import { basename, extname } from 'path';
import pathMatch from 'path-match';
import { parse } from 'url';

export function createRouter(routes: IRouteConfig[]) {
  const createMatcher = pathMatch({
    sensitive: true,
    strict: false,
    end: true,
  });

  const matchers = routes.map(({ pattern, entry }) => {
    const match = createMatcher(pattern);
    return {
      entry,
      pattern,
      match,
    };
  });

  return (request: any): IRouteMatch | undefined => {
    const { pathname } = parse(request.url);
    for (const { entry, match, pattern } of matchers) {
      const params = match(pathname);
      if (params) {
        return { entry, params, pattern };
      }
    }
    return undefined;
  };
}
export interface IRouteMatch {
  entry: string;
  params: any;
  pattern: string;
}
export interface IRouteConfig {
  pattern: string;
  entry: string;
}
export const getRoutesConfig = (routesPath: string, entryPath: string): IRouteConfig[] => {
  let defaultConfig = [];
  if (existsSync(entryPath)) {
    defaultConfig = readdirSync(entryPath)
      .filter(file => extname(file) === '.js')
      .map(file => basename(file).replace('.js', ''))
      .map(name => {
        return {
          pattern: '/' + name + '.html',
          entry: name,
        };
      });
  }
  if (existsSync(routesPath)) {
    delete require.cache[require.resolve(routesPath)];
    const customConfig = require(routesPath);
    if (Array.isArray(customConfig)) {
      return customConfig.concat(defaultConfig);
    }
  }
  return defaultConfig;
};
