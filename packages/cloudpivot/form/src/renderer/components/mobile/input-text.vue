<template>
  <h3-textarea
    v-if="!readonly && isTextarea"
    ref="h3Textarea"
    v-model="val"
    :title="label"
    :required="ctrl.required"
    :maxLength="maxLength"
    :placeholder="placeholder"
    :readonly="readonlyFormula || readonly"
    :error="ctrl.hasError"
    :labelStyle="styleObj"
    :rows="4"
    autoHeight
    @onChange="onChangeTextarea"
  />

  <h3-input
    v-else-if="!readonly && !isTextarea"
    v-model="val"
    :required="ctrl.required"
    :title="label"
    :placeholder="placeholder"
    :readonly="readonlyFormula || readonly"
    :clear="true"
    type="text"
    :maxLength="maxLength"
    :error="ctrl.hasError"
    :labelStyle="styleObj"
    @onBlur="onBlur"
    @onChange="onChange"
  />

  <div v-else class="field">
    <div class="field__label top" :style="style">
      {{ label }}
    </div>
    <div class="field__control">
      <mutil-text v-if="isLangText" :text="val" />
      <div v-else class="editor-htm" v-html="val"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { H3Input, H3Textarea } from 'h3-mobile-vue';
import { Component } from 'vue-property-decorator';
import { TextInputControl } from '../../controls';
import MutilText from '../shared/mutil-text.vue';

@Component({
  name: 'input-text',
  components: {
    H3Input,
    H3Textarea,
    MutilText,
  },
})
export default class InputText extends TextInputControl {
  onBlur() {
    super.validate();
  }

  onChange() {
    this.ctrl.value = this.val.length === 0 ? null : this.val;
  }

  onChangeTextarea() {
    const el = (this.$refs.h3Textarea as any).$el;
    const h = el.offsetHeight;
    el.style.height = `${el.offsetHeight}px`;
    this.ctrl.value = this.val.length === 0 ? null : this.val;
    setTimeout(() => {
      el.style.height = 'auto';
    }, 16.66666666);
  }
}
</script>

<style lang="less" scoped>
.field__control {
  padding: 0.5em 0;
}

// /deep/.h3-input-control textarea {
//   min-height: 25px;
// }
.editor-html {
  line-height: normal !important;
  word-break: break-all;
}
</style>
