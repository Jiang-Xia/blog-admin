import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeSettings from './en-US/settings';

export default {
  // 'menu.dashboard': 'Dashboard',
  // 'menu.server.dashboard': 'Dashboard-Server',
  // 'menu.server.workplace': 'Workplace-Server',
  // 'menu.server.monitor': 'Monitor-Server',
  'menu.list': 'List',
  'menu.result': 'Result',
  'menu.exception': 'Exception',
  'menu.form': 'Form',
  'menu.profile': 'Profile',
  'menu.visualization': 'Data Visualization',
  'menu.user': 'User Center',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': 'FAQ',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',

  // 自定义
  'menu.server.dashboard': 'Dashboard',
  'menu.server.workplace': 'Workplace',

  'menu.server.article': 'Article',
  'menu.server.articleList': 'List',
  'menu.server.articleEdit': 'Edit',

  'menu.server.category': 'Category',
  'menu.server.categoryList': 'List',

  'menu.server.tag': 'Tag',
  'menu.server.tagList': 'List',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
};
