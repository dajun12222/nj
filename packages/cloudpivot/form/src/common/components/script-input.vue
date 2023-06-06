<template>
  <a-modal
    :title="title"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
    @cancel="onCancel"
  >
    <div>
      <p style="color: green">
        /** <br />&nbsp;* value 当前值，oldValue旧值，form表单对象
        <br />&nbsp;*/ <br />
      </p>
      <span style="color: blue">function</span>(value, oldValue, form){
    </div>
    <h3-textarea
      v-model="value"
      :placeholder="`请输入${title}详细信息，例：form.text1.value = ''`"
      :autosize="{ minRows: 8 }"
      :maxLength="2000"
      style="border: 0"
    />
    <div>}</div>
    <template slot="footer">
      <a-button @click="onCancel"> {{ $t('languages.Apps.Cancel') }} </a-button>
      <a-button
        type="primary"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="onOk"
      >
        {{ $t('languages.Apps.Ok') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import rendererComponents from '../../renderer/components/pc';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Button, Modal } from '@h3/antd-vue';

@Component({
  name: 'script-input',
  components: {
    H3Textarea: rendererComponents.H3Textarea,
    AModal: Modal,
    AButton: Button,
  },
})
export default class ScriptInput extends Vue {
  get title() {
    const data = this.modalData;
    if (!data || !data.label) {
      return '';
    }
    return data.label;
  }

  value = '';

  @Prop({
    default: {},
  })
  modalData!: any;

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    const data = modalData.data;
    if (!data) {
      return;
    }

    this.value = data.value || '';
  }

  onCancel() {
    this.$emit('closeModal');
  }

  onOk() {
    this.$emit('backData', {
      value: this.value,
    });
  }
}
</script>

<style lang="less" scoped>
/deep/.h3-textarea {
  border: 0 !important;
}
</style>
