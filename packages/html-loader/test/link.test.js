import 'jest-extended';

const { compile, evaluated } = require('./helpers');

jest.setTimeout(15 * 1000);
describe('link loader', () => {
  it('should link js/css', async () => {
    const stats = await compile('link.html');

    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules)).toMatchSnapshot('module (evaluated)');
  });
});
