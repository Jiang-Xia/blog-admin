<script lang="ts" setup>
  import XMarkdownReader from '@/components/x-markdown-reader/index11.vue';

  const contentHtml =
    '<h2 id="spwwn">江夏</h2><blockquote><p><font size="2">一位来自广州的前端程序员 喜欢看电影，玩游戏，学技术。</font><br/></p></blockquote>';
</script>

<template>
  <div class="about-container">
    <x-markdown-reader class="my-info" :content="contentHtml" />
  </div>
</template>

<style lang="less" scoped>
  .banner-container {
    height: 40vh;
    @media screen and (max-width: 768px) {
      height: 60vh;
    }

    .banner-content {
      img {
        width: 100%;
        height: 100%;
        color: #fff;
      }
    }
  }

  .about-container {
    min-height: 100%;

    .my-info {
      position: relative;
      z-index: 0;
      width: 70%;
      // min-height: 100vh;
      min-width: 40%;
      margin: 20px auto 0;
      padding: 10px 20px 20px 20px;
      background-color: #fff;
      border-radius: 12px;
    }
  }
</style>
