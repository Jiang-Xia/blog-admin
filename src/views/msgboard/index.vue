<template>
  <div class="container">
    <!-- <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" /> -->
    <a-card class="general-card" :title="t('msgboard.query.title')">
      <a-row align="center">
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item :label="t('msgboard.form.commentContent')">
                  <a-input
                    v-model="formModel.comment"
                    :placeholder="t('msgboard.form.placeholder.comment')"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('msgboard.form.replyContent')">
                  <a-input
                    v-model="formModel.respondent"
                    :placeholder="t('msgboard.form.placeholder.reply')"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item :label="t('msgboard.form.email')">
                  <a-input
                    v-model="formModel.eamil"
                    :placeholder="t('msgboard.form.placeholder.email')"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('msgboard.form.nickname')">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="t('msgboard.form.placeholder.nickname')"
                    @press-enter="search()"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="5" style="text-align: right">
          <a-space :size="8">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ t('msgboard.button.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ t('msgboard.button.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
        stripe
      >
        <template #columns>
          <a-table-column
            :title="t('msgboard.table.nickname')"
            data-index="name"
            align="center"
            :width="100"
          />
          <a-table-column
            :title="t('msgboard.table.avatar')"
            data-index="avatar"
            align="center"
            :width="100"
          >
            <template #cell="{ record }">
              <a-avatar>
                <img :alt="record.title" :src="record.avatar" />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('msgboard.table.comment')"
            data-index="comment"
            :width="460"
            tooltip
            ellipsis
          />
          <a-table-column
            :title="t('msgboard.table.address')"
            data-index="address"
            :width="200"
            tooltip
          >
            <template #cell="{ record }">
              <a-link :href="record.address" target="_blank">{{ record.address }}</a-link>
            </template>
          </a-table-column>
          <!-- <a-table-column title="状态" data-index="url">
            <template #cell="{ record }">
              <a-switch
                v-model="record.agreed"
                @change="onSwitchChange(record)"
              >
                <template #checked-icon>
                  <icon-check />
                </template>
                <template #unchecked-icon>
                  <icon-close />
                </template>
              </a-switch>
            </template>
          </a-table-column> -->
          <a-table-column
            :title="t('msgboard.table.operation')"
            data-index="operations"
            :width="100"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" status="danger" @click="delHandle(record.id)">
                  <icon-delete />
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { type Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import request from '@/api/request';
  import { useTableList } from '@/hooks/data';

  const { t } = useI18n();

  const generateFormModel = () => {
    return {
      name: '',
      comment: '',
      eamil: '',
      respondent: '',
      page: 1,
      pageSize: 10,
    };
  };
  const formModel = ref(generateFormModel());
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const {
    action,
    loading,
    total,
    list: renderData,
    loadMore,
  } = useTableList('/msgboard', formModel.value);
  watch(
    () => renderData.value,
    (n) => {
      pagination.total = total.value;
    },
  );
  const search = () => {
    action.value = formModel.value;
    loadMore();
  };
  const onPageChange = (current: number) => {
    formModel.value.page = current;
    pagination.current = current;
    search();
  };
  const reset = () => {
    formModel.value = generateFormModel();
    pagination.current = 1;
    search();
  };
  const delHandle = async (id: number) => {
    Modal.confirm({
      title: t('msgboard.confirm.delete'),
      content: t('msgboard.confirm.deleteContent'),
      onOk: async () => {
        const res = await request.post('/msgboard/delete', [id]);
        Message.success(t('msgboard.message.deleteSuccess'));
        search();
      },
    });
  };
  const onSwitchChange = async (record: any) => {
    const { agreed, id } = record;
    const res = await request.patch(`/msgboard`, { agreed, id });
    Message.success(t('msgboard.message.setSuccess'));
  };
</script>

<script lang="ts">
  export default {
    name: 'MsgboardTable',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }

  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }

  .arco-card-body {
    min-height: 30vh;
  }
</style>
