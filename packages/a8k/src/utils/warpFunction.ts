export default function(fn: any) {
  return (...args: any) => {
    if (typeof fn === 'function') {
      return fn(...args);
    } else {
      return fn;
    }
  };
}
