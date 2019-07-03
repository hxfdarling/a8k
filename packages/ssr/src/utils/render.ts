import { renderToString } from 'react-dom/server';
import templateHelper from './templateHelper';

export interface IRenderOptions {
  richImg: string;
  title: string;
  keywords: string;
  description: string;
  style: string;
  extraData: any;
}

export default function render(
  template: string,
  element: React.ReactElement<any>,
  state: any,
  options: IRenderOptions = {} as IRenderOptions
) {
  const renderStart = Date.now();
  const perfData: { renderTime: number; renderStart: number } = {
    renderStart,
    renderTime: 0,
  };

  const domString = renderToString(element);

  perfData.renderTime = Date.now() - renderStart;

  return templateHelper(template, {
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
