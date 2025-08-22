/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

namespace guidance {}
namespace dayjs {}
namespace $t {}
