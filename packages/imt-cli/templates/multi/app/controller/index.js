const providerSearch = require('../components/index').default;
const render = require('../utils/render');

module.exports = async (ctx, next) => {
  providerSearch.props.store.dispatch({ type: 'SET_APP', data: {} });

  let state = providerSearch.props.store.getState();
  state = Object.assign(state, {
    isEnd: true,
    loaded: true,
  });

  const titleInfo = 'index';
  const keywords = 'imt';
  const description = 'imt react application';

  ctx.body = await render('index.html', providerSearch, state, {
    titleInfo,
    keywords,
    description,
  });
  next();
};
