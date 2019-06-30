import { renderToString } from 'react-dom/server';
import TemplateHelper from './templateHelper';

export interface IRenderOptions {
  richImg: string;
  title: string;
  keywords: string;
  description: string;
  style: string;
  extraData: any;
}

const engineCache: { [key: string]: TemplateHelper } = {};
export default function render(
  htmlFile: string,
  element: any,
  state: any,
  options: IRenderOptions = {} as IRenderOptions
) {
  const perfData: { renderTime: number; renderStart: number } = {
    renderStart: Date.now(),
    renderTime: 0,
  };

  const startTime = Date.now();
  const domString = renderToString(element);
  perfData.renderTime = Date.now() - startTime;
  if (!engineCache[htmlFile]) {
    engineCache[htmlFile] = new TemplateHelper(htmlFile);
  }
  const templateEngine: TemplateHelper = engineCache[htmlFile];
  return templateEngine.combine({
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
}
