<!--
 * @Date: 2020-03-28 10:47:20
 * @LastEditors: zhuqiu
 * @LastEditTime: 2020-07-02 19:32:40
 * @FilePath: \frontend\modules\cloudpivot\form\src\renderer\components\layout\pc-form-tabs.vue
-->

<template>
  <a-tabs v-model="activeKey" class="pc-tabs" @change="handleChange">
    <slot></slot>
  </a-tabs>
</template>

<script lang="ts">
import * as typings from '../../../../../form/schema';
import { Tabs } from '@h3/antd-vue';
import { Component, Prop } from 'vue-property-decorator';
import { BaseControl } from '../../controls';

@Component({
  name: 'form-tabs',
  components: {
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class FormTabs extends BaseControl<typings.TabsOptions> {
  @Prop({
    default: '-1',
  })
  defaultActiveKey!: string;

  activeKey: string = '';

  created() {
    if (this.ctrl && this.ctrl.value) {
      this.activeKey = this.ctrl.value;
    } else {
      this.activeKey = this.defaultActiveKey;
    }
    if (this.ctrl) {
      this.setValue(this.activeKey);
    }
  }

  handleChange(key) {
    this.setValue(key);
  }

  handleValueChange() {
    console.log('值变化时我执行了', this.ctrl ? this.ctrl.value : '空');
    this.activeKey = this.ctrl ? this.ctrl.value : '-1';
    typings.EventBus.$emit('activeKey', {
      data: this.activeKey,
    });
  }
}
</script>

<style lang="less" scoped>
.has-form-border {
  .pc-tabs {
    padding-left: 0;
  }
}
//解决当tab高度过低时关联表单筛选条件弹框被遮盖的问题
.pc-tabs {
  &.reverse-relevance-tabs {
    overflow: unset;
  }
}
</style>
