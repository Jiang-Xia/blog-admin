import type { RouteRecordNormalized } from 'vue-router';

const modules = import.meta.glob<{ default: RouteRecordNormalized | RouteRecordNormalized[] }>(
  './modules/*.ts',
);
const externalModules = import.meta.glob<{
  default: RouteRecordNormalized | RouteRecordNormalized[];
}>('./externalModules/*.ts');

// 自动导入路由模块（和模块命名没关系）
function formatModules(
  _modules: Record<string, { default?: RouteRecordNormalized | RouteRecordNormalized[] }>,
  result: RouteRecordNormalized[],
) {
  Object.keys(_modules).forEach((key) => {
    const defaultModule = _modules[key].default;
    // console.info('defaultModule: ', defaultModule);
    if (!defaultModule) return;
    const moduleList = Array.isArray(defaultModule) ? [...defaultModule] : [defaultModule];
    result.push(...moduleList);
  });
  return result;
}

export const appRoutes: RouteRecordNormalized[] = formatModules(modules, []);

export const appExternalRoutes: RouteRecordNormalized[] = formatModules(externalModules, []);
