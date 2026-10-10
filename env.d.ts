/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** 生产构建是否启用轻量业务代码混淆（标识符 + 剥离 console；仅 vite.config.prod 读取） */
  readonly VITE_ENABLE_OBFUSCATE: string;
}

namespace guidance {}
namespace dayjs {}
namespace $t {}
namespace $router {}
namespace $route {}
