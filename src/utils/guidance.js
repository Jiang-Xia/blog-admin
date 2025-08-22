import { useShepherd } from 'vue-shepherd';
import 'shepherd.js/dist/css/shepherd.css';

const tour = useShepherd({
  useModalOverlay: true,
});
const shepherd = () => {
  const bool = localStorage.getItem('guidanced');
  if (bool) {
    return;
  }
  tour.addSteps([
    {
      // 统计图
      title: '博客网站数据统计和趋势图',
      text: `统计了近90天来的访问量和14天访问情况趋势图`,
      attachTo: {
        element: '.left-side .panel',
        on: 'bottom',
      },
      buttons: [
        {
          action() {
            localStorage.setItem('guidanced', 'true');
            tour.cancel();
          },
          classes: 'shepherd-button-secondary',
          text: '退出',
        },
        {
          action() {
            return this.next();
          },
          text: '下一步',
        },
      ],
      id: 'left-side-panel',
    },
    {
      title: '系统设置',
      text: `可以设置全屏、暗黑模式、系统页面布局喜好等`,
      attachTo: {
        element: '.navbar .right-side',
        on: 'bottom',
      },
      buttons: [
        {
          action() {
            tour.back();
          },
          classes: 'shepherd-button-secondary',
          text: '上一步',
        },
        {
          action() {
            return this.next();
          },
          text: '下一步',
        },
      ],
      id: 'navbar-right-side',
    },
    {
      title: '头像菜单',
      text: `点击头像，可以选择修改密码、头像等资料，也可以退出登录`,
      attachTo: {
        element: '.arco-avatar',
        on: 'bottom',
      },
      buttons: [
        {
          action() {
            tour.back();
          },
          classes: 'shepherd-button-secondary',
          text: '上一步',
        },
        {
          action() {
            return this.next();
          },
          text: '下一步',
        },
      ],
      id: 'arco-avatar',
    },
    {
      title: '快捷操作',
      text: `如新建文章、菜单设置等功能会放在这里，方便使用。`,
      attachTo: {
        element: '.quick-operation-visited',
        on: 'bottom',
      },
      buttons: [
        {
          action() {
            tour.back();
          },
          classes: 'shepherd-button-secondary',
          text: '上一步',
        },
        {
          action() {
            return this.next();
          },
          text: '下一步',
        },
      ],
      id: 'panel-moduler-wrap',
    },
    {
      title: '最近文章',
      text: `博客网站最近发布的文章，优先在这里展示，方便浏览`,
      attachTo: {
        element: '.recently-article',
        on: 'left',
      },
      buttons: [
        {
          action() {
            tour.back();
          },
          classes: 'shepherd-button-secondary',
          text: '上一步',
        },
        {
          action() {
            localStorage.setItem('guidanced', 'true');
            tour.complete();
          },
          text: '完成引导',
        },
      ],
      id: 'recently-article',
    },
  ]);
  tour.start();
};
export default shepherd;
