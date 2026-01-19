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
    >
      <a-form-item label="权限名称" name="privilegeName" field="privilegeName">
        <a-input v-model="formState.privilegeName" :max-length="20" placeholder="权限名称" />
      </a-form-item>
      <a-form-item label="权限识别码" name="privilegeCode" field="privilegeCode">
        <a-input v-model="formState.privilegeCode" placeholder="权限识别码" />
      </a-form-item>
      <a-form-item label="所属页面" name="privilegePage" field="privilegePage">
        <a-tree-select
          v-model="formState.privilegePage"
          :data="treeData"
          :field-names="{ key: 'id', title: 'menuCnName', children: 'children' }"
          selectable="leaf"
          placeholder="请选择所属页面"
          allow-clear
          allow-search
          :size="'medium'"
          @change="handleTreeChange"
          label-in-value
        />
      </a-form-item>
      <a-form-item label="路径模式" name="pathPattern" field="pathPattern">
        <a-input v-model="formState.pathPattern" placeholder="路径模式，如 /api/users/:id" />
      </a-form-item>
      <a-form-item label="HTTP方法" name="httpMethod" field="httpMethod">
        <a-select v-model="formState.httpMethod" placeholder="请选择HTTP方法">
          <a-option value="GET">GET</a-option>
          <a-option value="POST">POST</a-option>
          <a-option value="PUT">PUT</a-option>
          <a-option value="DELETE">DELETE</a-option>
          <a-option value="PATCH">PATCH</a-option>
          <a-option value="HEAD">HEAD</a-option>
          <a-option value="OPTIONS">OPTIONS</a-option>
          <a-option value="*">*(全部)</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="是否公开接口" name="isPublic" field="isPublic">
        <a-switch
          v-model="formState.isPublic"
          :checked-value="true"
          :unchecked-value="false"
          checked-text="是"
          unchecked-text="否"
        />
      </a-form-item>
      <a-form-item label="是否需要检查资源所有权" name="requireOwnership" field="requireOwnership">
        <a-switch
          v-model="formState.requireOwnership"
          :checked-value="true"
          :unchecked-value="false"
          checked-text="是"
          unchecked-text="否"
        />
      </a-form-item>
      <a-form-item label="描述" name="description" field="description">
        <a-textarea v-model="formState.description" placeholder="请输入描述" :max-length="500" />
      </a-form-item>
      <a-form-item label="是否可见" name="isVisible" field="isVisible">
        <a-switch
          v-model="formState.isVisible"
          :checked-value="true"
          :unchecked-value="false"
          checked-text="是"
          unchecked-text="否"
        />
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
  // import useLoading from '@/hooks/loading';
  // import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  // import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { computed, onBeforeUnmount, onMounted } from 'vue'
  import { useAppStore } from '@/store';
  import request from '@/api/request';
  import { useI18n } from 'vue-i18n';
  import { getPrivilegeById, createPrivilege, updatePrivilege } from '@/api/privilege';
  const { t } = useI18n();

  const appStore = useAppStore();
  const router = useRouter();
  const route = useRoute();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? '编辑权限' : '新增权限';
  });
  interface stringKey {
    [propName: string]: string | number;
  }
  interface FormState {
    privilegeName: string;
    privilegeCode: string;
    privilegePage: string;
    isVisible: boolean;
    pathPattern: string;
    httpMethod: string;
    isPublic: boolean;
    requireOwnership: boolean;
    description: string;
  }
  const defaultForm = {
    privilegeName: '',
    privilegeCode: '',
    privilegePage: '',
    isVisible: true,
    pathPattern: '',
    httpMethod: '',
    isPublic: false,
    requireOwnership: false,
    description: '',
  };

  const formRef = ref();
  const visible = ref(false);
  const currentId = ref('');
  const formState: FormState = reactive({ ...defaultForm });
  const treeData = ref([]);
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

  const getMenuListHandle = async (val = 1) => {
    const res = await request.get('admin/menu', { params: {} }).then((res) => res.data);
    treeData.value = res;
  };

  const rules = {
    privilegeName: [
      { required: true, message: '权限名称不能为空' },
      { maxLength: 50, message: '权限名称不能超过50个字符' },
    ],
    privilegeCode: [
      { required: true, message: '权限识别码不能为空' },
      { maxLength: 50, message: '权限识别码不能超过50个字符' },
    ],
    privilegePage: [{ required: true, message: '所属页面不能为空' }],
    pathPattern: [
      { required: true, message: '路径模式不能为空' },
      { maxLength: 500, message: '路径模式不能超过500个字符' },
    ],
    httpMethod: [
      { required: true, message: 'HTTP方法不能为空' },
      { maxLength: 10, message: 'HTTP方法不能超过10个字符' },
    ],
    description: [{ maxLength: 500, message: '描述不能超过500个字符' }],
  };
  // 提交成功
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    const params = {
      ...values,
    };
    // 确保布尔值正确传递
    params.isVisible = !!values.isVisible;
    // console.log('params:', params)
    // return
    if (type.value === 'edit') {
      // 编辑
      params.editId = currentId.value;
      const res = await updatePrivilege(params);
      visible.value = false;
      // console.log({ res });
      Message.success('修改成功！');
      resetForm();
    } else {
      // 新建
      const res = await createPrivilege(params);
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

  // const ArticleInfo = ref({})
  // 编辑
  const getInfoHandle = async () => {
    const res = await getPrivilegeById(Number(currentId.value));
    const responseData = res.data;

    formState.privilegeName = responseData.privilegeName || '';
    formState.privilegeCode = responseData.privilegeCode || '';
    formState.privilegePage = responseData.privilegePage || '';
    formState.privilegePage = responseData.privilegePage || '';
    formState.isVisible = responseData.isVisible !== undefined ? responseData.isVisible : true;
    formState.pathPattern = responseData.pathPattern || '';
    formState.httpMethod = responseData.httpMethod || '';
    formState.isPublic = responseData.isPublic !== undefined ? responseData.isPublic : false;
    formState.requireOwnership =
      responseData.requireOwnership !== undefined ? responseData.requireOwnership : false;
    formState.description = responseData.description || '';

    // 如果是编辑模式，需要将privilegePage转换为树形选择器需要的格式
    // 由于树形选择器需要节点的ID，直接赋值即可
  };
  const show = (val: any) => {
    type.value = val.type;
    console.log({ type: type.value });
    getMenuListHandle();

    if (type.value === 'edit') {
      currentId.value = val.id;
      getInfoHandle();
    } else {
      resetForm();
    }
    visible.value = true;
  };
  const handleOk = () => {
    visible.value = false;
  };
  const handleCancel = () => {
    visible.value = false;
  };
  const handleTreeChange = ({ value, label }: any) => {
    formState.privilegePage = label;
    formState.privilegePage = value;
  };

  // 父组件调用子组件方法和变量需要导出
  defineExpose({ show, visible });
  const emits = defineEmits(['success']);
</script>

<script lang="ts">
  export default {
    name: 'addPrivilege',
  };
</script>

<style scoped lang="less"></style>
