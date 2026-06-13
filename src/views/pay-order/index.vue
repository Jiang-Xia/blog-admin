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
        :pagination="false"
        :data="tableData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1350, y: 600 }"
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
            :width="220"
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
          <a-table-column :title="t('payOrder.table.createTime')" :width="170">
            <template #cell="{ record }">
              {{
                record.createTime ? $dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              }}
            </template>
          </a-table-column>
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
      <TablePagination
        :total="pagination.total"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        @change="onPageChange"
        @page-size-change="onPageSizeChange"
      />
    </a-card>

    <!-- 退款弹窗（支持部分退款） -->
    <a-modal
      v-model:visible="refundVisible"
      :title="t('payOrder.refund.title')"
      :ok-text="t('payOrder.refund.confirm')"
      :ok-button-props="{ loading: refundLoading }"
      @ok="submitRefund"
    >
      <a-form :model="refundForm" layout="vertical">
        <!-- 订单金额与已退款信息 -->
        <a-descriptions :column="2" size="small" style="margin-bottom: 16px">
          <a-descriptions-item label="订单金额">
            <span style="font-weight: 600; color: #165dff">
              ¥{{ Number(currentOrder?.totalAmount || 0).toFixed(2) }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="已退款金额">
            <span style="font-weight: 600; color: #f53f3f">
              ¥{{ Number(currentOrder?.refundAmount || 0).toFixed(2) }}
            </span>
          </a-descriptions-item>
        </a-descriptions>
        <a-alert
          v-if="Number(currentOrder?.refundAmount || 0) > 0"
          type="info"
          style="margin-bottom: 16px"
        >
          当前剩余可退金额：
          <span style="font-weight: 600; color: #ff7d00"> ¥{{ maxRefundAmount.toFixed(2) }} </span>
        </a-alert>
        <a-form-item :label="t('payOrder.refund.amount')" required>
          <a-input-number
            v-model="refundForm.refundAmount"
            :placeholder="t('payOrder.refund.placeholder.amount')"
            :min="0.01"
            :precision="2"
            :max="maxRefundAmount"
            style="width: 100%"
          />
          <template #extra> 最多可退 ¥{{ maxRefundAmount.toFixed(2) }} </template>
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
  import { ref, reactive, computed, onMounted } from 'vue';
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
  });

  // 退款弹窗
  const refundVisible = ref(false);
  const refundLoading = ref(false);
  const currentOrder = ref<any>(null);
  const refundForm = reactive({
    refundAmount: 0,
    refundReason: '',
  });

  /** 当前订单剩余可退金额 */
  const maxRefundAmount = computed(() => {
    if (!currentOrder.value) return 0;
    const total = Number(currentOrder.value.totalAmount) || 0;
    const refunded = Number(currentOrder.value.refundAmount) || 0;
    return Number((total - refunded).toFixed(2));
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

  /** 退款（支持部分退款） */
  const handleRefund = (record: any) => {
    currentOrder.value = record;
    // 默认填入剩余可退金额（全额退款场景）
    const total = Number(record.totalAmount) || 0;
    const refunded = Number(record.refundAmount) || 0;
    refundForm.refundAmount = Number((total - refunded).toFixed(2));
    refundForm.refundReason = '';
    refundVisible.value = true;
  };

  const submitRefund = async () => {
    const remaining = maxRefundAmount.value;
    if (!refundForm.refundAmount || refundForm.refundAmount <= 0) {
      Message.warning('请输入退款金额');
      return;
    }
    if (refundForm.refundAmount > remaining) {
      Message.warning(`退款金额不能超过剩余可退金额 ¥${remaining.toFixed(2)}`);
      return;
    }
    refundLoading.value = true;
    try {
      const res = (await refundPayOrder({
        out_trade_no: currentOrder.value.outTradeNo,
        refund_amount: String(refundForm.refundAmount),
        refund_reason: refundForm.refundReason || '用户申请退款',
      })) as any;
      const data = res?.data || res;
      if (data?.alipaySuccess === false || data?.localSuccess === false) {
        Message.warning(data?.message || '退款操作未完成');
      } else {
        Message.success(data?.message || t('payOrder.refund.success'));
        refundVisible.value = false;
      }
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
          const res = (await closePayOrder({ out_trade_no: record.outTradeNo })) as any;
          const data = res?.data || res;
          if (data?.alipaySuccess === false || data?.localSuccess === false) {
            Message.warning(data?.message || '关单操作未完成');
          } else {
            Message.success(data?.message || t('payOrder.close.success'));
          }
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
      const data = res?.data || res;
      if (data?.alipaySuccess === false || data?.localSuccess === false) {
        Message.warning(data?.message || '查询操作未完成');
      } else {
        const statusText = data?.status ? t(`payOrder.status.${data.status}`) : '';
        Message.success(data?.message || `${t('payOrder.query.success')}${statusText}`);
      }
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

  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
</style>
