interface configState {
  iconfonrUrl: string;
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  iconfonrUrl: '//at.alicdn.com/t/c/font_3574965_lptsdcyg8dk.js',
};

let url: string;
// let url2: string;
const mode = import.meta.env.MODE;
const metaEnv = import.meta.env;
if (mode === 'development') {
  console.log({ 当前环境变量: { MODE: metaEnv.MODE } });
}
// x-api 后端服务
if (mode === 'production') {
  url = metaEnv.VITE_API_BASE_URL;
} else {
  url = metaEnv.VITE_PREFIX_PATH;
}
// 静态资源域名（与 blog-server /static 挂载一致）
const imgUrl =
  metaEnv.VITE_API_STATIC_URL ||
  (mode === 'production' ? 'https://jiang-xia.top/x-api/blog-server' : 'http://localhost:5000');
export const baseUrl: string = url;
export const staticUrl: string = imgUrl;
export default config;
