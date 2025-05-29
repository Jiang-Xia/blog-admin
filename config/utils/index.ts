/**
 * Whether to generate package preview
 * 是否生成打包报告
 */
export default {};
const REPORT = false;
export function isReportMode(): boolean {
  return REPORT;
}
