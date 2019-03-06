const fs = require('fs');
const serialize = require('serialize-javascript');

const RICH_IMG_PLACEHOLDER = 'RICH_IMG_PLACEHOLDER';
const HTML_PLACEHOLDER = 'HTML_PLACEHOLDER';
const STATE_PLACEHOLDER = 'STATE_PLACEHOLDER';
const getRegExp = str => {
  return new RegExp(`<!--[ ]*${str}[ ]*-->`);
};
const key2handler = {
  RICH_IMAGE_INSERTER: (html, val) => {
    const meta = `<meta itemprop="image" content="${val}"/>`;
    const reg = /<meta\s+itemprop="image"[^>]+>/gm;
    const match = html.match(reg);

    if (match && match.length) {
      return html.replace(reg, meta).replace(getRegExp(RICH_IMG_PLACEHOLDER), '');
    }

    return html.replace(getRegExp(RICH_IMG_PLACEHOLDER), meta);
  },
  TITLE_INSERTER: (html, val) => {
    if (val) {
      const reg = /<title>.+<\/title>/;
      return html.replace(reg, `<title>${val}</title>`);
    }
    return html;
  },
  KEYWORDS_INSERTER: (html, val) => {
    if (val) {
      const meta = `<meta name="keywords" content="${val}"/>`;
      const reg = /<meta\s+name="keywords"[^>]+>/gm;
      const match = html.match(reg);
      if (match && match.length) {
        return html.replace(reg, meta);
      }
    }
    return html;
  },
  DESCRIPTION_INSERTER: (html, val) => {
    if (val) {
      const meta = `<meta name="description" itemprop="description" content="${val}"/>`;
      const reg = /<meta\s+name="description"[^>]+>/gm;
      const match = html.match(reg);
      if (match && match.length) {
        return html.replace(reg, meta);
      }
    }
    return html;
  },
  HTML_PLACEHOLDER: (html, val) => {
    return html.replace(getRegExp(HTML_PLACEHOLDER), val);
  },
  STATE_PLACEHOLDER: (html, val) => {
    return html.replace(
      getRegExp(STATE_PLACEHOLDER),
      `<script>window.__initialState=${serialize(val)};</script>`
    );
  },
  SERVER_FLAG_INSERTER: html => {
    return html.replace(/<\/head>/, '<script>window.isSvr=true;</script>$&');
  },
  PERF_INSERTER: (html, val) => {
    return html.replace(/<\/head>/, `<script>window.__perfData=${serialize(val)};</script>$&`);
  },
};

module.exports = class {
  constructor(filename) {
    this._templateContent = fs.readFileSync(filename, 'utf-8');
  }

  combine(kv = {}) {
    let html = this.templateContent;
    kv.SERVER_FLAG_INSERTER = 1;
    Object.keys(kv).forEach(key => {
      html = key2handler[key](html, kv[key]);
    });

    return html;
  }

  get templateContent() {
    return this._templateContent;
  }

  set templateContent(content) {
    this._templateContent = content;
  }
};
