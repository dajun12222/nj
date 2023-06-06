<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-tabs class="form-panel" defaultActiveKey="2">
    <a-tab-pane key="1" :tab="$t('languages.Apps.FormDesignPage.DataItem')">
      <data-item-panel />
    </a-tab-pane>

    <a-tab-pane key="2" :tab="$t('languages.Apps.FormDesignPage.Control')">
      <control-panel />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts">
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import ControlPanel from './control-panel.vue';
import DataItemPanel from './data-item-panel.vue';

@Component({
  name: 'form-design-panel',
  components: {
    ControlPanel,
    DataItemPanel,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class FormDesignPanel extends Vue {}
</script>

<style lang="less">
.form-panel {
  &.ant-tabs {
    display: flex;
    flex-direction: column;
    // height: 100%;
  }
  .ant-tabs-bar,
  .ant-tabs-tabpane {
    background: #fff;
    // border-radius: 4px;
  }
  .ant-tabs-tab {
    // width: 88px;
    font-size: 12px;
  }
  .ant-tabs-nav-wrap {
    text-align: center;
  }
  .ant-tabs-content {
    flex: 1;
    height: calc(100% - 42px);
    .ant-tabs-tabpane {
      overflow: auto;
      min-height: 100%;
    }
  }
  .h3-panel-header > span {
    font-size: 13px !important;
    color: #111218;
  }
}
</style>
