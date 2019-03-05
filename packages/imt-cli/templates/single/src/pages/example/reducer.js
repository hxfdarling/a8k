export default function(state, { data, type }) {
  switch (type) {
    default:
      return { ...state, ...data };
  }
}
