const babel = require('../lib/utils/babel');

try {
  // babel 异步require会导致jest异常
  babel('filepath', 'result', {});
} catch (e) {
  console.log('--');
}
