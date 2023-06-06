<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workflow-setting">
    <history-version />
  </div>
</template>
<script lang="ts">
import HistoryVersion from '@/components/apps/workflowSetting/historyVersion.vue';
import ParamSetting from '@/components/apps/workflowSetting/paramSetting.vue';
import setPrivilege from '@/components/apps/workflowSetting/set-privilege.vue';
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'WorkflowSetting',
  components: {
    ParamSetting,
    HistoryVersion,
    setPrivilege,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class WorkflowSetting extends Vue {}
</script>
<style lang="less" scoped>
@import '~@/styles/tab.less';
.workflow-setting {
  .ant-tabs-bar {
    margin: 0px;
    .ant-tabs-nav-scroll {
      text-align: left;
      margin: 0px 24px;
      .ant-tabs-tab {
        padding: 16px 16px 12px 16px;
      }
    }
  }
}
</style>
