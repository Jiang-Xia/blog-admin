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
      :wrapper-col-props="{ span: 16, offset: 0 }"
      hide-cancel
      autocomplete="off"
      @submit-success="handleFinish"
      @submit-failed="handleFinishFailed"
    >
      <a-form-item :label="t('user.form.username')" name="username" field="username">
        <a-input
          v-model="formState.username"
          :disabled="type === 'edit'"
          :max-length="11"
          :placeholder="t('user.form.placeholder.username')"
        />
      </a-form-item>
      <a-form-item :label="t('user.form.nickname')" name="nickname" field="nickname">
        <a-input v-model="formState.nickname" :placeholder="t('user.form.placeholder.nickname')" />
      </a-form-item>
      <a-form-item
        v-if="type !== 'edit'"
        :label="t('user.form.password')"
        name="password"
        field="password"
        :max-length="16"
      >
        <a-input v-model="formState.password" :placeholder="t('user.form.placeholder.password')" />
      </a-form-item>
      <a-form-item
        v-if="type !== 'edit'"
        :label="t('user.form.passwordRepeat')"
        name="passwordRepeat"
        :max-length="16"
        field="passwordRepeat"
      >
        <a-input
          v-model="formState.passwordRepeat"
          :placeholder="t('user.form.placeholder.passwordRepeat')"
        />
      </a-form-item>

      <a-form-item :label="t('user.form.deptId')" name="deptId" field="deptId">
        <a-select
          v-model="formState.deptId"
          :loading="loadingDepts"
          :placeholder="t('user.form.placeholder.deptId')"
          :filterable="true"
        >
          <a-option v-for="dept in deptOptions" :key="dept.value" :value="dept.value">
            {{ dept.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('user.form.roleIds')" name="roleIds" field="roleIds">
        <a-select
          v-model="formState.roleIds"
          multiple
          :loading="loadingRoles"
          :placeholder="t('user.form.placeholder.roleIds')"
          allow-create
          :filterable="true"
        >
          <a-option v-for="role in roleOptions" :key="role.value" :value="role.value">
            {{ role.label }}
            <span v-if="role.desc" style="color: #999; font-size: 12px; margin-left: 8px"
              >({{ role.desc }})</span
            >
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item :label="t('user.form.avatar')" name="avatar" field="avatar">
        <a-input v-model="formState.avatar" :placeholder="t('user.form.placeholder.avatar')" />
      </a-form-item>

      <a-form-item :label="t('user.form.intro')" name="intro" field="intro">
        <a-textarea
          v-model="formState.intro"
          :placeholder="t('user.form.placeholder.intro')"
          :max-length="100"
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
  import request from '@/api/request';
  import { adminCreateUser, adminUpdateUser } from '@/api/user';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? t('user.modal.edit') : t('user.modal.add');
  });
  interface stringKey {
    [propName: string]: string | number | undefined | any[];
  }
  interface FormState extends stringKey {
    mobile: string;
    username: string;
    nickname: string;
    password: string;
    passwordRepeat: string;
    avatar?: string;
    intro?: string;
    roleIds?: string[];
    deptId?: string;
  }
  const defaultForm = {
    mobile: '',
    username: '',
    nickname: '',
    password: '',
    passwordRepeat: '',
    avatar: '',
    intro: '',
    roleIds: [],
  };

  const formRef = ref();
  const visible = ref(false);
  const currentId = ref('');
  const captchaUrl = ref('');
  const roleOptions = ref<Array<{ label: string; value: string; desc?: string }>>([]);
  const deptOptions = ref<Array<{ label: string; value: string }>>([]);
  const loadingRoles = ref(false);
  const loadingDepts = ref(false);
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
    username: [
      { required: true, message: t('user.validate.username.required') },
      { pattern: /^1[3-9]\d{9}$/, message: t('user.validate.username.pattern') },
      { maxLength: 11, message: t('user.validate.username.maxLength') },
    ],
    nickname: [
      { required: true, message: t('user.validate.nickname.required') },
      { maxLength: 6, message: t('user.validate.nickname.maxLength') },
    ],
    password: [
      {
        required: true,
        validator: (value: string, callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下必须输入密码
            if (!value) {
              callback(t('user.validate.password.required'));
            } else if (value.length < 6) {
              callback(t('user.validate.password.minLength'));
            } else if (value.length > 18) {
              callback(t('user.validate.password.maxLength'));
            } else {
              callback();
            }
          } else {
            // 编辑模式下不需要密码
            callback();
          }
        },
        message: t('user.validate.password.required'),
      },
    ],
    passwordRepeat: [
      {
        required: true,
        validator: (value: string, callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下需要验证重复密码
            if (!value) {
              callback(t('user.validate.passwordRepeat.required'));
            } else if (value !== formState.password) {
              callback(t('user.validate.passwordRepeat.notMatch'));
            } else {
              callback();
            }
          } else {
            // 编辑模式下不需要重复密码
            callback();
          }
        },
        message: t('user.validate.passwordRepeat.required'),
      },
    ],
    avatar: [],
    intro: [],
    roleIds: [
      {
        required: true,
        validator: (value: string[], callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下必须选择角色
            if (!value || value.length === 0) {
              callback(t('user.validate.roleIds.required'));
            } else {
              callback();
            }
          } else {
            // 编辑模式下可选
            callback();
          }
        },
        message: t('user.validate.roleIds.required'),
      },
    ],
    deptId: [
      {
        required: true,
        validator: (value: string, callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下必须选择部门
            if (!value) {
              callback(t('user.validate.deptId.required'));
            } else {
              callback();
            }
          } else {
            // 编辑模式下可选
            callback();
          }
        },
        message: t('user.validate.deptId.required'),
      },
    ],
  };
  // 提交成功
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    // 准备提交参数
    const params = { ...values };

    // 处理角色ID数组，转换为数字类型
    if (params.roleIds && params.roleIds.length > 0) {
      params.roleIds = params.roleIds.map((roleId: string) => parseInt(roleId));
    }

    // 处理部门ID，转换为数字类型
    if (params.deptId) {
      params.deptId = parseInt(params.deptId);
    }
    params.mobile = params.username;
    // 在编辑模式下，移除手机号、用户名和密码字段，因为这些不能被修改
    if (type.value === 'edit') {
      delete params.mobile; // 编辑时不修改手机号
      delete params.username; // 编辑时不修改用户名
      delete params.password; // 编辑时不修改密码
    }

    // console.log('params:', params)
    // return
    if (type.value === 'edit') {
      // 编辑 - 使用管理员更新用户接口
      const res = await adminUpdateUser(parseInt(currentId.value), params);
      visible.value = false;
      // console.log({ res });
      Message.success(t('user.message.updateSuccess'));
      resetForm();
    } else {
      // 新建 - 使用管理员创建用户接口
      const res = await adminCreateUser(params);
      visible.value = false;
      Message.success(t('user.message.createSuccess'));
      resetForm();
    }
    emits('success');
  };
  // 提交失败
  const handleFinishFailed = (errors: any) => {
    console.log(errors);
  };
  const loadRoles = async () => {
    try {
      loadingRoles.value = true;
      const res = await request.get('/role');
      roleOptions.value = res.data.list.map((role: any) => ({
        label: role.roleName,
        value: String(role.id),
        desc: role.roleDesc,
      }));
    } catch (error) {
      console.error('获取角色列表失败:', error);
      Message.error(t('user.message.getRolesFailed'));
    } finally {
      loadingRoles.value = false;
    }
  };

  const loadDepts = async () => {
    try {
      loadingDepts.value = true;
      const res = await request.get('/dept');
      deptOptions.value = res.data.list.map((dept: any) => ({
        label: dept.deptName,
        value: String(dept.id),
      }));
    } catch (error) {
      console.error('获取部门列表失败:', error);
      Message.error(t('user.message.getDeptsFailed'));
    } finally {
      loadingDepts.value = false;
    }
  };

  const resetForm = () => {
    formRef.value.resetFields();
  };

  // const ArticleInfo = ref({})
  // 编辑
  const getInfoHandle = async () => {
    const res = await request.get('user/info', {
      params: { id: currentId.value },
    });
    const userData = res.data;
    // 只设置表单中存在的字段，避免设置多余字段
    Object.keys(formState).forEach((key) => {
      if (userData[key] !== undefined) {
        formState[key as keyof FormState] = userData[key];
      }
    });

    // 处理用户的角色信息
    if (userData.roles && userData.roles.length > 0) {
      formState.roleIds = userData.roles.map((role: any) => String(role.id));
    } else {
      formState.roleIds = [];
    }

    // 处理用户的部门信息
    if (userData.deptId) {
      formState.deptId = String(userData.deptId);
    } else {
      formState.deptId = undefined;
    }

    // 编辑时不需要验证码，所以清空
    formState.authCode = '';
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
    // 加载角色和部门列表
    loadRoles();
    loadDepts();
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
