const Koa = require('koa');
const path = require('path');
const ssr = require('@a8k/koa-ssr-middleware').default;
const {
  ssrDevServer: { port },
} = require('../a8k.config.js');

const app = new Koa();

app.use(ssr());
app.use(require('koa-static')(path.join(__dirname, '../dist/'), {}));

app.listen(port, () => {
  console.log();
  console.log(`http://localhost:${port}`);
});
