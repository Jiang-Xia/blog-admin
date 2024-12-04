import request from '@/api/request';
import { ref } from 'vue';

import useLoading from '@/hooks/loading';
// 分页表格列表
export const useTableList = (
  url: string,
  data: any,
  method = 'get',
  immediate = true
) => {
  const list = ref([]);
  const total = ref(0);
  const { loading, setLoading } = useLoading(true);
  // 请求参数
  const action = ref(data);
  // 分页
  const pagination = ref({});
  const loadMore = async () => {
    const res = await request({
      url,
      method,
      params: method === 'get' ? action.value : '',
      data: method === 'post' ? action.value : '',
    });
    loading.value = false;
    setLoading(false);
    list.value = res.data.list;
    res.data.pagination.current = res.data.pagination.page;
    pagination.value = res.data.pagination;
  };
  if (immediate) {
    loadMore();
  }
  const refreshFun = () => {
    loadMore();
  };
  return {
    pagination,
    action,
    loading,
    list,
    total,
    loadMore,
    refreshFun,
  };
};

// 不分页表格列表
export const useTableNoPageList = (url: string, data: any, method = 'get') => {
  const list = ref([]);
  const total = ref(0);
  const { loading, setLoading } = useLoading(true);
  // 请求参数
  const action = ref(data);

  const loadMore = async () => {
    const res = await request({
      url,
      method,
      params: method === 'get' ? action.value : '',
      data: method === 'post' ? action.value : '',
    });
    loading.value = false;
    setLoading(false);
    list.value = res.data;
  };
  loadMore();
  const refreshFun = () => {
    loadMore();
  };
  return {
    action,
    loading,
    list,
    total,
    loadMore,
    refreshFun,
  };
};
export default { useTableList, useTableNoPageList };
