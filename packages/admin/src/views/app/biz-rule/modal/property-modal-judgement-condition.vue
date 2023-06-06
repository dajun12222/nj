<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="div-height">
    <div class="input-modal" @click="modalShow">
      <div v-if="inputValue === '已设置'" class="txt-delete">
        <div class="txt">{{ inputValue }}</div>
        <em
          class="icon aufontAll h-icon-all-delete-o1"
          @click.stop="deleteAll"
        ></em>
      </div>
      <!-- <a-icon type="ellipsis" /> -->
      <em class="icon aufontAll h-icon-all-setting-o"></em>
    </div>
    <a-modal
      wrapClassName="property-judgement-condition"
      width="544px"
      :visible="visible"
      okText="保存"
      cancelText="取消"
      @ok="handleOk"
      @cancel="modalHide"
    >
      <template slot="title">
        <div>判断条件</div>
      </template>
      <div class="content">
        <div class="row">
          满足以下
          <a-select v-model="type" class="ml8 mr8 wid_80">
            <a-select-option value="AND"> 全部 </a-select-option>
            <a-select-option value="OR"> 任一 </a-select-option> </a-select>条件
        </div>

        <div>
          <div class="filters">
            <a-row>
              <a-col :span="8"> 目标模型数据项 </a-col>
              <a-col :span="6"> 对比方式 </a-col>
              <a-col :span="8"> 验证模型数据项 </a-col>
              <a-col :span="2" />
            </a-row>
            <a-row
              v-for="(row, filterIndex) in filtersList"
              :key="filterIndex"
              class="condition-row"
            >
              <a-col :span="8">
                <!-- 目标模型 -->
                <data-item-select
                  v-model="row.targetSchemaDataItem"
                  :onlyPublished="true"
                  class="data-filed"
                  :list="targetFieldList"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'modifier',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [10, 8, 6, 7, 11] }"
                  @change="
                    (val) => {
                      return targetFieldChange(val, row);
                    }
                  "
                />
              </a-col>
              <a-col :span="6">
                <a-select
                  v-model="row.filterCondition.maturityFunctionType"
                  showSearch
                  class="data-filter"
                  :disabled="true"
                >
                  <a-select-option
                    v-for="(item, index) in row.filterCondition.list"
                    :key="index"
                    :value="item.key"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="8">
                <!-- 验证模型 -->
                <data-item-select
                  v-model="row.verifySchemaDataItem"
                  :onlyPublished="true"
                  class="data-filed"
                  :list="getCurrentVerifyFieldList(row.targetSchemaDataItem)"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [10, 8, 6, 7, 11] }"
                />
              </a-col>
              <a-col :span="2">
                <i
                  class="icon aufontAll h-icon-all-delete1 delete"
                  @click="delRows(filterIndex)"
                ></i>
              </a-col>
            </a-row>
          </div>
          <div class="add">
            <span>
              <i class="icon aufontAll h-icon-all-plus-o"></i>
            </span>
            <span @click="addRows">新增条件</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import appsApi from '@/apis/apps';
import { DataItemType } from 'cloudpivot/form/schema';
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import * as forms from 'cloudpivot-forms';
import { Component, Inject, Mixins, Prop, Watch } from 'vue-property-decorator';
import DataItemSelect from '../../data-rule/data-item-select.vue';
import { SystemDataItemCode } from '../typings/rule-data-condition-type';
import { Icon, Modal, Row, Col, Select, Input } from '@h3/antd-vue';

@Component({
  name: 'propertyJudgementCondition',
  components: {
    DataItemSelect,
    AIcon: Icon,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInput: Input,
  },
})
export default class propertyJudgementCondition extends Mixins(
  PropertyComponent,
) {
  @Prop() dataItems!: any;

  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }

  visible: boolean = false;

  verifySchemaCode: any = '';

  targetSchemaCode: string = '';

  type: any = 'AND';

  filtersList: any[] = [];

  // 验证模型数据字段数据源
  verifyFieldList: any[] = [];

  // 目标模型数据字段数据源
  targetFieldList: any[] = [];

  inputValue: string = '未设置';

  //对比函数
  maturityFunctionList: any = [{ key: 'EQ', name: '等于', index: 1 }];

  initData() {
    const targetval: any = this.controller.children.targetSchema;
    if (targetval && targetval._value) {
      this.targetSchemaCode = targetval._value.schemaCode;
      this.getDataItems('target', this.targetSchemaCode);
    }
    const verifyval: any = this.controller.children.verifySchemaCode;
    if (verifyval && verifyval._value) {
      this.verifySchemaCode = verifyval._value;
      //判断是否为子表
      if (this.verifySchemaCode.indexOf('.') !== -1) {
        this.getDataItems('verify', this.verifySchemaCode.split('.')[0], true);
      } else {
        this.getDataItems('verify', this.verifySchemaCode);
      }
    }
    this.getDefaultData();
  }

  //数据回写
  dataDraft() {
    const value: any = this.value;
    if (value.conditions && value.conditions.length > 0) {
      this.filtersList = [];
      this.inputValue = '已设置';
      this.type = value.conditionJoinType;
      value.conditions.forEach((c, index) => {
        const targetSource: any = this.targetFieldList.find(
          (d: any) => d.code === c.targetSchemaDataItem,
        );
        const verifySource: any = this.verifyFieldList.find(
          (d: any) => d.code === c.verifySchemaDataItem,
        );
        if (!targetSource) {
          return;
        }
        let verifySchemaDataItem: string = c.verifySchemaDataItem;
        if (!verifySource) {
          verifySchemaDataItem = '';
        }
        this.filtersList.push({
          verifySchemaDataItem, //数据项
          filterCondition: {
            maturityFunctionType: c.conditionType,
            list: this.maturityFunctionList,
          }, //对比函数
          targetSchemaDataItem: c.targetSchemaDataItem,
        });
      });
      this.filtersList.length === 0 && this.getDefaultData();
    }
  }

  getDefaultData() {
    this.filtersList = [];
  }

  @Watch('value', {
    immediate: true,
  })
  valueChange(value) {
    this.emitChange(value);
    if (
      this.value &&
      this.value.hasOwnProperty('conditions') &&
      this.value.conditions.length > 0
    ) {
      this.inputValue = '已设置';
    } else {
      this.inputValue = '未设置';
    }
  }

  // 确定
  handleOk(): void {
    let switchBtn = false;
    this.filtersList.forEach((f) => {
      if (!f.targetSchemaDataItem || !f.verifySchemaDataItem) {
        switchBtn = true;
      }
    });
    if (switchBtn) {
      this.$message.error('判断条件不成立');
      return;
    }
    if (this.filtersList.length === 0) {
      this.inputValue = '未设置';
      const source = {
        conditionJoinType: this.type,
        conditions: [],
      };
      this.emitChange(source);
      this.modalHide();
      return;
    }
    const obj: any = {
      conditionJoinType: this.type,
    };
    obj['conditions'] = this.buildData();
    this.emitChange(obj);
    this.inputValue = '已设置';
    this.modalHide();
  }

  buildData() {
    const item: any = [];
    this.filtersList.forEach((f) => {
      const res: any = {
        targetSchemaDataItem: f.targetSchemaDataItem,
        conditionType: f.filterCondition.maturityFunctionType,
        verifySchemaDataItem: f.verifySchemaDataItem,
        targetSchemaDataItemName: '',
        verifySchemaDataItemName: '',
      };

      if (f.targetSchemaDataItem) {
        // 记录目标名称
        const targetSchemaDataItem = this.targetFieldList.find(
          (el) => el.code === f.targetSchemaDataItem,
        );
        res.targetSchemaDataItemName = targetSchemaDataItem.name || '';
      }

      if (f.verifySchemaDataItem) {
        const currentItem: any = this.verifyFieldList.find(
          (el) => el.code === f.verifySchemaDataItem,
        );
        if (currentItem) {
          res.verifySchemaDataItemName = currentItem.name;
        }
      }

      item.push(res);
    });
    return item;
  }

  modalShow(): void {
    this.initData();
    this.visible = true;
  }

  modalHide(): void {
    this.visible = false;
  }

  // 添加行
  addRows(): void {
    const item: any = {
      targetSchemaDataItem: undefined, //数据项
      filterCondition: {
        maturityFunctionType: 'EQ',
        list: this.maturityFunctionList,
      }, //对比函数
      verifySchemaDataItem: undefined,
    };
    this.filtersList.push(item);
  }

  delRows(index) {
    this.filtersList.splice(index, 1);
  }

  async getDataItems(str: string, code: string, isSheet?: boolean) {
    // 获取数据字段
    const res = await appsApi.getDataItemList({
      schemaCode: code,
    });
    if (res && res.errcode === 0) {
      if (str === 'target') {
        console.log(res, 'res');
        this.targetFieldList = res.data;
      } else {
        if (isSheet) {
          const source: any = res.data.find((d) => {
            return this.verifySchemaCode.split('.')[1] === d.code;
          });
          const sheetDataItem = source.subSchema.properties.map((res) => {
            !res.code.includes('.') &&
              (res.code = `${this.verifySchemaCode.split('.')[1]}.${res.code}`);
            return res;
          });
          this.verifyFieldList = [...res.data, ...sheetDataItem].filter(
            (res: any) =>
              res.code !==
              `${this.verifySchemaCode.split('.')[1]}.${
                SystemDataItemCode.SortKey
              }`,
          );
        } else {
          this.verifyFieldList = res.data;
        }
      }
      this.dataDraft();
    }
  }

  targetFieldChange(code: string, row: any) {
    //
    row.verifySchemaDataItem = '';
  }

  getCurrentVerifyFieldList(val: string) {
    const source: any = this.targetFieldList.find((t) => {
      return t.code === val;
    });
    if (!source) {
      return [];
    }
    switch (source.propertyType) {
      case DataItemType.StaffDeptMix:
        return this.verifyFieldList.filter((v) => {
          return (
            v.propertyType === source.propertyType &&
            v.code !== SystemDataItemCode.Modifier &&
            v.code.indexOf('.') === -1
          );
        });
      case DataItemType.StaffMulti:
      case DataItemType.StaffSingle:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return this.verifyFieldList.filter((v) => {
          return (
            (v.propertyType === source.propertyType ||
              v.propertyType === DataItemType.StaffDeptMix) &&
            v.code !== SystemDataItemCode.Modifier &&
            v.code.indexOf('.') === -1
          );
        });
      case DataItemType.RelevanceForm:
        let idArr: Array<any> = [];
        let verify: string = this.verifySchemaCode;
        if (this.verifySchemaCode.includes('.')) {
          verify = this.verifySchemaCode.split('.')[0];
          if (source.relativeCode === verify) {
            idArr = this.verifyFieldList.filter((v) => {
              return (
                v.code === SystemDataItemCode.Id ||
                (v.code.split('.')[v.code.split('.').length - 1] ===
                  SystemDataItemCode.ParentId &&
                  v.code.indexOf('.') === -1)
              );
            });
          }
        } else {
          if (source.relativeCode === verify) {
            idArr = this.verifyFieldList.filter((v) => {
              return (
                v.code.split('.')[v.code.split('.').length - 1] ===
                  SystemDataItemCode.Id && v.code.indexOf('.') === -1
              );
            });
          }
        }
        return this.verifyFieldList
          .filter((v) => {
            return (
              v.propertyType === source.propertyType &&
              source.relativeCode === v.relativeCode &&
              v.code.indexOf('.') === -1
            );
          })
          .concat(idArr);
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
        //业务对象ID
        if (source.code === SystemDataItemCode.Id) {
          return this.verifyFieldList.filter((v) => {
            return (
              (v.propertyType === source.propertyType ||
                source.schemaCode === v.relativeCode) &&
              !v.defaultProperty &&
              v.code.indexOf('.') === -1
            );
          });
        } else if (source.code === SystemDataItemCode.SequenceStatus) {
          return this.verifyFieldList.filter((v) => {
            return (
              [
                DataItemType.ShortText,
                DataItemType.Radio,
                DataItemType.Dropdown,
              ].includes(v.propertyType) &&
              v.code.split('.')[v.code.split('.').length - 1] !==
                SystemDataItemCode.Id &&
              v.code.split('.')[v.code.split('.').length - 1] !==
                SystemDataItemCode.ParentId &&
              v.code !== SystemDataItemCode.SequenceNo &&
              v.code.indexOf('.') === -1
            );
          });
        } else if (source.code === SystemDataItemCode.SequenceNo) {
          return this.verifyFieldList.filter((v) => {
            return (
              [
                DataItemType.ShortText,
                DataItemType.Radio,
                DataItemType.Dropdown,
              ].includes(v.propertyType) &&
              v.code.split('.')[v.code.split('.').length - 1] !==
                SystemDataItemCode.Id &&
              v.code.split('.')[v.code.split('.').length - 1] !==
                SystemDataItemCode.ParentId &&
              v.code !== SystemDataItemCode.SequenceNo &&
              v.code !== SystemDataItemCode.SequenceStatus &&
              v.code.indexOf('.') === -1
            );
          });
        } else {
          return this.verifyFieldList.filter((v) => {
            return (
              ([
                DataItemType.ShortText,
                DataItemType.Radio,
                DataItemType.Dropdown,
              ].includes(source.propertyType)
                ? [
                    DataItemType.ShortText,
                    DataItemType.Radio,
                    DataItemType.Dropdown,
                  ].includes(v.propertyType)
                : [DataItemType.Checkbox, DataItemType.DropdownMulti].includes(
                    v.propertyType,
                  )) && v.code.indexOf('.') === -1
            );
          });
        }
      default:
        return this.verifyFieldList.filter((v) => {
          return (
            v.propertyType === source.propertyType && v.code.indexOf('.') === -1
          );
        });
    }
  }
}
</script>

<style lang="less">
.property-judgement-condition .filters {
  .ant-row {
    margin-bottom: 8px;
  }
}
.property-judgement-condition {
  .row {
    display: flex;
    align-items: center;
  }

  .ml8 {
    margin-left: 8px;
  }

  .mr8 {
    margin-right: 8px;
  }
  .wid_80 {
    width: 80px;
  }
  .add {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    span {
      margin-right: 8px;
    }
  }
  .filters {
    margin-top: 20px;
    /deep/.ant-row {
      padding: 3px 8px;
    }
    /deep/.ant-row > div {
      font-size: 12px;
      color: #111218;
      line-height: 20px;
    }
    .condition-row:hover {
      background: #eef4fd;
    }
  }
  .data-filter {
    width: 110px;
  }
  .data-filed {
    width: 150px;
    .data-select {
      width: 150px !important;
    }
  }
}
</style>

<style lang="less" scoped></style>
