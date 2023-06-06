<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    v-form-validate="{
      trigger: 'validate',
      success: formValidateSuccess,
      error: formValidateError,
    }"
    class="from-attribute-options"
  >
    <a-tabs
      :activeKey="tabKey"
      :class="{
        tabStyle: true,
        tabWithOutModel:
          !(modelBasicAttributeColumns.length > 0) &&
          !(modelAttributeColumns.length > 0) &&
          !(modelRuleColumns.length > 0),
        noCollapse: noCollapse,
      }"
      @change="tabChange"
    >
      <a-tab-pane key="ControlAttribute" tab="控件属性">
        <div
          v-if="
            allControls && allControls.control && tabKey === 'ControlAttribute'
          "
        >
          <a-collapse v-model="activeCollapse">
            <!-- 基础信息 -->
            <a-collapse-panel
              v-show="baseAttributeColumns.length > 0"
              :key="noCollapse ? 'baseDisabled' : 'base'"
              header="基础信息"
              :disabled="noCollapse"
            >
              <FormControlAttribute
                :attrKey="'baseAttributeColumns'"
                :controlAttribute="baseAttributeColumns"
                :controlType="controlType"
                :control="control"
                @transferRemove="transferRemove"
              />
            </a-collapse-panel>
            <!-- 控件属性 -->
            <a-collapse-panel
              v-show="controlAttributeColumns.length > 0"
              :key="noCollapse ? 'controlDisabled' : 'control'"
              header="控件属性"
              :disabled="noCollapse"
            >
              <FormControlAttribute
                ref="FormCtrAttr"
                :attrKey="'controlAttributeColumns'"
                :formData="formData"
                :controlAttribute="controlAttributeColumns"
                :assistAttribute="modelColumnsMerge"
                :control="control"
                type="controlAttribute"
                @transferRemove="transferRemove"
              />
            </a-collapse-panel>

            <!-- 数据规则 -->
            <a-collapse-panel
              v-show="modelColumnsMerge.length > 0"
              :key="noCollapse ? 'rolesDisabled' : 'roles'"
              header="模型属性"
            >
              <FormControlAttribute
                ref="modelDataRule"
                :attrKey="'modelRuleColumns'"
                :formData="formData"
                :controlAttribute="modelColumnsMerge"
                :assistAttribute="controlAttributeColumns"
                :control="control"
              />
            </a-collapse-panel>

            <!-- 控件事件 -->
            <a-collapse-panel
              v-show="scriptAttributeColumns.length > 0"
              :key="noCollapse ? 'eventDisabled' : 'event'"
              header="控件事件"
            >
              <FormControlAttribute
                :attrKey="'scriptAttributeColumns'"
                :controlAttribute="scriptAttributeColumns"
                :control="control"
              />
            </a-collapse-panel>
          </a-collapse>
        </div>
        <div v-else-if="tabKey === 'ControlAttribute'" class="empty-pane">
          <span>请在画布中选择控件</span>
        </div>
      </a-tab-pane>
      <a-tab-pane key="FormAttribute" tab="表单属性" class="tabPaneStyle">
        <FormControlAttribute
          :attrKey="'formColumns'"
          :controlAttribute="formColumns"
        />
        <custom-button-list
          v-if="!(formData && formData.modelType === 'TREE')"
          addviewType="Form"
        />
      </a-tab-pane>
      <!-- <a-tab-pane
        v-if="
          modelBasicAttributeColumns.length > 0 ||
          modelAttributeColumns.length > 0 ||
          modelRuleColumns.length > 0
        "
        key="ModelAttribute"
        tab="模型配置"
      >
        <div>
          <div v-if="modelBasicAttributeColumns.length" class="modelCls">
            <div class="modelTitle">基础属性</div>
            <div class="modelAttr">
              <FormControlAttribute
                ref="modelBasicAttr"
                :attrKey="'modelBasicAttributeColumns'"
                :formData="formData"
                :controlAttribute="modelBasicAttributeColumns"
              />
            </div>
          </div>
          <div v-if="modelAttributeColumns.length" class="modelCls">
            <div class="modelTitle">数据项属性</div>
            <div class="modelAttr">
              <FormControlAttribute
                ref="modelDataAttr"
                :attrKey="'modelAttributeColumns'"
                :formData="formData"
                :controlAttribute="modelAttributeColumns"
                :assistAttribute="controlAttributeColumns"
                :control="control"
                @optionTypeChange="optionTypeChange"
              />
            </div>
          </div>
          <div v-if="modelRuleColumns.length" class="modelCls">
            <div class="modelTitle">数据项规则</div>
            <div class="modelAttr">
              <FormControlAttribute
                ref="modelDataRule"
                :attrKey="'modelRuleColumns'"
                :formData="formData"
                :controlAttribute="modelRuleColumns"
                :assistAttribute="controlAttributeColumns"
              />
            </div>
          </div>
        </div>
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>
<script lang="ts">
import { buildControlOptions } from '@/components/apps/form-design/typings/control-factory';
import { formDirective } from '@/directives/form-validate';
import FormValidateHandleMixin from '@/minxins/form-validate-handle';
import { Collapse, Tabs,Row,
  Col, } from '@h3/antd-vue';
import {
  commonBaseAttributeListMap,
  controlAttributeListMap,
} from 'cloudpivot/form/src/schema/control-attribute-transfer';
import {
  CompareVersion,
  getComponentByControlType,
} from 'cloudpivot/form/utils';
import cloneDeep from 'lodash/cloneDeep';
import { mixins } from 'vue-class-component';
import { Component, Prop, Provide, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { FormControlType } from '../typings';
import * as ControlFactory from '../typings/control-factory';
import FormControlAttribute from './form-attribute-control.vue';
import ControlAttributeMap, {
  baseAttributeMapOptionsExtend,
  ControlCNNameType,
  formAttributeMap,
  ScriptsType,
} from './typings/control-attribute-map';
import ControlAttributeMapOptions from './typings/control-attribute-map-type';
import {
  ControlAttributeOptions,
  ControlAttributeType,
} from './typings/form-attribute';
import CustomButtonList from '@/components/apps/customButton/custom-button-list.vue';
import { DataType, ObjectPropertyInfo } from "cloudpivot/form/typings";
import { EventBus } from 'cloudpivot/form/src/schema/event-bus';

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'form-attribute',
  components: {
    FormControlAttribute,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    CustomButtonList,
    ARow: Row,
    ACol: Col,
  },
  directives: {
    'form-validate': formDirective,
  },
})
export default class FormAttribute extends mixins(FormValidateHandleMixin) {
  tabKey: any = 'ControlAttribute'; // 默认tab显示a

  activeCollapse: any[] = [
    'base',
    'control',
    'event',
    'roles',
    'baseDisabled',
    'controlDisabled',
    'eventDisabled',
    'rolesDisabled',
  ]; // 默认打开的<a-collapse-panel>

  controlType: number = -1; // 当前控件类型

  controlKey: string = ''; // 当前控件ID

  parentKey: string = ''; // 当前控件父ID

  summary: any = {}; // 摘要

  formColumns: any = []; // 表单属性栏

  baseAttributeColumns: any = []; // 基础属性栏

  controlAttributeColumns: any = []; // 控件属性栏

  scriptAttributeColumns: any = []; // 事件属性栏

  attributeColumns: any = []; // 属性栏

  modelBasicAttributeColumns: any = []; // 模型基础属性栏

  modelAttributeColumns: any = []; // 模型属性栏

  modelRuleColumns: any = []; // 模型规则栏

  modelColumnsMerge: any = []; //原模型规则合模型属性合并

  optionTypeChange(type) {
    console.log(9998);
    this.$emit('optionTypeChange', type);
  }

  @Prop() formData!: any;

  @Prop({ default: () => ({}) }) allControls!: any;

  // 获取摘要的信息
  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCode: any;

  @DataModelModule.Mutation('setBizSheetCode') setBizSheetCode: any;

  @DataModelModule.State('summaryList') summaryList: any;

  @DataModelModule.Action('getDataItemList') getDataItemList: any;

  @DataModelModule.Action('getSummary') getSummary: any;

  @DataModelModule.Mutation('setSummary') setSummary: any;

  @DataModelModule.State('defaultSummary') defaultSummary: any;

  @DataModelModule.Action('submitSummary') submitSummary: any;

  @DataModelModule.State('dataItemList') dataItemList: any;

  @DataModelModule.Mutation('setDataItemTypeList') setDataItemTypeList: any;

  @DataModelModule.State('formRuleList') formRuleList: any;

  @DataModelModule.State('formSystemVersion') formSystemVersion: any;

  get getSummaryOptions(): any {
    const summaryOptions: any = { list: [], mode: 'tags' };
    this.summaryList.forEach((val: any) => {
      summaryOptions.list.push({ label: val.name, value: val.code });
    });
    return summaryOptions;
  }

  get controlPath() {
    const c = this.allControls.control;
    if (c && c.path) {
      return c.path;
    }
  }

  get version() {
    return this.$store.state.config.systemVersion;
  }

  get controlCode() {
    const c = this.allControls.control;
    if (c && c.key) {
      return c.key;
    }
  }

  get controlName() {
    const c = this.allControls.control;
    if (c && c.options && c.options.name) {
      return c.options.name;
    }
  }

  @Watch('summaryList')
  watchSummaryList() {
    this.setSummaryAttribute();
  }

  @Watch('defaultSummary')
  watchDefaultSummary() {
    this.setSummaryAttribute();
  }

  @Watch('allControls', {
    immediate: true,
  })
  watchAllControls(allControls: any) {
    if (!allControls || !allControls.control) {
      this.tabKey = 'FormAttribute';
    } else {
      // todo： 这个方法是过度方法，处理部分历史遗留数据的， 需要在运行一段时间知后删除
      allControls.control = this.translatrRowsToString(allControls.control);
      if (allControls.isSeletedControl) {
        this.tabKey = 'ControlAttribute';
      }
      this.controlKey = allControls.control.key;
      this.controlType = allControls.control.type;
      this.parentKey = allControls.control.parentKey;
      // this.$nextTick(() => {
      this.baseAttributeColumns = [];
      this.controlAttributeColumns = [];
      this.scriptAttributeColumns = [];
      this.modelAttributeColumns = [];
      this.modelRuleColumns = [];
      this.setAttribute(allControls);
      // });
    }
  }

  /**
   * @desc 子表的默认行属性为0时，一直提示不能为空，当row必须为string才不会报错
   */
  translatrRowsToString(control) {
    const { type } = control;
    let rows = undefined;
    if (control.options) {
      rows = control.options.rows;
    }
    if (type !== 201) {
      return control;
    }
    rows = typeof rows === 'string' ? rows : `${rows}`;
    control.options = { ...control.options, rows };
    return control;
  }

  @Watch('formData')
  watchFormData(formData: any) {
    //this.getDataItemList();
    this.$nextTick(() => {
      if (!formData.name) {
        return;
      }
      const lang: string = localStorage.getItem('locale') || '';

      this.formColumns = [];
      const code = Object.assign({}, formAttributeMap.code, {
        field: 'code',
        value: formData.code,
      });

      let formName = formData.name;

      if (formData.name_i18n) {
        const locales = JSON.parse(formData.name_i18n);
        if (locales[this.$i18n.locale]) {
          formName = locales[this.$i18n.locale];
        }
      }

      // console.log(formAttributeMap)
      // 表单项赋值
      const formTrack = Object.assign({}, formAttributeMap.formTrack, {
        field: 'formTrack', // ? 含义
        value: formData.formTrack ? !!formData.formTrack : false,
      });

      // // 表单数值
      const trackDataCodes = Object.assign(
        {},
        formAttributeMap.trackDataCodes,
        {
          field: 'trackDataCodes', // ? 含义
          value: formData.trackDataCodes || '',
        },
      );

      const name = Object.assign({}, formAttributeMap.name, {
        field: 'name',
        value: formName,
      });

      const externalLink = Object.assign(
        {},
        formAttributeMap.externalLinkAble,
        {
          field: 'externalLinkAble',
          value: formData.externalLinkAble || false,
        },
      );

      const qrCode = Object.assign({}, formAttributeMap.qrCodeAble, {
        field: 'qrCodeAble',
        value: formData.qrCodeAble ? formData.qrCodeAble : 'open',
      });

      const shortCode = Object.assign({}, formAttributeMap.shortCode, {
        field: 'shortCode',
        value: formData.shortCode || '',
      });

      const print = Object.assign({}, formAttributeMap.print, {
        field: 'print',
        value: !!formData.settingPrint || false,
      });

      const pdfAble = Object.assign({}, formAttributeMap.pdfAble, {
        field: 'pdfAble',
        value: formData.pdfAble ? formData.pdfAble : 'false',
      });

      const layoutType = Object.assign({}, formAttributeMap.layoutType, {
        field: 'layoutType',
        value: formData.layoutType ? formData.layoutType : 'horizontal',
      });

      const borderMode = Object.assign({}, formAttributeMap.borderMode, {
        field: 'borderMode',
        value: formData.borderMode ? formData.borderMode : 'close',
      });
      const formComment = Object.assign({}, formAttributeMap.formComment, {
        field: 'formComment',
        value: formData.formComment ? !!formData.formComment : false,
      });

      const formFramework = Object.assign({}, formAttributeMap.formFramework, {
        field: 'formFramework',
        value: formData.formFramework ? formData.formFramework : 5,
      });

      const { schemaCode } = formData;
      const formId = Object.assign({}, formAttributeMap.id, {
        field: 'sheetData',
        value: {
          id: formData.id,
          schemaCode,
          shortCode: formData.shortCode,
          code: formData.code,
          printTemplateJson: formData.printTemplateJson,
          name: formData.name,
          sheetType: formData.sheetType,
          // 传递
          trackDataCodes: formData.trackDataCodes,
        },
      });

      // if ()
      this.formColumns.push(...[code, name]);
      this.formColumns.push(
        this.summary,
        externalLink,
        qrCode,
        formId,
        shortCode,
        pdfAble,
        print,
        layoutType,
        borderMode,
        formComment,
        formTrack,
        trackDataCodes,
        formFramework,
      );

      // 设置隐藏字段
      let displayFied: string[] = [];
      this.formColumns.forEach((res: any) => {
        if (res.options && res.options.hideField) {
          displayFied = displayFied.concat(res.options.hideField);
        }
      });

      displayFied.forEach((res: any) => {
        const field: any = this.formColumns.find((attr: any) => {
          return attr.field === res;
        });
        if (field) {
          field.display = false;
        }
      });
    });

    // 监控表单的属性
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.watchFormData(this.formData);
  }

  /**
   * 设置摘要属性
   * */
  setSummaryAttribute() {
    if (this.defaultSummary.length || this.summaryList.length) {
      this.summary = Object.assign(this.summary, {
        field: 'summary',
        value: this.defaultSummary,
        options: this.getSummaryOptions,
      });
      this.watchFormData(this.formData);
    }
  }

  control: any = {};

  /**
   * 设置属性栏值
   * @param allControls     控件属性
   */
  setAttribute(allControls: any) {
    const control: any = allControls.control as any;
    this.control = control;
    const tmpOptions: any = control.options as any;
    
    const componentAsset_copy: any = getComponentByControlType(+control.type);
    //const componentAsset: any = getComponentByControlType(+control.type);

    if(componentAsset_copy.info.type === "departmentSelector"){
      if(allControls.control.key === "account"){
        let index  = componentAsset_copy.conduct.groups.controller.keys.indexOf('hasLeaf');
        if(index < 0){
          componentAsset_copy.conduct.groups.controller.keys.push('hasLeaf');
          componentAsset_copy.schema.properties.hasLeaf = {
            type: DataType.Boolean,
            title: "是否为子叶节点",
            default: false,
          };
        }
      }else{
        let index  = componentAsset_copy.conduct.groups.controller.keys.indexOf('hasLeaf');
        if(index > -1){
          componentAsset_copy.conduct.groups.controller.keys.splice(index, 1);
          delete componentAsset_copy.schema.properties.hasLeaf; 
        }
      }
      //componentAsset_copy.conduct.groups.controller.keys
      
    }
    const componentAsset: any = componentAsset_copy;

  
    let groups = JSON.parse(JSON.stringify(componentAsset.conduct.groups));
    const type: string = (() => {
      let tmpType = control.type;
      if (tmpType >= 50 && tmpType < 70) {
        tmpType = 50;
      }
      return tmpType.toString();
    })();

    let name = tmpOptions.name;

    if (tmpOptions.name_i18n) {
      const locales = tmpOptions.name_i18n; //JSON.parse(tmpOptions.name_i18n);
      const locale = this.$i18n.locale;
      if (locales[locale]) {
        name = locales[locale];
      }
    }

    let options: any = typeof name === 'string' ? { name: name } : {};

    const { dataItem, initSpanValue } = allControls;
    console.log(allControls, 'allControls');
    if (dataItem) {
      options = Object.assign(options, {
        dataItemName: dataItem.code,
        // widgetType: control.type
      });
    }

    options = Object.assign({ defaultValue: '' }, tmpOptions, options);
    if (dataItem) {
      //若数据模型中勾选了不允许为空，则此字段在表单中必填，requiredFormula设置为true
      if (!options.requiredFormula) {
        options.requiredFormula = dataItem.propertyEmpty ? 'true' : '';
      }
      if ((dataItem.type === 9 || dataItem.type === 11) && !options.queryCode) {
        //关联单选或者关联多选时，数据模型中保存的查询列表数据保存在options，需特殊处理解析出来渲染值
        const option = dataItem.options ? JSON.parse(dataItem.options) : '';
        options.queryCode = option ? option.queryCode : '';
      }
    }

    if (control.width !== undefined) {
      const sheetAsset: any = getComponentByControlType(FormControlType.Sheet);
      componentAsset.schema.properties.width =
        sheetAsset.schema.properties.width; // 如果是子表内的控件,可以设置列宽
      componentAsset.conduct.properties.width =
        sheetAsset.conduct.properties.width; // 如果是子表内的控件,可以设置列宽
      groups.base.keys = [...groups.base.keys, 'width'];
      options.width = control.width === null ? '' : control.width.toString();
    }
    const calcValue = (key, opt, pros) =>
      opt[key] || typeof opt[key] === 'boolean'
        ? opt[key]
        : pros[key] && pros[key].value !== undefined
        ? pros[key].value
        : opt[key];
    if (componentAsset) {
      const { conduct, schema } = componentAsset;
      // let { properties } = conduct;
      const properties: any = conduct.properties;
      for (const attributeKey of Object.keys(groups)) {
        const attribute = groups[attributeKey];
        const attributeColumns: any = [];
        const transferAttributeColumns: any = [];
        const transferRuleColumns: any = [];
        const transferBasicAttributeColumns: any = [];
        for (const key of attribute.keys) {
          let attributeOptions: any;
          let _options = {};
          if (properties && properties[key]) {
            _options = properties[key].options
              ? { ...properties[key].options }
              : {};
            if (properties[key].inputMethod) {
              switch (properties[key].inputMethod) {
                case ControlAttributeType.Modal:
                  attributeOptions = {
                    ...properties[key],
                    modalField: key,
                    ...ControlAttributeMapOptions(
                      ControlAttributeType.Modal,
                      '_',
                    ),
                  };
                  // 将 conduct定义的 数据传递给 modal框
                  const modalOptions = Object.keys(properties[key]).filter(
                    (k) =>
                      !['inputMethod', 'inputComponent', 'options'].includes(k),
                  );
                  if (modalOptions && modalOptions.length) {
                    attributeOptions['modalOptions'] = {};
                    for (const k of modalOptions) {
                      attributeOptions['modalOptions'][k] = properties[key][k];
                    }
                  }
                  break;
                case ControlAttributeType.Dropdown:
                  attributeOptions = {
                    inputMethod: properties[key].inputMethod,
                  };
                  if (properties[key].options && properties[key].options.list) {
                    if (typeof properties[key].options.list === 'function') {
                      if (dataItem) {
                        _options['list'] = properties[key].options.list(
                          dataItem.type,
                          dataItem,
                          control,
                        );
                      } else {
                        _options['list'] =
                          properties[key].options.list(control);
                      }
                    }
                  } else {
                    if (!properties[key].options.dataList) {
                      console.error(
                        `下拉框属性,必须在options设置 list 或 dataList!`,
                      );
                    }
                  }
                  break;
                case ControlAttributeType.SelectTree:
                case ControlAttributeType.Tree:
                  attributeOptions = {
                    ...properties[key],
                    ...ControlAttributeMapOptions(
                      properties[key].inputMethod ||
                        schema.properties[key].type,
                      null,
                    ),
                  };
                  break;
                default:
                  break;
              }
            } else {
              attributeOptions = ControlAttributeMapOptions(
                properties[key].inputMethod || schema.properties[key].type,
                null,
              );
            }
            const _val = calcValue(key, options, properties);
            const cOptions = Object.assign({}, attributeOptions, _options);
            const controlAttribute = Object.assign(
              {},
              schema.properties[key],
              {
                label: schema.properties[key].title,
                type: schema.properties[key].type,
                tip: schema.properties[key].tip,
              },
              { options: cOptions },
              { value: _val, field: key },
            );
            if (dataItem) {
              controlAttribute.dataItem = dataItem;
              if (key === 'schemaCode' || key === 'dataItemName') {
                if (!controlAttribute.options) {
                  controlAttribute.options = {};
                }
                controlAttribute.options.disabled = dataItem.published;
              }
            }
            // 关联查询用于区分是关联单选还是关联多选
            if (key === 'relativeType') {
              controlAttribute.display = false;
            }
            attributeColumns.push(controlAttribute);
          } else {
            const controlAttribute: any = Object.assign(
              {},
              { value: options[key], field: key, options: {} },
              {
                label: schema.properties[key].title,
                type: schema.properties[key].type,
                tip: schema.properties[key].tip,
              },
            );
            if (dataItem) {
              controlAttribute.dataItem = dataItem;
              if (key === 'schemaCode' || key === 'dataItemName') {
                if (!controlAttribute.options) {
                  controlAttribute.options = {};
                }
                controlAttribute.options.disabled = dataItem.published;
              }
            }
            attributeColumns.push(controlAttribute);
          }
        }
        const copy = cloneDeep(controlAttributeListMap);
        const transferAttributesArr: any[] = copy[control.type];
        if (Array.isArray(transferAttributesArr)) {
          for (const key of transferAttributesArr.map((item) => item.key)) {
            let attributeOptions: any;
            let _options = {};
            if (properties && properties[key]) {
              _options = properties[key].options
                ? { ...properties[key].options }
                : {};
              if (properties[key].inputMethod) {
                switch (properties[key].inputMethod) {
                  case ControlAttributeType.Modal:
                    attributeOptions = {
                      ...properties[key],
                      modalField: key,
                      ...ControlAttributeMapOptions(
                        ControlAttributeType.Modal,
                        '_',
                      ),
                    };
                    // 将 conduct定义的 数据传递给 modal框
                    const modalOptions = Object.keys(properties[key]).filter(
                      (k) =>
                        !['inputMethod', 'inputComponent', 'options'].includes(
                          k,
                        ),
                    );
                    if (modalOptions && modalOptions.length) {
                      attributeOptions['modalOptions'] = {};
                      for (const k of modalOptions) {
                        attributeOptions['modalOptions'][k] =
                          properties[key][k];
                      }
                    }
                    break;
                  case ControlAttributeType.Dropdown:
                    attributeOptions = {
                      inputMethod: properties[key].inputMethod,
                    };
                    if (
                      properties[key].options &&
                      properties[key].options.list
                    ) {
                      if (typeof properties[key].options.list === 'function') {
                        if (dataItem) {
                          _options['list'] = properties[key].options.list(
                            dataItem.type,
                            dataItem,
                            control,
                          );
                        } else {
                          _options['list'] =
                            properties[key].options.list(control);
                        }
                      }
                    } else {
                      if (!properties[key].options.dataList) {
                        console.error(
                          `下拉框属性,必须在options设置 list 或 dataList!`,
                        );
                      }
                    }
                    break;
                  case ControlAttributeType.SelectTree:
                  case ControlAttributeType.Tree:
                    attributeOptions = {
                      ...properties[key],
                      ...ControlAttributeMapOptions(
                        properties[key].inputMethod ||
                          schema.properties[key].type,
                        null,
                      ),
                    };
                    break;
                  default:
                    break;
                }
              } else {
                attributeOptions = ControlAttributeMapOptions(
                  properties[key].inputMethod || schema.properties[key].type,
                  null,
                );
              }
              const _val = calcValue(key, options, properties);
              const cOptions = Object.assign({}, attributeOptions, _options);
              const controlAttribute = Object.assign(
                {},
                schema.properties[key],
                {
                  label: schema.properties[key].title,
                  type: schema.properties[key].type,
                },
                { options: cOptions },
                { value: _val, field: key },
              );
              if (dataItem) {
                controlAttribute.dataItem = dataItem;
                if (key === 'schemaCode' || key === 'dataItemName') {
                  if (!controlAttribute.options) {
                    controlAttribute.options = {};
                  }
                  controlAttribute.options.disabled = dataItem.published;
                }
              }
              const mapItem: any = transferAttributesArr.find(
                (x) => x.key === controlAttribute.field,
              );
              if (mapItem) {
                if (mapItem.isRuleAttribute === 0) {
                  transferBasicAttributeColumns.push(controlAttribute);
                } else if (mapItem.isRuleAttribute === 1) {
                  transferRuleColumns.push(controlAttribute);
                } else {
                  transferAttributeColumns.push(controlAttribute);
                }
              }
            } else {
              const controlAttribute: any = Object.assign(
                {},
                { value: options[key], field: key, options: {} },
                {
                  label: schema.properties[key].title,
                  type: schema.properties[key].type,
                },
              );
              if (dataItem) {
                controlAttribute.dataItem = dataItem;
                if (key === 'schemaCode' || key === 'dataItemName') {
                  if (!controlAttribute.options) {
                    controlAttribute.options = {};
                  }
                  controlAttribute.options.disabled = dataItem.published;
                }
              }
              const mapItem: any = transferAttributesArr.find(
                (x) => x.key === controlAttribute.field,
              );
              if (mapItem) {
                if (mapItem.isRuleAttribute === 0) {
                  transferBasicAttributeColumns.push(controlAttribute);
                } else if (mapItem.isRuleAttribute === 1) {
                  transferRuleColumns.push(controlAttribute);
                } else {
                  transferAttributeColumns.push(controlAttribute);
                }
              }
            }
          }
        }
        switch (attributeKey) {
          case 'base':
            this.baseAttributeColumns = [...attributeColumns];
            console.log(
              '当前系统版本:',
              this.version,
              '当前表单版本:',
              this.formSystemVersion,
            );
            if (CompareVersion(this.version, this.formSystemVersion) === 1) {
              const transferBaseAttributeArr: any[] =
                commonBaseAttributeListMap[type];
              const historyOpArr: any[] = this.getOpRecord();
              console.log(
                '当前base:',
                transferBaseAttributeArr,
                '当前的historyOpArr',
                historyOpArr,
              );
              if (Array.isArray(historyOpArr) && historyOpArr.length > 0) {
                historyOpArr.forEach((item) => {
                  let findIndex: number = -1;
                  const findItem: any = transferBaseAttributeArr.find(
                    (x: any, iIndex: number) => {
                      if (x.key === item) {
                        findIndex = iIndex;
                        return true;
                      } else {
                        return false;
                      }
                    },
                  );
                  if (findItem) {
                    // 对列表顺序调整
                    transferBaseAttributeArr.forEach((x) => {
                      if (x.index > findItem.index) {
                        x.index--;
                      }
                    });
                    transferBaseAttributeArr.splice(findIndex, 1);
                  }
                });
              }
              if (
                Array.isArray(transferBaseAttributeArr) &&
                transferBaseAttributeArr.length > 0
              ) {
                transferBaseAttributeArr.sort(
                  (a: any, b: any) => a.index - b.index,
                );
                let seriesNum: number = 1;
                let index: number = 0;
                let startIndex: number = 0;
                transferBaseAttributeArr.forEach((item, i) => {
                  if (i === 0) {
                    index = item.index;
                    startIndex = i;
                    transferBaseAttributeArr[startIndex].seriesNum = seriesNum;
                    transferBaseAttributeArr[startIndex].removeNames =
                      item.label;
                    transferBaseAttributeArr[startIndex].group = item.key;
                  } else {
                    if (item.index === index + 1) {
                      seriesNum += 1;
                      index += 1;
                      transferBaseAttributeArr[startIndex].seriesNum =
                        seriesNum;
                      transferBaseAttributeArr[startIndex].removeNames +=
                        ',' + item.label;
                      item.group = transferBaseAttributeArr[startIndex].key;
                    } else {
                      index = item.index;
                      seriesNum = 1;
                      startIndex = i;
                      transferBaseAttributeArr[startIndex].seriesNum =
                        seriesNum;
                      transferBaseAttributeArr[startIndex].removeNames =
                        item.label;
                      transferBaseAttributeArr[startIndex].group = item.key;
                    }
                  }
                });
                transferBaseAttributeArr.forEach((item) => {
                  // this.baseAttributeColumns.splice(item.index, 0, item);
                });
              }
            }
            break;
          case 'controller':
            console.log('--------controlller', attributeColumns);
            this.controlAttributeColumns = [...attributeColumns];
            this.modelAttributeColumns = [...transferAttributeColumns];
            this.modelRuleColumns = [...transferRuleColumns];
            this.modelBasicAttributeColumns = [
              ...transferBasicAttributeColumns,
            ];
            console.log(
              '当前系统版本:',
              this.version,
              '当前表单版本:',
              this.formSystemVersion,
            );
            // 当前表单的版本号与系统的版本号比较
            if (CompareVersion(this.version, this.formSystemVersion) === 1) {
              // 看本地是否已经有操作历史记录， 如果有的话，不需要再做提示， 需要过滤掉
              let transferAttributesArrAdjust: any = [];
              if (transferAttributesArr && transferAttributesArr.length > 0) {
                transferAttributesArrAdjust = transferAttributesArr
                  .filter((x) => x.isRuleAttribute)
                  .filter((x) => !x.isNotShowHis);
              }
              const historyOpArr: any[] = this.getOpRecord();
              historyOpArr.forEach((item) => {
                let findIndex: number = -1;
                const findItem: any = transferAttributesArrAdjust.find(
                  (x: any, iIndex: number) => {
                    if (x.key === item) {
                      findIndex = iIndex;
                      return true;
                    } else {
                      return false;
                    }
                  },
                );
                if (findItem) {
                  // 对列表顺序调整
                  transferAttributesArrAdjust.forEach((x) => {
                    if (x.index > findItem.index) {
                      x.index--;
                    }
                  });
                  transferAttributesArrAdjust.splice(findIndex, 1);
                }
              });
              transferAttributesArrAdjust.sort(
                (a: any, b: any) => a.index - b.index,
              );
              let seriesNum: number = 1;
              let index: number = 0;
              let startIndex: number = 0;
              transferAttributesArrAdjust.forEach((item, i) => {
                if (i === 0) {
                  index = item.index;
                  startIndex = i;
                  transferAttributesArrAdjust[startIndex].seriesNum = seriesNum;
                  transferAttributesArrAdjust[startIndex].removeNames =
                    item.label;
                  transferAttributesArrAdjust[startIndex].group = item.key;
                } else {
                  if (item.index === index + 1) {
                    seriesNum += 1;
                    index += 1;
                    transferAttributesArrAdjust[startIndex].seriesNum =
                      seriesNum;
                    transferAttributesArrAdjust[startIndex].removeNames +=
                      ',' + item.label;
                    item.group = transferAttributesArrAdjust[startIndex].key;
                  } else {
                    index = item.index;
                    seriesNum = 1;
                    startIndex = i;
                    transferAttributesArrAdjust[startIndex].seriesNum =
                      seriesNum;
                    transferAttributesArrAdjust[startIndex].removeNames =
                      item.label;
                    transferAttributesArrAdjust[startIndex].group = item.key;
                  }
                }
              });
              transferAttributesArrAdjust.forEach((item) => {
                // this.controlAttributeColumns.splice(item.index, 0, item);
              });
            }
            console.log(
              transferBasicAttributeColumns,
              '--------------------------TRANSFER',
            );
            //设置为必填；“是否只读”默认为“false”，且置灰不可修改
            for (const attribute of this.controlAttributeColumns) {
              const modelRule = this.modelRuleColumns.find(
                (modelRuleColumnsItem) => {
                  if (modelRuleColumnsItem.dataItem && attribute.dataItem) {
                    return (
                      modelRuleColumnsItem.dataItem.code ===
                        attribute.dataItem.code &&
                      modelRuleColumnsItem.field === 'requiredFormula'
                    );
                  }
                },
              );
              if (
                modelRule &&
                modelRule.value === 'true' &&
                attribute.field === 'readonlyFormula'
              ) {
                attribute.options.disabled = true;
              }
              if (
                !control.options.span &&
                initSpanValue &&
                attribute.field === 'span'
              ) {
                attribute.value = initSpanValue;
              }
            }

            for (const attribute of this.modelBasicAttributeColumns) {
              if (
                attribute.field === 'dataItemName' &&
                attribute.value === 'parentId'
              ) {
                attribute.options.disabled = true;
                this.controlAttributeColumns =
                  this.controlAttributeColumns.filter((item: any) => {
                    return !['isAuthorize', 'defaultVal', 'isScan'].includes(
                      item.field,
                    );
                  });
                this.modelAttributeColumns = this.modelAttributeColumns.filter(
                  (item: any) => {
                    if (item.field === 'showStyle') {
                      item.options.selectorDisabled = true;
                      item.value = 'tree';
                    }
                    if (item.field === 'schemaCode') {
                      item.options.disabled = true;
                    }
                    return ![
                      'queryCode',
                      'mappings',
                      'searchFormula',
                      'conditions',
                      'linkMode',
                    ].includes(item.field);
                  },
                );
                this.modelRuleColumns = this.modelRuleColumns.filter(
                  (item: any) => {
                    return !['requiredFormula'].includes(item.field);
                  },
                );
                break;
              }
            }

            this.modelColumnsMerge = this.getModelColumnsMerge();
            break;
          case 'scripts':
            this.scriptAttributeColumns = [...attributeColumns];
            break;
          default:
            console.error(
              '组件conduct.group 的key 应该是 base、controller、scripts',
            );
        }
      }
      this.fieldsOptionsHandle();
    } else {
      if (options) {
        for (const field in options) {
          if (options.hasOwnProperty(field)) {
            const key = field as any;
            const controlOptions: any = ControlAttributeMap.Map[type];
            let attributeOptions: any;
            if (controlOptions && controlOptions[key]) {
              attributeOptions = ControlAttributeMapOptions(
                controlOptions[key].type,
                controlOptions[key].attrType,
              );
            }
            if (ControlAttributeMap.BaseMap[key]) {
              // const baseAttributeExtend: any = baseAttributeMapOptionsExtend[type];
              let baseAttributeExtend: any;
              if (dataItem && dataItem.type === 1) {
                baseAttributeExtend = baseAttributeMapOptionsExtend['2'];
              } else {
                baseAttributeExtend = baseAttributeMapOptionsExtend[type];
              }
              let cOptions: any;
              let extendOptions: any;

              if (baseAttributeExtend && baseAttributeExtend[key]) {
                extendOptions = ControlAttributeMapOptions(
                  baseAttributeExtend[key].type,
                  baseAttributeExtend[key].attrType,
                );
              } else {
                cOptions = Object.assign(
                  {},
                  attributeOptions,
                  ControlAttributeMap.BaseMap[key].options,
                );
              }

              const baseAttribute: any = Object.assign(
                {},
                ControlAttributeMap.BaseMap[key],
                { options: cOptions || extendOptions },
                baseAttributeExtend ? baseAttributeExtend[key] : {},
                { value: options[key], field: key },
              );

              if (
                key === 'widgetType' &&
                baseAttribute.type === ControlAttributeType.String
              ) {
                baseAttribute.value = ControlCNNameType[baseAttribute.value];
              }

              if (key === 'width') {
                const min = ControlFactory.getSheetColumnWidth(control.type);
                const typeOther = 'min';
                const newReg = {
                  typeOther,
                  regexp: (value: string) => parseFloat(value) >= min,
                  message: `不能小于最小宽度${min}`,
                };
                const regexps = baseAttribute.options.regexps.regexps;
                const idx = regexps.findIndex((r: any) => r.type === typeOther);
                if (idx > -1) {
                  regexps.splice(idx, 1, newReg);
                } else {
                  regexps.push(newReg);
                }
              }

              this.baseAttributeColumns.push(baseAttribute);
            } else if (controlOptions && controlOptions[key]) {
              const cOptions = Object.assign(
                {},
                attributeOptions,
                controlOptions[key].options,
              );
              const controlAttribute = Object.assign(
                {},
                controlOptions[key],
                { options: cOptions },
                { value: options[key], field: key },
              );
              if (dataItem) {
                controlAttribute.dataItem = dataItem;
                if (key === 'schemaCode' || key === 'dataItemName') {
                  if (!controlAttribute.options) {
                    controlAttribute.options = {};
                  }
                  controlAttribute.options.disabled = dataItem.published;
                }
              }

              const isScript: any = ScriptsType[key];
              if (isScript) {
                this.scriptAttributeColumns.push(controlAttribute);
              } else {
                this.controlAttributeColumns.push(controlAttribute);
              }
            } else {
              //Else Empty block statement
            }
          }
        }
        this.fieldsOptionsHandle();
      }
    }
  }

  /**
   * 获取隐藏字段数组
   * @param attr     控件属性
   */
  getHideFields(attr: ControlAttributeOptions) {
    let displayFields: string[] = [];
    if (attr.options) {
      // bool类型的
      if (attr.options.fieldDisplay instanceof Array) {
        displayFields = displayFields.concat(
          attr.value
            ? attr.options.fieldDisplay[0]
            : attr.options.fieldDisplay[1],
        );
      }
      if (attr.options.hideField) {
        // 通用隐藏方法
        const hideFields: Function | string[] = attr.options.hideField;
        displayFields = displayFields.concat(
          hideFields instanceof Function
            ? hideFields(attr.value)
            : hideFields || [],
        );
      }
      if (attr.options.transaction) {
        attr.options.transaction({
          attr,
          attrs: this.controlAttributeColumns,
          displayFields,
          allControls: this.allControls,
        });
      }
    }
    return displayFields;
  }

  /**
   *  显示字段的过滤
   */
  fieldsOptionsHandle() {
    let displayFields: string[] = [];
    [
      ...this.baseAttributeColumns,
      ...this.controlAttributeColumns,
      ...this.scriptAttributeColumns,
      // ...this.formColumns
    ].forEach((attr: any) => {
      displayFields = displayFields.concat(this.getHideFields(attr));
    });

    displayFields = [...new Set(displayFields)];

    displayFields.forEach((field: string) => {
      this.controlAttributeColumns.find((attr: any) => {
        if (attr.field === field) {
          if (!attr.options) {
            attr.options = {};
          }
          attr.display = false;
        }
        return attr.field === field;
      });
    });
  }

  // 页签切换
  tabChange(tabKey: any) {
    if (
      this.controlType === FormControlType.Label ||
      this.controlType === FormControlType.Group ||
      this.controlType === FormControlType.Title ||
      this.controlType === FormControlType.Description ||
      this.controlType === FormControlType.Html ||
      this.controlType === FormControlType.Tabs ||
      this.controlType === FormControlType.TabsPanel
    ) {
      if (tabKey === 'ModelAttribute') {
        this.$message.info('此控件无需在模型中配置数据项属性');
        return;
      }
    }
    this.tabKey = tabKey;
  }

  @Watch('tabKey')
  onTabKeyChange() {
    // 发一个事件：改变key,用于h3-editor的刷新
    EventBus.$emit('changeKey', {});
  }

  // 判断控件属性中是否有任何属性
  get isBaseAttrEmpty() {
    if (
      this.baseAttributeColumns.length > 0 ||
      this.controlAttributeColumns.length > 0 ||
      this.modelAttributeColumns.length > 0 ||
      this.modelRuleColumns.length > 0
    ) {
      return false;
    }
    return true;
  }

  /**
   * type的回填
   * @param type
   */
  typeAttributeBackfill(type: number) {
    this.$emit(
      'control-update',
      this.controlKey,
      {
        type: Number(type),
      },
      this.parentKey,
      this.controlPath,
    );
  }

  /**
   * width的回填
   * @param type
   */
  widthAttributeBackfill(width: number | null) {
    this.$emit(
      'control-update',
      this.controlKey,
      {
        width,
      },
      this.parentKey,
      this.controlPath,
    );
  }

  /**
   *options的回填
   * @param key
   * @param field
   * @param value
   */
  optionsAttributeBackfill(key: string, field: string, value: any) {
    const options: any = {};
    let attr: any = (this as any)[key].find(
      (item: any) => item.field === field,
    );
    if (
      (['modelRuleColumns', 'modelAttributeColumns'].includes(key) &&
        field === 'defaultValue') ||
      this.isRelativeModelAttr(field)
    ) {
      attr = (this as any)['controlAttributeColumns'].find(
        (item: any) => item.field === field,
      );
    }
    // 关联表单显示字段同步到stroe
    if (
      (attr && attr.dataItem && attr.dataItem.type === 9) ||
      (attr.dataItem && attr.dataItem.type === 11)
    ) {
      this.dataItemList.forEach((data: any, index: number) => {
        if (attr.dataItem.parentCode) {
          const sheetData = this.dataItemList[index].children;
          if (sheetData) {
            sheetData.map((d: any, i: number) => {
              if (d.code === attr.dataItem.code) {
                if (field === 'displayField') {
                  this.dataItemList[index].children[i].relativePropertyCode =
                    value;
                }
              }
            });
          }
        } else if (data.code === attr.dataItem.code) {
          if (field === 'displayField') {
            this.dataItemList[index].relativePropertyCode = value;
          }
        } else {
          //Else Empty block statement
        }
      });
      this.setDataItemTypeList(this.dataItemList);
    }

    options[field] = value;
    attr.value = value;
    if (field === 'regexpText') {
      const val = JSON.parse(value);
      if (val.en === '' && val.zh === '') {
        options[field] = '';
        attr.value = '';
      }
    }

    const displayFields: string[] = this.getHideFields(attr);
    if (displayFields.length) {
      displayFields.forEach((item: string) => {
        options[item] = buildControlOptions(this.allControls.control.type)[
          item
        ];
      });
    }
    if (key === 'modelColumnsMerge') {
      this.$emit('modelAttrRule-update', {
        type: this.getMergeBeforeKey(field),
        key: this.controlKey,
        parentKey: this.parentKey ? this.parentKey : '',
        field,
        value,
        modelAttributeColumns: this['modelAttributeColumns'] || [],
      });
    } else if (key === 'modelAttributeColumns' || key === 'modelRuleColumns') {
      this.$emit('modelAttrRule-update', {
        type: key,
        key: this.controlKey,
        parentKey: this.parentKey ? this.parentKey : '',
        field,
        value,
        modelAttributeColumns: this['modelAttributeColumns'] || [],
      });
    } else {
      //Else Empty block statement
    }
    this.$emit(
      'control-update',
      this.controlKey,
      {
        options,
      },
      this.parentKey,
      this.controlPath,
    );
  }

  /**
   * 摘要的回填
   * @param summary
   */
  summaryAttributeBackfill(summary: string) {
    this.setSummary(summary.split(','));
    this.submitSummary();
  }

  /**
   * 表单的回填
   * @param field
   * @param value
   */
  formAttributeBackfill(field: string, value: any) {
    this.$emit('edit-formdata-attribute', field, value);
  }

  /**
   * 属性栏值修改
   * @param key        属性控件key
   * @param field       字段的名称
   * @param value       字段的值
   */
  @Provide()
  updateAttribute(
    key: string,
    field: string,
    value: any,
    controlType?: string,
  ) {
    if (field === 'options') {
      // 选项
      const item = this.modelAttributeColumns.find(
        (el) => el.field === 'options',
      );
      try {
        const options = JSON.parse(item.dataItem.options);
        options.options = value;
        item.dataItem.options = options;
      } catch (error) {}
    }
    this.$nextTick(() => {
      switch (key) {
        case 'baseAttributeColumns':
          if (field === 'widgetType') {
            this.typeAttributeBackfill(value);
          } else if (field === 'width') {
            this.widthAttributeBackfill(!value ? null : Number(value));
          } else if (
            field === 'name' &&
            value &&
            (controlType ? controlType !== '202' : true)
          ) {
            //  控件名称限制输入字符数40
            let character = 0;
            let newVal = value;
            value.split('').forEach((el) => {
              if (el.match(/^[\u4e00-\u9fa5]+$/)) {
                character += 2;
              } else {
                character += 1;
              }
            });
            if (character > 40) {
              newVal = value.substring(0, value.length - 1);
            }
            this.optionsAttributeBackfill(key, field, newVal);
          } else {
            this.optionsAttributeBackfill(key, field, value);
          }
          break;
        case 'modelAttributeColumns':
        case 'modelRuleColumns':
          this.optionsAttributeBackfill('modelColumnsMerge', field, value);
          break;
        case 'controlAttributeColumns':
          if (this.isRelativeModelAttr(field)) {
            this.optionsAttributeBackfill(
              'modelAttributeColumns',
              field,
              value,
            );
          } else {
            this.optionsAttributeBackfill(key, field, value);
          }
          return false;
        case 'scriptAttributeColumns':
          this.optionsAttributeBackfill(key, field, value);
          break;
        case 'formColumns':
          if (field === 'summary') {
            this.summaryAttributeBackfill(value);
          } else {
            this.formAttributeBackfill(field, value);
          }
          break;
        default:
          console.warn('updateAttribute', key);
          this.optionsAttributeBackfill(key, field, value);
          break;
      }
    });
  }

  @Provide()
  inputAttributeBlur(key: string, field: string, value: any) {
    this.$nextTick(() => {
      if (field === 'dataItemName') {
        const options: any = {};
        const attr: any = (this as any)[key].find(
          (item: any) => item.field === field,
        );

        options[field] = value;
        attr.value = value;

        const displayFields: string[] = this.getHideFields(attr);
        if (displayFields.length) {
          displayFields.forEach((item: string) => {
            options[item] = buildControlOptions(this.allControls.control.type)[
              item
            ];
          });
        }
        this.$emit(
          'control-update-blur',
          this.controlKey,
          {
            options,
          },
          this.parentKey,
          this.controlPath,
        );
      }
    });
  }

  /**
   * 属性栏值修改
   * @param key        属性控件key
   * @param field       字段的名称
   * @param callback    方法回到
   */
  @Provide()
  attrCallback(key: string, field: string, callback: Function, extra = null) {
    const cols: any = [...(this as any)[key]];
    this.$nextTick(() => {
      callback(
        key,
        cols.find((col: any) => col.field === field),
        cols,
        this,
        extra,
      );
    });
  }

  created() {
    this.initData();
  }

  initData() {
    // 处理摘要
    const routeParams: any = this.$route.params;
    this.setBizSchemaCode(routeParams.bizSchemaCode);
    this.setBizSheetCode(routeParams.sheetCode);
    this.getSummary();
    this.getDataItemList();
    this.summary = Object.assign({}, formAttributeMap.summary);
  }

  transferRemove(data: any) {
    let tobeDeleteArr: any[] = [];
    if (data && data.isBaseAttribute) {
      tobeDeleteArr = this.baseAttributeColumns.filter((item) => {
        return item.group === data.group;
      });
    } else {
      tobeDeleteArr = this.controlAttributeColumns.filter((item) => {
        return item.group === data.group;
      });
    }
    this.setOpRecord(tobeDeleteArr);
    if (data && data.isBaseAttribute) {
      this.baseAttributeColumns = this.baseAttributeColumns.filter((item) => {
        return !item.group || item.group !== data.group;
      });
    } else {
      this.controlAttributeColumns = this.controlAttributeColumns.filter(
        (item) => {
          return !item.group || item.group !== data.group;
        },
      );
    }
  }

  setOpRecord(arr: any[]) {
    const transferOpRecord: any =
      window.localStorage.getItem('transferOpRecord');
    if (transferOpRecord) {
      const userStr = window.sessionStorage.getItem('user');
      if (userStr) {
        const user: any = JSON.parse(userStr);
        const transferOpObj: any = JSON.parse(transferOpRecord);
        if (transferOpObj && transferOpObj[user.id]) {
          const keyStr = `${this.formData.schemaCode}|${this.formData.code}`;
          let keyObj = transferOpObj[user.id][keyStr];
          if (keyObj) {
            if (Array.isArray(keyObj[this.controlKey])) {
              keyObj[this.controlKey] = keyObj[this.controlKey].concat(
                arr.map((item) => item.key),
              );
            } else {
              keyObj[this.controlKey] = arr.map((item) => item.key);
            }
          } else {
            keyObj = Object.create({});
            keyObj[this.controlKey] = arr.map((item) => item.key);
            transferOpObj[user.id][keyStr] = keyObj;
          }
        }
        window.localStorage.setItem(
          'transferOpRecord',
          JSON.stringify(transferOpObj),
        );
      }
    } else {
      const userStr = window.sessionStorage.getItem('user');
      if (userStr) {
        const user: any = JSON.parse(userStr);
        const keyStr = `${this.formData.schemaCode}|${this.formData.code}`;
        const transferOpObj: any = {};
        transferOpObj[user.id] = {};
        transferOpObj[user.id][keyStr] = {};
        const [...key] = arr;
        transferOpObj[user.id][keyStr][this.controlKey] = arr.map(
          (item) => item.key,
        );
        window.localStorage.setItem(
          'transferOpRecord',
          JSON.stringify(transferOpObj),
        );
      }
    }
  }

  getOpRecord() {
    let retArr: any[] = [];
    const transferOpRecord: any =
      window.localStorage.getItem('transferOpRecord');
    if (transferOpRecord) {
      const userStr = window.sessionStorage.getItem('user');
      if (userStr) {
        const user: any = JSON.parse(userStr);
        const transferOpObj: any = JSON.parse(transferOpRecord);
        if (transferOpObj && transferOpObj[user.id]) {
          const keyStr = `${this.formData.schemaCode}|${this.formData.code}`;
          const keyObj = transferOpObj[user.id][keyStr];
          if (keyObj && Array.isArray(keyObj[this.controlKey])) {
            retArr = keyObj[this.controlKey];
          }
        }
      }
    }
    return retArr;
  }

  get noCollapse() {
    if (
      this.control.type === 200 ||
      this.control.type === 202 ||
      this.control.type === 100 ||
      this.control.type === 101 ||
      this.control.type === 102 ||
      this.control.type === 103 ||
      this.control.type === 104 ||
      this.control.type === 105 ||
      this.control.type === 106 ||
      this.control.type === 109
    ) {
      return true;
    }
    return false;
  }

  getModelColumnsMerge() {
    const originMerge = this.modelRuleColumns.concat(
      this.modelAttributeColumns,
    );
    const transferAttr = controlAttributeListMap[this.control.type];
    console.log(transferAttr);
    //排序
    return originMerge.sort((a, b) => {
      return (
        transferAttr.find((item) => item.key === a.field).index -
        transferAttr.find((item) => item.key === b.field).index
      );
    });
  }

  getMergeBeforeKey(field) {
    const target = controlAttributeListMap[this.control.type].find(
      (item) => item.key === field,
    );
    return target.isRuleAttribute === 1
      ? 'modelRuleColumns'
      : 'modelAttributeColumns';
  }

  isRelativeModelAttr(field) {
    if (
      (this.control.type === 80 || this.control.type === 81) &&
      [
        'schemaCode',
        'showStyle',
        'queryCode',
        'displayField',
        'mappings',
        'searchFormula',
        'conditions',
        'linkMode',
      ].includes(field)
    ) {
      return true;
    }
    return false;
  }
}
</script>

<style lang="less">
@import '~@/components/apps/form-design/style/form-attribute-layout.less';
</style>
<style lang="less" scoped>
@import '~@/components/apps/form-design/style/form-attribute-layout-scoped.less';
</style>
