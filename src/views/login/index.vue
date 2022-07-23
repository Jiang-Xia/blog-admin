<template>
  <div class="container">
    <!-- <form method="#" action="index.html" class="form-wrap">
      <h1>登录</h1>
      <br />
      <hr />
      <input type="text" name="username" placeholder="Username" />
      <input type="password" name="password" placeholder="Password" />
      <input type="submit" name="" value="Login" />
    </form> -->
    <div class="content">
      <div class="content-inner">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import LoginForm from './components/login-form.vue';
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    height: 100vh;
    background-image: url(./images/bg-02.jpg);
    background-position: center;
    background-size: cover;

    .content {
      position: relative;
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
    }

    .content-inner {
      padding: 60px 30px;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 0 rgba(0, 0, 0, 0.29);
    }
  }

  .container::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    display: block;
    width: 100%;
    height: 100%;
    background: rgba(93, 84, 240, 0.5);
    background: -webkit-linear-gradient(
      left,
      rgba(0, 168, 255, 0.5),
      rgba(185, 0, 255, 0.5)
    );
    background: -moz-linear-gradient(
      left,
      rgba(0, 168, 255, 0.5),
      rgba(185, 0, 255, 0.5)
    );
    content: '';
    pointer-events: none;
  }
</style>

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-lg) {
  }
</style>
