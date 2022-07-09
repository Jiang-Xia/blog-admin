import { defineComponent, onMounted, ref } from 'vue';
import './index.less';
// import hljs from 'highlight.js'
// import dayjs from 'dayjs'
import { copy } from '@/utils/index';

export default defineComponent({
  name: 'XMarkdownReader',
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
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
    // 坑点 tsx中 ref要写对应的变量，字符串没用
    return () => (
      <div
        ref={markdownRef}
        class={'x-markdown-reader'}
        v-html={props.content}
      ></div>
    );
  },
  //   mounted() {
  //     // const markdownRef = ref()
  //     console.log(this.$refs)
  //     if (this.$refs.markdownRef) {
  //       const blocks = this.$refs.value.markdownRef.querySelectorAll('pre code')
  //       blocks.forEach((block: HTMLElement) => {
  //         const span = document.createElement('span')
  //         span.classList.add('copy-code-btn')
  //         span.innerText = block.className.toLowerCase()
  //         hljs.highlightBlock(block)
  //       })
  //     }
  //   }
});
