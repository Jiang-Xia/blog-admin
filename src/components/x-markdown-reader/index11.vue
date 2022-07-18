<script lang="ts">
  import {
    reactive,
    ref,
    defineAsyncComponent,
    defineComponent,
    Component,
    onMounted,
  } from 'vue';
  import './index.less';
  import { copy } from '@/utils/index';

  export default {
    name: 'XMarkdownReader',
    props: {
      content: {
        type: String,
        default: '',
      },
    },
    setup(props: any, { emit }) {
      const markdownRef = ref();
      onMounted(() => {
        // console.log(markdownRef.value)
        if (!markdownRef.value) {
          return;
        }
        if (markdownRef.value) {
          const blocks = markdownRef.value.querySelectorAll('pre code');
          blocks.forEach((block: HTMLElement) => {
            const span = document.createElement('span');
            const i = document.createElement('i');
            span.className = 'code-left-bar';
            i.className = 'copy-btn pointer';
            i.innerText = '复制';
            span.innerText = block.className.toLowerCase();
            span.appendChild(i);
            block.parentElement?.insertBefore(span, block);
            i.onclick = () => copy(block.innerText);
            // hljs.highlightBlock(block)
          });
        }
      });

      return {
        markdownRef,
      };
    },
  };
</script>

<template>
  <div :ref="markdownRef" class="x-markdown-reader" v-html="content"></div>
</template>

<style lang="less" scoped></style>
