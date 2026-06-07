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
import localeSensitiveWord from '@/views/sensitive-word/locale/en-US';
import localeOperationLog from '@/views/operation-log/locale/en-US';
import localeScheduledTask from '@/views/scheduled-task/locale/en-US';
import localeTaskManage from '@/views/task-manage/locale/en-US';

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
  'menu.server.articleList': 'ArticleList',
  'menu.server.articleEdit': 'ArticleEdit',

  'menu.server.category': 'Category',
  'menu.server.categoryList': 'CategoryList',

  'menu.server.tag': 'Tag',
  'menu.server.tagList': 'TagList',

  'menu.server.user': 'Person',
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

  'menu.server.sensitiveWord': 'SensitiveWord',
  'menu.server.sensitiveWordList': 'SensitiveWordList',
  'menu.server.sensitiveWordReview': 'ReviewManagement',

  'menu.server.operationLog': 'OperationLog',
  'menu.server.operationLogList': 'LogList',

  'menu.server.adminTools': 'Admin Tools',

  'menu.server.scheduledTask': 'Scheduled Tasks',
  'menu.server.taskLog': 'Task Log',
  'menu.server.taskManage': 'Task Management',

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
  ...localeSensitiveWord,
  ...localeOperationLog,
  ...localeScheduledTask,
  ...localeTaskManage,
};
