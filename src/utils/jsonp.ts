/* eslint-disable */
const cache: any = {};
function jsonp(url: string, callback: any) {
  if (!url) {
    return;
  }
  const a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']; // 定义一个数组以便产生随机函数名
  const r1 = Math.floor(Math.random() * 10);
  const r2 = Math.floor(Math.random() * 10);
  const r3 = Math.floor(Math.random() * 10);
  const name = `getJSONP${a[r1]}${a[r2]}${a[r3]}`;
  const cbname = `cache.${name}`; // 作为jsonp函数的属性
  if (url.indexOf('?') === -1) {
    url += `?jsonp=${cbname}`;
  } else {
    url += `&jsonp=${cbname}`;
  }
  const script: any = document.createElement('script');
  // 定义被脚本执行的回调函数
  cache[name] = function (res: any) {
    console.log(cache[name]);
    try {
      callback && callback(res);
    } catch (err: any) {
      //
    } finally {
      // 最后删除该函数与script元素
      delete cache[name];
      script.parentNode.removeChild(script);
    }
  };
  script.src = url;
  console.log(script.src);
  document.getElementsByTagName('head')[0].appendChild(script);
}
export default jsonp;
