interface configState {
  iconfonrUrl: string;
}
const config: configState = {
  // 阿里巴巴图标库链接，新添加图标需要重新生成 css 改成js
  iconfonrUrl: '//at.alicdn.com/t/font_3114416_q86z969eeh.js',
};

let url: string;
const mode = import.meta.env.MODE;
// x-api 后端服务
if (mode === 'production') {
  // baseUrl = 'http://42.192.145.236:5000'
  url = 'https://jiang-xia.top/x-api/blog-server';
} else {
  url = 'http://localhost:5000';
  // url = 'http://42.192.145.236:5000'
  // url = 'https://jiang-xia.top/x-api/blog-server';
}
export const baseUrl: string = url;
export default config;
