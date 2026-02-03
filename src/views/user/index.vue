<script setup lang="ts">
  import { useUserStore } from '@/store/';
  import { ref, reactive } from 'vue';
  import request from '@/api/request';
  import { Message, Modal } from '@arco-design/web-vue';
  import useUser from '@/hooks/user';
  import { useI18n } from 'vue-i18n';

  interface stringKey {
    [propName: string]: string | number;
  }
  const { logout } = useUser();
  const { t } = useI18n();
  const { email, nickname, mobile, homepage, intro, avatar, id: uid } = useUserStore();
  const visible = ref(false);
  const form = reactive({
    password: '',
    passwordRepeat: '',
    passwordOld: '',
    nickname,
    mobile,
    email,
    homepage,
    intro,
    avatar,
  });
  const modalForm = ref(Modal);

  const handleClick = () => {
    visible.value = true;
  };
  const handleBeforeOk = (done: any) => {
    // prevent close done(false)
    const { passwordOld, password, passwordRepeat } = form;
    const obj = {
      passwordOld,
      password,
      passwordRepeat,
      id: uid,
    };
    request
      .patch(`/user/password`, obj)
      .then(() => {
        done();
        Message.success(t('user.message.changePasswordSuccess'));
        // console.log({ logout, dom: modalForm.value });
        modalForm.value.resetFields();
        setTimeout(() => {
          logout();
        }, 1000);
      })
      .catch(() => {
        done(false);
      });
  };
  const handleCancel = () => {
    visible.value = false;
  };
  // 修改除了密码之外的信息
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    const keys: string[] = ['nickname', 'mobile', 'homepage', 'intro', 'avatar'];
    const obj: stringKey = {};
    keys.forEach((v: string) => {
      obj[v] = values[v];
    });
    // 修改除了密码之外的属性
    await request.patch('user/edit', {
      ...obj,
      id: uid,
    });
    Message.success(t('user.message.updateSuccess'));
  };
</script>

<template>
  <div class="my-info">
    <div class="center">
      <a-avatar>
        <img v-if="form.avatar" :src="form.avatar" />
        <template v-else>{{ form.nickname }}</template>
      </a-avatar>
    </div>
    <a-card :style="{ width: '80%' }" :title="t('user.title')">
      <template #extra>
        <a-button type="text" @click="handleClick">{{ t('user.button.changePassword') }}</a-button>
      </template>

      <a-form :model="form" auto-label-width @submit-success="handleFinish">
        <a-form-item v-if="form.mobile" field="mobile" :label="t('user.form.mobile')">
          <a-input
            v-model="form.mobile"
            :placeholder="t('user.form.placeholder.mobile')"
            disabled
          />
        </a-form-item>
        <a-form-item v-if="form.email" field="email" :label="t('user.form.email')">
          <a-input v-model="form.email" :placeholder="t('user.form.placeholder.email')" disabled />
        </a-form-item>
        <a-form-item field="nickname" :label="t('user.form.nickname')">
          <a-input
            v-model="form.nickname"
            :max-length="11"
            :placeholder="t('user.form.placeholder.nickname')"
          />
        </a-form-item>
        <a-form-item field="avatar" :label="t('user.form.avatar')">
          <a-input v-model="form.avatar" :placeholder="t('user.form.placeholder.avatar')" />
        </a-form-item>
        <a-form-item field="homepage" :label="t('user.form.homepage')">
          <a-input v-model="form.homepage" :placeholder="t('user.form.placeholder.homepage')" />
        </a-form-item>
        <a-form-item field="intro" :label="t('user.form.intro')">
          <a-input v-model="form.intro" :placeholder="t('user.form.placeholder.intro')" />
        </a-form-item>
        <a-form-item>
          <a-button html-type="submit" type="primary">{{ t('common.button.save') }}</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-modal
      v-model:visible="visible"
      :title="t('user.modal.changePassword')"
      @cancel="handleCancel"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="modalForm" :model="form">
        <a-form-item field="passwordOld" :label="t('user.form.passwordOld')">
          <a-input-password
            v-model="form.passwordOld"
            allow-clear
            :max-length="16"
            :placeholder="t('user.form.placeholder.passwordOld')"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item field="password" :label="t('user.form.password')">
          <a-input-password
            v-model="form.password"
            allow-clear
            :max-length="16"
            :placeholder="t('user.form.placeholder.password')"
            auto-com
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item field="passwordRepeat" :label="t('user.form.passwordRepeat')">
          <a-input-password
            v-model="form.passwordRepeat"
            allow-clear
            :placeholder="t('user.form.placeholder.passwordRepeat')"
            :max-length="16"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
  .my-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70%;
    // min-height: 100vh;
    min-width: 40%;
    margin: 20px auto 0;
    padding: 10px 20px 40px;
    background-color: #fff;
    border-radius: 8px;

    .center {
      height: 70px;
      line-height: 70px;
      text-align: center;
    }

    .arco-col {
      height: 48px;
    }
  }
</style>
