import request from '@/api/request';

/**
 * 数据大屏相关接口
 */

// 获取博客统计概览（包含所有图表数据）
// 包含：文章列表、总数、访问量趋势、发布趋势、概览数据及趋势、分类、标签、文章归档
export function getBlogOverview() {
  return request.get('/article/statistics');
}
