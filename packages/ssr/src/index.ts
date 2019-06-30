import { logger } from '@a8k/common';
import { SERVER_ENTRY_DIR, SERVER_VIEW_DIR } from '@a8k/common/lib/constants';
import express from 'express';
import { readFileSync } from 'fs-extra';
import koa, { Context } from 'koa';
import { resolve } from 'path';
import React from 'react';
import { createRouter, getRoutesConfig, IRouteConfig, IRouteMatch } from './utils/helper';
import renderToString, { IRenderOptions } from './utils/render';

export interface IA8kSsrOptions {
  routesPath?: string;
  entryPath?: string;
  viewPath?: string;
  enhanceComponent?: (
    component: React.ElementType,
    options: { state: any; renderOptions: IRenderOptions; req: any; res: any }
  ) => React.ElementType;
  renderToString?: (
    template: string,
    element: React.ReactElement,
    state: any,
    renderOptions: IRenderOptions,
    req: any,
    res: any
  ) => string;
}

const cwd = process.cwd();

export class SSR {
  private routesConfig: IRouteConfig[];
  private routesPath: string;
  private entryPath: string;
  private viewPath: string;
  private viewCache: { [key: string]: string } = {};
  // tslint:disable-next-line: variable-name
  public _router: (request: any) => IRouteMatch | undefined;
  private options: IA8kSsrOptions;
  constructor(options?: IA8kSsrOptions) {
    options = options || {};
    this.routesPath = resolve(cwd, options.routesPath || './routes.js');
    this.entryPath = resolve(cwd, options.entryPath || SERVER_ENTRY_DIR);
    this.viewPath = resolve(cwd, options.viewPath || SERVER_VIEW_DIR);
    this.routesConfig = getRoutesConfig(this.routesPath, this.entryPath);
    this.router = createRouter(this.routesConfig);
    this.options = options || {};
    logger.debug('[ssr]routesConfig', this.routesConfig);
  }
  get router() {
    if (process.env.NODE_ENV === 'development') {
      // 开发模式下为了防止entry目录清理或者修改时 直出服务器没有感知到，因此每次渲染都会重新查询一次
      this.routesConfig = getRoutesConfig(this.routesPath, this.entryPath);
      this.router = createRouter(this.routesConfig);
    }
    return this._router;
  }
  set router(value) {
    this._router = value;
  }
  public async render(
    req: koa.Request | express.Request,
    res: koa.Response | express.Response,
    entry: string,
    params: any
  ) {
    logger.debug('[ssr] render entry:', entry, ', params:', params);

    const template = this.getTemplate(entry);
    try {
      let component = this.getEntry(entry);
      let state = {};
      let renderOptions: any;
      if (component.bootstrap) {
        ({ state, ...renderOptions } = await component.bootstrap(params, req, res));
      }
      if (component.getInitialProps) {
        state = component.getInitialProps(params, req, res);
        if (state instanceof Promise) {
          state = await state;
        }
      }
      if (component.prefetch) {
        state = component.prefetch(params, req, res);
        if (state instanceof Promise) {
          state = await state;
        }
      }
      const { renderToString: customRenderToString, enhanceComponent } = this.options;
      if (enhanceComponent) {
        component = enhanceComponent(component, { state, renderOptions, req, res });
      }
      const element = React.createElement(component, state);
      if (customRenderToString) {
        return customRenderToString(template, element, state, renderOptions, req, res);
      }
      return renderToString(template, element, state, renderOptions);
    } catch (e) {
      logger.error(`[ssr error] ${entry}, ${req.url}`);
      console.error(e);
      return template;
    }
  }
  private getTemplate(entry: string) {
    this.viewCache[entry] =
      this.viewCache[entry] ||
      readFileSync(resolve(this.viewPath, entry + '.html'), 'utf-8').toString();
    return this.viewCache[entry];
  }
  private getEntry(entry: string) {
    const bundle = require(resolve(this.entryPath, entry + '.js'));
    return bundle.__esModule ? bundle.default : bundle;
  }
}
export function koaMiddleware(options: IA8kSsrOptions) {
  const ssr = new SSR(options);
  return async (ctx: Context, next: any) => {
    const route = ssr.router(ctx.req);
    if (route) {
      ctx.status = 200;
      ctx.body = await ssr.render(ctx.request, ctx.response, route.entry, route.params);
    } else {
      return next();
    }
  };
}
export function expressMiddleware(options: IA8kSsrOptions) {
  const ssr = new SSR(options);
  return async (req: express.Request, res: express.Response, next: any) => {
    const route = ssr.router(req);
    if (route) {
      res.status(200).send(await ssr.render(req, res, route.entry, route.params));
    } else {
      return next();
    }
  };
}
