const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/index.html', require('./controller/index'));

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log();
  console.log('http://localhost:3000');
});
