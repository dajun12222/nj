<template>
  <a-row type="flex">
    <slot></slot>
  </a-row>
</template>

<script lang="ts">
import { Row } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RendererLayoutControl } from '../../typings';

@Component({
  name: 'form-row',
  components: {
    ARow: Row,
  },
})
export default class FormRow extends Vue {
  @Prop()
  control!: RendererLayoutControl;
}
</script>

<style lang="less" scoped>
@import './../../../../../common/common';
.dashed {
  border-bottom: 1px dashed @border-color;
}
.system-info-box {
  margin-bottom: 14px;
}
.has-form-border {
  .system-info-box {
    margin-bottom: 0;
  }
}
</style>
