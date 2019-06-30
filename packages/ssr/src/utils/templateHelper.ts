import serialize from 'serialize-javascript';

const RICH_IMG_PLACEHOLDER = 'RICH_IMG_PLACEHOLDER';
const HTML_PLACEHOLDER = 'HTML_PLACEHOLDER';
const STATE_PLACEHOLDER = 'STATE_PLACEHOLDER';
const STYLE_PLACEHOLDER = 'STYLE_PLACEHOLDER';
const EXTRA_DATA_PLACEHOLDER = 'EXTRA_DATA_PLACEHOLDER';

const getRegExp = (str: string) => {
  return new RegExp(`<!--[ ]*${str}[ ]*-->`);
};
const key2handler = {
  RICH_IMAGE_INSERTER: (html: string, val: string) => {
    const meta = `<meta itemprop="image" content="${val}"/>`;
    const reg = /<meta\s+itemprop="image"[^>]+>/gm;
    const match = html.match(reg);

    if (match && match.length) {
      return html.replace(reg, meta).replace(getRegExp(RICH_IMG_PLACEHOLDER), '');
    }
    return html.replace(getRegExp(RICH_IMG_PLACEHOLDER), meta);
  },
  TITLE_INSERTER: (html: string, val: string) => {
    if (val) {
      const reg = /<title>.*<\/title>/;
      return html.replace(reg, `<title>${val}</title>`);
    }
    return html;
  },
  KEYWORDS_INSERTER: (html: string, val: string) => {
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
  DESCRIPTION_INSERTER: (html: string, val: string) => {
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
  STYLE_PLACEHOLDER: (html: string, val: string) => {
    return html.replace(getRegExp(STYLE_PLACEHOLDER), val);
  },
  HTML_PLACEHOLDER: (html: string, val: string) => {
    return html.replace(getRegExp(HTML_PLACEHOLDER), val);
  },
  STATE_PLACEHOLDER: (html: string, val: string) => {
    return html.replace(
      getRegExp(STATE_PLACEHOLDER),
      `<script>window.__initialState=${serialize(val)};</script>`
    );
  },
  EXTRA_DATA_PLACEHOLDER: (html: string, val: any) => {
    return html.replace(
      getRegExp(EXTRA_DATA_PLACEHOLDER),
      `<script>window.__extraData=${serialize(val)};</script>`
    );
  },

  SERVER_FLAG_INSERTER: (html: string) => {
    return html.replace(/<\/head>/, '<script>window.isSvr=true;</script>$&');
  },
  PERF_INSERTER: (html: string, val: string) => {
    return html.replace(/<\/head>/, `<script>window.__perfData=${serialize(val)};</script>$&`);
  },
} as any;

interface ICombine {
  RICH_IMAGE_INSERTER: any;
  TITLE_INSERTER: any;
  KEYWORDS_INSERTER: any;
  DESCRIPTION_INSERTER: any;
  STYLE_PLACEHOLDER: any;
  HTML_PLACEHOLDER: any;
  STATE_PLACEHOLDER: any;
  EXTRA_DATA_PLACEHOLDER: any;
  SERVER_FLAG_INSERTER?: any;
  PERF_INSERTER: any;
  [key: string]: any;
}

export default class {
  private template: string;
  constructor(template: string) {
    this.template = template;
  }
  public combine(kv: ICombine) {
    let { template } = this;
    kv.SERVER_FLAG_INSERTER = 1;
    Object.keys(kv).forEach((key: string) => {
      template = key2handler[key](template, kv[key] || '');
    });
    return template;
  }
}
