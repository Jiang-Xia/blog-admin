/**
 * 生产构建代码混淆：封装 vite-plugin-bundle-obfuscator。
 * 仅在 VITE_ENABLE_OBFUSCATE=true 时由 vite.config.prod 挂载。
 * autoExcludeNodeModules=false，保留项目自有 manualChunks，仅靠 excludes 跳过 vendor。
 * 反调试走 obfuscator 自带 debugProtection / disableConsoleOutput。
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
      compact: true, // 压成单行，去掉多余空白
      simplify: true, // 简化语法树，便于后续变换

      // —— 控制流（提升阅读成本，有运行时开销） ——
      controlFlowFlattening: true, // 打乱 if/循环等控制流，约可慢 1.5x
      controlFlowFlatteningThreshold: 0.5, // 参与扁平化的节点比例 0~1，越高越慢越难读
      deadCodeInjection: false, // 注入无用代码；关：避免包体暴涨

      // —— 反调试 / 控制台 ——
      debugProtection: true, // 打开 DevTools 时用 debugger 等手段打断调试
      debugProtectionInterval: 2000, // 每隔 N ms 复查；0 表示只检查一次
      disableConsoleOutput: true, // 替换 console.* 为空实现，避免控制台泄信息

      // —— 标识符 / 全局 ——
      identifierNamesGenerator: 'hexadecimal', // 变量名风格：hexadecimal | mangled | dictionary
      renameGlobals: false, // 是否重命名全局变量；关：避免弄坏未声明的全局引用
      selfDefending: false, // 代码被美化/格式化后自毁；关：减少与部分打包工具冲突
      log: false, // obfuscator 内部日志（非 Vite 插件 log）

      // —— 字面量变换 ——
      numbersToExpressions: false, // 数字改成表达式（如 123 → 0x7b^0）；关：少一点开销
      splitStrings: true, // 长字符串拆成拼接片段
      splitStringsChunkLength: 8, // 每段字符数
      transformObjectKeys: false, // 是否混淆对象键名；关：避免破坏运行时依赖字面键的逻辑
      unicodeEscapeSequence: false, // 字符串变 \uXXXX；关：可读性差且收益有限

      // —— 字符串数组（核心防抄手段） ——
      stringArray: true, // 字面量抽到数组，代码里改为下标访问
      stringArrayThreshold: 0.75, // 参与抽取的字符串比例 0~1
      stringArrayEncoding: ['base64'], // 数组项编码：[] | base64 | rc4
      stringArrayCallsTransform: true, // 把对 stringArray 的调用再包一层，增加还原难度
      stringArrayCallsTransformThreshold: 0.5, // 上述变换比例
      stringArrayIndexShift: true, // 访问时对下标做偏移运算
      stringArrayRotate: true, // 构建时旋转数组顺序
      stringArrayShuffle: true, // 构建时打乱数组顺序
      stringArrayWrappersCount: 1, // 访问包装函数层数
      stringArrayWrappersChainedCalls: true, // 包装函数之间链式调用
      stringArrayWrappersParametersMaxCount: 2, // 包装函数最大参数个数
      stringArrayWrappersType: 'variable', // 包装形态：variable | function
    },
  });
}
