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
        <a-radio value="account">{{ t('login.form.accountLogin') }}</a-radio>
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
      <!-- 账号登录表单 -->
      <template v-if="loginType === 'account'">
        <a-form-item
          field="username"
          :rules="[
            { required: true, message: t('login.form.userName.errMsg') },
            {
              validator: (value: string, callback: (error?: string) => void) => {
                if (!value) {
                  callback(t('login.form.userName.errMsg'));
                  return;
                }
                if (!isLoginAccount(value)) {
                  callback(t('login.form.userName.pattern'));
                  return;
                }
                callback();
              },
            },
          ]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input
            v-model="userInfo.username"
            :placeholder="t('login.form.userName.placeholder')"
            allow-clear
            :max-length="LOGIN_ACCOUNT_MAX_LENGTH"
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
        <!-- 进页随机；graphic 内嵌，slide/click/rotate 点登录后弹窗 -->
        <LoginHumanCheck ref="humanCheckRef" />
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
          <a-input
            v-model="userInfo.email"
            allow-clear
            :placeholder="t('login.form.email.placeholder')"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item
          field="emailAuthCode"
          :rules="[{ required: true, message: t('login.form.emailAuthCode.errMsg') }]"
          :validate-trigger="['change', 'blur']"
          hide-label
        >
          <a-input-search
            :model-value="userInfo.emailAuthCode"
            :placeholder="t('login.form.emailAuthCode.placeholder')"
            allow-clear
            :max-length="EMAIL_VERIFICATION_CODE_LENGTH"
            :input-attrs="emailVerificationCodeNativeInputAttrs"
            search-button
            :disabled="emailCaptchaDisabled"
            :loading="emailLoading"
            @update:model-value="onEmailAuthCodeModelUpdate"
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
          <!-- 仅记住账号/邮箱，绝不落盘密码（与「记住密码」区分） -->
          <a-checkbox :model-value="loginConfig.rememberAccount" @change="onRememberAccountChange">
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
  import { ref, reactive, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import type { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginData } from '@/api/user';
  import { getEmailAuthCode } from '@/api/login';
  import { shouldRefreshGraphicCaptcha } from '@/constants/graphic-captcha-error';
  import {
    createSanitizedModelUpdater,
    EMAIL_VERIFICATION_CODE_LENGTH,
    emailVerificationCodeNativeInputAttrs,
    sanitizeEmailVerificationCodeInput,
    watchCaptchaInput,
  } from '@/utils/captcha-input';
  import { LOGIN_ACCOUNT_MAX_LENGTH, isLoginAccount } from '@/utils/username';
  import LoginHumanCheck from './login-human-check.vue';
  import type { AdminHumanPayload } from './login-human-check.vue';

  const router = useRouter();
  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const { query } = useRoute();
  const humanCheckRef = ref<{
    ensureReady: () => Promise<AdminHumanPayload | null>;
    reset: () => Promise<void>;
  } | null>(null);

  /**
   * 记住账号：localStorage（VueUse useStorage）只存账号标识与开关，不存密码。
   * 常见做法是「记住账号」≠「记住密码」；密码由浏览器 Password Manager 处理更安全。
   */
  const loginConfig = useStorage('login-config', {
    rememberAccount: true,
    loginType: 'account' as 'account' | 'email',
    username: '',
    email: '',
  });
  // 清理历史版本遗留的明文密码字段，避免继续持久化敏感信息。
  if ('password' in loginConfig.value) {
    delete (loginConfig.value as Record<string, unknown>).password;
  }
  if ('emailPassword' in loginConfig.value) {
    delete (loginConfig.value as Record<string, unknown>).emailPassword;
  }

  // 登录方式：随记住账号一并回填，方便下次直接进上次用的入口
  const loginType = ref<'account' | 'email'>(
    loginConfig.value.loginType === 'email' ? 'email' : 'account',
  );

  const userInfo = reactive({
    username: loginConfig.value.rememberAccount ? loginConfig.value.username || '' : '',
    password: '',
    email: loginConfig.value.rememberAccount ? loginConfig.value.email || '' : '',
    emailAuthCode: '',
  });

  watchCaptchaInput(
    () => userInfo.emailAuthCode,
    (value) => {
      userInfo.emailAuthCode = value;
    },
    sanitizeEmailVerificationCodeInput,
    watch,
  );

  const onEmailAuthCodeModelUpdate = createSanitizedModelUpdater((value) => {
    userInfo.emailAuthCode = value;
  }, sanitizeEmailVerificationCodeInput);

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
      try {
        // 根据登录方式准备登录数据
        let loginData: LoginData;
        if (loginType.value === 'account') {
          // slide/click/rotate 先弹窗（此时不进入 loading）；取消则中断
          const human = (await humanCheckRef.value?.ensureReady()) || null;
          if (!human) {
            return;
          }
          loginData = {
            username: values.username,
            password: values.password,
            ...(human.captchaVerification
              ? { captchaVerification: human.captchaVerification }
              : { authCode: human.authCode, captchaId: human.captchaId }),
          };
        } else {
          loginData = {
            email: values.email,
            verificationCode: values.emailAuthCode,
          };
        }

        setLoading(true);
        await userStore.login(loginData);
        const { redirect, ...othersQuery } = router.currentRoute.value.query;
        router.push({
          name: (redirect as string) || 'Workplace',
          query: {
            ...othersQuery,
          },
        });
        Message.success(t('login.form.login.success'));
        persistRememberedAccount(values);
      } catch (err: any) {
        errorMessage.value = err?.message || '';
        if (loginType.value === 'account' && shouldRefreshGraphicCaptcha(err?.bizCode)) {
          void humanCheckRef.value?.reset();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  /** 登录成功后按开关写入/清空本地账号（useStorage 自动同步 localStorage） */
  const persistRememberedAccount = (values: Record<string, any>) => {
    loginConfig.value.loginType = loginType.value;
    if (!loginConfig.value.rememberAccount) {
      loginConfig.value.username = '';
      loginConfig.value.email = '';
      return;
    }
    if (loginType.value === 'account') {
      loginConfig.value.username = String(values.username || '').trim();
    } else {
      loginConfig.value.email = String(values.email || '').trim();
    }
  };

  /**
   * 勾选状态写入 localStorage；取消时立刻清掉已存账号，
   * 避免「关了开关但下次仍回填」。
   */
  const onRememberAccountChange = (value: boolean | (string | number | boolean)[]) => {
    const checked = value === true;
    loginConfig.value.rememberAccount = checked;
    if (!checked) {
      loginConfig.value.username = '';
      loginConfig.value.email = '';
    }
  };

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
</style>
