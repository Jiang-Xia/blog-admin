/**
 * 生产构建代码混淆：封装 vite-plugin-bundle-obfuscator。
 * 仅在 VITE_ENABLE_OBFUSCATE=true 时由 vite.config.prod 挂载。
 * autoExcludeNodeModules=false，保留项目自有 manualChunks，仅靠 excludes 跳过 vendor。
 *
 * 实测：stringArray / splitStrings / controlFlowFlattening / debugProtection
 * 均可能弄坏登录页等 Vue scoped 样式，故保持关闭；只做标识符混淆 + 剥 console。
 *
 * options 透传 javascript-obfuscator，完整说明见：
 * https://github.com/javascript-obfuscator/javascript-obfuscator#javascript-obfuscator-options
 */
import type { PluginOption } from 'vite';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';

/**
 * 排除 vite.config.prod 中 manualChunks 产出的 vendor 文件名。
 * 用「chunk名-hash.js」精确匹配，避免误伤如 chart-option 等业务 chunk。
 */
const VENDOR_CHUNK_EXCLUDES = [
  /[/\\]arco-[A-Za-z0-9_]+\.js$/,
  /[/\\]chart-[A-Za-z0-9_]+\.js$/,
  /[/\\]vue-[A-Za-z0-9_]+\.js$/,
  /[/\\]md-editor-[A-Za-z0-9_]+\.js$/,
  /[/\\]xlsx-[A-Za-z0-9_]+\.js$/,
];

export default function configObfuscatorPlugin(): PluginOption {
  return vitePluginBundleObfuscator({
    enable: true, // 是否启用混淆
    log: true, // 构建时打印混淆体积前后对比
    apply: 'build', // 仅 production build，不影响 dev serve
    // false：不改写项目已有 manualChunks；true 时插件会额外拆 vendor 并自动排除
    autoExcludeNodeModules: false,
    excludes: VENDOR_CHUNK_EXCLUDES, // 不混淆的 chunk 文件名（RegExp / 字符串）
    threadPool: true, // 多线程混淆，加快大包构建
    options: {
      // —— 输出形态 ——
      compact: true, // 压成单行，去掉换行与多余空白
      simplify: true, // 简化 AST（合并表达式等），便于后续变换、略减体积

      // —— 控制流 ——
      // 把 if/for/while 等改写成 switch+状态机，难读，运行可慢约 1.5x；易弄坏 Vue 渲染 → 关
      controlFlowFlattening: false,
      controlFlowFlatteningThreshold: 0.75, // 参与扁平化的节点比例 0~1（仅 flattening 开启时生效）
      // 插入永不执行的废代码，增大体积与阅读成本 → 关（包体会暴涨）
      deadCodeInjection: false,

      // —— 反调试 / 控制台 ——
      // 检测 DevTools，用 debugger 等打断调试；验证样式时请先别开 F12，以免误判
      debugProtection: true,
      debugProtectionInterval: 2000, // 每隔 N ms 复查
      disableConsoleOutput: true, // 把 console.log/warn/error 等替换为空函数，减少控制台泄信息

      // —— 标识符 / 全局 ——
      identifierNamesGenerator: 'hexadecimal', // 变量/函数名风格：hexadecimal | mangled | dictionary
      // 是否重命名全局变量；开了易弄坏未在作用域声明的全局引用 → 关
      renameGlobals: false,
      // 代码被美化/格式化后“自毁”（运行异常）；易与打包工具冲突 → 关
      selfDefending: false,
      log: false, // javascript-obfuscator 自身是否打内部日志（非 Vite 插件 log）

      // —— 字面量变换 ——
      // 数字改成表达式，如 123 → 0x7b^0，增加阅读成本
      numbersToExpressions: true,
      // 把长字符串切成多段再拼接；短 class / data-v 被切开后易与 CSS 对不齐 → 关
      splitStrings: false,
      splitStringsChunkLength: 10, // 每段字符数（仅 splitStrings 开启时生效）
      // 混淆对象字面量的键名；可能影响依赖字面键的逻辑，本地验证中
      transformObjectKeys: true,
      // 字符串改成 \uXXXX 转义形式；体积膨胀大、收益低 → 关
      unicodeEscapeSequence: false,

      // —— 字符串数组（核心“藏字符串”手段；会破坏 Vue scoped，整组关闭） ——
      // 把字符串抽到数组，代码里改成 a[i] 访问；曾导致登录页样式错乱 → 关
      stringArray: false,
      stringArrayThreshold: 0.75, // 参与抽取的字符串比例 0~1
      stringArrayEncoding: [], // 数组项编码：[] 无编码 | base64 | rc4
      stringArrayCallsTransform: false, // 对 stringArray 的调用再包一层函数
      stringArrayCallsTransformThreshold: 0.5, // 上述包装比例
      stringArrayIndexShift: false, // 访问下标时做偏移运算
      stringArrayRotate: false, // 构建时旋转数组顺序
      stringArrayShuffle: false, // 构建时打乱数组顺序
      stringArrayWrappersCount: 1, // 访问包装函数层数
      stringArrayWrappersChainedCalls: false, // 包装函数之间是否链式调用
      stringArrayWrappersParametersMaxCount: 2, // 包装函数最大参数个数
      stringArrayWrappersType: 'variable', // 包装形态：variable | function
    },
  });
}
