<template>
  <div class="container">
    <a-card class="general-card" title="成就管理">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="关键词">
                  <a-input
                    v-model="formModel.keyword"
                    placeholder="请输入成就名称"
                    allow-clear
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="分类">
                  <a-select v-model="formModel.category" placeholder="请选择分类" allow-clear>
                    <a-option value="creation">创作</a-option>
                    <a-option value="social">社交</a-option>
                    <a-option value="exploration">探索</a-option>
                    <a-option value="sign">签到</a-option>
                    <a-option value="economy">经济</a-option>
                    <a-option value="lottery">抽奖</a-option>
                    <a-option value="pet">宠物</a-option>
                    <a-option value="guild">公会</a-option>
                    <a-option value="author">作者</a-option>
                    <a-option value="special">特殊</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="状态">
                  <a-select v-model="formModel.active" allow-clear>
                    <a-option value="true">启用</a-option>
                    <a-option value="false">禁用</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :span="5" style="text-align: right">
          <a-space :size="8">
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="showCreateModal">
              <template #icon><icon-plus /></template>
              新增成就
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-table
        :loading="loading"
        row-key="id"
        :pagination="false"
        :data="tableData"
        :bordered="false"
        scrollbar
        :scroll="{ x: 1200, y: 600 }"
      >
        <template #columns>
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active !== false ? 'green' : 'red'">
                {{ record.active !== false ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关联" data-index="itemLinked" :width="90">
            <template #cell="{ record }">
              <a-tag :color="record.itemLinked ? 'green' : 'red'">
                {{ record.itemLinked ? '已关联' : '未关联' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="物品编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="120" />
          <a-table-column title="描述" data-index="description" :width="160" ellipsis tooltip />
          <a-table-column title="分类" data-index="category" :width="90">
            <template #cell="{ record }">
              <a-tag>{{ categoryLabel(record.category) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="追踪事件" data-index="trackEvent" :width="110">
            <template #cell="{ record }">
              {{
                record.itemLinked
                  ? trackEventLabel(record.trackEvent || record.effectJson?.trackEvent)
                  : '—'
              }}
            </template>
          </a-table-column>
          <a-table-column title="图标" data-index="icon" :width="110" />
          <a-table-column
            title="达成条件"
            data-index="conditionText"
            :width="180"
            ellipsis
            tooltip
          />
          <a-table-column title="目标次数" data-index="maxProgress" :width="90" align="center">
            <template #cell="{ record }">
              {{ record.itemLinked ? record.maxProgress : '—' }}
            </template>
          </a-table-column>
          <a-table-column title="经验奖励" data-index="expReward" :width="90" align="center">
            <template #cell="{ record }">
              <span v-if="record.itemLinked" style="color: #f59e0b; font-weight: 600">
                +{{ record.expReward }}
              </span>
              <span v-else>—</span>
            </template>
          </a-table-column>
          <a-table-column title="隐藏" data-index="isHidden" :width="60">
            <template #cell="{ record }">{{ record.isHidden ? '是' : '否' }}</template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="60" align="center" />
          <a-table-column title="操作" data-index="operations" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space v-if="record.itemLinked" :size="8">
                <a-button size="mini" type="primary" @click="showEditModal(record)"
                  ><icon-edit
                /></a-button>
                <a-button size="mini" type="primary" status="danger" @click="handleDelete(record)"
                  ><icon-delete
                /></a-button>
              </a-space>
              <span v-else>—</span>
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

    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑成就' : '新增成就'"
      :width="720"
      @before-ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-alert v-if="!isEdit" type="info" class="achievement-modal-tip">
        成就须从「系统物品」选择，名称/描述/图标由系统物品决定；此处配置追踪事件与达成规则。
      </a-alert>
      <a-form
        :model="modalForm"
        layout="horizontal"
        :label-col-props="{ flex: '96px' }"
        :wrapper-col-props="{ flex: '1' }"
        class="achievement-modal-form"
      >
        <a-form-item label="系统物品" required>
          <a-select
            v-model="modalForm.itemCode"
            placeholder="请选择系统物品"
            allow-search
            allow-clear
            :disabled="isEdit"
            :loading="itemOptionsLoading"
          >
            <a-option
              v-for="item in itemOptions"
              :key="item.code"
              :value="item.code"
              :label="`${item.name} (${item.code})`"
            >
              {{ item.name }} ({{ item.code }}) · {{ itemTypeLabel(item.itemType) }}
            </a-option>
          </a-select>
        </a-form-item>

        <template v-if="selectedItem">
          <a-divider orientation="left">物品信息</a-divider>
          <a-descriptions :column="2" size="small" bordered class="achievement-item-preview">
            <a-descriptions-item label="名称">{{ selectedItem.name }}</a-descriptions-item>
            <a-descriptions-item label="类型">
              {{ itemTypeLabel(selectedItem.itemType) }}
            </a-descriptions-item>
            <a-descriptions-item label="编码">{{ selectedItem.code }}</a-descriptions-item>
            <a-descriptions-item label="图标">{{ selectedItem.icon || '—' }}</a-descriptions-item>
            <a-descriptions-item label="描述" :span="2">
              {{ selectedItem.description || '—' }}
            </a-descriptions-item>
          </a-descriptions>
        </template>

        <a-divider orientation="left">成就配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="追踪事件" required>
              <a-select v-model="modalForm.trackEvent" placeholder="请选择触发事件">
                <a-option v-for="opt in trackEventOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类" required>
              <a-select v-model="modalForm.category" placeholder="请选择分类">
                <a-option value="creation">创作</a-option>
                <a-option value="social">社交</a-option>
                <a-option value="exploration">探索</a-option>
                <a-option value="sign">签到</a-option>
                <a-option value="economy">经济</a-option>
                <a-option value="lottery">抽奖</a-option>
                <a-option value="pet">宠物</a-option>
                <a-option value="guild">公会</a-option>
                <a-option value="author">作者</a-option>
                <a-option value="special">特殊</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="maxProgressLabel" required>
              <a-input-number
                v-model="modalForm.maxProgress"
                :min="1"
                :placeholder="maxProgressPlaceholder"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="经验奖励" required>
              <a-input-number
                v-model="modalForm.expReward"
                :min="0"
                placeholder="不小于 0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="排序" required>
              <a-input-number
                v-model="modalForm.sort"
                :min="0"
                placeholder="不小于 0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">启用</a-radio>
                <a-radio :value="false">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="隐藏成就">
              <a-radio-group v-model="modalForm.isHidden">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  /**
   * 成就管理：从系统物品选择并配置达成规则（名称/图标来自 item_config）
   */
  import { ref, reactive, computed } from 'vue';
  import type { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    IconEdit,
    IconDelete,
    IconPlus,
    IconSearch,
    IconRefresh,
  } from '@arco-design/web-vue/es/icon';
  import {
    getAchievementList,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    getItemConfigList,
  } from '@/api/rpg';
  import useLoading from '@/hooks/loading';

  interface ItemOption {
    code: string;
    name: string;
    description?: string;
    itemType: string;
    icon?: string;
    active?: boolean;
    effectJson?: Record<string, unknown> | string | null;
  }

  const ITEM_TYPE_LABELS: Record<string, string> = {
    title: '称号',
    avatar_frame: '头像框',
    pet: '宠物',
    equipment: '装备',
    achievement: '成就',
    buff: '增益',
    currency: '钻石',
    consumable: '消耗品',
  };
  const itemTypeLabel = (type: string) => ITEM_TYPE_LABELS[type] || type;

  const CATEGORY_LABELS: Record<string, string> = {
    creation: '创作',
    social: '社交',
    exploration: '探索',
    sign: '签到',
    economy: '经济',
    lottery: '抽奖',
    pet: '宠物',
    guild: '公会',
    author: '作者',
    special: '特殊',
  };
  const categoryLabel = (category: string) => CATEGORY_LABELS[category] || category;

  /** 与 blog-server AchievementEvent 一致 */
  const trackEventOptions = [
    { value: 'article', label: '发布文章' },
    { value: 'comment', label: '发表评论' },
    { value: 'reply', label: '发表回复' },
    { value: 'msgboard', label: '留言板留言' },
    { value: 'like', label: '点赞文章' },
    { value: 'collect', label: '收藏文章' },
    { value: 'sign_in', label: '累计签到' },
    { value: 'consecutive_sign', label: '连续签到' },
    { value: 'level_up', label: '等级提升' },
    { value: 'reputation', label: '声望值' },
    { value: 'tip', label: '打赏文章' },
    { value: 'tip_received', label: '收到打赏' },
    { value: 'lottery_draw', label: '抽奖' },
    { value: 'lottery_pity', label: '抽奖保底' },
    { value: 'social_cheer', label: '加油' },
    { value: 'social_flower', label: '送花' },
    { value: 'social_egg', label: '扔鸡蛋' },
    { value: 'pet_hatch', label: '获得宠物' },
    { value: 'guild_join', label: '加入公会' },
    { value: 'guild_create', label: '创建公会' },
    { value: 'article_level_up', label: '文章升级' },
    { value: 'masterpiece', label: '文章神作' },
    { value: 'poster_share', label: '分享赛季海报' },
  ];
  const trackEventLabel = (event?: string) =>
    trackEventOptions.find((opt) => opt.value === event)?.label || event || '—';

  const maxProgressLabel = computed(() => {
    const event = modalForm.value.trackEvent;
    if (event === 'sign_in' || event === 'consecutive_sign') return '目标天数';
    if (event === 'level_up') return '目标等级';
    if (event === 'reputation') return '目标声望';
    return '达成次数';
  });

  const maxProgressPlaceholder = computed(() => {
    const event = modalForm.value.trackEvent;
    if (event === 'sign_in') return '累计签到天数，如 30';
    if (event === 'consecutive_sign') return '连续签到天数，如 7';
    if (event === 'level_up') return '达到等级，如 20';
    if (event === 'reputation') return '达到声望，如 500';
    return '不小于 1';
  });

  const { loading, setLoading } = useLoading(true);

  const generateFormModel = () => ({
    keyword: '',
    category: undefined as string | undefined,
    active: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  });

  const formModel = ref(generateFormModel());
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });

  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editId = ref<number>(0);
  const defaultModalForm = {
    itemCode: '',
    category: 'creation',
    trackEvent: undefined as string | undefined,
    maxProgress: 1,
    expReward: 10,
    sort: 10,
    active: true,
    isHidden: 0,
  };
  const modalForm = ref({ ...defaultModalForm });

  const itemOptions = ref<ItemOption[]>([]);
  const itemOptionsLoading = ref(false);

  const selectedItem = computed(() =>
    itemOptions.value.find((item) => item.code === modalForm.value.itemCode),
  );

  const isItemActive = (item: ItemOption) => item.active !== false && Number(item.active) !== 0;

  const isAchievementConfigured = (item: ItemOption) => {
    const effect = item.effectJson;
    if (!effect || typeof effect === 'string') return false;
    return effect.achievementConfigured === true;
  };

  /** 加载成就类系统物品：新增仅未配置项，编辑含全部启用项（下拉禁用） */
  const loadItemOptions = async (mode: 'create' | 'edit' = 'create') => {
    itemOptionsLoading.value = true;
    try {
      const res: any = await getItemConfigList({ itemType: 'achievement', page: 1, pageSize: 500 });
      itemOptions.value = (res?.data?.list ?? []).filter((item: ItemOption) => {
        if (!isItemActive(item)) return false;
        if (mode === 'edit') return true;
        return !isAchievementConfigured(item);
      });
    } finally {
      itemOptionsLoading.value = false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getAchievementList(formModel.value);
      tableData.value = res?.data?.list ?? [];
      pagination.total = res?.data?.pagination?.total ?? 0;
    } finally {
      setLoading(false);
    }
  };

  loadData();

  const search = () => {
    formModel.value.page = 1;
    pagination.current = 1;
    loadData();
  };

  const reset = () => {
    formModel.value = generateFormModel();
    pagination.current = 1;
    loadData();
  };

  const onPageChange = (current: number) => {
    formModel.value.page = current;
    pagination.current = current;
    loadData();
  };

  const onPageSizeChange = (pageSize: number) => {
    formModel.value.page = 1;
    formModel.value.pageSize = pageSize;
    pagination.current = 1;
    pagination.pageSize = pageSize;
    loadData();
  };

  const showCreateModal = async () => {
    isEdit.value = false;
    editId.value = 0;
    modalForm.value = { ...defaultModalForm };
    modalVisible.value = true;
    await loadItemOptions('create');
  };

  const showEditModal = async (record: any) => {
    isEdit.value = true;
    editId.value = record.id;
    await loadItemOptions('edit');
    modalForm.value = {
      itemCode: record.code,
      category: record.category,
      trackEvent: record.trackEvent || record.effectJson?.trackEvent,
      maxProgress: record.maxProgress ?? record.effectJson?.maxProgress ?? 1,
      expReward: record.expReward ?? record.effectJson?.expReward ?? 10,
      sort: record.sort,
      active: record.active !== false,
      isHidden: record.isHidden ?? 0,
    };
    modalVisible.value = true;
  };

  const buildAchievementPayload = () => ({
    category: modalForm.value.category,
    sort: modalForm.value.sort,
    active: modalForm.value.active,
    isHidden: modalForm.value.isHidden,
    effectJson: {
      maxProgress: modalForm.value.maxProgress,
      expReward: modalForm.value.expReward,
      trackEvent: modalForm.value.trackEvent,
    },
  });

  /** 成就配置必填校验（新增/编辑均适用） */
  const validateModalForm = (): boolean => {
    if (!modalForm.value.itemCode) {
      Message.warning('请选择系统物品');
      return false;
    }
    if (!modalForm.value.trackEvent) {
      Message.warning('请选择追踪事件');
      return false;
    }
    if (!modalForm.value.category) {
      Message.warning('请选择分类');
      return false;
    }
    if (modalForm.value.maxProgress == null || modalForm.value.maxProgress < 1) {
      Message.warning(`${maxProgressLabel.value}须不小于 1`);
      return false;
    }
    if (modalForm.value.expReward == null || modalForm.value.expReward < 0) {
      Message.warning('请填写经验奖励（不小于 0）');
      return false;
    }
    if (modalForm.value.sort == null || modalForm.value.sort < 0) {
      Message.warning('请填写排序（不小于 0）');
      return false;
    }
    return true;
  };

  const handleModalOk = async () => {
    if (!validateModalForm()) {
      return false;
    }
    try {
      if (isEdit.value) {
        await updateAchievement(editId.value, buildAchievementPayload());
        Message.success('更新成功');
      } else {
        await createAchievement({
          itemCode: modalForm.value.itemCode,
          ...buildAchievementPayload(),
        });
        Message.success('新增成功');
      }
      loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除成就',
      content: '确定删除该成就配置吗？删除后不可恢复。',
      onOk: async () => {
        await deleteAchievement(record.id);
        Message.success('删除成功');
        loadData();
      },
    });
  };
</script>

<script lang="ts">
  export default { name: 'RpgAchievementTable' };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }
  .achievement-modal-tip {
    margin-bottom: 12px;
  }
  .achievement-item-preview {
    margin-bottom: 8px;
  }
  .achievement-modal-form {
    :deep(.arco-divider-text-left) {
      margin: 4px 0 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-2);
    }

    :deep(.arco-row) {
      width: 100%;
    }

    :deep(.arco-form-item) {
      margin-bottom: 16px;
    }
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
