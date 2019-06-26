const Koa = require('koa');
const path = require('path');
const ssr = require('@a8k/ssr-koa-middleware');
const {
  ssrConfig: { port },
} = require('../a8k.config.js');

const app = new Koa();

app.use(ssr());
app.use(require('koa-static')(path.join(__dirname, '../.a8k/static/'), {}));

app.listen(port, () => {
  console.log();
  console.log(`http://localhost:${port}`);
});
