import types from './action_types';

export default function(state, { data, type }) {
  if (Object.keys(types).find(key => types[key] === type)) {
    switch (type) {
      default:
        return { ...state, ...data };
    }
  }
  return state || {};
}
