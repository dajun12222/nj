<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <common-setting
      v-if="isShowCommonSetting"
      type="SUB_INSTANCE"
      @setMappingStr="setMappingStr"
    />
    <a-collapse :bordered="false" :activeKey="['2', '3', '4', '5']">
      <!-- <a-collapse-panel key="1" header="基础属性">
        <common-setting
          v-if="isShowCommonSetting"
          type="SUB_INSTANCE"
          @setMappingStr="setMappingStr"
        />
      </a-collapse-panel> -->

      <!-- 参与者设置 -->
      <a-collapse-panel key="3" header="参与者">
        <participant type="SUB_INSTANCE" />
      </a-collapse-panel>

      <!-- 数据映射 -->
      <a-collapse-panel key="2" header="数据映射">
        <data-mapping ref="mapping" />
      </a-collapse-panel>

      <a-collapse-panel key="5">
        <div slot="header" class="custom-collapse-panel-header">
          消息通知
          <a-tooltip>
            <template slot="title">
              <div>若节点与流程配置的消息模版不一</div>
              <div>样，将按节点的消息配置发送通知。</div>
            </template>
            <span class="icon aufontAll h-icon-all-question-circle"></span>
          </a-tooltip>
          <div @click.stop="toSetNotification">消息管理</div>
        </div>
        <notification type="SUB_INSTANCE" />
      </a-collapse-panel>

      <!-- 事件处理 -->
      <a-collapse-panel key="4" header="事件处理">
        <activity-event type="SUB_INSTANCE" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts">
import { Collapse, Tooltip } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import ActivityEvent from './property/activityEvent.vue';
import commonSetting from './property/commonSetting.vue';
import DataMapping from './property/dataMapping.vue';
import Notification from './property/notification.vue';
import Participant from './property/participant.vue';
@Component({
  name: 'SubInstanceProperty',
  components: {
    commonSetting,
    Participant,
    DataMapping,
    ActivityEvent,
    Notification,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATooltip: Tooltip,
  },
})
export default class SubInstanceProperty extends Vue {
  isShowCommonSetting: boolean = true;

  setMappingStr() {
    const mapping = this.$refs.mapping as any;
    if (mapping) {
      mapping.setMappingStr();
    }
  }

  toSetNotification() {
    localStorage.setItem('integrationDefaultActiveKey', '5');
    window.open('/admin/#/system/integration-setting', '_blank');
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.custom-collapse-panel-header {
  display: flex;
  justify-content: space-between;
  position: relative;
  div {
    color: @primary-color;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .h-icon-all-question-circle {
    position: absolute;
    left: 62px;
    top: 1px;
    font-size: 13px;
    color: rgba(17, 18, 24, 0.25);
    font-weight: 400;
  }
}
.h-icon-all-question-circle {
  font-size: 13px;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.25);
  padding-left: 2px;
}
</style>
