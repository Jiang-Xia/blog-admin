<template>
  <div class="table-pagination">
    <span v-if="total > 0" class="table-pagination__range">{{ rangeText }}</span>
    <a-pagination
      :total="total"
      :current="current"
      :page-size="pageSize"
      show-total
      show-jumper
      show-page-size
      @change="onChange"
      @page-size-change="onPageSizeChange"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      total?: number;
      current?: number;
      pageSize?: number;
    }>(),
    {
      total: 0,
      current: 1,
      pageSize: 10,
    },
  );

  const emit = defineEmits<{
    'change': [current: number];
    'page-size-change': [pageSize: number];
  }>();

  const rangeText = computed(() => {
    if (!props.total) return '';
    const start = (props.current - 1) * props.pageSize + 1;
    const end = Math.min(props.current * props.pageSize, props.total);
    return `第 ${start}-${end} 条`;
  });

  const onChange = (current: number) => {
    emit('change', current);
  };

  const onPageSizeChange = (pageSize: number) => {
    emit('page-size-change', pageSize);
  };
</script>

<style scoped lang="less">
  .table-pagination {
    display: flex;
    width: 100%;
    padding-top: 16px;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;

    &__range {
      color: var(--color-text-2);
      font-size: 14px;
      white-space: nowrap;
    }
  }
</style>
