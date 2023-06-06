<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="message-notify">
    <property-widget label="通知类型">
      <div slot="right" class="select-type">
        <a-select
          v-model="curActivityProps.todoDataItem.dataItemType"
          showSearch
          class="input-select"
        >
          <a-select-option
            v-for="(item, index) in options"
            :key="index"
            :value="item.type"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
    </property-widget>

    <property-widget v-show="isShowDataTitle" label="数据标题">
      <div slot="right" class="select-type">
        <a-select
          v-model="curActivityProps.todoDataItem.summary"
          class="input-select"
          mode="tags"
          :placeholder="$t('languages.PlaceHolder.Select')"
        >
          <a-select-opt-group>
            <span slot="label" class="select-title">业务数据项</span>
            <a-select-option v-for="i in bizSummaryList" :key="i.code">
              {{ i.name }}
            </a-select-option>
          </a-select-opt-group>
          <a-select-opt-group>
            <span slot="label" class="select-title">系统数据项</span>
            <a-select-option v-for="i in defaultSummaryList" :key="i.code">
              {{ i.name }}
            </a-select-option>
          </a-select-opt-group>
        </a-select>
      </div>
    </property-widget>
  </div>
</template>
<script lang="ts">
import { Select } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PropertyWidget from '../base/propertyWidget.vue';

const WorkflowModule = namespace('Apps/Workflow');

// 通知类型
enum NotifyType {
  default = 0,
  customerize = 1,
}

@Component({
  name: 'MessageNotify',
  components: {
    PropertyWidget,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
  },
})
export default class MessageNotify extends Vue {
  @WorkflowModule.State('WorkflowDataItem_origin') WorkflowDataItemOrigin: any;

  @WorkflowModule.State('curActivityProps') curActivityProps: any;

  options: Array<any> = [
    {
      type: NotifyType.default,
      name: '系统默认通知',
    },
    {
      type: NotifyType.customerize,
      name: '自定义通知',
    },
  ];

  get isShowDataTitle() {
    return (
      this.curActivityProps.todoDataItem.dataItemType === NotifyType.customerize
    );
  }

  get defaultSummaryList() {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => data.defaultProperty,
    );
  }

  get bizSummaryList(): any[] {
    return this.WorkflowDataItemOrigin.filter(
      (data: any) => !data.defaultProperty,
    );
  }

  mounted() {}

  // /**
  //  * 通知类型变化
  // */
  // typeChange(v) {
  //   console.log(v);
  // }

  // /**
  //  * 数据标题变化
  // */
  // summaryChange(v) {
  //   console.log(v);
  // }
}
</script>
<style lang="less">
.message-notify {
  /deep/.property-wrap:first-child {
    border-top: none;
  }
  .select-type {
    width: 100%;
    height: 32px;
    /deep/.input-select {
      width: 100%;
      height: 100%;
      border: none;
      /deep/.ant-select-selection {
        border: none;
        box-shadow: none;
      }
    }
  }
}
</style>
