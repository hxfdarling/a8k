// rollup.config.js
import typescript from 'rollup-plugin-typescript';

const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  plugins: [typescript()],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourceMap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourceMap: true,
    },
  ],
};
