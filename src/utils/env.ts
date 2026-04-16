// 使用 Vite 的运行时环境变量，避免浏览器端访问 process 报错。
const debug = !import.meta.env.PROD;

export default debug;
