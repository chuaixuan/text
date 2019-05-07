if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) { //sw.js处于根目录，为当前项目代理
        console.log('成功安装', registration.scope);
    }).catch(function (err) {
        console.log(err);
    });
}

//下载（ download）
//安装（ install）
//激活（ activate）

self.importScripts('serviceworker-cache-polyfill.js'); //对低版本浏览器兼容，polyfill

var urlsToCache = [
    '/',
    '/index.js',
    '/style.css',
    '/favicon.ico',
]; //需要缓存的静态文件

var CACHE_NAME = 'counterxing';

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) { //对fetch请求监听，检测缓存中是否存在相同response，如有则返回缓存中的response

    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return debounce(fetch(event.request), 300); //防止重复提交请求
            })
    );
});

/**
 * debounce   fn函数在最后一次调用时刻的wait毫秒之后执行！
 * @param  fn 执行函数
 * @param  wait 时间间隔
 * @param  immediate 为true，debounce会在wait 时间间隔的开始调用这个函数
 * @returns {Function}
 */
function debounce(fn, wait, immediate) {
    var timeout, args, context, timestamp, result;
    var later = function () {
        var last = new Date().getTime() - timestamp;
        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = fn.apply(context, args);
                context = args = null;
            }
        }
    }
    return function () {
        context = this;
        args = arguments;
        timestamp = new Date().getTime(); //每次触发时更新
        var callNow = immediate && !timeout;
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
        if (callNow) {
            result = fn.apply(context, args);
            context = args = null;
        }
        return result;
    }
}
