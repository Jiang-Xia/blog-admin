import type { RouteRecordNormalized } from 'vue-router';

const modules: any = import.meta.glob('./modules/*.ts', { eager: true });
const externalModules: any = import.meta.glob('./externalModules/*.ts', { eager: true });

// 自动导入路由模块（和模块命名没关系）
function formatModules(
  _modules: Record<string, { default?: RouteRecordNormalized | RouteRecordNormalized[] }>,
  result: RouteRecordNormalized[],
) {
  Object.keys(_modules).forEach((key) => {
    const defaultModule = _modules[key].default;
    // console.info('defaultModule: ', defaultModule,);
    if (!defaultModule) return;
    const moduleList = Array.isArray(defaultModule) ? [...defaultModule] : [defaultModule];
    result.push(...moduleList);
  });
  return result;
}

export const appRoutes: RouteRecordNormalized[] = formatModules(modules, []);

export const appExternalRoutes: RouteRecordNormalized[] = formatModules(externalModules, []);
// console.log({ appRoutes, appExternalRoutes }, '-----------  >')
