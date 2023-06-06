<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <h3-panel
      v-for="(group, index) in groups"
      :key="index"
      :title="group.name"
      :collapsible="true"
      :bold="true"
    >
      <div class="box">
        <control-block
          v-for="c in group.controls"
          :key="c.code"
          v-h3-drag
          :isUsed="isUsed(c.code)"
          :options="c"
          :class="{ disabled: isUsed(c.code) }"
        />
      </div>
    </h3-panel>
  </div>
</template>

<script lang="ts">
import common from 'cloudpivot/common/pc';
import { getComponentsInfo } from 'cloudpivot/form/utils';
import { Component, Vue } from 'vue-property-decorator';
import * as dataitemStore from '../stores/data-items.store-helper';
import controlBill from '../typings/control-bill';
import ControlBlock from './control-block.vue';

@Component({
  name: 'control-panel',
  components: {
    ControlBlock,
    H3Panel: common.components.Panel,
  },
})
export default class ControlPanel extends Vue {
  // groups = controlBill.group;
  groups: any = [];

  created() {
    this.buildPanel();
  }

  // 构建 Panel
  buildPanel() {
    const registerComponentInfo = getComponentsInfo();
    for (const gItem of controlBill.group) {
      const groupArray: any = { name: gItem.name, controls: [] };
      const componentInfo = registerComponentInfo[gItem.name];
      if (!componentInfo) {
        console.error(`没有 ${gItem.name} 类型组件注册!`);
        break;
      }
      for (const ctrlItem of gItem.controls) {
        const ck = ctrlItem.type + '';
        if (componentInfo[ck]) {
          groupArray.controls.push({
            ...componentInfo[ck],
            ...ctrlItem,
          });
          delete componentInfo[ck];
        }
      }
      this.groups.push(groupArray);
    }
    for (const rcKey of Object.keys(registerComponentInfo)) {
      const rcItem = registerComponentInfo[rcKey];
      for (const cItemKey of Object.keys(rcItem)) {
        const cItem = rcItem[cItemKey];
        let t = false;
        for (const gItem of this.groups) {
          if (gItem.name === cItem.group) {
            t = true;
            gItem.controls.push({
              ...cItem,
              type: cItem.formControllerType,
              name: cItem.title,
            });
            break;
          }
        }
        if (!t) {
          this.groups.push({
            name: cItem.group,
            controls: [
              {
                ...cItem,
                type: cItem.formControllerType,
                name: cItem.title,
              },
            ],
          });
        }
      }
    }
  }

  mounted() {}

  isUsed(code: string) {
    if (!code) {
      return false;
    }
    const item = dataitemStore
      .getDataItems(this)
      .filter((x) => x.isSystem)
      .find((x) => x.code === code);
    if (!item) {
      return false;
    }
    return item.used;
  }
}
</script>

<style lang="less" scoped>
.box {
  text-align: left;
  padding-left: 16px;
  background: #fff;
  margin-bottom: 4px;
}

/deep/.h3-panel-header {
  display: block !important;
  &.left {
    color: #111218;
    font-weight: bold;
    font-size: 13px;
    padding: 0px 0 4px 10px !important;
    line-height: 40px;
    > i {
      margin-right: 8px;
    }
  }
}
</style>
