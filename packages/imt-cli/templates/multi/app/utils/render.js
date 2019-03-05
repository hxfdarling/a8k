const { renderToString } = require('react-dom/server');
const path = require('path');
const HtmlTemplateHelper = require('./htmlTemplateHelper');

const engineCache = {};
module.exports = (htmlFile, element, state = {}, options = {}) => {
  htmlFile = path.resolve(__dirname, `../views/${htmlFile}`);
  return new Promise((resolve, reject) => {
    let output = '';
    const perfData = {};
    try {
      const startTime = Date.now();
      const domString = renderToString(element);
      perfData.renderTime = Date.now() - startTime;
      if (!engineCache[htmlFile]) {
        engineCache[htmlFile] = new HtmlTemplateHelper(htmlFile);
      }
      /** @type {HtmlTemplateHelper} */
      const htmlEngine = engineCache[htmlFile];
      output = htmlEngine.combine({
        HTML_PLACEHOLDER: domString,
        STATE_PLACEHOLDER: state,
        RICH_IMAGE_INSERTER: options.richImg,
        PERF_INSERTER: perfData,
        TITLE_INSERTER: options.titleInfo, // 修改title
        KEYWORDS_INSERTER: options.keywords, // 修改keywords
        DESCRIPTION_INSERTER: options.description, // 修改description
      });
      resolve(output);
    } catch (e) {
      reject(e);
    }
  });
};
