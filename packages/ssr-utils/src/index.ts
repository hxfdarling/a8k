import path from 'path';
import { renderToString } from 'react-dom/server';
import HtmlTemplateHelper from './htmlTemplateHelper';

export interface IRenderOptions {
  richImg: string;
  title: string;
  keywords: string;
  description: string;
  style: string;
  extraData: any;
}

const engineCache: any = {};
export function render(
  htmlFile: string,
  element: any,
  state: any,
  options: IRenderOptions = {} as IRenderOptions
) {
  return new Promise((resolve, reject) => {
    let output = '';
    const perfData: { renderTime: number; renderStart: number } = {
      renderStart: Date.now(),
      renderTime: 0,
    };
    try {
      const startTime = Date.now();
      const domString = renderToString(element);
      perfData.renderTime = Date.now() - startTime;
      if (!engineCache[htmlFile]) {
        engineCache[htmlFile] = new HtmlTemplateHelper(htmlFile);
      }
      const htmlEngine: HtmlTemplateHelper = engineCache[htmlFile];
      output = htmlEngine.combine({
        HTML_PLACEHOLDER: domString,
        STATE_PLACEHOLDER: state || {},
        PERF_INSERTER: perfData,
        RICH_IMAGE_INSERTER: options.richImg,
        STYLE_PLACEHOLDER: options.style,
        TITLE_INSERTER: options.title, // 修改title
        KEYWORDS_INSERTER: options.keywords, // 修改keywords
        DESCRIPTION_INSERTER: options.description, // 修改description
        EXTRA_DATA_PLACEHOLDER: options.extraData || {},
      });
      resolve(output);
    } catch (e) {
      reject(e);
    }
  });
}
export const mapToString = (list: string[], dir: string) => {
  return list.reduce(
    (p, c) => {
      p[c.split('.')[0]] = path.join(dir, c);
      return p;
    },
    {} as { [key: string]: string }
  );
};
