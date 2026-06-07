<template>
  <div class="container">
    <a-card class="general-card" :title="t('payOrder.title')">
      <!-- 搜索栏 -->
      <a-row style="margin-bottom: 16px" :gutter="16">
        <a-col :flex="1">
          <a-form :model="searchForm" layout="inline" :label-col-props="{ span: 6 }">
            <a-form-item :label="t('payOrder.form.outTradeNo')">
              <a-input
                v-model="searchForm.outTradeNo"
                :placeholder="t('payOrder.form.placeholder.outTradeNo')"
                allow-clear
              />
            </a-form-item>
            <a-form-item :label="t('payOrder.form.status')">
              <a-select
                v-model="searchForm.status"
                :placeholder="t('payOrder.form.placeholder.status')"
                allow-clear
                style="width: 140px"
              >
                <a-option value="PENDING">{{ t('payOrder.status.PENDING') }}</a-option>
                <a-option value="PAID">{{ t('payOrder.status.PAID') }}</a-option>
                <a-option value="REFUNDED">{{ t('payOrder.status.REFUNDED') }}</a-option>
                <a-option value="CLOSED">{{ t('payOrder.status.CLOSED') }}</a-option>
                <a-option value="FAILED">{{ t('payOrder.status.FAILED') }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="t('payOrder.form.subject')">
              <a-input
                v-model="searchForm.subject"
                :placeholder="t('payOrder.form.placeholder.subject')"
                allow-clear
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">
                  <template #icon><icon-search /></template>
                  {{ t('payOrder.button.search') }}
                </a-button>
                <a-button @click="handleReset">
                  <template #icon><icon-refresh /></template>
                  {{ t('payOrder.button.reset') }}
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>

      <!-- 表格 -->
      <a-table
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        :data="tableData"
        :bordered="false"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #columns>
          <a-table-column
            :title="t('payOrder.table.outTradeNo')"
            data-index="outTradeNo"
            :width="200"
            :ellipsis="true"
          />
          <a-table-column
            :title="t('payOrder.table.tradeNo')"
            data-index="tradeNo"
            :width="180"
            :ellipsis="true"
          />
          <a-table-column
            :title="t('payOrder.table.subject')"
            data-index="subject"
            :width="160"
            :ellipsis="true"
          />
          <a-table-column :title="t('payOrder.table.totalAmount')" :width="100" align="right">
            <template #cell="{ record }">
              <span style="font-weight: 600; color: #165dff">¥{{ record.totalAmount }}</span>
            </template>
          </a-table-column>
          <a-table-column :title="t('payOrder.table.status')" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="statusColorMap[record.status]" size="small">
                {{ t(`payOrder.status.${record.status}`) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('payOrder.table.channel')" :width="80" align="center">
            <template #cell="{ record }">
              {{ t(`payOrder.channel.${record.channel}`) }}
            </template>
          </a-table-column>
          <a-table-column :title="t('payOrder.table.refundAmount')" :width="100" align="right">
            <template #cell="{ record }">
              <span v-if="record.refundAmount > 0" style="color: #f53f3f">
                ¥{{ record.refundAmount }}
              </span>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('payOrder.table.createTime')"
            data-index="createTime"
            :width="170"
          />
          <a-table-column :title="t('payOrder.table.action')" :width="220" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <!-- 只有已支付才能退款 -->
                <a-button
                  v-if="record.status === 'PAID'"
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleRefund(record)"
                >
                  {{ t('payOrder.action.refund') }}
                </a-button>
                <!-- 待支付或失败才能关单 -->
                <a-button
                  v-if="['PENDING', 'FAILED'].includes(record.status)"
                  type="text"
                  size="small"
                  status="warning"
                  @click="handleClose(record)"
                >
                  {{ t('payOrder.action.close') }}
                </a-button>
                <!-- 待支付状态可主动查询 -->
                <a-button
                  v-if="record.status === 'PENDING'"
                  type="text"
                  size="small"
                  @click="handleQuery(record)"
                >
                  {{ t('payOrder.action.query') }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 退款弹窗 -->
    <a-modal
      v-model:visible="refundVisible"
      :title="t('payOrder.refund.title')"
      :ok-text="t('payOrder.refund.confirm')"
      :ok-button-props="{ loading: refundLoading }"
      @ok="submitRefund"
    >
      <a-form :model="refundForm" layout="vertical">
        <a-form-item :label="t('payOrder.refund.amount')" required>
          <a-input-number
            v-model="refundForm.refundAmount"
            :placeholder="t('payOrder.refund.placeholder.amount')"
            :min="0.01"
            :precision="2"
            :max="currentOrder?.totalAmount"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item :label="t('payOrder.refund.reason')">
          <a-textarea
            v-model="refundForm.refundReason"
            :placeholder="t('payOrder.refund.placeholder.reason')"
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message, Modal } from '@arco-design/web-vue';
  import { getPayOrderList, refundPayOrder, closePayOrder, queryPayOrder } from '@/api/pay-order';

  const { t } = useI18n();

  // 状态颜色映射
  const statusColorMap: Record<string, string> = {
    PENDING: 'orange',
    PAID: 'green',
    REFUNDED: 'red',
    CLOSED: 'gray',
    FAILED: 'red',
  };

  // 搜索表单
  const searchForm = reactive({
    outTradeNo: '',
    status: undefined as string | undefined,
    subject: '',
  });

  // 表格数据
  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 20,
    showTotal: true,
    showPageSize: true,
  });

  // 退款弹窗
  const refundVisible = ref(false);
  const refundLoading = ref(false);
  const currentOrder = ref<any>(null);
  const refundForm = reactive({
    refundAmount: 0,
    refundReason: '',
  });

  /** 加载订单列表 */
  const loadData = async () => {
    loading.value = true;
    try {
      const params: Record<string, any> = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (searchForm.outTradeNo) params.outTradeNo = searchForm.outTradeNo;
      if (searchForm.status) params.status = searchForm.status;
      if (searchForm.subject) params.subject = searchForm.subject;

      const res = (await getPayOrderList(params)) as any;
      const responseData = res?.data || res;
      tableData.value = responseData?.list || [];
      pagination.total = responseData?.pagination?.total || 0;
    } catch (err) {
      console.error('加载订单列表失败', err);
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    loadData();
  };

  const handleReset = () => {
    searchForm.outTradeNo = '';
    searchForm.status = undefined;
    searchForm.subject = '';
    handleSearch();
  };

  const onPageChange = (page: number) => {
    pagination.current = page;
    loadData();
  };

  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadData();
  };

  /** 退款 */
  const handleRefund = (record: any) => {
    currentOrder.value = record;
    refundForm.refundAmount = record.totalAmount;
    refundForm.refundReason = '';
    refundVisible.value = true;
  };

  const submitRefund = async () => {
    if (!refundForm.refundAmount || refundForm.refundAmount <= 0) {
      Message.warning('请输入退款金额');
      return;
    }
    refundLoading.value = true;
    try {
      await refundPayOrder({
        out_trade_no: currentOrder.value.outTradeNo,
        refund_amount: String(refundForm.refundAmount),
        refund_reason: refundForm.refundReason || '用户申请退款',
      });
      Message.success(t('payOrder.refund.success'));
      refundVisible.value = false;
      loadData();
    } catch (err) {
      console.error('退款失败', err);
    } finally {
      refundLoading.value = false;
    }
  };

  /** 关单 */
  const handleClose = (record: any) => {
    Modal.warning({
      title: t('payOrder.action.close'),
      content: t('payOrder.close.confirm'),
      async onOk() {
        try {
          await closePayOrder({ out_trade_no: record.outTradeNo });
          Message.success(t('payOrder.close.success'));
          loadData();
        } catch (err) {
          console.error('关单失败', err);
        }
      },
    });
  };

  /** 查询状态 */
  const handleQuery = async (record: any) => {
    try {
      const res = (await queryPayOrder({ out_trade_no: record.outTradeNo })) as any;
      const orderData = res?.data || res;
      Message.success(`${t('payOrder.query.success')}${t(`payOrder.status.${orderData.status}`)}`);
      loadData();
    } catch (err) {
      console.error('查询状态失败', err);
    }
  };

  onMounted(() => {
    loadData();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0;
  }
</style>
