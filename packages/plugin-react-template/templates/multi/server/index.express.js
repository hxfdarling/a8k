const path = require('path');
const express = require('express');
const ssr = require('@a8k/ssr-express-middleware');
const {
  ssrDevServer: { port },
} = require('../a8k.config.js');

const app = express();

app.use(ssr());
app.use(express.static(path.join(__dirname, '../dist/'), {}));
app.listen(port, () => {
  console.log();
  console.log(`http://localhost:${port}`);
});
