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
      <a-form-item label="账号" name="username" field="username">
        <a-input
          v-model="formState.username"
          :disabled="type === 'edit'"
          :max-length="11"
          placeholder="账号"
        />
      </a-form-item>
      <a-form-item label="昵称" name="nickname" field="nickname">
        <a-input v-model="formState.nickname" placeholder="昵称" />
      </a-form-item>
      <a-form-item
        v-if="type !== 'edit'"
        label="密码"
        name="password"
        field="password"
        :max-length="16"
      >
        <a-input v-model="formState.password" placeholder="密码" />
      </a-form-item>
      <a-form-item
        v-if="type !== 'edit'"
        label="确认密码"
        name="passwordRepeat"
        :max-length="16"
        field="passwordRepeat"
      >
        <a-input v-model="formState.passwordRepeat" placeholder="确认密码" />
      </a-form-item>

      <a-form-item label="所属部门" name="deptId" field="deptId">
        <a-select
          v-model="formState.deptId"
          :loading="loadingDepts"
          placeholder="请选择用户所属部门"
          :filterable="true"
        >
          <a-option v-for="dept in deptOptions" :key="dept.value" :value="dept.value">
            {{ dept.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="所属角色" name="roleIds" field="roleIds">
        <a-select
          v-model="formState.roleIds"
          multiple
          :loading="loadingRoles"
          placeholder="请选择用户所属角色"
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

      <a-form-item label="头像" name="avatar" field="avatar">
        <a-input v-model="formState.avatar" placeholder="头像URL" />
      </a-form-item>

      <a-form-item label="简介" name="intro" field="intro">
        <a-textarea v-model="formState.intro" placeholder="个人简介或签名" :max-length="100" />
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
  import request from '@/api/request';
  import { adminCreateUser, adminUpdateUser } from '@/api/user';

  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? '编辑用户' : '新增用户';
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
    username: [
      { required: true, message: '请输入手机号' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
      { maxLength: 11, message: '手机号不能超过11个字符' },
    ],
    nickname: [
      { required: true, message: '请输入昵称' },
      { maxLength: 6, message: '昵称不能超过6个字符' },
    ],
    password: [
      {
        required: true,
        validator: (value: string, callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下必须输入密码
            if (!value) {
              callback('请输入密码');
            } else if (value.length < 6) {
              callback('密码至少需要6个字符');
            } else if (value.length > 18) {
              callback('密码不能超过18个字符');
            } else {
              callback();
            }
          } else {
            // 编辑模式下不需要密码
            callback();
          }
        },
        message: '请输入密码',
      },
    ],
    passwordRepeat: [
      {
        required: true,
        validator: (value: string, callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下需要验证重复密码
            if (!value) {
              callback('请再次输入密码');
            } else if (value !== formState.password) {
              callback('两次输入的密码不一致');
            } else {
              callback();
            }
          } else {
            // 编辑模式下不需要重复密码
            callback();
          }
        },
        message: '请再次输入密码',
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
              callback('请选择至少一个角色');
            } else {
              callback();
            }
          } else {
            // 编辑模式下可选
            callback();
          }
        },
        message: '请选择用户所属角色',
      },
    ],
    deptId: [
      {
        required: true,
        validator: (value: string, callback: (error?: string) => void) => {
          if (type.value === 'add') {
            // 添加模式下必须选择部门
            if (!value) {
              callback('请选择用户所属部门');
            } else {
              callback();
            }
          } else {
            // 编辑模式下可选
            callback();
          }
        },
        message: '请选择用户所属部门',
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
      Message.success('修改成功！');
      resetForm();
    } else {
      // 新建 - 使用管理员创建用户接口
      const res = await adminCreateUser(params);
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
      Message.error('获取角色列表失败');
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
      Message.error('获取部门列表失败');
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
