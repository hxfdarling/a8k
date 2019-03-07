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
  const keywords = 'a8k';
  const description = 'a8k react application';

  ctx.body = await render('index.html', providerSearch, state, {
    titleInfo,
    keywords,
    description,
  });
  next();
};
