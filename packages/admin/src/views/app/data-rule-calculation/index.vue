<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-rule">
    <a-tabs
      v-model="activeKey"
      class="user-tabs"
      :animated="false"
      @change="tabsChange"
    >
      <a-tab-pane :key="1" :tab="'校验规则'">
        <verify-rules :activeKey="activeKey" :columns="columns" />
      </a-tab-pane>
      <a-tab-pane :key="2" :tab="'计算规则'">
        <calculate-rules :activeKey="activeKey" :columns="columns" />
      </a-tab-pane>
      <a-tab-pane :key="3" :tab="'显示规则'">
        <display-rules :activeKey="activeKey" :columns="columns" />
      </a-tab-pane>
      <a-tab-pane :key="4" :tab="'必填规则'">
        <other-rules :activeKey="activeKey" :columns="columns" />
      </a-tab-pane>
      <a-tab-pane :key="5" :tab="'只读规则'">
        <readonly-rules :activeKey="activeKey" :columns="columns" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import CalculateRules from '@/views/app/data-rule-calculation/calculateRules.vue';
import DisplayRules from '@/views/app/data-rule-calculation/displayRules.vue';
import OtherRules from '@/views/app/data-rule-calculation/otherRules.vue';
import ReadonlyRules from '@/views/app/data-rule-calculation/readonlyRules.vue';
import VerifyRules from '@/views/app/data-rule-calculation/verifyRules.vue';
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'DataRuleCalculation',
  components: {
    OtherRules,
    DisplayRules,
    VerifyRules,
    CalculateRules,
    ReadonlyRules,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class DataRuleCalculation extends Vue {
  @DataModelModule.Action('getDataItemList') getDataItemListX: any;

  @DataModelModule.Action('getFormRuleList') getFormRuleList: any;

  @DataModelModule.State('formRuleList') formRuleList: any;

  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  @DataModelModule.Mutation('setFilterDataItemList') setFilterDataItemList: any;

  activeKey = 1;

  spinning: boolean = true;

  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'name',
      key: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: {
        customRender: 'name',
      },
      width: 200,
      align: 'left',
    },
    {
      dataIndex: 'checkType',
      slots: { title: 'typeTitle' },
      scopedSlots: {
        customRender: 'checkType',
      },
      key: 'checkType',
      align: 'left',
    },
    {
      dataIndex: 'action',
      slots: { title: 'actionTitle' },
      scopedSlots: { customRender: 'action' },
      width: 120,
      key: 'action',
      align: 'right',
    },
  ];

  tabsChange(val: number) {
    this.spinning = true;
  }

  closeSpin() {
    this.spinning = false;
  }
}
</script>
<style lang="less" scoped>
@import '../../../styles/tab.less';
.data-rule {
  .action {
    i {
      cursor: pointer;
      padding-left: 17px;
    }
  }
}
</style>
<style lang="less">
.action-list-operating {
  i:nth-child(2) {
    padding-left: 17px;
  }
  i {
    cursor: pointer;
  }
}

.select-option-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .right {
    border-radius: 12px;
    padding: 0 8px;
    font-size: 12px;
    height: 22px;
    line-height: 22px;
  }
}

.data-item-select-content {
  .ant-select-selection-selected-value {
    width: 100%;
  }
}

.and-or {
  margin: 0 5px;
}
</style>
