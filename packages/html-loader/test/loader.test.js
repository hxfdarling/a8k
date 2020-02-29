import 'jest-extended';

const { compile, evaluated } = require('./helpers');

jest.setTimeout(15 * 1000);
describe('base loader', () => {
  it('should compile with `js` entry point', async () => {
    const stats = await compile('basic.js');

    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules)).toMatchSnapshot('module (evaluated)');
  });

  it('should compile with `html` entry point', async () => {
    const stats = await compile('basic.html');
    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules)).toMatchSnapshot('module (evaluated)');
  });
});
