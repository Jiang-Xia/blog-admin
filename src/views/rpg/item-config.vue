<template>
  <div class="container">
    <a-card class="general-card" title="系统物品管理">
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
                    placeholder="物品名称"
                    allow-clear
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="类型">
                  <a-select v-model="formModel.itemType" allow-clear placeholder="全部类型">
                    <a-option value="title">称号</a-option>
                    <a-option value="avatar_frame">头像框</a-option>
                    <a-option value="pet">宠物</a-option>
                    <a-option value="consumable">消耗品</a-option>
                    <a-option value="buff">Buff</a-option>
                    <a-option value="achievement">成就</a-option>
                    <a-option value="equipment">装备</a-option>
                    <a-option value="currency">钻石</a-option>
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
          <a-button type="primary" @click="showCreateModal">
            <template #icon><icon-plus /></template>
            新增物品
          </a-button>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :data="tableData"
        :pagination="false"
        :bordered="false"
        scrollbar
        :scroll="{ x: 900, y: 600 }"
      >
        <template #columns>
          <a-table-column title="状态" data-index="active" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'red'">
                {{ record.active ? '启用' : '禁用' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="编码" data-index="code" :width="140" />
          <a-table-column title="名称" data-index="name" :width="120" />
          <a-table-column title="类型" data-index="itemType" :width="100">
            <template #cell="{ record }">
              <a-tag>{{ itemTypeLabel(record.itemType) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="稀有度" data-index="rarity" :width="90">
            <template #cell="{ record }">
              <a-tag :color="rarityColor(record.rarity)">
                {{ rarityLabel(record.rarity) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sort" :width="70" align="center" />
          <a-table-column title="扩展配置" data-index="effectJson" :width="100" align="center">
            <template #cell="{ record }">
              <a-button
                v-if="record.effectJson && Object.keys(record.effectJson).length"
                size="mini"
                type="text"
                @click="showJsonDetail(record)"
              >
                查看
              </a-button>
              <span v-else>-</span>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ record }">
              <a-space :size="8">
                <a-button size="mini" type="primary" @click="showEditModal(record)">
                  <icon-edit />
                </a-button>
                <a-button size="mini" type="primary" status="danger" @click="handleDelete(record)">
                  <icon-delete />
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
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑物品' : '新增物品'"
      :width="720"
      @before-ok="handleModalOk"
      @cancel="modalVisible = false"
    >
      <a-form
        :model="modalForm"
        :label-col-props="{ flex: '84px' }"
        :wrapper-col-props="{ flex: '1' }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="编码" required>
              <a-input v-model="modalForm.code" :disabled="isEdit" placeholder="唯一编码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称" required>
              <a-input v-model="modalForm.name" placeholder="物品名称" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="描述">
              <a-input v-model="modalForm.description" placeholder="物品描述" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="类型">
              <a-select v-model="modalForm.itemType">
                <a-option value="title">称号</a-option>
                <a-option value="avatar_frame">头像框</a-option>
                <a-option value="pet">宠物</a-option>
                <a-option value="consumable">消耗品</a-option>
                <a-option value="buff">Buff</a-option>
                <a-option value="achievement">成就</a-option>
                <a-option value="equipment">装备</a-option>
                <a-option value="currency">钻石</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="稀有度">
              <a-select v-model="modalForm.rarity">
                <a-option value="common">普通</a-option>
                <a-option value="rare">稀有</a-option>
                <a-option value="epic">史诗</a-option>
                <a-option value="legendary">传说</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序">
              <a-input-number v-model="modalForm.sort" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="图标">
              <a-input v-model="modalForm.icon" placeholder="图标ID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类">
              <a-input v-model="modalForm.category" placeholder="可选分类" allow-clear />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="图标图">
              <a-upload
                :show-file-list="false"
                accept="image/png,image/webp,image/jpeg,image/svg+xml"
                :custom-request="onIconUpload"
              >
                <template #upload-button>
                  <div
                    class="asset-thumb"
                    :class="{ 'is-loading': iconUploading, 'has-image': !!iconPreviewUrl }"
                  >
                    <img v-if="iconPreviewUrl" :src="iconPreviewUrl" alt="图标预览" />
                    <div v-else class="asset-thumb-empty">
                      <icon-plus :size="18" />
                      <span>上传 icon</span>
                    </div>
                    <div v-if="iconUploading" class="asset-thumb-mask">
                      <a-spin :size="16" />
                    </div>
                  </div>
                </template>
              </a-upload>
              <span class="asset-hint">rpgAssets/itemIcon/{图标ID}.*</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="背景图">
              <a-upload
                :show-file-list="false"
                accept="image/png,image/webp,image/jpeg,image/svg+xml"
                :custom-request="onBgUpload"
              >
                <template #upload-button>
                  <div
                    class="asset-thumb"
                    :class="{ 'is-loading': bgUploading, 'has-image': !!bgPreviewUrl }"
                  >
                    <img v-if="bgPreviewUrl" :src="bgPreviewUrl" alt="背景预览" />
                    <div v-else class="asset-thumb-empty">
                      <icon-plus :size="18" />
                      <span>上传背景</span>
                    </div>
                    <div v-if="bgUploading" class="asset-thumb-mask">
                      <a-spin :size="16" />
                    </div>
                  </div>
                </template>
              </a-upload>
              <span class="asset-hint">rpgAssets/itemBg/{图标ID}.*</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="扩展配置" class="effect-form-item">
              <div class="effect-guide">
                <div class="effect-guide__summary">{{ effectGuide.summary }}</div>
                <ul v-if="effectGuide.fields.length" class="effect-guide__fields">
                  <li v-for="field in effectGuide.fields" :key="field">{{ field }}</li>
                </ul>
                <a-button size="mini" type="outline" @click="fillEffectTemplate"
                  >填入示例模板</a-button
                >
              </div>
              <a-textarea
                v-model="modalForm.effectJsonText"
                :placeholder="effectJsonPlaceholder"
                :auto-size="{ minRows: 4, maxRows: 10 }"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="状态">
              <a-radio-group v-model="modalForm.active">
                <a-radio :value="true">启用</a-radio>
                <a-radio :value="false">禁用</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="jsonVisible" title="扩展配置" :width="640" :footer="false">
      <pre class="json-preview">{{ jsonPreviewText }}</pre>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  /**
   * 系统物品管理：CRUD + icon/bg 上传
   * 上传落盘 blog-server/public/rpgAssets/，文件名 = 图标 ID 字段
   */
  import { ref, reactive, computed } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    IconEdit,
    IconDelete,
    IconPlus,
    IconSearch,
    IconRefresh,
  } from '@arco-design/web-vue/es/icon';
  import type { Pagination } from '@/types/global';
  import {
    getItemConfigList,
    createItemConfig,
    updateItemConfig,
    deleteItemConfig,
    uploadItemAsset,
  } from '@/api/rpg';
  import { resolveStaticUrl } from '@/api/resources';
  import useLoading from '@/hooks/loading';
  import { getItemEffectGuide } from '@/constants/rpg-item-effect';

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

  const RARITY_LABELS: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  const itemTypeLabel = (type: string) => ITEM_TYPE_LABELS[type] || type;
  const rarityLabel = (rarity: string) => RARITY_LABELS[rarity] || rarity;
  const rarityColor = (rarity: string) => {
    const map: Record<string, string> = {
      common: 'gray',
      rare: 'blue',
      epic: 'purple',
      legendary: 'orangered',
    };
    return map[rarity] || 'gray';
  };

  const { loading, setLoading } = useLoading(true);
  const formModel = ref({
    keyword: '',
    itemType: undefined as string | undefined,
    page: 1,
    pageSize: 20,
  });
  const tableData = ref<any[]>([]);
  const basePagination: Pagination = { current: 1, pageSize: 20, total: 0 };
  const pagination = reactive({ ...basePagination });
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const editId = ref(0);
  const defaultModalForm = {
    code: '',
    name: '',
    description: '',
    itemType: 'title',
    category: '',
    icon: 'default',
    rarity: 'common',
    sort: 10,
    active: true,
    effectJsonText: '{}',
  };
  const modalForm = ref({ ...defaultModalForm });
  const jsonVisible = ref(false);
  const jsonPreviewText = ref('');
  const iconUploading = ref(false);
  const bgUploading = ref(false);
  const iconPreviewUrl = ref('');
  const bgPreviewUrl = ref('');

  /** 编辑弹窗打开时，按 icon 键拼预览 URL（默认 png，上传后以接口返回为准） */
  const syncAssetPreview = () => {
    const key = modalForm.value.icon?.trim();
    if (!key || key === 'default') {
      iconPreviewUrl.value = '';
      bgPreviewUrl.value = '';
      return;
    }
    iconPreviewUrl.value = resolveStaticUrl(`/static/rpgAssets/itemIcon/${key}.png`);
    bgPreviewUrl.value = resolveStaticUrl(`/static/rpgAssets/itemBg/${key}.png`);
  };

  /** 上传 icon/bg 至 blog-server；需先填图标 ID，成功后刷新预览 URL */
  const uploadAsset = async (
    option: { fileItem: { file?: File }; onSuccess: () => void; onError: (e: Error) => void },
    assetType: 'icon' | 'bg',
  ) => {
    const icon = modalForm.value.icon?.trim();
    if (!icon || icon === 'default') {
      Message.warning('请先填写图标 ID');
      option.onError(new Error('missing icon'));
      return;
    }
    const file = option.fileItem.file;
    if (!file) {
      option.onError(new Error('missing file'));
      return;
    }
    const loadingRef = assetType === 'icon' ? iconUploading : bgUploading;
    loadingRef.value = true;
    try {
      const res: any = await uploadItemAsset(file, icon, assetType);
      const url = res?.data?.url || res?.url;
      if (assetType === 'icon') {
        iconPreviewUrl.value = resolveStaticUrl(url);
      } else {
        bgPreviewUrl.value = resolveStaticUrl(url);
      }
      Message.success(assetType === 'icon' ? '图标上传成功' : '背景上传成功');
      option.onSuccess();
    } catch (e: any) {
      Message.error(e?.message || '上传失败');
      option.onError(e);
    } finally {
      loadingRef.value = false;
    }
  };

  const onIconUpload = (option: Parameters<typeof uploadAsset>[0]) => uploadAsset(option, 'icon');
  const onBgUpload = (option: Parameters<typeof uploadAsset>[0]) => uploadAsset(option, 'bg');

  const effectGuide = computed(() => getItemEffectGuide(modalForm.value.itemType));
  const effectJsonPlaceholder = computed(() => {
    const example = JSON.stringify(effectGuide.value.example, null, 2);
    return example === '{}' ? 'JSON 对象，通常可留空 {}' : example;
  });

  const isEffectJsonEmpty = (text?: string) => {
    const trimmed = text?.trim();
    if (!trimmed) return true;
    try {
      const parsed = JSON.parse(trimmed);
      return (
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        Object.keys(parsed).length === 0
      );
    } catch {
      return false;
    }
  };

  const fillEffectTemplate = () => {
    if (!isEffectJsonEmpty(modalForm.value.effectJsonText)) {
      Message.warning('当前已有内容，请先清空后再填入模板');
      return;
    }
    modalForm.value.effectJsonText = JSON.stringify(effectGuide.value.example, null, 2);
  };

  const showJsonDetail = (record: any) => {
    jsonPreviewText.value = JSON.stringify(record.effectJson || {}, null, 2);
    jsonVisible.value = true;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await getItemConfigList(formModel.value);
      tableData.value = res.data.list;
      pagination.total = res.data.pagination.total;
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
    formModel.value = { keyword: '', itemType: undefined, page: 1, pageSize: 20 };
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

  const buildPayload = () => {
    const text = modalForm.value.effectJsonText?.trim();
    let effectJson: Record<string, any> | null = null;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          Message.warning('扩展配置必须是 JSON 对象');
          return null;
        }
        effectJson = parsed;
      } catch {
        Message.warning('扩展配置 JSON 格式不正确');
        return null;
      }
    }
    return {
      name: modalForm.value.name,
      description: modalForm.value.description || '',
      itemType: modalForm.value.itemType,
      category: modalForm.value.category || '',
      icon: modalForm.value.icon || 'default',
      rarity: modalForm.value.rarity || 'common',
      sort: modalForm.value.sort ?? 10,
      active: modalForm.value.active,
      effectJson,
    };
  };

  const showCreateModal = () => {
    isEdit.value = false;
    editId.value = 0;
    modalForm.value = { ...defaultModalForm };
    iconPreviewUrl.value = '';
    bgPreviewUrl.value = '';
    modalVisible.value = true;
  };
  const showEditModal = (record: any) => {
    isEdit.value = true;
    editId.value = record.id;
    modalForm.value = {
      code: record.code,
      name: record.name,
      description: record.description || '',
      itemType: record.itemType || 'title',
      category: record.category || '',
      icon: record.icon || 'default',
      rarity: record.rarity || 'common',
      sort: record.sort ?? 10,
      active: record.active !== false,
      effectJsonText: JSON.stringify(record.effectJson || {}, null, 2),
    };
    syncAssetPreview();
    modalVisible.value = true;
  };

  const handleModalOk = async () => {
    if (!modalForm.value.code || !modalForm.value.name) {
      Message.warning('编码和名称不能为空');
      return false;
    }
    const payload = buildPayload();
    if (!payload) return false;
    try {
      if (isEdit.value) {
        await updateItemConfig(editId.value, payload);
        Message.success('更新成功');
      } else {
        await createItemConfig({ code: modalForm.value.code, ...payload });
        Message.success('创建成功');
      }
      loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除物品',
      content: `确定删除 ${record.name} 吗？`,
      onOk: async () => {
        await deleteItemConfig(record.id);
        Message.success('删除成功');
        loadData();
      },
    });
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
  .json-preview {
    max-height: 480px;
    overflow: auto;
    margin: 0;
    padding: 12px;
    background: var(--color-fill-2);
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 12px;
  }
  .effect-form-item {
    :deep(.arco-form-item-label-col) {
      align-self: flex-start;
      padding-top: 6px;
    }
    :deep(.arco-form-item-content) {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .effect-guide,
    :deep(.arco-textarea-wrapper) {
      width: 100%;
    }
  }
  .effect-guide {
    padding: 10px 12px;
    background: var(--color-fill-2);
    border-radius: 4px;
    font-size: 12px;
    color: var(--color-text-2);
  }
  .effect-guide__summary {
    margin-bottom: 6px;
    color: var(--color-text-1);
  }
  .effect-guide__fields {
    margin: 0 0 8px;
    padding-left: 18px;
    line-height: 1.6;
  }
  .asset-thumb {
    position: relative;
    width: 96px;
    height: 96px;
    border: 1px dashed var(--color-border-3);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: var(--color-fill-2);
  }
  .asset-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .asset-thumb-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 100%;
    font-size: 12px;
    color: var(--color-text-3);
  }
  .asset-thumb-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(255 255 255 / 0.65);
  }
  .asset-hint {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--color-text-3);
  }
</style>
