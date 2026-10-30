/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  /** 是否走 /encrypt 网关（与 home 共用命名） */
  readonly VITE_NUXT_OPEN_ENCRYPT?: string;
  /** 网关套件 aes|gm，须与 Nest app_gatewayCrypto 一致 */
  readonly VITE_NUXT_GATEWAY_CRYPTO?: string;
  /** 开发态加解密分步耗时日志；仅 DEV 且为 true 时打印 */
  readonly VITE_NUXT_GATEWAY_CRYPTO_LOG?: string;
  /** 生产构建是否启用轻量业务代码混淆（标识符 + 剥离 console；仅 vite.config.prod 读取） */
  readonly VITE_ENABLE_OBFUSCATE: string;
  /**
   * 仅 DEV：登录人机验证固定方式 graphic|slide|click|rotate；未配置则随机
   */
  readonly VITE_CAPTCHA_MODE?: string;
}

namespace guidance {}
namespace dayjs {}
namespace $t {}
namespace $router {}
namespace $route {}
