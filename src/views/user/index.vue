<script setup lang="ts">
  import XMarkdownReader from '@/components/x-markdown-reader';

  const contentHtml =
    '<h2 id="spwwn">江夏</h2><blockquote><p><font size="2">一位来自广州的前端程序员 喜欢看电影，玩游戏，学技术。</font><br/></p></blockquote>';
</script>

<template>
  <div> <XMarkdownReader :content="contentHtml" /> </div
></template>

<style lang="less" scoped></style>
