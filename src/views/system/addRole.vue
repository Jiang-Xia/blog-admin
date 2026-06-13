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
      :label-col-props="{ span: 5, offset: 0 }"
      :wrapper-col-props="{ span: 17, offset: 0 }"
      hide-cancel
      autocomplete="off"
      @submit-success="handleFinish"
      @submit-failed="handleFinishFailed"
    >
      <a-form-item :label="t('role.form.roleName')" name="roleName" field="roleName">
        <a-input
          v-model="formState.roleName"
          :max-length="11"
          :placeholder="t('role.form.placeholder.roleName')"
        />
      </a-form-item>
      <a-form-item :label="t('role.form.roleDesc')" name="roleDesc" field="roleDesc">
        <a-input v-model="formState.roleDesc" :placeholder="t('role.form.placeholder.roleDesc')" />
      </a-form-item>
      <a-form-item :label="t('role.form.privileges')" name="privileges" field="privileges">
        <a-tree
          v-if="treeData.length > 0"
          style="max-height: 400px; overflow-y: auto; width: 100%"
          :checkable="true"
          v-model:checked-keys="formState.privileges"
          :check-strictly="true"
          :only-check-leaf="false"
          :data="treeData"
          :field-names="{
            key: 'value',
            title: 'label',
            children: 'children',
            icon: 'customIcon',
          }"
          @check="onTreeCheck"
        >
        </a-tree>
      </a-form-item>

      <a-form-item :label="t('role.form.dataScope')" field="articleScopeType">
        <a-select
          v-model="formState.articleScopeType"
          :placeholder="t('role.form.placeholder.scopeType')"
        >
          <a-option value="ALL">{{ t('role.scopeType.ALL') }}</a-option>
          <a-option value="DEPT">{{ t('role.scopeType.DEPT') }}</a-option>
          <a-option value="DEPT_AND_CHILDREN">{{ t('role.scopeType.DEPT_AND_CHILDREN') }}</a-option>
          <a-option value="CUSTOM">{{ t('role.scopeType.CUSTOM') }}</a-option>
        </a-select>
      </a-form-item>

      <a-form-item
        v-if="formState.articleScopeType === 'CUSTOM'"
        :label="t('role.form.customDepts')"
        field="articleCustomDeptIds"
      >
        <a-tree-select
          v-model="formState.articleCustomDeptIds"
          :data="deptTreeData"
          :placeholder="t('role.form.placeholder.customDepts')"
          multiple
          allow-clear
          tree-checkable
          :field-names="{ key: 'value', title: 'deptName', children: 'children' }"
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
  import { computed, ref, reactive, nextTick } from 'vue';
  // import useLoading from '@/hooks/loading';
  // import { Pagination } from '@/types/global';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  // import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { computed, onBeforeUnmount, onMounted } from 'vue'
  import { useAppStore } from '@/store';
  import request from '@/api/request';
  import { useI18n } from 'vue-i18n';
  import { getRoleById, createRole, updateRole, updateRoleDataScope } from '@/api/role';
  import { getDeptTree } from '@/api/dept';
  const { t } = useI18n();

  const appStore = useAppStore();
  const router = useRouter();
  const route = useRoute();
  const type = ref('add');
  const title = computed(() => {
    return type.value === 'edit' ? t('role.modal.edit') : t('role.modal.add');
  });
  interface stringKey {
    [propName: string]: string | number;
  }
  interface FormState {
    roleName: string;
    roleDesc: string;
    privileges: string[];
    articleScopeType: string;
    articleCustomDeptIds: number[];
  }
  const defaultForm = {
    roleName: '',
    roleDesc: '',
    privileges: [],
    articleScopeType: 'DEPT',
    articleCustomDeptIds: [],
  };

  const formRef = ref();
  const visible = ref(false);
  const currentId = ref('');
  const formState: FormState = reactive({ ...defaultForm });
  const treeData = ref<any[]>([]);
  const deptTreeData = ref<any[]>([]);
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

  // 处理树形组件勾选事件
  const onTreeCheck = (checkedKeys: string[], e: any) => {
    const subKeys = checkedSubKeys(e.node.children);
    if (e.checked) {
      formState.privileges = [...checkedKeys, ...subKeys];
    } else {
      formState.privileges = formState.privileges.filter((key) => !subKeys.includes(key));
    }
  };

  const getMenuPrivilegeTree = async (val = 1) => {
    const res = await request
      .get('/role/menu-privilege-tree', { params: {} })
      .then((res) => res.data);
    console.log(res, 'getMenuPrivilegeTree');
    treeData.value = res;
  };

  const loadDeptTree = async () => {
    const res = await getDeptTree();
    deptTreeData.value = res.data ?? [];
  };

  const buildArticleDataScope = () => ({
    resourceType: 'article',
    scopeType: formState.articleScopeType,
    deptIds:
      formState.articleScopeType === 'CUSTOM'
        ? formState.articleCustomDeptIds.map((id) => Number(id))
        : undefined,
  });

  const saveArticleDataScope = async (roleId: number) => {
    await updateRoleDataScope(roleId, [buildArticleDataScope()]);
  };

  // 已选中的子节点
  const checkedSubKeys = (data: any[]): string[] => {
    if (!data || data.length === 0) return [];
    let keys: string[] = [];
    data.forEach((item) => {
      keys.push(item.value || item.id);
      if (item.children && item.children.length > 0) {
        keys = [...keys, ...checkedSubKeys(item.children)];
      }
    });
    return keys;
  };

  const rules = {
    roleName: [
      { required: true, message: t('role.validate.roleName.required') },
      { minLength: 2, message: t('role.validate.roleName.minLength') },
      { maxLength: 11, message: t('role.validate.roleName.maxLength') },
    ],
    roleDesc: [{ maxLength: 100, message: t('role.validate.roleDesc.maxLength') }],
  };
  // 提交成功
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    // 分离权限信息
    const { privileges: AllIds, ...otherValues } = values;
    const privileges = AllIds.filter((id: any) => !id.includes('p'));
    const menus = AllIds.filter((id: any) => id.includes('p'));

    // 构造参数，将选中的权限ID传递给后端
    const params = {
      ...otherValues,
      privileges, // 发送选中的权限ID数组
      menus, // 发送选中的菜单ID数组
    };
    // console.log('params:', params)
    // return
    if (type.value === 'edit') {
      // 编辑
      params.editId = currentId.value;
      const res = await updateRole(params);
      await saveArticleDataScope(Number(currentId.value));
      visible.value = false;
      // console.log({ res });
      Message.success(t('role.message.updateSuccess'));
      resetForm();
    } else {
      // 新建
      const res = await createRole(params);
      const roleId = res.data?.id;
      if (roleId) {
        await saveArticleDataScope(Number(roleId));
      }
      visible.value = false;
      Message.success(t('role.message.createSuccess'));
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
    const res = await getRoleById(Number(currentId.value));
    const keys = Object.keys(defaultForm);
    keys.forEach((key: string) => {
      if (key !== 'articleScopeType' && key !== 'articleCustomDeptIds') {
        formState[key as keyof FormState] = res.data[key];
      }
    });
    formState.privileges = [...res.data.privileges, ...res.data.menus];
    const articleScope = (res.data.dataScopes ?? []).find(
      (item: { resourceType: string }) => item.resourceType === 'article',
    );
    formState.articleScopeType = articleScope?.scopeType ?? 'DEPT';
    formState.articleCustomDeptIds = articleScope?.deptIds ?? [];
  };
  const show = (val: any) => {
    type.value = val.type;
    console.log({ type: type.value });
    getMenuPrivilegeTree();
    loadDeptTree();
    if (type.value === 'edit') {
      currentId.value = val.id;
      getInfoHandle();
    } else {
      Object.assign(formState, { ...defaultForm });
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
    name: 'AddRole',
  };
</script>

<style scoped lang="less"></style>
