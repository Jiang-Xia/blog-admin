import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';

import localeSettings from './zh-CN/settings';

export default {
  // 'menu.dashboard': '仪表盘',
  // 'menu.server.dashboard': '仪表盘-服务端',
  // 'menu.server.workplace': '工作台',
  // 'menu.server.monitor': '实时监控-服务端',
  'menu.list': '列表页',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': '常见问题',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',

  // 自定义
  'menu.server.dashboard': '仪表盘',
  'menu.server.workplace': '工作台',

  'menu.server.article': '文章管理',
  'menu.server.articleList': '文章列表',
  'menu.server.articleEdit': '文章编辑',

  'menu.server.category': '分类管理',
  'menu.server.categoryList': '分类列表',

  'menu.server.tag': '标签管理',
  'menu.server.tagList': '标签列表',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
};
