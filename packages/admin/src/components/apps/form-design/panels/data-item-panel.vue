<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="biz">
    <h3-panel title="业务数据项" :collapsible="true" :bold="true">
      <div class="box">
        <template v-for="item in bizs">
          <control-block
            :key="item.code"
            v-h3-drag
            :options="item"
            :isDataItem="true"
            :isUsed="item.used"
            :class="{ disabled: item.used }"
          />

          <div v-if="item.properties" :key="item.code + '-props'" class="box">
            <control-block
              v-for="subItem in filter(item.properties)"
              :key="item.code + '.' + subItem.code"
              v-h3-drag
              :options="subItem"
              :isDataItem="true"
              :isUsed="subItem.used"
              :class="{ disabled: subItem.used }"
            />
          </div>
        </template>
      </div>
    </h3-panel>

    <h3-panel title="系统数据项" :collapsible="true" :bold="true">
      <div class="box">
        <control-block
          v-for="item in systems"
          :key="item.code"
          v-h3-drag
          :options="item"
          :isDataItem="true"
          :class="{ disabled: item.used }"
        />
      </div>
    </h3-panel>
  </div>
</template>

<script lang="ts">
import common from 'cloudpivot/common/pc';
import { Component, Vue } from 'vue-property-decorator';
import * as systemCodes from '../../../shared/system-data-item-codes';
import { DataItemState } from '../stores/data-items.store';
import * as dataitemStore from '../stores/data-items.store-helper';
import ControlBlock from './control-block.vue';

const disabledKeys = [
  systemCodes.name,
  systemCodes.sequence_status,
  // systemCodes.owner_dept_Id,
];

const codes = Object.keys(systemCodes)
  .map((k) => (systemCodes as any)[k])
  .filter((k) => disabledKeys.indexOf(k) === -1);

@Component({
  name: 'data-item-panel',
  components: {
    ControlBlock,
    H3Panel: common.components.Panel,
  },
})
export default class DataItemPanel extends Vue {
  get items() {
    return dataitemStore.getDataItems(this);
  }

  get bizs() {
    return this.items.filter((x) => x.published && !x.isSystem);
  }

  get systems() {
    return this.items.filter((x) => x.isSystem && codes.indexOf(x.code) > -1);
  }

  filter(items: DataItemState[]) {
    return items.filter((x) => x.published && !x.isSystem);
  }
}
</script>

<style lang="less" scoped>
.box {
  text-align: left;
  padding-left: 16px;
  background: #fff;
}

/deep/.h3-panel-header {
  display: block !important;
}

.biz {
  /deep/.h3-panel-header {
    span {
      margin-left: -8px;
    }
    i {
      font-weight: bold;
    }
  }
}
</style>
