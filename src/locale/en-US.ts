import localeMessageBox from '@/components/message-box/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';
import localeArticle from '@/views/article/locale/en-US';
import localeCategory from '@/views/category/locale/en-US';
import localeTag from '@/views/tag/locale/en-US';
import localeSystem from '@/views/system/locale/en-US';
import localeUser from '@/views/user/locale/en-US';
import localeComment from '@/views/comment/locale/en-US';
import localeMsgboard from '@/views/msgboard/locale/en-US';
import localeLink from '@/views/link/locale/en-US';
import localeResource from '@/views/resource/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';
import localeDatascreen from '@/views/dashboard/datascreen/locale/en-US';

import localeSettings from './en-US/settings';
import localeCommon from './en-US/common';

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

  'menu.server.user': 'Me',
  'menu.server.userSet': 'UserSet',
  'menu.server.menuSet': 'MenuSet',

  'menu.server.link': 'Link',
  'menu.server.linkList': 'LinkList',

  'menu.server.msgboard': 'Msgboard',
  'menu.server.msgboardList': 'MsgboardList',

  'menu.server.system': 'System',
  'menu.server.userManage': 'UserManage',
  'menu.server.menuManage': 'MenuManage',
  'menu.server.roleManage': 'RoleManage',
  'menu.server.privilegeManage': 'PrivilegeManage',
  'menu.server.deptManage': 'DeptManage',

  'menu.server.resource': 'Resource',
  'menu.server.resourceList': 'ResourceList',

  'menu.server.comment': 'Comment',
  'menu.server.commentList': 'CommentList',

  ...localeSettings,
  ...localeCommon,
  ...localeMessageBox,
  ...localeLogin,
  ...localeArticle,
  ...localeCategory,
  ...localeTag,
  ...localeSystem,
  ...localeUser,
  ...localeComment,
  ...localeMsgboard,
  ...localeLink,
  ...localeResource,
  ...localeWorkplace,
  ...localeDatascreen,
};
