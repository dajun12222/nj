<template>
  <h3-field
    :readOnly="true"
    :showIcon="false"
    :label="label"
    :labelStyle="styleObj"
    :class="{ vertical: layoutType }"
  >
    <div :class="{ field__control: !readonly }">
      {{ text }}
    </div>
  </h3-field>
</template>

<script lang="ts">
import { H3Field } from 'h3-mobile-vue';
import { Component, Inject } from 'vue-property-decorator';
import { SystemControl } from '../../controls';

@Component({
  name: 'system-control',
  components: {
    H3Field,
  },
})
export default class MobileSystemControl extends SystemControl {
  @Inject()
  layoutTypeFn!: Function;

  //上下布局模式
  get layoutType() {
    if (this.layoutTypeFn) {
      return this.layoutTypeFn();
    }
  }
}
</script>

<style lang="less" scoped>
.field.system > .field__label {
  justify-content: flex-end;
}
</style>
