<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="property-container">
    <!-- 控件属性 -->

    <a-tabs
      :activeKey="tabKey"
      class="property-container-tabs"
      @change="tabChange"
    >
      <!-- tab 1 -->
      <a-tab-pane key="ControlAttribute" tab="节点属性">
        <property-panel
          v-if="isControlAttribute"
          class="property-panel-style"
          :schema="property.schema"
          :settings="property.settings"
          :data="property.data"
          @change="nodePropertyChange"
        />
        <div v-else class="noneNode">请选择画布中的节点</div>
      </a-tab-pane>
      <!-- tab 2 -->
      <a-tab-pane key="BizRuleAttribute" tab="规则属性">
        <property-panel
          ref="bizRuleAttribute"
          class="property-panel-style"
          :schema="bizRuleProperty.schema"
          :settings="bizRuleProperty.settings"
          :data="bizRuleProperty.data"
          @change="bizRulePropertyChange"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Tabs } from '@h3/antd-vue';
import {
  factory,
  PropertyPanel,
} from 'cloudpivot-designer/designer-core/property-panel';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import './property-desgner-extend';
import { schema, settings } from './property-schema';
import bizRuleschema from './property-schema/biz-rule-property/schema';
import bizRuleSetting from './property-schema/biz-rule-property/settings';
import { NodeType, propertyNode } from './typings/node-type';

const BizRuleModule = namespace('Apps/BizRule');

@Component({
  name: 'BizRuleProperty',
  components: {
    PropertyPanel,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class BizRuleProperty extends Vue {
  @BizRuleModule.State('curComponent') curComponent: any;

  @BizRuleModule.State('workflowData') workflowData: any;

  @BizRuleModule.State('currentActivity') currentActivity: any;

  @BizRuleModule.Mutation('showDefaultPropertyPanel')
  showDefaultPropertyPanel: any;

  @BizRuleModule.Mutation('setWorkflowData') setWorkflowData: any;

  @BizRuleModule.Mutation('updateNodeProps') updateNodeProps: any;

  // @Prop() data !: any;
  @Prop() dataItems!: any;

  tabKey: any = 'BizRuleAttribute';

  activeCollapse: any[] = ['base', 'control'];

  property: any = {};

  propertySchema: any = '';

  propertySettings: any = '';

  propertyData: any = {};

  bizRuleProperty: any = {};

  created() {
    this.showDefaultPropertyPanel();
  }

  //是否为真正的业务结点
  get isControlAttribute() {
    return (
      JSON.stringify(this.currentActivity) !== '{}' &&
      !propertyNode.includes(this.currentActivity.nodeType)
    );
  }

  // 页签切换
  tabChange(tabKey: any) {
    /* if (propertyNode.includes(this.currentActivity.nodeType)) {
      this.tabKey = 'BizRuleAttribute';
      this.$message.info('请先选择业务节点');
      return;
    } */
    this.tabKey = tabKey;
  }

  nodeClick(node: any) {
    const v = this.currentActivity;
    const bizRuleAttribute = propertyNode;
    if (bizRuleAttribute.includes(v.nodeType)) {
      this.tabKey = 'BizRuleAttribute';
    } else {
      this.tabKey = 'ControlAttribute';
    }
  }

  setBizRuleProperty() {
    const bizRule = JSON.parse(JSON.stringify(bizRuleschema));
    // 默认规则编码不可以编辑
    if (this.workflowData.defaultRule) {
      bizRule.properties.code.disabled = true;
      bizRule.properties.bizRuleType.disabled = true;
    } else {
      //Else Empty block statement
    }

    if (/isEdit=false/.test(location.href)) {
      bizRule.properties.code.disabled = true;
    }
    const data = factory.build(bizRule);
    for (const item in data.children) {
      if (this.workflowData[item]) {
        data.children[item].value = this.workflowData[item];
      }
    }
    // 规则属性节点设置数据项
    if (bizRuleSetting.properties && bizRuleSetting.properties.display) {
      const display: any = bizRuleSetting.properties.display;
      for (const item in display) {
        if (
          display[item].component &&
          display[item].component.options &&
          display[item].component.options.dataItems
        ) {
          display[item].component.options.dataItems = this.dataItems;
        }
      }
    }

    this.bizRuleProperty = {
      schema: bizRule,
      settings: bizRuleSetting,
      data,
    };
  }

  @Watch('curComponent')
  onCurComponentchange(v) {
    if (!v) {
      this.tabKey = 'BizRuleAttribute';
      return;
    }
    if (v === 'WorkflowProperty' || v === 'LineProperty') {
      this.tabKey = 'BizRuleAttribute';
    } else {
      this.tabKey = 'ControlAttribute';
    }
  }

  nodePropertyChange(key: string, val: any, data: any) {
    if (val === undefined) {
      return;
    }
    //处理消息通知节点链接类型变化时逻辑
    if (key === 'linkType') {
      this.handleLinkTypeChange(val, data);
    }
    if (key === 'triggerObjectCode') {
      this.updateNodeProps({ key: 'childTriggerConditionType', value: '' });
      setTimeout(() => {
        this.onCurrentActivityChange(this.currentActivity);
      }, 0);
    }

    this.updateNodeProps({ key, value: val.value ? val.value : val });
  }

  handleLinkTypeChange(value: string, data: any) {
    if (value === 'FORM_LINKS') {
      data.children.sheetCode.display = true;
      data.children.url.value = '';
      data.children.url.display = false;
    } else {
      data.children.sheetCode.display = false;
      data.children.url.display = true;
    }
  }

  bizRulePropertyChange(key: string, value: any, data: any) {
    const _backData = { ...this.workflowData };
    _backData[key] = data.value[key];
    this.setWorkflowData(_backData);
  }

  setChildOption(theSetting, node) {
    const dataManipulation = [
      NodeType.Create,
      NodeType.Delete,
      NodeType.Update,
    ];
    const childTriggerConditionType =
      theSetting.properties.display.childTriggerConditionType;
    if (this.workflowData.defaultRule && childTriggerConditionType) {
      const options = childTriggerConditionType.selectOptions;
      const _options = [...options];
      if (
        dataManipulation.includes(node.nodeType) &&
        this.workflowData.code === 'Available'
      ) {
        theSetting.properties.display.childTriggerConditionType.selectOptions =
          _options.filter((res) => res.value === 'VALID');
      }
      if (
        dataManipulation.includes(node.nodeType) &&
        this.workflowData.code === 'Cancel'
      ) {
        theSetting.properties.display.childTriggerConditionType.selectOptions =
          _options.filter((res) => res.value === 'INVALID');
      }
      if (
        dataManipulation.includes(node.nodeType) &&
        this.workflowData.code === 'Delete'
      ) {
        theSetting.properties.display.childTriggerConditionType.selectOptions =
          _options.filter((res) => res.value === 'DELETE');
      }
      if (
        dataManipulation.includes(node.nodeType) &&
        this.workflowData.code === 'Update'
      ) {
        const opt = ['ADD', 'DELETE', 'MODIFY'];
        theSetting.properties.display.childTriggerConditionType.selectOptions =
          _options.filter((res) => opt.includes(res.value));
      }

      if (
        dataManipulation.includes(node.nodeType) &&
        this.workflowData.code === 'Create'
      ) {
        theSetting.properties.display.childTriggerConditionType.selectOptions =
          _options.filter((res) => res.value === 'ADD');
      }

      if (
        dataManipulation.includes(node.nodeType) &&
        this.workflowData.code === 'Load'
      ) {
        theSetting.properties.display.childTriggerConditionType.selectOptions =
          [];
      }
    }

    return theSetting;
  }

  setSchemaData(theSchema: any, v: any) {
    if (v.linkType !== 'FORM_LINKS') {
      theSchema.properties['url'].hidden = false;
      theSchema.properties['sheetCode'].hidden = true;
    } else {
      theSchema.properties['url'].hidden = true;
      theSchema.properties['sheetCode'].hidden = false;
    }
    return theSchema;
  }

  @Watch('$route')
  routeChange() {
    this.setBizRuleProperty();
  }

  @Watch('dataItems')
  onDataItemChange() {
    this.onCurrentActivityChange(this.currentActivity);
  }

  @Watch('currentActivity')
  onCurrentActivityChange(v) {
    if (Object.keys(v).length === 0) {
      this.tabKey = 'BizRuleAttribute';
      return;
    }
    // 没有节点属性，直接显示业务规则属性
    const bizRuleAttribute = propertyNode;
    if (bizRuleAttribute.includes(v.nodeType)) {
      this.tabKey = 'BizRuleAttribute';
      return;
    }
    this.tabKey = 'ControlAttribute';
    let theSchema = JSON.parse(JSON.stringify(schema[v.nodeType]));
    // console.log('v.nodeType', v.nodeType);
    // console.log('theSchema', theSchema);
    const subscription = settings[v.nodeType].properties.subscription;
    let theSetting = JSON.parse(JSON.stringify(settings[v.nodeType]));
    theSetting.properties.subscription = subscription;
    theSetting = this.setChildOption(theSetting, v);
    //处理消息通知节点数据
    if (v.linkType) {
      theSchema = this.setSchemaData(theSchema, v);
    }
    if (v.edit) {
      theSchema.properties.nodeCode.disabled = true;
    }
    if (theSetting.properties && theSetting.properties.display) {
      const display = theSetting.properties.display;
      for (const item in display) {
        if (
          display[item].component &&
          display[item].component.options &&
          display[item].component.options.dataItems
        ) {
          display[item].component.options.dataItems = this.dataItems;
        }
      }
    }
    if (theSchema && theSetting) {
      this.propertySchema = theSchema;
      this.propertySettings = theSetting;

      const data = factory.build(theSchema);
      console.log(data);

      this.property = {
        schema: theSchema,
        settings: theSetting,
        data,
      };
      // this.propertyData = data;

      for (const key in data.children) {
        if (v[key]) {
          const value = data.children[key].value;
          // if(typeof value === 'object') {
          //   data.children[key].value = JSON.parse( JSON.stringify(v[key]) )
          //   // Object.assign(value, v[key]);

          // } else {
          //   data.children[key].value = v[key];
          // }
          data.children[key].value = v[key];
        }
      }

      this.property = {
        schema: theSchema,
        settings: theSetting,
        data,
      };
    }
  }
}
</script>

<style lang="less" scoped>
.property-container {
  background: /* #e9edf2 */ white;
  min-width: 267px;
  height: 100%;
  &-tabs {
    /deep/ .ant-tabs-nav {
      font-weight: 600;
    }
  }
  // .property-panel-style {

  // }
  /deep/.ant-tabs {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    .ant-tabs-bar {
      flex: 0 0 40px;
      margin: 0;
      margin-right: 16px;
    }
    .ant-tabs-bar,
    .ant-tabs-tabpane {
      background: #fff;
      // border-radius: 4px;
    }
    .ant-tabs-nav-wrap {
      text-align: center;
    }
    .ant-collapse-header {
      padding-left: 24px !important;
      .anticon-right {
        //  padding-left: 8px;
        left: 8px;
      }
    }
    .ant-tabs-content {
      flex: 1;
      height: 100%;
      .ant-tabs-tabpane {
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 100%;
        margin-top: 8px;
        padding-right: 11px;
        .ant-collapse-content-box {
          padding: 0px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.property-container {
  .ant-tabs-tab {
    margin-right: 73px;
    color: #111218;
    font-weight: normal;
  }
  .property-panel-style {
    height: calc(90vh - 180px);
    /* padding: 0px 8px; */
    .last-none-item {
      border-top: 1px solid #e9e9e9;
    }
    .property-item {
      position: relative;
      &:first-child {
        border-top: 0;
      }
      // &.last-none-item {
      //   &
      // }
      /*  border-top: 1px solid #e9e9e9; */
      /* display: flex; */
      &:last-child {
        /* border-bottom: 1px solid #e9e9e9; */
      }
      .property-label {
        flex: none;
        width: 40%;
        line-height: 32px;
        /* padding: 0px 5px; */
        color: black;
        font-weight: bold;
        label {
          /* margin-left: 8px; */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }
      }
      .property-field {
        width: 100%;
        color: #111218;
        font-weight: 400;
        /* padding: 0px 10px; */
        .ant-input,
        .ant-select {
          color: #111218;
          font-weight: 400;
        }
        .ant-select-disabled {
          .ant-select-arrow {
            display: none;
          }
        }
        /* border-left: 1px solid #e9e9e9; */
        flex: 1;
        .ant-select-selection,
        .ant-select {
          width: 100%;
        }
      }
    }
    .required {
      &:before {
        content: '*';
        display: inline-block;
        vertical-align: middle;
        color: #f4454e;
        position: relative;
        font-size: 13px;
        top: -5px;
        transform: translate(-50%, -50%);
        left: 5px;
        height: 10px;
      }
    }
    .ant-collapse-content {
      background-color: white;
    }
    .ant-collapse-borderless {
      background-color: white;
    }
  }
}
</style>

<style lang="less" scoped>
.property-container {
  padding: 0px 0px 0px 16px;
  .noneNode {
    position: relative;
    text-align: center;
    top: 45%;
    color: rgba(17, 18, 24, 0.5);
  }
  /deep/.ant-select {
    font-size: 13px;
  }
}
</style>
