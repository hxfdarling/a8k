/*eslint-disable*/
(function() {
  function flex() {
    try {
      var htmlDom = document.documentElement;
      var width = window.innerWidth || htmlDom.clientWidth;
      var height = window.innerHeight || htmlDom.clientHeight;
      var ratio = width / height;
      var rem = Math.min(1, width / 750);
      htmlDom.style.fontSize = rem * 100 + 'px';
    } catch (e) {
      console.error(e);
    }
  }
  flex();
  //为什么要这样？因为fudao的安卓webview 初始化会得到的宽度高度都是0
  window.addEventListener('resize', flex);
})();
