<template>
  <a-card
    class="general-card"
    title="项目代码"
    :header-style="{ paddingBottom: 0 }"
    :body-style="{ paddingTop: 0 }"
    style="height: 166px"
  >
    <a-row>
      <a-col :span="12">
        <a-link href="https://gitee.com/jiang-xia/blog-home-nuxt"> 博客前端项目 </a-link>
      </a-col>
      <a-col :span="12">
        <a-link href="https://gitee.com/jiang-xia/blog-admin"> 博客后台管理 </a-link>
      </a-col>
      <a-col :span="18">
        <a-link href="https://gitee.com/jiang-xia/blog-server"> 博客服务端项目 </a-link>
      </a-col>
    </a-row>
  </a-card>
</template>

<style lang="less" scoped>
  .arco-card-body .arco-link {
    margin: 10px 0;
    color: rgb(var(--gray-8));
  }
</style>
