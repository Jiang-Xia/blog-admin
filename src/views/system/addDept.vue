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
      <a-form-item label="部门名称" name="deptName" field="deptName">
        <a-input v-model="formState.deptName" :max-length="20" placeholder="请输入部门名称" />
      </a-form-item>
      <a-form-item label="部门编码" name="deptCode" field="deptCode">
        <a-input v-model="formState.deptCode" :max-length="20" placeholder="请输入部门编码" />
      </a-form-item>
      <a-form-item label="父级部门" name="parentId" field="parentId">
        <a-tree-select
          v-model="formState.parentId"
          :data="deptTreeData"
          :field-names="{ key: 'id', title: 'deptName', children: 'children' }"
          placeholder="请选择父级部门"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="部门负责人ID" name="leaderId" field="leaderId">
        <a-input v-model="formState.leaderId" placeholder="请输入部门负责人ID" />
      </a-form-item>
      <a-form-item label="部门负责人姓名" name="leaderName" field="leaderName">
        <a-input v-model="formState.leaderName" placeholder="请输入部门负责人姓名" />
      </a-form-item>
      <a-form-item label="部门排序" name="orderNum" field="orderNum">
        <a-input-number v-model="formState.orderNum" placeholder="请输入部门排序" :min="0" />
      </a-form-item>
      <a-form-item label="状态" name="status" field="status">
        <a-radio-group v-model="formState.status">
          <a-radio :value="1">正常</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="部门描述" name="remark" field="remark">
        <a-textarea v-model="formState.remark" placeholder="请输入部门描述" :max-length="200" />
      </a-form-item>

      <a-form-item :wrapper-col-props="{ span: 13, offset: 7 }">
        <a-button type="primary" html-type="submit">提交</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
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
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? '编辑机构' : '新增机构';
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
      console.error('加载部门树失败:', error);
    }
  };
  // 自定义异步校验
  const checkTitle = async (value: string, cb: (error?: string) => void) => {
    console.log(value);
    if (!value) {
      cb('请输入标题！');
    }
    Promise.resolve();
  };
  const checkDescription = async (value: string, cb: (error?: string) => void) => {
    if (!value) {
      cb('请输入描述！');
    }
    Promise.resolve();
  };

  const rules = {
    deptName: [
      { required: true, message: '请输入部门名称' },
      { minLength: 2, message: '部门名称至少2个字符' },
      { maxLength: 20, message: '部门名称不能超过20个字符' },
    ],
    deptCode: [
      { required: true, message: '请输入部门编码' },
      { minLength: 2, message: '部门编码至少2个字符' },
      { maxLength: 20, message: '部门编码不能超过20个字符' },
    ],
    parentId: [{ required: true, message: '请选择父级部门' }],
    leaderId: [{ maxLength: 20, message: '部门负责人ID不能超过20个字符' }],
    leaderName: [{ maxLength: 20, message: '部门负责人姓名不能超过20个字符' }],
    orderNum: [
      { required: true, message: '请输入部门排序' },
      { type: 'number', min: 0, message: '排序必须为非负数' },
    ],
    remark: [{ maxLength: 200, message: '部门描述不能超过200个字符' }],
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
      Message.success('修改成功！');
      resetForm();
    } else {
      // 新建
      const res = await createDept(params);
      visible.value = false;
      Message.success('新建成功！');
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
      console.error('获取部门信息失败:', error);
      Message.error('获取部门信息失败');
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
