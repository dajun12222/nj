<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="tabs">
    <tabs-heads
      v-model="activeKey"
      :heads="heads"
      @change="onActiveKeyChange"
    />
    <tabs-panel
      v-for="panel in panels"
      v-show="activeKey === panel.key"
      :key="panel.key"
      :panel="panel"
    />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import { FormTabs, FormTabsPanel } from '../typings';

@Component({
  name: 'tabs',
  components: {
    TabsHeads: () => import('./tabs-heads.vue'),
    TabsPanel: () => import('./tabs-panel.vue'),
  },
})
export default class Tabs extends Vue {
  @Prop({
    default: () => {},
  })
  readonly control!: FormTabs;

  panels: FormTabsPanel[] = [];

  activeKey = '';

  @Inject()
  emitControlUpdate!: Function;

  get heads() {
    if (!this.control.options) {
      return [];
    }

    return this.control.options.heads || [];
  }

  @Watch('control', {
    immediate: true,
    deep: true,
  })
  setControl(val: any) {
    if (val.panels) {
      this.panels = val.panels;
    }

    if (this.heads.length > 0) {
      let head = this.heads.find((h) => h.active);
      if (!head) {
        head = this.heads[0];
      }
      this.activeKey = head.key;
    }
  }

  onActiveKeyChange(activeKey: string) {
    const head = this.heads.find((h) => h.key === activeKey);
    this.heads.forEach((h) => (h.active = false));
    head.active = true;
  }
}
</script>

<style lang="less" scoped>
.tabs {
  flex-grow: 1;
  max-width: 100%;
}
</style>
