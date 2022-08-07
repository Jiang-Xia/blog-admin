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
      :label-col-props="{ span: 3, offset: 0 }"
      :wrapper-col-props="{ span: 20, offset: 0 }"
      hide-cancel
      autocomplete="off"
      @submit-success="handleFinish"
      @submit-failed="handleFinishFailed"
    >
      <a-form-item label="id" name="id" field="id">
        <a-input
          v-model="formState.id"
          :disabled="type === 'edit'"
          placeholder="id"
        />
      </a-form-item>
      <a-form-item label="pid" name="pid" field="pid">
        <a-input v-model="formState.pid" placeholder="pid" />
      </a-form-item>
      <a-form-item label="path" name="path" field="path">
        <a-input v-model="formState.path" placeholder="path" />
      </a-form-item>
      <a-form-item label="name" name="name" field="name">
        <a-input v-model="formState.name" placeholder="name" />
      </a-form-item>
      <a-form-item label="icon" name="icon" field="icon">
        <a-input v-model="formState.icon" placeholder="icon" />
      </a-form-item>
      <a-form-item label="locale" name="locale" field="locale">
        <a-input v-model="formState.locale" placeholder="locale" />
      </a-form-item>
      <a-form-item label="filePath" name="filePath" field="filePath">
        <a-input v-model="formState.filePath" placeholder="filePath" />
      </a-form-item>
      <a-form-item label="order" name="order" field="order">
        <a-input-number v-model="formState.order" placeholder="order" />
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
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { computed, onBeforeUnmount, onMounted } from 'vue'
  import { useAppStore } from '@/store';
  import 'md-editor-v3/lib/style.css';
  import axios from 'axios';

  // const appStore = useAppStore();
  // const router = useRouter();
  // const route = useRoute();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? '编辑菜单' : '新增菜单';
  });
  interface stringKey {
    [propName: string]: string | number;
  }
  interface FormState extends stringKey {
    id: string;
    pid: string;
    path: string;
    name: string;
    order: number;
    icon: string;
    locale: string;
    filePath: string;
  }
  const defaultForm = {
    id: '',
    pid: '',
    path: '',
    name: '',
    order: 1,
    icon: '',
    locale: '',
    filePath: '',
  };

  const formRef = ref();
  const visible = ref(false);
  const currentId = ref('');
  const formState: FormState = reactive({ ...defaultForm });
  // 自定义异步校验
  const checkTitle = async (value: string, cb: (error?: string) => void) => {
    console.log(value);
    if (!value) {
      cb('请输入标题！');
    }
    Promise.resolve();
  };
  const checkDescription = async (
    value: string,
    cb: (error?: string) => void
  ) => {
    if (!value) {
      cb('请输入描述！');
    }
    Promise.resolve();
  };
  const rules = {
    // title: [{ required: true, validator: checkTitle, trigger: 'blur' }],
    // description: [
    //   { required: true, validator: checkDescription, trigger: 'blur' },
    // ],
    // category: [{ required: true, message: '请选择分类！', trigger: 'change' }],
    // tags: [{ required: true, message: '请选择标签！', trigger: 'change' }],
    // cover: [{ required: true, message: '封面为必填！', trigger: 'blur' }],
    // contentHtml: [{ required: true, trigger: 'change' }],
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
      params.editId = currentId.value;
      const res = await axios.patch('admin/menu', params);
      visible.value = false;
      // console.log({ res });
      Message.success('修改成功！');
      resetForm();
    } else {
      // 新建
      const res = await axios.post('admin/menu', params);
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
  // 文章编辑
  const getInfoHandle = async () => {
    const res = await axios.get('admin/menu/detail', {
      params: { id: currentId.value },
    });
    const keys = Object.keys(defaultForm);
    keys.forEach((key: string) => {
      formState[key as string] = res.data[key];
    });
  };
  const show = (val: any) => {
    type.value = val.type;
    console.log({ type: type.value });
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
  // 父组件调用子组件方法和变量需要导出
  defineExpose({ show, visible });
  const emits = defineEmits(['success']);
</script>

<script lang="ts">
  export default {
    name: 'AddMenu',
  };
</script>

<style scoped lang="less"></style>
