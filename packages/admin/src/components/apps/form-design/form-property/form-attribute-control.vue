<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="attr-rows">
    <div
      v-for="(attr, i) in controlAttributeFilter"
      v-show="attr.display !== false && attr.field !== 'regexpText'"
      :key="i"
      class="attr-row"
      :class="getAttrValClass(attr)"
    >
      <div
        v-if="
          controlType === FormControlType &&
          attr.field === 'name' &&
          (type !== 'controlAttribute' ||
            (type === 'controlAttribute' && attr.field !== 'requiredFormula'))
        "
        style="width: 100%"
      >
        <h3-editor
          :key="control.key + timeKey"
          :value="attr.value"
          :field="attr.field"
          @change="change"
        />
      </div>
      <template
        v-else-if="
          (type !== 'controlAttribute' && attr.removeNames !== '只读条件') ||
          (type === 'controlAttribute' &&
            attr.field !== 'requiredFormula' &&
            attr.removeNames !== '只读条件')
        "
      >
        <!-- <transition
          v-if="attr.seriesNum && attr.removeNames !== '只读条件'"
          name="fade"
        >
          <div
            class="transferTips"
            :style="{ height: attr.seriesNum * 33 + 'px' }"
          >
            <i
              class="icon aufontAll h-icon-all-close posCls"
              @click="deleteTips(attr)"
            ></i>
            <div class="content">{{ attr.removeNames }}已挪至模型配置</div>
          </div>
        </transition> -->
        <label class="attr-lab">
          <span v-html="attr.label"></span>
          <a-tooltip v-if="attr.tip">
            <span slot="title" v-html="attr.tip.content"></span>
            <a-icon
              :type="
                attr.tip.icon === 'question-circle-o'
                  ? 'question-circle'
                  : attr.tip.icon
              "
              theme="filled"
            />
          </a-tooltip>
          <a-tooltip v-else-if="attr.options && attr.options.tip">
            <span slot="title" v-html="attr.options.tip.content"></span>
            <a-icon
              :type="
                attr.options.tip.icon === 'question-circle-o'
                  ? 'question-circle'
                  : attr.options.tip.icon
              "
              theme="filled"
            />
          </a-tooltip>
        </label>
        <div v-show="attr.field !== 'print'" class="attr-val">
          <FormAttributeValue
            :dataItem="attr.dataItem"
            :label="attr.label"
            :dom="attr.dom"
            :value="getValue(attr)"
            :field="attr.field"
            :type="attr.type"
            :attrType="attr.attrType"
            :attributes="controlAttribute"
            :assistAttribute="assistAttribute"
            :options="attr.options"
            :formData="formData"
            :attributeItem="attr"
            :control="control"
            @change="change"
            @blur="blur"
            @callback="callback"
            @optionTypeChange="optionTypeChange"
          />
        </div>
        <a-row  v-show="attr.field === 'print'" class="elRow">
          <a-col @click="showPrintTemplate" class="elColSetUp">设置</a-col>
        </a-row>
      </template>
      <PrintTemplate 
      v-if="attr.field === 'print'"
      :isShowPrintTemplate="isShowPrintTemplate"
      :oauthType="oauthType"
      @changeShowPrintTemplate="changeShowPrintTemplate"
      :dataItem="attr.dataItem"
      :label="attr.label"
      :dom="attr.dom"
      :value="getValue(attr)"
      :field="attr.field"
      :type="attr.type"
      :attrType="attr.attrType"
      :attributes="controlAttribute"
      :assistAttribute="assistAttribute"
      :options="attr.options"
      :formData="formData"
      :attributeItem="attr"
:control="control"
      @change="change"
      @blur="blur"
      @callback="callback"
      
      @optionTypeChange="optionTypeChange"
    ></PrintTemplate>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator';
import FormAttributeValue from './form-attribute-value.vue';
import PrintTemplate from './PrintTemplate.vue';
import { FormControlType } from '../typings';
import workflowApi from "@/apis/workflow";

import { getAttrValClass } from '@/common/attrRowClasses';

import { EventBus } from 'cloudpivot/form/src/schema/event-bus';
import {
  Modal,
  Tooltip, 
  Icon,
  Row,
  Col,
  Select,
  Input,
} from '@h3/antd-vue'; 
@Component({
  name: 'form-control-attribute',
  components: {
    ARow: Row,
    ACol: Col,
    FormAttributeValue,
    PrintTemplate,
    H3Editor: () =>
      import(/* webpackChunkName: "h3-editor" */ './h3-editor.vue'),
    ATooltip: Tooltip,
    AIcon: Icon,
  },
})
export default class FormControlAttribute extends Vue {
  @Prop() attrKey!: string; // 控件ID

  @Prop() controlAttribute!: any; // 控件的属性集合

  @Prop() assistAttribute!: any; // 辅助控件属性集合

  @Prop() formData!: any;

  @Prop() controlType!: any;

  @Prop({ default: '' }) type?: string;

  @Prop() control?: any;

  @Inject()
  updateAttribute?: Function;

  @Inject()
  inputAttributeBlur?: Function;

  @Inject()
  attrCallback?: Function;

  oauthType:string = '2';
  isShowPrintTemplate:boolean = false;
  @Watch('isShowPrintTemplate')
  onIsShowPrintTemplate(newVal:any){
    if(newVal){
      this.getOauthType();
    }
  }

  
  //判断是账套还是组织
  async getOauthType(){
    //functionCode
    const { bizSchemaCode, workflowCode } = this.$route.params;
    let res:any = await workflowApi.getNodeInfo({ functionCode: bizSchemaCode });
    if(res.data && res.data.remarks && res.data.remarks === '1'){
      this.oauthType = '1';
    }else{
      this.oauthType = '2';
      
    }
    this.$forceUpdate();
  }

  get FormControlType() {
    return FormControlType.Description;
  }

  timeKey: number = new Date().getTime();

  setKey() {
    this.timeKey = this.timeKey + 1;
  }

  created() {
    EventBus.$on('changeKey', () => {
      this.setKey();
    });
  }

  destroyed() {
    EventBus.$off('changeKey');
  }

  /**
   * 过滤掉子表里面的数据项，“标题是否显示”属性
   */
  get controlAttributeFilter(): any[] {
    let controlAttribute = this.controlAttribute.filter((item) => {
      return (
        !item.dataItem ||
        !item.dataItem.parentCode ||
        (item.dataItem.parentCode && item.field !== 'labelVisible')
      );
    });
    if (
      this.controlAttribute &&
      this.controlAttribute.length &&
      this.controlAttribute[0].dataItem &&
      this.controlAttribute[0].dataItem.type === 9
    ) {
      for (const attribute of this.controlAttribute) {
        if (attribute.field === 'showStyle' && attribute.value === 'tree') {
          controlAttribute = controlAttribute.filter((item: any) => {
            return !['queryCode', 'conditions', 'searchFormula'].includes(
              item.field,
            );
          });
        }
      }
    }
    if (
      this.assistAttribute &&
      this.assistAttribute.length &&
      this.assistAttribute[0].dataItem &&
      this.assistAttribute[0].dataItem.type === 9
    ) {
      for (const attribute of this.assistAttribute) {
        if (attribute.field === 'showStyle' && attribute.value === 'tree') {
          controlAttribute = controlAttribute.filter((item: any) => {
            return !['showField'].includes(item.field);
          });
        }
      }
    }
    return controlAttribute;
  }

  showPrintTemplate(){
    this.isShowPrintTemplate = true;
  }

  changeShowPrintTemplate(){
    this.isShowPrintTemplate = false;
  }

  optionTypeChange(type) {
    console.log(8888);
    this.$emit('optionTypeChange', type);
  }

  getValue(attr) {
    if (attr.dataItem && attr.dataItem.options && attr.label === '选项') {
      try {
        let options: {} = JSON.parse(attr.dataItem.options);
        if (options) {
          // @ts-ignore
          options = JSON.parse(options.options);
        }
        // @ts-ignore
        if (options.checkedDictionary) {
          return JSON.stringify(options);
        }
      } catch (error) {}
    }

    return attr.value;
  }

  /**
   * 属性修改的回调
   * @param field
   * @param value
   */
  change(field: string, value: any, extraVal: any = null) {
    // 表单属性中 控制布局与边框模式互斥设置
    if (field === 'layoutType') {
      localStorage.setItem('layoutType', value);
    } else if (field === 'fieldCode') {
      this.controlAttribute.forEach((c) => {
        if (c.field === 'relativeType') {
          this.$set(c.options, 'relativeType', extraVal);
        }
      });
    } else {
      //Else Empty block statement
    }
    if (this.updateAttribute) {
      if (field === 'defaultValue') {
        this.updateAttribute('controlAttributeColumns', field, value);
      }
      this.updateAttribute(this.attrKey, field, value, this.controlType + '');
    }
  }

  /**
   * 属性修改的回调
   * @param field
   * @param fun
   */
  callback(field: string, fun: Function, extra = null) {
    if (this.attrCallback) {
      this.attrCallback(this.attrKey, field, fun, extra);
    }
  }

  blur(field: string, value: any) {
    if (this.inputAttributeBlur) {
      this.inputAttributeBlur(this.attrKey, field, value);
    }
  }

  @Watch('controlAttribute', {
    deep: true,
  })
  watchControlAttribute(val) {
    this.initDataType();
  }

  initDataType() {
    //初始化表单属性中 控制布局与边框模式
    this.controlAttribute.forEach((c) => {
      // 显示字段置灰
      if (c.field === 'displayField' && c.dataItem.published) {
        this.controlAttribute.forEach((f) => {
          if (f.field === 'displayField') {
            this.$set(f.options, 'selectorDisabled', true);
          }
        });
      }
      //显示样式置灰
      if (c.field === 'showStyle' && c.dataItem.published) {
        this.controlAttribute.forEach((f) => {
          if (f.field === 'showStyle') {
            this.$set(f.options, 'selectorDisabled', true);
          }
        });
      }
    });
  }

  deleteTips(attr) {
    this.$emit('transferRemove', attr);
  }

  getAttrValClass(attr) {
    return getAttrValClass(attr, this);
  }

  //判断选人控件未设置根节点
  get orgRootNoLength() {
    if (this.control && this.control.options && this.control.options.orgRoot) {
      return (
        this.control.options.orgRoot === '[]' ||
        !this.control.options.orgRoot.length
      );
    } else {
      return true;
    }
  }
}
</script>

<style lang="less" scoped>
.transferTips {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  background: rgba(255, 251, 230, 0.85);
  border-radius: 4px;
  border: 1px solid #ffe58f;
  color: rgba(17, 18, 24, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  display: inline-block;
  text-align: left;
  margin: 0 30px;
}
.posCls {
  position: absolute;
  right: 8px;
  top: 2px;
}
.elRow {
    display: flex;
    padding-left: 8px;
    border-left: 1px solid #e9e9e9;
    .elColSetUp {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
</style>
