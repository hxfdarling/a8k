# @a8k/nunjucks-loader

The original '[nunjucks-html-loader](https://github.com/ryanhornberger/nunjucks-html-loader)' not support relative search path and webpack4 has warning. So, I fork it

## Usage

### install

```bash
npm i -D @a8k/nunjucks-loader
```

### webpack rules

```js
const configureHtmlLoader = ({ mini, projectDir }) => {
  return {
    test: /\.(html|njk|nunjucks)$/,
    use: [
      {
        loader: resolve('html-loader'),
        options: {
          minimize: mini && env.NODE_ENV === PROD,
        },
      },
      {
        loader: resolve('@a8k/nunjucks-loader'),
        options: {
          // Other super important. This will be the base
          // directory in which webpack is going to find
          // the layout and any other file index.njk is calling.
          // default search path is current resource path
          searchPaths: ['./src', './src/pages', './src/assets'].map(i => path.join(projectDir, i)),
        },
      },
    ],
  };
};
```
