<template>
  <div class="description">
    <rich-text
      v-show="ctrl.display"
      :text="label"
      :align="align"
      :labelStyle="style"
      class="desc"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { BaseControl } from '../../controls';
import { LayoutControlOptions } from '../../typings';
import RichText from '../shared/rich-text.vue';

@Component({
  name: 'description',
  components: {
    RichText,
  },
})
export default class Description extends BaseControl<LayoutControlOptions> {
  get align() {
    return this.controlOpts.align;
  }
}
</script>

<style lang="less" scoped>
/deep/.mutil-text {
  font-size: 12px;

  & > span {
    color: rgba(0, 0, 0, 0.45);
  }
}
</style>
