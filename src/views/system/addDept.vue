<template>
  <a-modal
    v-model:visible="visible"
    :mask-closable="false"
    :title="title"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      name="custom-validation"
      :model="formState"
      :rules="rules"
      :label-col-props="{ span: 6, offset: 0 }"
      :wrapper-col-props="{ span: 18, offset: 0 }"
      hide-cancel
      autocomplete="off"
      @submit-success="handleFinish"
      @submit-failed="handleFinishFailed"
      auto-label-width
      label-align="center"
    >
      <a-form-item :label="t('dept.form.deptName')" name="deptName" field="deptName">
        <a-input
          v-model="formState.deptName"
          :max-length="20"
          :placeholder="t('dept.form.placeholder.deptName')"
        />
      </a-form-item>
      <a-form-item :label="t('dept.form.deptCode')" name="deptCode" field="deptCode">
        <a-input
          v-model="formState.deptCode"
          :max-length="20"
          :placeholder="t('dept.form.placeholder.deptCode')"
        />
      </a-form-item>
      <a-form-item :label="t('dept.form.parentId')" name="parentId" field="parentId">
        <a-tree-select
          v-model="formState.parentId"
          :data="deptTreeData"
          :field-names="{ key: 'id', title: 'deptName', children: 'children' }"
          :placeholder="t('dept.form.placeholder.parentId')"
          allow-clear
        />
      </a-form-item>
      <a-form-item :label="t('dept.form.leaderId')" name="leaderId" field="leaderId">
        <a-input v-model="formState.leaderId" :placeholder="t('dept.form.placeholder.leaderId')" />
      </a-form-item>
      <a-form-item :label="t('dept.form.leaderName')" name="leaderName" field="leaderName">
        <a-input
          v-model="formState.leaderName"
          :placeholder="t('dept.form.placeholder.leaderName')"
        />
      </a-form-item>
      <a-form-item :label="t('dept.form.orderNum')" name="orderNum" field="orderNum">
        <a-input-number
          v-model="formState.orderNum"
          :placeholder="t('dept.form.placeholder.orderNum')"
          :min="0"
        />
      </a-form-item>
      <a-form-item :label="t('dept.form.status')" name="status" field="status">
        <a-radio-group v-model="formState.status">
          <a-radio :value="1">{{ t('dept.status.normal') }}</a-radio>
          <a-radio :value="0">{{ t('dept.status.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('dept.form.remark')" name="remark" field="remark">
        <a-textarea
          v-model="formState.remark"
          :placeholder="t('dept.form.placeholder.remark')"
          :max-length="200"
        />
      </a-form-item>

      <a-form-item :wrapper-col-props="{ span: 13, offset: 7 }">
        <a-button type="primary" html-type="submit">{{ t('common.button.submit') }}</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">{{
          t('common.button.reset')
        }}</a-button>
      </a-form-item>
    </a-form>
    <template #footer><div> </div></template>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAppStore } from '@/store';
  import { useI18n } from 'vue-i18n';
  import { getDeptById, createDept, updateDept, getDeptTree } from '@/api/dept';
  const { t } = useI18n();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? t('dept.modal.edit') : t('dept.modal.add');
  });
  interface stringKey {
    [propName: string]: string | number;
  }
  interface FormState {
    deptName: string;
    deptCode: string;
    parentId: number;
    leaderId?: string;
    leaderName?: string;
    orderNum: number;
    status: number;
    remark?: string;
  }
  const defaultForm = {
    deptName: '',
    deptCode: '',
    parentId: 0,
    leaderId: undefined,
    leaderName: undefined,
    orderNum: 0,
    status: 1,
    remark: undefined,
  };

  const deptTreeData = ref([]);
  const formRef = ref();
  const visible = ref(false);
  const currentId = ref('');
  const formState: FormState = reactive({ ...defaultForm });

  // 初始化部门树数据
  const loadDeptTree = async () => {
    try {
      const res = await getDeptTree();
      deptTreeData.value = res.data || [];
    } catch (error) {
      console.error(t('system.message.loadDeptTreeFailed'), error);
    }
  };
  // 自定义异步校验
  const checkTitle = async (value: string, cb: (error?: string) => void) => {
    console.log(value);
    if (!value) {
      cb(t('system.validate.titleRequired'));
    }
    Promise.resolve();
  };
  const checkDescription = async (value: string, cb: (error?: string) => void) => {
    if (!value) {
      cb(t('system.validate.descriptionRequired'));
    }
    Promise.resolve();
  };

  const rules = {
    deptName: [
      { required: true, message: t('system.validate.deptName.required') },
      { minLength: 2, message: t('system.validate.deptName.minLength') },
      { maxLength: 20, message: t('system.validate.deptName.maxLength') },
    ],
    deptCode: [
      { required: true, message: t('system.validate.deptCode.required') },
      { minLength: 2, message: t('system.validate.deptCode.minLength') },
      { maxLength: 20, message: t('system.validate.deptCode.maxLength') },
    ],
    parentId: [{ required: true, message: t('system.validate.parentId.required') }],
    leaderId: [{ maxLength: 20, message: t('system.validate.leaderId.maxLength') }],
    leaderName: [{ maxLength: 20, message: t('system.validate.leaderName.maxLength') }],
    orderNum: [
      { required: true, message: t('system.validate.orderNum.required') },
      { type: 'number', min: 0, message: t('system.validate.orderNum.min') },
    ],
    remark: [{ maxLength: 200, message: t('system.validate.remark.maxLength') }],
  };
  // 提交成功
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    const params = {
      ...values,
    };
    // console.log('params:', params)
    // return
    if (type.value === 'edit') {
      // 编辑
      params.id = currentId.value;
      const res = await updateDept(params);
      visible.value = false;
      // console.log({ res });
      Message.success(t('dept.message.updateSuccess'));
      resetForm();
    } else {
      // 新建
      const res = await createDept(params);
      visible.value = false;
      Message.success(t('dept.message.createSuccess'));
      resetForm();
    }
    emits('success');
  };
  // 提交失败
  const handleFinishFailed = (errors: any) => {
    console.log(errors);
  };
  const resetForm = () => {
    formRef.value.resetFields();
  };

  const show = (val: any) => {
    type.value = val.type;
    console.log({ type: type.value });
    if (type.value === 'edit') {
      currentId.value = val.id;
      getInfoHandle();
    } else {
      resetForm();
      // 新增时默认加载部门树
      loadDeptTree();
    }
    visible.value = true;
  };

  // 编辑时加载部门树
  const getInfoHandle = async () => {
    try {
      // 先加载部门树
      await loadDeptTree();
      const res = await getDeptById(Number(currentId.value));
      const deptInfo = res.data;
      Object.keys(defaultForm).forEach((key) => {
        if (key in deptInfo) {
          (formState as any)[key] = deptInfo[key];
        }
      });
    } catch (error) {
      console.error(t('dept.message.getDeptInfoFailed'), error);
      Message.error(t('dept.message.getDeptInfoFailed'));
    }
  };
  const handleOk = () => {
    visible.value = false;
  };
  const handleCancel = () => {
    visible.value = false;
  };
  // 父组件调用子组件方法和变量需要导出
  defineExpose({ show, visible });
  const emits = defineEmits(['success']);

  // 初始化部门树数据
  loadDeptTree();
</script>

<script lang="ts">
  export default {
    name: 'AddDept',
  };
</script>

<style scoped lang="less"></style>
