import Koa from 'koa';
const app = new Koa();
app.use((ctx: Koa.Context) => {
  ctx.body = 'hello world';
});
app.listen(8082);
