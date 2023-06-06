<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div id="workflowPropertyWrapper" class="property-container">
    <a-collapse :bordered="false" :activeKey="['1', '2', '3', '4', '5']">
      <a-collapse-panel key="1" header="基础属性">
        <common-setting type="workflow" />
      </a-collapse-panel>

      <a-collapse-panel key="2" header="流程事件">
        <workflow-event />
      </a-collapse-panel>

      <a-collapse-panel v-if="workflowData.todoDataItems !== undefined" key="3">
        <div slot="header" class="custom-collapse-panel-header">
          <span>消息通知</span>
          <div @click.stop="toSetNotification">消息管理</div>
        </div>
        <notificationNew :todoItems="todoItems" @change="todoItemsChange" />
      </a-collapse-panel>

      <a-collapse-panel key="4" header="流程发起配置">
        <flowStartConfig />
      </a-collapse-panel>

      <a-collapse-panel key="5" class="unset-overflow" header="流程运维特权人">
        <setPrivilege />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { Collapse } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import activityEvent from './property/activityEvent.vue';
import commonSetting from './property/commonSetting.vue';
import workflowEvent from './property/workflowEvent.vue';
import flowStartConfig from './property/flowStartConfig.vue';
import setPrivilege from '@/components/apps/workflowSetting/set-privilege.vue';
import notificationNew from './property/notification-new.vue';
import { namespace } from 'vuex-class';
const WorkflowModule = namespace('Apps/Workflow');

@Component({
  name: 'WorkflowProperty',
  components: {
    commonSetting,
    activityEvent,
    workflowEvent,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    flowStartConfig,
    setPrivilege,
    notificationNew,
  },
})
export default class WorkflowProperty extends Vue {
  @Prop() data!: any;

  @WorkflowModule.State('workflowData') workflowData: any;

  @WorkflowModule.Mutation('setTodoDataItems') setTodoDataItems: any;

  todoItems: any[] = [];

  @Watch('workflowData.todoDataItems')
  onChange(val) {
    if (val) {
      this.todoItems = JSON.parse(JSON.stringify(val));
    }
  }

  todoItemsChange(vals) {
    this.todoItems = vals;
    this.setTodoDataItems(vals);
  }

  toSetNotification() {
    localStorage.setItem('integrationDefaultActiveKey', '5');

    window.open('/admin/#/system/integration-setting', '_blank');
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
#workflowPropertyWrapper {
  padding-top: 10px;
}
.custom-collapse-panel-header {
  display: flex;
  justify-content: space-between;
  div {
    color: @primary-color;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
}

.property-container {
  height: 100%;
  width: 100%;
  /deep/.ant-collapse .ant-collapse-item {
    text-align: left;
    background: #fff;
  }
  /deep/.ant-collapse > .ant-collapse-item-active {
    border-bottom: 0;
    margin-bottom: 16px;
    .ant-collapse-content {
      overflow: unset;
    }
  }
  .ant-collapse-content-box {
    padding: 0;
  }
}

.property-container input {
  border: 0 !important;
  outline: none !important;
  &:focus {
    box-shadow: unset !important;
  }
}

.content-right {
  width: 100%;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.unset-overflow {
  /deep/.ant-collapse-content {
    overflow: unset;
  }
}
</style>
