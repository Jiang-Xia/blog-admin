<script setup lang="ts">
  import { useUserStore } from '@/store/';
  import { ref, reactive } from 'vue';
  import axios from 'axios';
  import { Message } from '@arco-design/web-vue';

  const { nickname, mobile, id: uid } = useUserStore();
  const visible = ref(false);
  const form = reactive({
    password: '',
    passwordRepeat: '',
    nickname,
    mobile,
  });
  const handleClick = () => {
    visible.value = true;
  };
  const handleBeforeOk = (done: any) => {
    // prevent close done(false)
    console.log(form);
    const obj = {
      password: form.password,
      passwordRepeat: form.passwordRepeat,
      id: uid,
    };
    axios.patch(`/user/password`, obj).then((res) => {
      console.log(res);
      done();
    });
  };
  const handleCancel = () => {
    visible.value = false;
  };
  // 修改除了密码之外的信息
  const handleFinish = async (values: any) => {
    // console.log('values', values)
    const { password, passwordRepeat } = values;
    if (password && passwordRepeat) {
      // 修改了密码
      const obj = {
        password,
        passwordRepeat,
        id: uid,
      };
      axios.patch(`/user/password`, obj).then((res) => {
        console.log(res);
      });
    } else {
      // 修改除了密码之外的属性
      const res = await axios.patch('user/edit', {
        nickname: values.nickname,
        id: uid,
      });
    }
    Message.success('修改成功！');
  };
</script>

<template>
  <div class="my-info">
    <div class="center">
      <a-avatar>{{ form.nickname }}</a-avatar>
    </div>
    <a-card :style="{ width: '80%' }" title="个人信息">
      <template #extra>
        <!-- <a-button type="text" @click="handleClick">修改密码</a-button> -->
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

        <a-form-item field="password" label="密码">
          <a-input-password
            v-model="form.password"
            allow-clear
            :max-length="11"
            placeholder="密码"
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
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button html-type="submit" type="primary">保存</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- <a-modal
      v-model:visible="visible"
      title="修改密码"
      @cancel="handleCancel"
      @before-ok="handleBeforeOk"
    >
      <a-form :model="form">
        <a-form-item field="password" label="密码">
          <a-input
            v-model="form.password"
            :max-length="11"
            placeholder="密码"
          />
        </a-form-item>
        <a-form-item field="passwordRepeat" label="确认密码">
          <a-input v-model="form.passwordRepeat" placeholder="确认密码" />
        </a-form-item>
      </a-form>
    </a-modal> -->
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
