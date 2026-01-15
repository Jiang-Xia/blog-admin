import { ref } from 'vue';
import api from '@/api/index';
import type { LocationQueryValue } from 'vue-router';
import { Message } from '@arco-design/web-vue';
// import { getToken } from '@/utils/auth';
import { useUserStore } from '@/store';

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
export { colors, getRandomClor };

export const updateViews = async (id: LocationQueryValue | LocationQueryValue[]) => {
  await api.updateViews({ id });
};
export const updateLikes = async (data: Record<string, unknown>) => {
  const res = await api.updateLikes(data);
  return res;
};

const userStore = useUserStore();
// 更新点赞数
export const updateLikesHandle = async (item: { id: string; checked: 0 | 1; likes: number }) => {
  if (!userStore.token) {
    Message.warning('请先登录！');
    return;
  }
  const send = {
    articleId: item.id,
    uid: userStore.id,
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
type C = { name: string; type: string; cb: () => void };
export const ceateOkHandle = async ({ name, type, cb }: C) => {
  // console.log(userStore.createTime);
  const obj = {
    label: name,
    value: name,
    uid: userStore.id,
  };
  if (type === '分类') {
    await api.createCategory(obj);
    Message.success('添加成功！');
    cb();
  } else {
    await api.createTag(obj);
    Message.success('添加成功！');
    cb();
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

// 更新分类和标签
type U = { name: string; type: string; id: string; cb: () => void };
export const updateCategoryTag = async ({ name, type, id, cb }: U) => {
  const obj = {
    label: name,
    value: name,
  };
  if (type === '分类') {
    await api.updateCategory({ id, ...obj });
    Message.success('更新成功！');
    cb();
  } else {
    await api.updateTag({ id, ...obj });
    Message.success('更新成功！');
    cb();
  }
};
