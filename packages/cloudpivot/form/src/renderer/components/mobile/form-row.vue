<template>
  <div class="form-row">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RendererLayoutControl } from '../../typings';

@Component({
  name: 'form-row',
})
export default class FormRow extends Vue {
  @Prop()
  control!: RendererLayoutControl;
}
</script>

<style lang="less" scoped>
@import './../../../../../common/common';

.form-row {
  display: flex;
  flex-flow: row wrap;

  &.dotted {
    border-bottom: 1px dotted @base-border-color;
  }
}
</style>
