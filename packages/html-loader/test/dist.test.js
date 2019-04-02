
import 'jest-extended';

const { compile, evaluated } = require('./helpers');

describe('dist loader', () => {
  it('在development模式下不引入', async () => {
    const stats = await compile('dist.html');

    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules))
      .toMatchSnapshot('module (evaluated)');
  });
  it('在production模式下引入', async () => {
    process.env.NODE_ENV = 'production';
    const stats = await compile('dist.html');

    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules))
      .toMatchSnapshot('module (evaluated)');
  });
});
