<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="edit-app">
    <a-tabs :defaultActiveKey="defaultActiveTab" :animated="false">
      <a-tab-pane v-for="t in tabs" :key="t.key" :tab="t.tab">
        <component
          :is="t.key"
          :isTabPane="true"
          class="edit-app__panel"
          @refresh="refresh"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import Basic from '../settings/base-setting.vue';
import Permission from '../settings/permission-setting.vue';

@Component({
  name: 'edit-package',
  components: {
    Basic,
    Permission,
    // Configs,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class EditPackage extends Vue {
  defaultActiveTab: string = 'basic';

  tabs: any[] = [];

  mounted() {
    this.tabs = [
      {
        tab: this.$t('languages.appSettings.baseSetting'),
        key: 'basic',
      },
      {
        tab: this.$t('languages.appSettings.permissionSetting'),
        key: 'permission',
      },
      // {
      //   tab: this.$t('languages.appSettings.packageSetting'),
      //   key: 'configs'
      // }
    ];
  }

  refresh() {
    this.$emit('refresh');
  }
}
</script>
<style lang="less" scoped>
.edit-app {
  height: 100%;
  /deep/.ant-tabs {
    height: 100%;
  }
  /deep/.ant-tabs-content {
    height: calc(100% - 56px);
  }
  /deep/.ant-tabs-tabpane {
    position: absolute;
    height: 100%;
  }
  /deep/.ant-tabs-bar {
    margin: 0 24px;
  }
  &__panel {
    &.base-settings {
      margin-top: 30px;
    }
  }
}
</style>
