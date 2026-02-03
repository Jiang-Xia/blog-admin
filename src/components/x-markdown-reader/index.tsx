import { defineAsyncComponent, defineComponent, type Component, onMounted, ref } from 'vue';
import './index.less';
// import hljs from 'highlight.js'
// import dayjs from 'dayjs'
import { copy } from '@/utils/index';
import { useI18n } from 'vue-i18n';

const XMarkdownReader = defineComponent({
  name: 'XMarkdownReader',
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  setup(props: { content: string }) {
    const { t } = useI18n();
    const markdownRef = ref<HTMLElement | null>(null);
    onMounted(() => {
      // console.log(markdownRef.value)
      if (!markdownRef.value) {
        return;
      }
      if (markdownRef.value) {
        const blocks = markdownRef.value.querySelectorAll('pre code');
        blocks.forEach((block) => {
          const span = document.createElement('span');
          const i = document.createElement('i');
          span.className = 'code-left-bar';
          i.className = 'copy-btn pointer';
          i.innerText = t('common.button.copy');
          span.innerText = (block as HTMLElement).className.toLowerCase();
          span.appendChild(i);
          (block as HTMLElement).parentElement?.insertBefore(span, block as HTMLElement);
          i.onclick = () => copy((block as HTMLElement).innerText);
          // hljs.highlightBlock(block)
        });
      }
    });
    // 坑点 tsx中 ref要写对应的变量，字符串没用
    return () => <div ref={markdownRef} class={'x-markdown-reader'} v-html={props.content}></div>;
  },
});

export default XMarkdownReader;
// export default defineAsyncComponent(
//   () =>
//     new Promise((resolve, reject) => {
//       resolve({
//         template: '<div>I am async!</div>',
//       });
//     })
// );
