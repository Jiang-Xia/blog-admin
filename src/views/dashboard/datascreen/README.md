# 博客数据大屏展示

基于 Vue3 + ECharts + Arco Design 实现的博客数据可视化大屏展示系统。

## 功能特性

### 📊 数据展示模块

1. **数据概览卡片**
   - 文章总数统计
   - 总访问量统计
   - 总点赞数统计
   - 评论总数统计
   - 实时趋势显示

2. **访问量趋势图**
   - 近30天访问量趋势
   - 折线图展示
   - 渐变色填充效果

3. **文章发布趋势**
   - 按月统计文章发布量
   - 柱状图展示
   - 渐变色柱体

4. **分类文章统计**
   - 环形饼图展示各分类文章占比
   - 支持交互高亮
   - 显示具体数值和百分比

5. **标签词云**
   - 词云图展示热门标签
   - 标签大小反映文章数量
   - 多彩色渲染

6. **热门文章排行**
   - TOP 10 热门文章列表
   - 显示访问量和点赞数
   - 前三名特殊标识

7. **最近活动**
   - 时间轴展示最近操作
   - 分类展示不同活动类型
   - 彩色图标标识

### 🎨 界面特性

- **深色主题**: 科技感深色背景配色
- **玻璃态效果**: 毛玻璃背景模糊效果
- **渐变动画**: 平滑的数值动画过渡
- **全屏模式**: 支持全屏展示
- **响应式布局**: 适配不同屏幕尺寸

## 技术栈

- **Vue 3.5**: 组合式API + TypeScript
- **ECharts 5.6**: 数据可视化图表库
- **vue-echarts 7.0**: Vue 3 的 ECharts 封装
- **echarts-wordcloud**: 词云图插件
- **Arco Design Vue 2.57**: UI 组件库
- **TypeScript**: 类型安全

## 文件结构

```
datascreen/
├── index.vue                      # 主页面
└── components/
    ├── overview-card.vue          # 数据概览卡片
    ├── view-trend-chart.vue       # 访问趋势图
    ├── article-publish-chart.vue  # 发布趋势图
    ├── category-chart.vue         # 分类统计图
    ├── tag-cloud-chart.vue        # 标签词云图
    ├── popular-articles.vue       # 热门文章列表
    └── recent-activities.vue      # 最近活动列表
```

## 使用说明

### 访问方式

1. 启动项目后访问：`/dashboard/datascreen`
2. 或在仪表盘菜单中点击"数据大屏"

### 操作说明

1. **全屏模式**
   - 点击右上角"全屏显示"按钮进入全屏
   - 按 ESC 键或点击"退出全屏"退出

2. **数据刷新**
   - 页面加载时自动获取最新数据
   - 可手动刷新浏览器更新数据

3. **图表交互**
   - 鼠标悬停查看详细数据
   - 点击图例可隐藏/显示对应数据系列

## API 接口

### 前端接口

文件位置: `src/api/datascreen.ts`

```typescript
// 获取博客统计概览
getBlogOverview()

// 获取分类统计
getCategoryStatistics()

// 获取标签统计
getTagStatistics()

// 获取文章访问趋势
getArticleViewTrend(days)

// 获取热门文章排行
getPopularArticles(limit)

// 获取文章发布趋势
getArticlePublishTrend()

// 获取评论统计
getCommentStatistics()
```

### 后端接口需求

需要后端提供以下接口支持：

1. `GET /article/statistics` - 文章统计数据
2. `GET /category/all` - 分类列表及文章数
3. `GET /tag/all` - 标签列表及文章数
4. `GET /article/view-trend` - 访问量趋势
5. `GET /article/popular` - 热门文章排行

## 数据模拟

当前版本包含模拟数据，方便开发和演示。实际使用时：

1. 确保后端API已实现
2. 修改组件中的数据获取逻辑
3. 移除模拟数据部分

## 自定义配置

### 修改配色方案

在各组件的 ECharts 配置中修改 `color` 数组：

```typescript
color: ['#165DFF', '#14C9C9', '#F7BA1E', '#F77234', '#00B42A', '#722ED1']
```

### 调整图表样式

在 `useChartOption` 钩子的返回对象中修改配置项。

### 修改布局

在 `index.vue` 中调整 CSS Grid 布局：

```css
.charts-container {
  grid-template-columns: repeat(3, 1fr);  /* 3列布局 */
  gap: 20px;
}
```

## 性能优化

1. **按需加载**: 组件采用异步加载方式
2. **数据缓存**: 可添加数据缓存机制减少请求
3. **虚拟滚动**: 长列表可考虑使用虚拟滚动
4. **图表懒加载**: 图表在视口内才渲染

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

不支持 IE 浏览器。

## 后续优化

- [ ] 添加数据刷新按钮和定时刷新
- [ ] 支持日期范围选择
- [ ] 添加数据导出功能
- [ ] 支持自定义主题配置
- [ ] 添加更多图表类型
- [ ] 支持图表拖拽排序
- [ ] 添加数据对比功能

## 常见问题

### Q: 词云不显示？
A: 确保已安装 `echarts-wordcloud` 依赖：
```bash
npm install echarts-wordcloud
```

### Q: 图表不自适应？
A: 确保使用了 `useChartOption` 钩子，它会自动处理响应式。

### Q: 全屏模式异常？
A: 检查浏览器是否支持 Fullscreen API，部分浏览器在 iframe 中可能受限。

## 参考资源

- [ECharts 官方文档](https://echarts.apache.org/)
- [Arco Design Vue](https://arco.design/vue)
- [echarts-wordcloud](https://github.com/ecomfe/echarts-wordcloud)
