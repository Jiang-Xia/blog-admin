<template>
  <div v-show="!ticket" class="login-form-wrapper">
    <div class="login-form-title">{{ $t('login.form.title') }}</div>
    <div class="login-form-sub-title">{{ $t('login.form.subtitle') }}</div>
    <div class="login-form-error-msg">{{ errorMessage }}</div>
    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="username"
        :rules="[{ required: true, message: $t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.username"
          :placeholder="$t('login.form.userName.placeholder')"
          :max-length="11"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: $t('login.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="userInfo.password"
          :placeholder="$t('login.form.password.placeholder')"
          allow-clear
          :max-length="16"
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item
        field="authCode"
        :rules="[{ required: true, message: '验证码必填' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.authCode"
          placeholder="请输入验证码"
          :max-length="11"
        >
          <template #suffix>
            <a-image
              height="30"
              :src="authCodeUrl"
              style="margin-right: -12px"
              :preview="false"
              @click="changeAuthCodeUrl"
            />
          </template>
        </a-input>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            checked="rememberPassword"
            :model-value="loginConfig.rememberPassword"
            @change="setRememberPassword as any"
          >
            {{ $t('login.form.rememberPassword') }}
          </a-checkbox>
          <a-link>{{ $t('login.form.forgetPassword') }}</a-link>
        </div>
        <a-button
          type="primary"
          html-type="submit"
          long
          :loading="loading"
          class="login-btn"
        >
          {{ $t('login.form.login') }}
        </a-button>
        <a-button type="text" long class="login-form-register-btn">
          {{ $t('login.form.register') }}
        </a-button>
      </a-space>
    </a-form>
  </div>
  <a-spin v-if="ticket" dot />
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginData } from '@/api/user';
  import { getAuthCode } from '@/api/login';

  const router = useRouter();
  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const { query } = useRoute();
  const loginConfig = useStorage('login-config', {
    rememberPassword: true,
    username: '', // 演示默认值
    password: '', // demo default value
  });
  const userInfo = reactive({
    username: loginConfig.value.username,
    password: loginConfig.value.password,
    authCode: '',
  });
  getAuthCode();
  const ticket = ref(query.ticket as string);
  if (ticket.value) {
    userStore.ticketLogin(ticket.value).then(() => {
      setTimeout(() => {
        router.push({
          name: 'ArticleEdit',
        });
      }, 800);
    });
  }
  const handleSubmit = async ({
    errors,
    values,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: Record<string, any>;
  }) => {
    if (!errors) {
      setLoading(true);
      try {
        await userStore.login(values as LoginData);
        const { redirect, ...othersQuery } = router.currentRoute.value.query;
        router.push({
          name: (redirect as string) || 'Workplace',
          query: {
            ...othersQuery,
          },
        });
        Message.success(t('login.form.login.success'));
        const { rememberPassword } = loginConfig.value;
        const { username, password } = values;
        // 实际生产环境需要进行加密存储。
        // The actual production environment requires encrypted storage.
        loginConfig.value.username = rememberPassword ? username : '';
        loginConfig.value.password = rememberPassword ? password : '';
      } catch (err) {
        errorMessage.value = (err as Error).message;
      } finally {
        setLoading(false);
      }
    }
  };
  const setRememberPassword = (value: boolean) => {
    loginConfig.value.rememberPassword = value;
  };

  // 验证码
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/user/authCode`;
  const authCodeUrl = ref(baseUrl);
  const changeAuthCodeUrl = () => {
    authCodeUrl.value = `${baseUrl}?t=${new Date().getTime()}`;
  };
</script>

<style lang="less" scoped>
  .login-form {
    &-wrapper {
      width: 248px;
      text-align: center;
    }

    &-title {
      margin-bottom: 10px;
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 24px;
      line-height: 32px;
    }

    &-sub-title {
      color: var(--color-text-3);
      font-size: 12px;
      line-height: 24px;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: var(--color-text-3) !important;
    }

    .login-btn {
      background: rgb(93 84 240 / 50%);
      background: linear-gradient(
        left,
        rgb(0 168 255 / 50%),
        rgb(185 0 255 / 50%)
      );
      background: linear-gradient(
          left,
          rgb(0 168 255 / 50%),
          rgb(185 0 255 / 50%)
        )
        no-repeat;
      border-radius: 5px;
    }
  }
</style>
