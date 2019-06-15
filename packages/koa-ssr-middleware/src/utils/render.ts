import HtmlTemplateHelper from './htmlTemplateHelper';
const { renderToString } = require('react-dom/server');

export interface IRenderOptions {
  richImg: string;
  titleInfo: string;
  keywords: string;
  description: string;
  style: string;
  extraData: any;
}

const engineCache: any = {};
export default (
  htmlFile: string,
  element: any,
  state: any,
  options: IRenderOptions = {} as IRenderOptions
) => {
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
        RICH_IMAGE_INSERTER: options.richImg,
        HTML_PLACEHOLDER: domString,
        STYLE_PLACEHOLDER: options.style,
        STATE_PLACEHOLDER: state || {},
        PERF_INSERTER: perfData,
        TITLE_INSERTER: options.titleInfo, // 修改title
        KEYWORDS_INSERTER: options.keywords, // 修改keywords
        DESCRIPTION_INSERTER: options.description, // 修改description
        EXTRA_DATA_PLACEHOLDER: options.extraData || {},
      });
      resolve(output);
    } catch (e) {
      reject(e);
    }
  });
};
