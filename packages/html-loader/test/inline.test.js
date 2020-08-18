import 'jest-extended';

const { compile, evaluated } = require('./helpers');

jest.setTimeout(15 * 1000);
describe('inline loader', () => {
  it('should inline html/js/css', async () => {
    const stats = await compile('inline.html', {
      loader: {
        options: {
          imageAttrs: [
            { name: 'property', value: 'og:image' },
            { name: 'property', value: 'aweme:image' },
            { name: 'name', value: 'twitter:image' },
          ],
        },
      },
    });

    expect(stats.compilation.warnings).toBeArrayOfSize(0);
    expect(stats.compilation.errors).toBeArrayOfSize(0);

    const { modules } = stats.toJson();
    const [module] = modules;
    expect(module.source).toMatchSnapshot('module');
    expect(evaluated(module.source, modules)).toMatchSnapshot('module (evaluated)');
  });
});
