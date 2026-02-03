<script setup lang="ts">
  import { Message } from '@arco-design/web-vue';
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  // defineProps之类不用自己导入
  // 定义props属性
  const props = defineProps({
    value: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '分类',
    },
    editData: {
      type: Object,
      default: null,
    },
  });
  const name = ref('');
  const id = ref('');
  const localValue = ref(props.value);
  const isEdit = ref(false);

  // const emit = defineEmits<{ (e: 'update:value', id: boolean): void; (e: 'ok', o: Object): void }>()
  const emit = defineEmits(['update:value', 'ok']);

  watch(
    () => props.value,
    (n: boolean, o: boolean) => {
      localValue.value = n;
      if (n) {
        if (props.editData) {
          // 编辑模式
          isEdit.value = true;
          name.value = props.editData.label;
          id.value = props.editData.id;
        } else {
          // 创建模式
          isEdit.value = false;
          name.value = '';
          id.value = '';
        }
      }
    },
  );

  const handleOk = () => {
    if (!name.value) {
      Message.warning(t('category.validate.nameRequired'));
      return;
    }
    if (name.value && name.value.length < 2) {
      Message.warning(t('category.validate.minLength'));
      return;
    }
    emit('update:value', false);
    if (isEdit.value) {
      emit('ok', { name: name.value, type: props.type, id: id.value, isEdit: true });
    } else {
      emit('ok', { name: name.value, type: props.type, isEdit: false });
    }
  };
</script>

<template>
  <a-modal
    v-model:visible="localValue"
    :title="isEdit ? t('category.modal.edit') + type : t('category.modal.create') + type"
    :cancel-text="t('category.button.cancel')"
    :ok-text="t('category.button.confirm')"
    @ok="handleOk"
    @cancel="emit('update:value', false)"
  >
    <a-input
      v-model="name"
      :placeholder="t('category.form.placeholder.input') + type + t('category.form.nameSuffix')"
    ></a-input>
  </a-modal>
</template>

<style lang="scss" scoped></style>
