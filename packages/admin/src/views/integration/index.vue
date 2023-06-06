<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="integration-panel">
    <a-tabs
      v-model="currentTab"
      :class="[
        'user-tabs',
        currentTab === tabs[2]
          ? 'sevent'
          : currentTab === tabs[1]
          ? 'three'
          : '',
      ]"
      @change="toggleTab"
    >
      <a-tab-pane :key="tabs[0]" :tab="'集成服务'">
        <integration class="panel-wrap" />
      </a-tab-pane>
      <a-tab-pane :key="tabs[1]" :tab="'数据源'">
        <sqlpool class="panel-wrap" />
      </a-tab-pane>
      <a-tab-pane :key="tabs[2]" :tab="'报表高级数据源'">
        <outdatasource class="panel-wrap" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'integration-panel',
  components: {
    integration: () => import('./integration/index.vue'),
    sqlpool: () => import('./sql-pool/index.vue'),
    outdatasource: () => import('./outdatasource/index.vue'),
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class IntegrationPanel extends Vue {
  tabs: string[] = ['integration', 'connections', 'outdatasource'];

  currentTab: string = '';

  toggleTab() {
    sessionStorage.setItem('intergrationTab', this.currentTab);
  }

  mounted() {
    const tab = sessionStorage.getItem('intergrationTab');
    if (tab) {
      this.currentTab = tab;
    } else {
      this.currentTab = this.tabs[0];
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/tab.less';
.integration-panel {
  text-align: left;
  .panel-wrap {
    height: 100%;
  }
  /deep/.ant-tabs {
    overflow: hidden;
    height: calc(100vh - 64px);
  }
  /deep/.ant-tabs-bar {
    margin: 0;
    padding-left: 24px;
  }
  /deep/.ant-tabs-content {
    height: 100%;
  }
  /deep/.ant-table-body,
  /deep/.ant-table-header {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
</style>
