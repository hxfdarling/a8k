/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "81a208b1f61e9ab30a967056260f46e5"
  },
  {
    "url": "assets/css/0.styles.dfe690aa.css",
    "revision": "f15a09bc4d8ab6618ad1b754d83e8271"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.ca27093a.js",
    "revision": "5bd4db8d03f687cd00d1f84439745654"
  },
  {
    "url": "assets/js/2.725ea3ee.js",
    "revision": "be601685dcdeeecf018849a3a710eaeb"
  },
  {
    "url": "assets/js/3.d22063b6.js",
    "revision": "57d2fd4f417cfeec6417121258f47fd7"
  },
  {
    "url": "assets/js/4.49f27d8c.js",
    "revision": "b5fe8d0b1f470a13e6fa75cc878f384b"
  },
  {
    "url": "assets/js/5.d6b508de.js",
    "revision": "4115127caae945d33e7534d70b85fa6a"
  },
  {
    "url": "assets/js/6.e4a3ec97.js",
    "revision": "46aa8db6e9e97b8b380997a5dab90b02"
  },
  {
    "url": "assets/js/7.05890946.js",
    "revision": "e339f7befd3ef2a7b383bd09b50762a8"
  },
  {
    "url": "assets/js/8.40217b14.js",
    "revision": "a041acfcccda6bc965b462fbf521566f"
  },
  {
    "url": "assets/js/9.7f404717.js",
    "revision": "e82afe1c5ef866839bd31c565aab8d44"
  },
  {
    "url": "assets/js/app.af3373a2.js",
    "revision": "9c47bdef28484aed9c04c6093ded66ff"
  },
  {
    "url": "config/index.html",
    "revision": "29641d6c4990c3dc948d11fd901dbec7"
  },
  {
    "url": "dev/index.html",
    "revision": "6340dd552b91e23c82f12023272e70b2"
  },
  {
    "url": "guide/index.html",
    "revision": "3a9623df1fb19c47087f270a5e3bcfb5"
  },
  {
    "url": "index.html",
    "revision": "6cf191b9f9f3cadbcdbb82ebe537d534"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
