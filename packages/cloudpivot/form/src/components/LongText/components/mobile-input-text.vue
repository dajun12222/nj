<template>
  <h3-textarea
    v-if="!readonly && isTextarea && isLangText"
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
    :tip="controlOpts.tips"
    @onChange="onChangeTextarea"
  />

  <div v-else-if="!readonly && isTextarea && !isLangText" class="field">
    <div class="field__label top" :style="style">
      {{ label }}
    </div>
    <div class="field__control">
      <div class="editor-htm">
        {{ $t('cloudpivot.form.renderer.tip.onlySupportPcWrite') }}
      </div>
    </div>
  </div>

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
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else class="editor-htm" v-html="val"></div>
    </div>
  </div>
</template>

<script lang="ts">
import MutilText from '../../../../../form/src/common/components/mutil-text.vue';
import { TextInputControl } from '../../../../../form/src/common/controls/input-controls/text-input-control';
import { H3Input, H3Textarea } from 'h3-mobile-vue';
import { Component, Inject } from 'vue-property-decorator';

@Component({
  name: 'input-text',
  components: {
    H3Input,
    H3Textarea,
    MutilText,
  },
})
export default class InputText extends TextInputControl {
  @Inject({
    default: () => () => {},
  })
  getScrollEl!: () => HTMLDivElement;

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
.field.vertical {
  .field__label {
    padding-top: 10px;
  }
}
</style>
