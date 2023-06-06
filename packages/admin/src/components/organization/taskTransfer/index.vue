<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="work-handover" :class="showHandlerTip && 'hasTip'">
    <div v-show="showHandlerTip" class="work-handover_tip">
      <a-alert
        message="后台已启动交接全部数据动作，完成后将通过消息通知你！"
        type="warning"
        closable
        showIcon
        :afterClose="hideTip"
      />
    </div>
    <div class="work-handover-tabs">
      <a-tabs defaultActiveKey="1" class="user-tabs">
        <a-tab-pane key="1" :tab="'待办任务'">
          <div class="tabs__wrap">
            <TodoTask :userid="userid" @reloadUser="reloadUserList" />
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="'应用数据'">
          <div class="tabs__wrap">
            <AppsData
              :userid="userid"
              @showTip="switchShowTip"
              @reloadUser="reloadUserList"
            />
          </div>
        </a-tab-pane>

        <a-tab-pane v-if="curTab" key="3" :tab="'角色'">
          <div class="tabs__wrap">
            <Role
              :userid="userid"
              :corpid="corpid"
              @showTip="switchShowTip"
              @reloadUser="reloadUserList"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import TodoTask from './todoTask.vue';
import AppsData from './appsData.vue';
import Role from './role.vue';
import { Tabs, Alert } from '@h3/antd-vue';

@Component({
  name: 'TaskTransfer',
  components: {
    TodoTask,
    AppsData,
    Role,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AAlert: Alert,
  },
})
export default class TaskTransfer extends Vue {
  @Prop() userid!: string;

  @Prop() corpid!: string;

  @Prop() curTab!: string;

  showHandlerTip: boolean = false;

  /**
   * 是否显示交接全部提示
   */
  switchShowTip(flag?: boolean) {
    this.showHandlerTip = !!flag;
  }

  /**
   * 关闭后重置变量
   */
  hideTip() {
    console.log('tip closed');
    this.showHandlerTip = false;
  }

  reloadUserList() {
    this.$emit('reloadTree');
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/tab.less';
.work-handover {
  height: 100%;
  .work-handover_tip {
    max-height: 40px;
    overflow: hidden;
  }
  .work-handover-tabs {
    height: 100%;
  }
  /deep/.ant-tabs {
    height: 100%;
  }
  .tabs__wrap {
    margin: 0 24px;
  }
  /deep/.ant-tabs-bar {
    margin-bottom: 16px !important;
    margin: 0 24px;
    margin-top: 12px;
  }

  &.hasTip {
    .work-handover-tabs {
      height: calc(100% - 40px);
    }
  }
}
</style>
