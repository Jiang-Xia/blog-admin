import { ref } from 'vue';
import api from '@/api/index';
import { LocationQueryValue } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { getToken } from '@/utils/auth';
import { useAppStore, useUserStore } from '@/store';

// 分类
const categoryOptions = ref([]);
// 标签
const tagsOptions = ref([]);
const getOptions = async (type: string) => {
  if (type === '分类') {
    const res = await api.getAllCategory();
    categoryOptions.value = res.map((v: any) => {
      v.value = v.id;
      return v;
    });
    // console.log(res)
  } else {
    const res = await api.getAllTag();
    tagsOptions.value = res.map((v: any) => {
      v.value = v.id;
      v.checked = false;
      return v;
    });
  }
};
const colors: string[] = [
  '#4ea397',
  '#22c3aa',
  '#7bd9a5',
  '#d0648a',
  '#f58db2',
  '#f2b3c9',
  // dark
  '#dd6b66',
  '#759aa0',
  '#e69d87',
  '#8dc1a9',
  '#ea7e53',
  '#73a373',
  '#73b9bc',
  '#7289ab',
  '#91ca8c',
  '#f49f42',
];
// 随机获取一种颜色
const getRandomClor = () => {
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};
export { categoryOptions, tagsOptions, getOptions, colors, getRandomClor };

export const updateViews = async (
  id: LocationQueryValue | LocationQueryValue[]
) => {
  await api.updateViews({ id });
};
export const updateLikes = async (data: any) => {
  const res = await api.updateLikes(data);
  return res;
};

const appStore = useUserStore();

// 更新点赞数
export const updateLikesHandle = async (item: any) => {
  if (!appStore.state.token) {
    Message.warning('请先登录！');
    return;
  }
  const send = {
    articleId: item.id,
    uid: appStore.getters.userInfo.id,
    status: 1,
  };
  if (item.checked) {
    send.status = 0;
  } else {
    send.status = 1;
  }
  const res = await updateLikes(send);
  if (item.checked) {
    item.likes -= 1;
    item.checked = 0;
  } else {
    item.likes += 1;
    item.checked = 1;
  }
};

// 新建分类和标签
type C = { name: string; type: string };
export const ceateOkHandle = async ({ name, type }: C) => {
  const obj = {
    label: name,
    value: name,
  };
  if (type === '分类') {
    await api.createCategory(obj);
    Message.success('添加成功！');
    getOptions(type);
  } else {
    await api.createTag(obj);
    getOptions(type);
    Message.success('添加成功！');
  }
};

// 删除 分类和标签
export const delCategoryTag = async (type: string, id: string) => {
  if (type === '分类') {
    const res = await api.delCategory(id);
    return res;
    // console.log(res)
  }
  const res = await api.delTag(id);
  return res;
};
