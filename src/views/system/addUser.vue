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
      :label-col-props="{ span: 4, offset: 0 }"
      :wrapper-col-props="{ span: 18, offset: 0 }"
      hide-cancel
      autocomplete="off"
      @submit-success="handleFinish"
      @submit-failed="handleFinishFailed"
    >
      <a-form-item label="手机号" name="mobile" field="mobile">
        <a-input
          v-model="formState.mobile"
          :disabled="type === 'edit'"
          :max-length="11"
          placeholder="手机号"
        />
      </a-form-item>
      <a-form-item label="昵称" name="nickname" field="nickname">
        <a-input v-model="formState.nickname" placeholder="昵称" />
      </a-form-item>
      <a-form-item
        label="密码"
        name="password"
        field="password"
        :max-length="16"
      >
        <a-input v-model="formState.password" placeholder="密码" />
      </a-form-item>
      <a-form-item
        label="确认密码"
        name="passwordRepeat"
        :max-length="16"
        field="passwordRepeat"
      >
        <a-input v-model="formState.passwordRepeat" placeholder="确认密码" />
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

  const appStore = useAppStore();
  const router = useRouter();
  const route = useRoute();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? '编辑用户' : '新增用户';
  });
  interface stringKey {
    [propName: string]: string | number;
  }
  interface FormState extends stringKey {
    mobile: string;
    nickname: string;
    password: string;
    passwordRepeat: string;
  }
  const defaultForm = {
    mobile: '',
    nickname: '',
    password: '',
    passwordRepeat: '',
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
      const res = await axios.patch('user/edit', params);
      visible.value = false;
      // console.log({ res });
      Message.success('修改成功！');
      resetForm();
    } else {
      // 新建
      const res = await axios.post('user/register', params);
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
    const res = await axios.get('user/info', {
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
