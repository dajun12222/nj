<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <td :tabindex="10" @click="onClick">
    <base-control :control="control" />
  </td>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { FormControl } from '../typings';
import BaseControl from './base-control.vue';

@Component({
  name: 'sheet-statistic',
  components: {
    BaseControl,
  },
})
export default class SheetStatistic extends Vue {
  @Prop()
  readonly control!: FormControl;

  @Inject()
  emitControlSelect?: Function;

  onClick(evt: Event) {
    evt.stopPropagation();
    if (this.emitControlSelect) {
      this.emitControlSelect(this.control);
    }
  }
}
</script>
