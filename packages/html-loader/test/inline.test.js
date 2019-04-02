
import 'jest-extended';

const { compile, evaluated } = require('./helpers');

describe('inline loader', () => {
  it('should inline html/js/css', async () => {
    const stats = await compile('inline.html');

    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules))
      .toMatchSnapshot('module (evaluated)');
  });
});
