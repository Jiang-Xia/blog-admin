import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import './index.less';
import E from 'wangeditor';
import hljs from 'highlight.js';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'XEditor',
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    let myEditor: any;
    const languageType = [
      'JavaScript',
      'TypeScript',
      'JSON',
      'Markdown',
      'Python',
      'Html',
      'CSS',
      'XML',
      'SQL',
      'C',
      'C#',
      'C++',
      'Java',
      'Bash',
      'Plain text',
      'Go',
      'Kotlin',
      'Lua',
      'PHP',
      'Shell Session',
      'Ruby',
    ];
    // 配置颜色（文字颜色、背景色）
    const colors = ['#000000', '#eeece0', '#1c487f', '#4d80bf'];
    // const colors = ['#364f6b', '#393e46', '#1c487f', '#4d80bf']

    // 时间戳
    const id = `x-editor-${dayjs().valueOf()}`;
    // console.log(id)
    onMounted(() => {
      // console.log(document.querySelector('#editor'))
      const editor = new E(`#${id}`);
      myEditor = editor;
      editor.highlight = hljs;
      const config = {
        height: 500,
        pasteFilterStyle: false,
        languageType,
        // colors,
        ...props.config,
        // 事件回调
        onchange(newHtml: string) {
          const json = editor.txt.getJSON();
          emit('change', { editor, html: newHtml, json });
        },
        onSelectionChange(newHtml: string) {
          const json = editor.txt.getJSON();
          emit('selectionChange', { editor, html: newHtml, json });
        },
        onfocus(newHtml: string) {
          const json = editor.txt.getJSON();
          emit('focus', { editor, html: newHtml, json });
        },
        onblur(newHtml: string) {
          const json = editor.txt.getJSON();
          emit('blur', { editor, html: newHtml, json });
        },
      };
      editor.config = { ...editor.config, ...config };
      editor.create();
      emit('created', editor);
    });
    // 及时销毁编辑器
    onBeforeUnmount(() => {
      if (myEditor == null) return;
      // 销毁，并移除 editor
      myEditor.destroy();
      myEditor = null;
    });
    return () => (
      <div class={`x-editor-wrap ${props.customClass}`} id={id}></div>
    );
  },
});
