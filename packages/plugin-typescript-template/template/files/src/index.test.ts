import sum from '.';
describe('test suites', () => {
  it('test module', async () => {
    expect('module').toMatchSnapshot('module');
  });
  it('test sum', () => {
    expect(sum(1, 2)).toEqual(3);
  });
});
