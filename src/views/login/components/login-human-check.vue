<template>
  <!--
    账号登录人机验证：默认进页随机 graphic / slide / click / rotate。
    开发可用 VITE_CAPTCHA_MODE 固定某一种，便于联调。
    graphic 内嵌；slide/click/rotate 点登录后 a-modal 弹窗验证。
  -->
  <div class="login-human-check">
    <a-form-item
      v-if="mode === 'graphic'"
      field="authCode"
      :rules="[{ required: true, message: '验证码必填' }]"
      :validate-trigger="['change', 'blur']"
      hide-label
    >
      <a-input
        :model-value="authCode"
        :placeholder="t('login.form.imageCode.placeholder')"
        allow-clear
        :max-length="GRAPHIC_CAPTCHA_LENGTH"
        :input-attrs="graphicCaptchaNativeInputAttrs"
        @update:model-value="onGraphicCaptchaModelUpdate"
      >
        <template #suffix>
          <template v-if="authCodeUrl && !authCodeLoadError">
            <img
              class="captcha-img"
              :src="authCodeUrl"
              alt="验证码"
              @click="reloadGraphicDebounced"
              @error="authCodeLoadError = true"
            />
          </template>
          <button v-else class="captcha-placeholder" type="button" @click="reloadGraphicDebounced">
            点击获取
          </button>
        </template>
      </a-input>
    </a-form-item>

    <!-- 行为验证：表单内不展示；登录时弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="behaviorTitle"
      :footer="false"
      :mask-closable="false"
      unmount-on-close
      :width="mode === 'rotate' ? '420px' : '380px'"
      @cancel="onModalClose"
    >
      <div class="behavior-modal-body">
        <div v-if="loadingBehavior" class="behavior-loading">加载中…</div>
        <Slide
          v-else-if="mode === 'slide' && slideData"
          :data="slideData"
          :events="{
            confirm: onSlideConfirm,
            refresh: () => loadBehavior('slide'),
            close: onModalClose,
          }"
        />
        <Click
          v-else-if="mode === 'click' && clickData"
          :data="clickData"
          :events="{
            confirm: onClickConfirm,
            refresh: () => loadBehavior('click'),
            close: onModalClose,
          }"
        />
        <Rotate
          v-else-if="mode === 'rotate' && rotateData"
          :data="rotateData"
          :events="{
            confirm: onRotateConfirm,
            refresh: () => loadBehavior('rotate'),
            close: onModalClose,
          }"
        />
        <a-button
          v-else
          type="text"
          size="small"
          @click="loadBehavior(mode as BehaviorCaptchaType)"
        >
          重新获取验证
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  /**
   * admin 登录人机验证
   * - 进页随机 graphic / slide / click / rotate（与 home 一致）
   * - 仅 DEV：若配置 VITE_CAPTCHA_MODE=graphic|slide|click|rotate 则固定该方式
   * - graphic 表单内嵌；行为类点登录后弹窗，完成后再继续登录
   * - 底图/拼图为 Nest 下发的官方示例素材
   */
  import { computed, onMounted, ref, watch } from 'vue';
  import { useDebounceFn } from '@vueuse/core';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import { Slide, Click, Rotate } from 'go-captcha-vue';
  import 'go-captcha-vue/dist/style.css';
  import { getAuthCode } from '@/api/login';
  import {
    checkBehaviorCaptcha,
    getBehaviorCaptcha,
    type BehaviorCaptchaType,
  } from '@/api/captcha';
  import {
    createSanitizedModelUpdater,
    GRAPHIC_CAPTCHA_LENGTH,
    graphicCaptchaNativeInputAttrs,
    sanitizeGraphicCaptchaInput,
    watchCaptchaInput,
  } from '@/utils/captcha-input';

  export type AdminCaptchaMode = 'graphic' | 'slide' | 'click' | 'rotate';

  export type AdminHumanPayload = {
    mode: AdminCaptchaMode;
    authCode?: string;
    captchaId?: string;
    captchaVerification?: string;
  };

  const MODES: AdminCaptchaMode[] = ['graphic', 'slide', 'click', 'rotate'];
  const TITLE_MAP: Record<Exclude<AdminCaptchaMode, 'graphic'>, string> = {
    slide: '滑动拼图验证',
    click: '点选形状验证',
    rotate: '旋转图片验证',
  };

  const { t } = useI18n();
  const mode = ref<AdminCaptchaMode>('graphic');
  const authCode = ref('');
  const captchaId = ref('');
  const authCodeUrl = ref('');
  const authCodeLoadError = ref(false);
  const captchaVerification = ref('');
  const loadingBehavior = ref(false);
  const modalVisible = ref(false);
  const behaviorCaptchaId = ref('');
  const slideData = ref<{
    thumbX: number;
    thumbY: number;
    thumbWidth: number;
    thumbHeight: number;
    image: string;
    thumb: string;
  } | null>(null);
  const clickData = ref<{ image: string; thumb: string } | null>(null);
  const rotateData = ref<{
    angle: number;
    image: string;
    thumb: string;
    thumbSize: number;
  } | null>(null);

  let modalResolve: ((payload: AdminHumanPayload | null) => void) | null = null;

  const behaviorTitle = computed(() => {
    if (mode.value === 'graphic') return '';
    return TITLE_MAP[mode.value];
  });

  watchCaptchaInput(
    () => authCode.value,
    (value) => {
      authCode.value = value;
    },
    sanitizeGraphicCaptchaInput,
    watch,
  );

  const onGraphicCaptchaModelUpdate = createSanitizedModelUpdater((value) => {
    authCode.value = value;
  }, sanitizeGraphicCaptchaInput);

  /**
   * 选择本页验证方式。
   * DEV 下可读 VITE_CAPTCHA_MODE 固定；非法值或生产仍随机。
   */
  function pickMode(): AdminCaptchaMode {
    if (import.meta.env.DEV) {
      const fixed = String(import.meta.env.VITE_CAPTCHA_MODE || '')
        .trim()
        .toLowerCase() as AdminCaptchaMode;
      if (MODES.includes(fixed)) {
        return fixed;
      }
    }
    return MODES[Math.floor(Math.random() * MODES.length)];
  }

  async function loadGraphic() {
    try {
      const res = await getAuthCode();
      authCodeUrl.value = `data:image/svg+xml;base64,${res.captchaBase64}`;
      captchaId.value = res.captchaId || '';
      authCode.value = '';
      authCodeLoadError.value = false;
    } catch {
      authCodeUrl.value = '';
      captchaId.value = '';
      authCodeLoadError.value = true;
    }
  }

  const reloadGraphicDebounced = useDebounceFn(() => {
    void loadGraphic();
  }, 300);

  function clearBehaviorData() {
    slideData.value = null;
    clickData.value = null;
    rotateData.value = null;
  }

  async function loadBehavior(type: BehaviorCaptchaType) {
    loadingBehavior.value = true;
    clearBehaviorData();
    behaviorCaptchaId.value = '';
    captchaVerification.value = '';
    try {
      const res = await getBehaviorCaptcha(type);
      behaviorCaptchaId.value = res.captchaId || '';
      if (type === 'slide') {
        slideData.value = {
          thumbX: res.thumbX ?? 0,
          thumbY: res.thumbY ?? 0,
          thumbWidth: res.thumbWidth ?? 0,
          thumbHeight: res.thumbHeight ?? 0,
          image: res.image,
          thumb: res.thumb,
        };
      } else if (type === 'click') {
        clickData.value = { image: res.image, thumb: res.thumb };
      } else {
        rotateData.value = {
          angle: res.angle ?? 0,
          image: res.image,
          thumb: res.thumb,
          thumbSize: res.thumbSize ?? 0,
        };
      }
    } catch (err) {
      console.error('[login-human-check] behavior get failed', err);
    } finally {
      loadingBehavior.value = false;
    }
  }

  function settleModal(payload: AdminHumanPayload | null) {
    modalVisible.value = false;
    clearBehaviorData();
    const resolve = modalResolve;
    modalResolve = null;
    resolve?.(payload);
  }

  function onModalClose() {
    settleModal(null);
  }

  async function onSlideConfirm(point: { x: number; y: number }, reset: () => void) {
    try {
      const res = await checkBehaviorCaptcha({
        captchaId: behaviorCaptchaId.value,
        type: 'slide',
        point,
      });
      const token = res.captchaVerification || '';
      if (!token) {
        reset();
        await loadBehavior('slide');
        return;
      }
      captchaVerification.value = token;
      settleModal({ mode: 'slide', captchaVerification: token });
    } catch {
      reset();
      await loadBehavior('slide');
    }
  }

  async function onClickConfirm(dots: Array<{ x: number; y: number }>, reset: () => void) {
    try {
      const res = await checkBehaviorCaptcha({
        captchaId: behaviorCaptchaId.value,
        type: 'click',
        points: dots.map((d) => ({ x: d.x, y: d.y })),
      });
      const token = res.captchaVerification || '';
      if (!token) {
        reset();
        await loadBehavior('click');
        return;
      }
      captchaVerification.value = token;
      settleModal({ mode: 'click', captchaVerification: token });
    } catch {
      reset();
      await loadBehavior('click');
    }
  }

  async function onRotateConfirm(angle: number, reset: () => void) {
    try {
      const res = await checkBehaviorCaptcha({
        captchaId: behaviorCaptchaId.value,
        type: 'rotate',
        angle,
      });
      const token = res.captchaVerification || '';
      if (!token) {
        reset();
        await loadBehavior('rotate');
        return;
      }
      captchaVerification.value = token;
      settleModal({ mode: 'rotate', captchaVerification: token });
    } catch {
      reset();
      await loadBehavior('rotate');
    }
  }

  /**
   * 登录提交前：graphic 直接返回；行为类弹窗完成后再返回。
   */
  async function ensureReady(): Promise<AdminHumanPayload | null> {
    if (mode.value === 'graphic') {
      if (!authCode.value.trim()) {
        Message.error('验证码必填');
        return null;
      }
      return {
        mode: 'graphic',
        authCode: authCode.value.trim(),
        captchaId: captchaId.value,
      };
    }
    captchaVerification.value = '';
    return new Promise((resolve) => {
      modalResolve = resolve;
      modalVisible.value = true;
      void loadBehavior(mode.value);
    });
  }

  function getSubmitPayload(): AdminHumanPayload | null {
    if (mode.value === 'graphic') {
      if (!authCode.value.trim()) {
        Message.error('验证码必填');
        return null;
      }
      return {
        mode: 'graphic',
        authCode: authCode.value.trim(),
        captchaId: captchaId.value,
      };
    }
    if (!captchaVerification.value) {
      Message.error(`请完成${TITLE_MAP[mode.value]}`);
      return null;
    }
    return {
      mode: mode.value,
      captchaVerification: captchaVerification.value,
    };
  }

  async function reset() {
    authCode.value = '';
    captchaVerification.value = '';
    if (mode.value === 'graphic') {
      await loadGraphic();
    } else {
      clearBehaviorData();
    }
  }

  defineExpose({ ensureReady, getSubmitPayload, reset });

  onMounted(() => {
    mode.value = pickMode();
    if (mode.value === 'graphic') {
      void loadGraphic();
    }
  });
</script>

<style scoped lang="less">
  .captcha-img {
    height: 32px;
    cursor: pointer;
    border-radius: 2px;
    user-select: none;
  }

  .captcha-placeholder {
    height: 32px;
    padding: 0 8px;
    border: none;
    background: transparent;
    color: var(--color-text-3);
    cursor: pointer;
    font-size: 12px;
  }

  .behavior-modal-body {
    min-height: 180px;
    display: flex;
    justify-content: center;
  }

  .behavior-loading {
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-3);
    font-size: 13px;
  }
</style>
