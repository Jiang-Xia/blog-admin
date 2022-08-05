<script setup lang="ts">
  import { useUserStore } from '@/store/';
  import { ref, reactive } from 'vue';
  import axios from 'axios';
  import { Message, Modal } from '@arco-design/web-vue';
  import useUser from '@/hooks/user';

  interface stringKey {
    [propName: string]: string | number;
  }
  const { logout } = useUser();
  const { nickname, mobile, homepage, intro, avatar, id: uid } = useUserStore();
  const visible = ref(false);
  const form = reactive({
    password: '',
    passwordRepeat: '',
    nickname,
    mobile,
    passwordOld: '',
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
    axios
      .patch(`/user/password`, obj)
      .then(() => {
        done();
        Message.success('修改成功,请重新登陆！');
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
    const keys: string[] = [
      'nickname',
      'mobile',
      'homepage',
      'intro',
      'avatar',
    ];
    const obj: stringKey = {};
    keys.forEach((v: string) => {
      obj[v] = values[v];
    });
    // 修改除了密码之外的属性
    await axios.patch('user/edit', {
      ...obj,
      id: uid,
    });
    Message.success('修改成功！');
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
    <a-card :style="{ width: '80%' }" title="个人信息">
      <template #extra>
        <a-button type="text" @click="handleClick">修改密码</a-button>
      </template>

      <a-form :model="form" auto-label-width @submit-success="handleFinish">
        <a-form-item field="mobile" label="手机号">
          <a-input v-model="form.mobile" placeholder="手机号" disabled />
        </a-form-item>
        <a-form-item field="nickname" label="昵称">
          <a-input
            v-model="form.nickname"
            :max-length="11"
            placeholder="昵称"
          />
        </a-form-item>
        <a-form-item field="avatar" label="头像">
          <a-input v-model="form.avatar" placeholder="头像链接" />
        </a-form-item>
        <a-form-item field="homepage" label="主页">
          <a-input v-model="form.homepage" placeholder="个人主页地址" />
        </a-form-item>
        <a-form-item field="intro" label="介绍">
          <a-input
            v-model="form.intro"
            placeholder="这个人很懒，什么都没有留下！"
          />
        </a-form-item>
        <a-form-item>
          <a-button html-type="submit" type="primary">保存信息</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-modal
      v-model:visible="visible"
      title="修改密码"
      @cancel="handleCancel"
      @before-ok="handleBeforeOk"
    >
      <a-form ref="modalForm" :model="form">
        <a-form-item field="passwordOld" label="旧密码">
          <a-input-password
            v-model="form.passwordOld"
            allow-clear
            :max-length="16"
            placeholder="旧密码"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item field="password" label="新密码">
          <a-input-password
            v-model="form.password"
            allow-clear
            :max-length="16"
            placeholder="新密码"
            auto-com
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item field="passwordRepeat" label="确认密码">
          <a-input-password
            v-model="form.passwordRepeat"
            allow-clear
            placeholder="确认密码"
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
    padding: 10px 20px 40px 20px;
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
