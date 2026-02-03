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
      <a-form-item :label="t('menu.form.menuId')" name="id" field="id">
        <a-input
          v-model="formState.id"
          :disabled="type === 'edit'"
          :placeholder="t('menu.form.placeholder.menuId')"
        />
      </a-form-item>
      <a-form-item :label="t('menu.form.parentId')" name="pid" field="pid">
        <a-input v-model="formState.pid" :placeholder="t('menu.form.placeholder.parentId')" />
      </a-form-item>
      <a-form-item :label="t('menu.form.menuPath')" name="path" field="path">
        <a-input v-model="formState.path" :placeholder="t('menu.form.placeholder.menuPath')" />
      </a-form-item>
      <a-form-item :label="t('menu.form.menuName')" name="name" field="name">
        <a-input v-model="formState.name" :placeholder="t('menu.form.placeholder.menuName')" />
      </a-form-item>
      <a-form-item :label="t('menu.form.menuCnName')" name="menuCnName" field="menuCnName">
        <a-input
          v-model="formState.menuCnName"
          :placeholder="t('menu.form.placeholder.menuCnName')"
        />
      </a-form-item>
      <a-form-item :label="t('menu.form.menuIcon')" name="icon" field="icon">
        <a-input v-model="formState.icon" :placeholder="t('menu.form.placeholder.menuIcon')" />
      </a-form-item>
      <a-form-item :label="t('menu.form.locale')" name="locale" field="locale">
        <a-input v-model="formState.locale" :placeholder="t('menu.form.placeholder.locale')" />
      </a-form-item>
      <a-form-item :label="t('menu.form.filePath')" name="filePath" field="filePath">
        <a-input v-model="formState.filePath" :placeholder="t('menu.form.placeholder.filePath')" />
      </a-form-item>
      <a-form-item :label="t('menu.form.menuSort')" name="order" field="order">
        <a-input-number
          v-model="formState.order"
          :placeholder="t('menu.form.placeholder.menuSort')"
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
  // import useLoading from '@/hooks/loading';
  // import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  // import { useRoute, useRouter } from 'vue-router';
  // import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { computed, onBeforeUnmount, onMounted } from 'vue'
  // import { useAppStore } from '@/store';
  import request from '@/api/request';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  // const appStore = useAppStore();
  // const router = useRouter();
  // const route = useRoute();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? t('menu.modal.edit') : t('menu.modal.add');
  });
  interface stringKey {
    [propName: string]: string | number;
  }
  interface FormState extends stringKey {
    id: string;
    pid: string;
    path: string;
    name: string;
    menuCnName: string;
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
    menuCnName: '',
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
    id: [
      { required: true, message: t('system.validate.menuId.required') },
      { maxLength: 50, message: t('menu.validate.menuId.maxLength') },
      { pattern: /^[a-zA-Z0-9_-]+$/, message: t('menu.validate.menuId.pattern') },
    ],
    pid: [
      { maxLength: 50, message: t('menu.validate.parentId.maxLength') },
      { pattern: /^[a-zA-Z0-9_-]*$/, message: t('menu.validate.parentId.pattern') },
    ],
    path: [
      { required: true, message: t('system.validate.menuPath.required') },
      { maxLength: 100, message: t('menu.validate.menuPath.maxLength') },
    ],
    name: [
      { required: true, message: t('system.validate.menuEnName.required') },
      { maxLength: 50, message: t('menu.validate.menuName.maxLength') },
    ],
    menuCnName: [
      { required: true, message: t('system.validate.menuCnName.required') },
      { maxLength: 50, message: t('menu.validate.menuCnName.maxLength') },
    ],
    icon: [{ maxLength: 50, message: t('menu.validate.menuIcon.maxLength') }],
    locale: [{ maxLength: 50, message: t('menu.validate.locale.maxLength') }],
    filePath: [{ maxLength: 100, message: t('menu.validate.filePath.maxLength') }],
    order: [{ type: 'number', min: 0, max: 999999, message: t('menu.validate.menuSort.range') }],
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
      const res = await request.patch('admin/menu', params);
      visible.value = false;
      // console.log({ res });
      Message.success(t('menu.message.updateSuccess'));
      resetForm();
    } else {
      // 新建
      const res = await request.post('admin/menu', params);
      visible.value = false;
      Message.success(t('menu.message.createSuccess'));
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
  // 菜单编辑
  const getInfoHandle = async () => {
    const res = await request.get('admin/menu/detail', {
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
