<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="integration-setting">
    <div class="integration-setting__tabs">
      <a-tabs
        class="user-tabs"
        :defaultActiveKey="integrationDefaultActiveKey"
        @change="change"
      >
        <a-tab-pane key="1" :tab="'文件储存'">
          <div class="tabs__wrap">
            <file-storage />
          </div>
        </a-tab-pane>

        <a-tab-pane key="2" :tab="'附件预览'">
          <div class="tabs__wrap">
            <annex-preview />
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" :tab="'邮件配置'">
          <div class="tabs__wrap">
            <email-config />
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="showTab" key="4" :tab="'消息通知'">
          <div class="tabs__wrap">
            <notify-config />
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="showTab" key="5" :tab="'短信通知'">
          <div class="tabs__wrap">
            <sms-config :parentKey="activeKey" />
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="showTab" key="6" :tab="'地址授权'">
          <div class="tabs__wrap">
            <map-config />
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="showTab" key="7" :tab="'流程配置'">
          <div class="tabs__wrap">
            <workflow-config />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts">
import { Tabs } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import annexPreview from './annex-preview.vue';
import EmailConfig from './emailConfig.vue';
import fileStorage from './file-storage.vue';
import NotifyConfig from './notify-config.vue';
import SmsConfig from './sms-config.vue';
import MapConfig from './map-config.vue';
import WorkflowConfig from './workflow-config.vue';

const UserModule = namespace('System/User');

@Component({
  name: 'integration-setting',
  components: {
    annexPreview,
    fileStorage,
    EmailConfig,
    NotifyConfig,
    SmsConfig,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    MapConfig,
    WorkflowConfig,
  },
})
export default class IntegrationSetting extends Vue {
  @UserModule.State('isAdmin') isAdmin!: boolean;

  integrationDefaultActiveKey: string = '1';

  activeKey: string = '1';

  get showTab() {
    return this.$store && this.$store.state.System.User.isAdmin;
  }

  created() {
    const integrationDefaultActiveKey: any = localStorage.getItem(
      'integrationDefaultActiveKey',
    );
    if (integrationDefaultActiveKey) {
      this.integrationDefaultActiveKey = integrationDefaultActiveKey;
      this.activeKey = integrationDefaultActiveKey;
    }
  }

  change(activeKey) {
    localStorage.setItem('integrationDefaultActiveKey', activeKey);

    this.activeKey = activeKey;
  }

  destroyed() {
    localStorage.removeItem('integrationDefaultActiveKey');
  }
}
</script>
<style lang="less" scoped>
@import '../../../styles/tab.less';
.integration-setting {
  text-align: left;
  &__tabs {
    /deep/.ant-tabs-nav {
      margin: 0 24px;
    }
    .tabs__wrap {
      margin: 0 24px;
      padding-top: 16px;
    }
    &:last-child {
      .tabs__wrap {
        padding-top: 0px;
      }
    }
    /deep/.ant-tabs-bar {
      margin-bottom: 16px;
    }
  }
  /deep/.ant-table-body,
  /deep/.ant-table-header {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
}
</style>
