<template>
  <div v-show="!ticket" class="login-form-wrapper">
    <div class="login-form-title">{{ t('login.form.title') }}</div>
    <div class="login-form-sub-title">
      {{ t('login.form.subtitle') }}
    </div>
    <div class="login-form-error-msg">{{ errorMessage }}</div>

    <!-- 登录方式切换 -->
    <div class="login-form-type-toggle">
      <a-radio-group v-model:model-value="loginType" type="button" size="small">
        <a-radio value="mobile">{{ t('login.form.mobileLogin') }}</a-radio>
        <a-radio value="email">{{ t('login.form.emailLogin') }}</a-radio>
      </a-radio-group>
    </div>

    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <!-- 手机号登录表单 -->
      <template v-if="loginType === 'mobile'">
        <a-form-item
          field="username"
          :rules="[{ required: true, message: t('login.form.userName.errMsg') }]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input
            v-model="userInfo.username"
            :placeholder="t('login.form.userName.placeholder')"
            :max-length="11"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item
          field="password"
          :rules="[{ required: true, message: t('login.form.password.errMsg') }]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input-password
            v-model="userInfo.password"
            :placeholder="t('login.form.password.placeholder')"
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
            :placeholder="t('login.form.imageCode.placeholder')"
            :max-length="6"
          >
            <template #suffix>
              <template v-if="authCodeUrl && !authCodeLoadError">
                <img
                  class="captcha-img"
                  :src="authCodeUrl"
                  alt="验证码"
                  @click="changeAuthCodeUrlDebounced"
                  @error="authCodeLoadError = true"
                />
              </template>
              <button
                v-else
                class="captcha-placeholder"
                type="button"
                @click="changeAuthCodeUrlDebounced"
              >
                点击获取
              </button>
            </template>
          </a-input>
        </a-form-item>
      </template>

      <!-- 邮箱登录表单 -->
      <template v-else-if="loginType === 'email'">
        <a-form-item
          field="email"
          :rules="[
            { required: true, message: t('login.form.email.errMsg') },
            { type: 'email', message: t('login.form.email.invalid') },
          ]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input v-model="userInfo.email" :placeholder="t('login.form.email.placeholder')">
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item
          field="emailPassword"
          :rules="[{ required: true, message: t('login.form.emailPassword.errMsg') }]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input-password
            v-model="userInfo.emailPassword"
            :placeholder="t('login.form.emailPassword.placeholder')"
            allow-clear
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item
          field="emailAuthCode"
          :rules="[{ required: true, message: t('login.form.emailAuthCode.errMsg') }]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input-search
            v-model="userInfo.emailAuthCode"
            :placeholder="t('login.form.emailAuthCode.placeholder')"
            :max-length="6"
            search-button
            :disabled="emailCaptchaDisabled"
            :loading="emailLoading"
            @search="getEmailCaptcha"
          >
            <template #prefix>
              <icon-safe />
            </template>
            <template #button-default>
              {{ emailCaptchaText }}
            </template>
          </a-input-search>
        </a-form-item>
      </template>

      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            checked="rememberAccount"
            :model-value="loginConfig.rememberAccount"
            @change="setRememberAccount as any"
          >
            {{ t('login.form.rememberAccount') }}
          </a-checkbox>
          <a-link>{{ t('login.form.forgetPassword') }}</a-link>
        </div>
        <a-button type="primary" html-type="submit" long :loading="loading" class="login-btn">
          {{ t('login.form.login') }}
        </a-button>
        <a-button type="text" long class="login-form-register-btn" @click="register">
          {{ t('login.form.register') }}
        </a-button>
      </a-space>
    </a-form>
  </div>
  <a-spin v-if="ticket" dot />
</template>

<script lang="ts" setup>
  import { ref, reactive, onUnmounted } from 'vue';
  import { useDebounceFn } from '@vueuse/core';
  import { useRoute, useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import type { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginData } from '@/api/user';
  import { getAuthCode, getEmailAuthCode } from '@/api/login';
  import { shouldRefreshGraphicCaptcha } from '@/constants/graphic-captcha-error';

  const router = useRouter();
  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const { query } = useRoute();

  // 登录方式：mobile 或 email
  const loginType = ref<'mobile' | 'email'>('mobile');

  const loginConfig = useStorage('login-config', {
    rememberAccount: true,
    username: '', // 演示默认值
    email: '',
  });
  // 清理历史版本遗留的明文密码字段，避免继续持久化敏感信息。
  if ('password' in loginConfig.value) {
    delete (loginConfig.value as Record<string, unknown>).password;
  }
  if ('emailPassword' in loginConfig.value) {
    delete (loginConfig.value as Record<string, unknown>).emailPassword;
  }

  const userInfo = reactive({
    username: loginConfig.value.username,
    password: '',
    authCode: '',
    email: loginConfig.value.email,
    emailPassword: '',
    emailAuthCode: '',
  });

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
        // 根据登录方式准备登录数据
        let loginData: LoginData;
        if (loginType.value === 'mobile') {
          loginData = {
            username: values.username,
            password: values.password,
            authCode: values.authCode,
          };
        } else {
          // 邮箱登录数据
          loginData = {
            email: values.email,
            password: values.emailPassword,
            verificationCode: values.emailAuthCode,
          };
        }

        await userStore.login(loginData);
        const { redirect, ...othersQuery } = router.currentRoute.value.query;
        router.push({
          name: (redirect as string) || 'Workplace',
          query: {
            ...othersQuery,
          },
        });
        Message.success(t('login.form.login.success'));
        const { rememberAccount } = loginConfig.value;

        // 保存登录信息
        if (loginType.value === 'mobile') {
          loginConfig.value.username = rememberAccount ? values.username : '';
        } else {
          loginConfig.value.email = rememberAccount ? values.email : '';
        }
      } catch (err: any) {
        errorMessage.value = err?.message || '';
        if (loginType.value === 'mobile' && shouldRefreshGraphicCaptcha(err?.bizCode)) {
          void changeAuthCodeUrl();
          userInfo.authCode = '';
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const setRememberAccount = (value: boolean) => {
    loginConfig.value.rememberAccount = value;
  };

  // 图片验证码
  const authCodeUrl = ref('');
  const changeAuthCodeUrl = async () => {
    try {
      const res = await getAuthCode();
      authCodeUrl.value = `data:image/svg+xml;base64,${res.captchaBase64}`;
      authCodeLoadError.value = false;
    } catch {
      authCodeUrl.value = '';
      authCodeLoadError.value = true;
      // 错误提示由 axios 全局拦截器统一处理
    }
  };
  const authCodeLoadError = ref(false);
  const changeAuthCodeUrlDebounced = useDebounceFn(() => {
    void changeAuthCodeUrl();
  }, 300);
  void changeAuthCodeUrl();

  // 邮箱验证码相关
  const emailCaptchaText = ref(t('login.form.getEmailCaptcha'));
  const emailCaptchaDisabled = ref(false);
  const countdown = ref(60);
  const emailLoading = ref(false);
  // 保存倒计时定时器句柄，便于重复触发和组件卸载时统一清理。
  const emailCaptchaTimer = ref<number | null>(null);

  const getEmailCaptcha = () => {
    if (!userInfo.email) {
      Message.error(t('login.form.email.required'));
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      Message.error(t('login.form.email.invalid'));
      return;
    }

    // 发送验证码
    emailLoading.value = true;
    emailCaptchaDisabled.value = true;
    countdown.value = 60;
    emailCaptchaText.value = `${countdown.value}s`;

    if (emailCaptchaTimer.value) {
      clearInterval(emailCaptchaTimer.value);
    }

    emailCaptchaTimer.value = window.setInterval(() => {
      countdown.value--;
      emailCaptchaText.value = `${countdown.value}s`;
      if (countdown.value <= 0) {
        if (emailCaptchaTimer.value) {
          clearInterval(emailCaptchaTimer.value);
          emailCaptchaTimer.value = null;
        }
        emailCaptchaDisabled.value = false;
        emailCaptchaText.value = t('login.form.getEmailCaptcha');
      }
    }, 1000);
    getEmailAuthCode({ email: userInfo.email, type: 'login' })
      .then(() => {
        Message.success(t('login.form.captchaSent'));
        emailLoading.value = false;
      })
      .catch(() => {
        emailCaptchaDisabled.value = false;
        if (emailCaptchaTimer.value) {
          clearInterval(emailCaptchaTimer.value);
          emailCaptchaTimer.value = null;
        }
        emailCaptchaText.value = t('login.form.getEmailCaptcha');
        countdown.value = 60;
        emailLoading.value = false;
      });
  };

  const register = () => {
    window.open('https://jiang-xia.top/register');
  };

  onUnmounted(() => {
    if (emailCaptchaTimer.value) {
      clearInterval(emailCaptchaTimer.value);
      emailCaptchaTimer.value = null;
    }
  });
</script>

<style lang="less" scoped>
  .login-form {
    &-wrapper {
      width: 320px;
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

    &-type-toggle {
      margin-bottom: 20px;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: var(--color-text-3) !important;
    }

    .login-btn {
      background: rgb(93 84 240 / 70%);
      background: linear-gradient(left, rgb(0 168 255 / 50%), rgb(185 0 255 / 50%));
      background: linear-gradient(left, rgb(0 168 255 / 50%), rgb(185 0 255 / 50%)) no-repeat;
      border-radius: 5px;
    }
  }

  .captcha-img {
    height: 30px;
    width: 86px;
    margin-right: -12px;
    cursor: pointer;
    border-radius: 4px;
    user-select: none;
    background: rgba(255, 255, 255, 0.06);
  }

  .captcha-placeholder {
    height: 30px;
    width: 86px;
    margin-right: -12px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px dashed var(--color-border-2);
    color: var(--color-text-3);
    background: transparent;
    padding: 0 8px;
    font-size: 12px;
    line-height: 28px;
  }
</style>
