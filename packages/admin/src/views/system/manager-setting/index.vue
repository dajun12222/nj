<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="manager-setting">
    <div class="manager-setting__tabs">
      <a-tabs
        :class="['user-tabs', activeKey === '1' ? 'five' : '']"
        :defaultActiveKey="defaultActiveKey"
        @change="change"
      >
        <a-tab-pane v-if="!isOnlyAppAdmin" key="1" :tab="'系统管理员'">
          <div class="tabs__wrap">
            <system-manager />
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="isAdmin" key="2" :tab="'子管理员'">
          <div class="tabs__wrap">
            <apps-manager />
          </div>
        </a-tab-pane>
        <!-- <a-tab-pane :tab="'数据管理员'" key="3" v-if="!isOnlyAppAdmin">
          <div class="tabs__wrap">
            <data-manager v-if="activeKey === '3'"/>
          </div>
        </a-tab-pane> -->
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts">
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import AppsManager from './apps-manager.vue';
import DataManager from './data-manager.vue';
import SystemManager from './system-manager.vue';

const UserModule = namespace('System/User');

@Component({
  name: 'manager-setting',
  components: {
    SystemManager,
    AppsManager,
    DataManager,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class ManagerSetting extends Vue {
  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;

  @UserModule.State('isAdmin') isAdmin!: boolean;

  defaultActiveKey: string = '1';

  activeKey: string = '1';

  created() {
    // 如果登录用户只拥有子管理员权限，则只显示子管理员
    if (this.isAdmin && this.isOnlyAppAdmin) {
      this.defaultActiveKey = '2';
    }

    // 如果是仅仅是子管理员，则刷新不用执行页面定位
    if (this.isOnlyAppAdmin) {
      return;
    }
    const defaultActiveKey: any = localStorage.getItem('defaultActiveKey');
    if (defaultActiveKey) {
      this.defaultActiveKey = defaultActiveKey;
      this.activeKey = defaultActiveKey;
    }
  }

  change(activeKey) {
    if (this.isOnlyAppAdmin) {
      return;
    }
    localStorage.setItem('defaultActiveKey', activeKey);

    this.activeKey = activeKey;
  }

  destroyed() {
    localStorage.removeItem('defaultActiveKey');
  }
}
</script>
<style lang="less" scoped>
@import '../../../styles/tab.less';
.manager-setting {
  text-align: left;
  &__tabs {
    /deep/.ant-tabs-nav {
      margin: 0 24px;
    }
    .tabs__wrap {
      margin: 0 24px;
    }
  }
  /deep/.ant-table-body,
  /deep/.ant-table-header {
    &::-webkit-scrollbar {
      width: 8px;
    }
  }
}
</style>
