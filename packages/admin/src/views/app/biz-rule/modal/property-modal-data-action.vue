<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: zhuqiu name
 * @Date: 2020-04-02 21:07:21
 * @LastEditTime: 2020-05-27 14:58:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/entries/admin/src/views/app/biz-rule/modal/property-modal-data-action.vue
 -->
<template>
  <section>
    <a-modal
      v-model="visible"
      wrapClassName="data-action-modal-content"
      okText="保存"
      cancelText="取消"
      width="810px"
      @ok="modalOk"
      @cancel="modalCancel"
    >
      <template slot="title">
        <div>
          {{ actionType === 'createActions' ? '新增' : '更新' }}数据动作
        </div>
      </template>
      <div class="content">
        <div
          v-if="showMainTable && actionType === 'createActions'"
          class="data-action-modal-content-sub-title_div mg-bt-10"
        >
          查找主表
        </div>
        <a-select
          v-if="showMainTable && actionType === 'createActions'"
          v-model="ruleConditionJoinType"
          class="mg-bt-10"
          style="width: 292px"
          defaultValue="1"
        >
          <a-select-option key="AND"> 满足所有条件的数据 </a-select-option>
          <a-select-option key="OR"> 满足任一条件的数据 </a-select-option>
        </a-select>
        <!-- 查询数据 配置 -->
        <div
          v-if="showMainTable && actionType === 'createActions'"
          class="filters"
        >
          <a-row>
            <a-col :span="7" class="data-action-modal-content-fieldlab">
              目标模型数据字段
            </a-col>
            <a-col :span="5" class="data-action-modal-content-fieldlab">
              对比函数
            </a-col>
            <a-col :span="4" class="data-action-modal-content-fieldlab">
              值类型
            </a-col>
            <a-col :span="7" class="data-action-modal-content-fieldlab">
              当前模型数据字段/常量
            </a-col>
            <a-col :span="1" />
          </a-row>
          <a-row
            v-for="(row, index) of filtersCondition"
            :key="index"
            class="condition-row"
          >
            <a-col :span="7">
              <!-- 目标模型 -->
              <data-item-select
                v-model="row.targetSchemaDataItem"
                :onlyPublished="true"
                :list="targetMainDataItems"
                :systemFilterCtl="{
                  code: [
                    'workflowInstanceId',
                    'modifier',
                    'ownerDeptQueryCode',
                    'sortKey',
                  ],
                }"
                :bizFilterCtl="{ type: [8, 7, 10] }"
                @change="
                  (val) => {
                    return targetChange(val, row);
                  }
                "
              />
            </a-col>
            <a-col :span="5">
              <!-- 对比函数 -->
              <a-select
                v-model="row.ruleConditionType"
                style="width: 153px"
                class="data-filter"
                placeholder="请选择"
                :disabled="!row.targetSchemaDataItem"
              >
                <a-select-option
                  v-for="(type, i) of getConditionTypeList(row)"
                  :key="i"
                  :value="type.code"
                >
                  {{ type.name }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <!-- 值类型 -->
              <a-select
                v-model="row.valueType"
                style="width: 120px"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="(typeVal, i) of getRuleValueTypeList(row, 'filter')"
                  :key="i"
                  :value="typeVal.value"
                >
                  {{ typeVal.label }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7">
              <template v-if="row.valueType === 'FIXED'">
                <div class="item-box" style="width: 215px">
                  <!-- 文本类型 -->
                  <div
                    v-if="
                      (getShowType(getPropertyType(row, 'filter')) ||
                        getPropertyType(row, 'assign') === 10) &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-input
                      v-model="row.value"
                      style="width: 215px"
                      placeholder="请输入"
                    />
                  </div>
                  <!-- 日期 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Date &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-date-picker
                      v-model="row.value"
                      style="width: 215px"
                      format="YYYY-MM-DD HH:mm:ss"
                      :showTime="{
                        defaultValue: moment(new Date(), 'HH:mm:ss'),
                      }"
                      placeholder="请选择时间"
                    />
                  </div>
                  <!-- 时间 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Time &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-time-picker
                      v-model="row.value"
                      style="width: 215px"
                      placeholder="请选择时间"
                      format="HH:mm:ss"
                    />
                  </div>
                  <!-- 数值 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Number &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-input
                      v-model="row.value"
                      style="width: 215px"
                      type="number"
                      placeholder="请输入"
                    />
                  </div>
                  <!-- 逻辑 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') === DataItemTypes.Logic &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-select
                      v-model="row.value"
                      style="width: 215px"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="true"> true </a-select-option>
                      <a-select-option value="false"> false </a-select-option>
                    </a-select>
                  </div>
                  <!-- 选人控件 -->
                  <div
                    v-if="
                      getShowTypeStaff(getPropertyType(row, 'filter')) &&
                      row.ruleConditionType !== 'EP'
                    "
                    style="background: white !important"
                  >
                    <staff-selector
                      v-model="row.value"
                      :options="getStaffSelectorOpts(row)"
                    />
                  </div>
                  <!-- 审批意见 -->
                  <div
                    v-if="
                      getPropertyType(row, 'filter') ===
                        DataItemTypes.ApprovalOpinion &&
                      row.ruleConditionType !== 'EP'
                    "
                  >
                    <a-select
                      v-model="row.value"
                      style="width: 215px"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="PROCESSING">
                        进行中
                      </a-select-option>
                      <a-select-option value="COMPLETED">
                        已完成
                      </a-select-option>
                    </a-select>
                  </div>
                </div>
              </template>

              <template v-if="row.valueType === 'DYNAMIC'">
                <data-item-select
                  v-model="row.currentSchemaDataItem"
                  :onlyPublished="true"
                  :list="getCurrentDataItemList(row, 'filter')"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'modifier',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [8, 7] }"
                />
              </template>
            </a-col>
            <a-col :span="1">
              <i
                class="icon aufontAll h-icon-all-delete1 delete"
                @click="delRows(index, 'filter')"
              ></i>
            </a-col>
          </a-row>
          <div class="data-action-modal-content-add-btn">
            <span>
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span @click="addFilterCondition">新增条件</span>
            </span>
          </div>
        </div>
        <!-- 新增数据 配置 -->
        <div class="data-action-modal-content-sub-title_div mg-bt-10">
          {{ actionType === 'createActions' ? '新增动作' : '更新动作' }}
        </div>
        <div class="filters">
          <a-row>
            <a-col :span="7" class="data-action-modal-content-fieldlab">
              目标模型数据字段
            </a-col>
            <a-col :span="5" class="data-action-modal-content-fieldlab">
              对比函数
            </a-col>
            <a-col :span="4" class="data-action-modal-content-fieldlab">
              值类型
            </a-col>
            <a-col :span="7" class="data-action-modal-content-fieldlab">
              当前模型数据字段/常量
            </a-col>
            <a-col :span="1" />
          </a-row>
          <a-row
            v-for="(row, index) of assignDataList"
            :key="index"
            class="condition-row"
          >
            <a-col :span="7">
              <data-item-select
                v-model="row.targetSchemaDataItem"
                :onlyPublished="true"
                :list="targetModelDataItems"
                :systemFilterCtl="{
                  code: [
                    'workflowInstanceId',
                    'id',
                    'parentId',
                    'name',
                    'sequenceStatus',
                    'createdDeptId',
                    'ownerDeptId',
                    'createdTime',
                    'modifier',
                    'modifiedTime',
                    'sequenceNo',
                    'ownerDeptQueryCode',
                    'sortKey',
                  ],
                }"
                :bizFilterCtl="{ type: [8, 7] }"
                @change="
                  (val) => {
                    return targetChange(val, row);
                  }
                "
              />
            </a-col>
            <a-col :span="5">
              <a-select
                v-model="row.ruleActionType"
                :disabled="!row.targetSchemaDataItem"
                style="width: 153px"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="(typeVal, i) of getRuleActionTypeList(row)"
                  :key="i"
                  :value="typeVal.value"
                >
                  {{ typeVal.label }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="4">
              <a-select
                v-model="row.valueType"
                style="width: 120px"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="(typeVal, i) of getRuleValueTypeList(row, 'assign')"
                  :key="i"
                  :value="typeVal.value"
                >
                  {{ typeVal.label }}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="7">
              <!-- 固定值输入 -->
              <template v-if="row.valueType === 'FIXED'">
                <div class="item-box" style="width: 215px">
                  <!-- 文本 -->
                  <div
                    v-if="
                      getShowType(getPropertyType(row, 'assign')) ||
                      getPropertyType(row, 'assign') === 10
                    "
                  >
                    <a-input
                      v-model="row.value"
                      style="width: 215px"
                      placeholder="请输入"
                    />
                  </div>
                  <!-- 数值 -->
                  <div
                    v-if="
                      getPropertyType(row, 'assign') === DataItemTypes.Number
                    "
                  >
                    <a-input
                      v-model="row.value"
                      style="width: 215px"
                      type="number"
                      placeholder="请输入"
                    />
                  </div>
                  <!-- 日期 需要校验 -->
                  <div
                    v-if="getPropertyType(row, 'assign') === DataItemTypes.Date"
                  >
                    <a-date-picker
                      v-model="row.value"
                      style="width: 215px"
                      format="YYYY-MM-DD HH:mm:ss"
                      :showTime="{
                        defaultValue: moment(new Date(), 'HH:mm:ss'),
                      }"
                      placeholder="请选择时间"
                    />
                  </div>
                  <!-- 时间 -->
                  <div
                    v-if="getPropertyType(row, 'assign') === DataItemTypes.Time"
                  >
                    <a-time-picker
                      v-model="row.value"
                      style="width: 215px"
                      placeholder="请选择时间"
                      format="HH:mm:ss"
                    />
                  </div>
                  <!-- 逻辑 -->
                  <div
                    v-if="
                      getPropertyType(row, 'assign') === DataItemTypes.Logic
                    "
                  >
                    <a-select
                      v-model="row.value"
                      style="width: 215px"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="true"> true </a-select-option>
                      <a-select-option value="false"> false </a-select-option>
                    </a-select>
                  </div>
                  <!-- 选人控件 -->
                  <div
                    v-if="getShowTypeStaff(getPropertyType(row, 'assign'))"
                    style="background: white !important"
                  >
                    <staff-selector
                      v-model="row.value"
                      :options="getStaffSelectorOpts(row)"
                    />
                  </div>
                  <!-- 审批意见 -->
                  <div
                    v-if="
                      getPropertyType(row, 'assign') ===
                      DataItemTypes.ApprovalOpinion
                    "
                  >
                    <a-select
                      v-model="row.value"
                      style="width: 215px"
                      :getPopupContainer="getPopupContainer"
                    >
                      <a-select-option value="PROCESSING">
                        进行中
                      </a-select-option>
                      <a-select-option value="COMPLETED">
                        已完成
                      </a-select-option>
                    </a-select>
                  </div>
                </div>
              </template>
              <!-- 动态值 选择 -->
              <template v-if="row.valueType === 'DYNAMIC'">
                <data-item-select
                  v-model="row.currentSchemaDataItem"
                  :onlyPublished="true"
                  :list="getCurrentDataItemList(row, 'ssign')"
                  :systemFilterCtl="{
                    code: [
                      'workflowInstanceId',
                      'ownerDeptQueryCode',
                      'sortKey',
                    ],
                  }"
                  :bizFilterCtl="{ type: [8, 7] }"
                />
              </template>
            </a-col>
            <a-col :span="1">
              <i
                class="icon aufontAll h-icon-all-delete1 delete"
                @click="delRows(index, 'assign')"
              ></i>
            </a-col>
          </a-row>

          <div class="data-action-modal-content-add-btn">
            <span>
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span @click="addAssignDataField">新增数据字段</span>
            </span>
          </div>
        </div>
      </div>
    </a-modal>
  </section>
</template>
<script lang="ts">
import appsApi from '@/apis/apps';
import {
  Col,
  DatePicker,
  Icon,
  Input,
  Modal,
  Row,
  Select,
  TimePicker,
} from '@h3/antd-vue';
import { DataItemType } from 'cloudpivot/form/schema';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import moment from 'moment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import DataItemSelect from '../../data-rule/data-item-select.vue';
import {
  BizRuleDataCondition,
  SystemDataItemCode,
} from '../typings/rule-data-condition-type';
interface ITableCondition {
  /**目标模型数据项 */
  targetSchemaDataItem: string;
  /**对比函数 */
  ruleConditionType?: string;
  /**值类型 */
  valueType: any;
  value: any;
  /**当前模型数据项 */
  currentSchemaDataItem: string;

  /**组件自定义属性 */
  [propName: string]: any;
}
enum RuleActionType {
  // 等于
  Equals = 'EQUALS',
  // 累加
  Increase = 'INCREASE',
  // 累减
  Decrease = 'DECREASE',
}

@Component({
  name: 'AddDataAction',
  components: {
    StaffSelector,
    DataItemSelect,
    AIcon: Icon,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInput: Input,
    ATimePicker: TimePicker,
    ADatePicker: DatePicker,
  },
})
export default class AddDataAction extends Vue {
  //   @Inject()
  //   controller!: forms.FormGroup;
  // 当前模型 数据项
  @Prop() dataItems!: any;

  @Prop({ default: 'createActions' }) actionType!: string;

  @Prop() value!: any;

  @Prop() schemaCode!: string;

  @Prop() targetOjectCode!: string;

  @Prop() triggerObjectCode!: string;

  // 规则查询条件满足类型
  ruleConditionJoinType: string = 'AND';

  //查询条件 数组
  filtersCondition: ITableCondition[] = [];

  filterConditionCurrentDataItemList: any[] = [];

  // 选人控件初始化参数
  staffSelectorOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  // modal 显示条件
  visible: boolean = true;

  canAdd = false;

  valueTypeList: any[] = [
    {
      label: '动态值',
      value: 'DYNAMIC',
    },
    {
      label: '固定值',
      value: 'FIXED',
    },
    {
      label: '为空',
      value: 'EMPTY',
    },
  ];

  ruleActionTypeList = [
    {
      label: '等于',
      value: RuleActionType.Equals,
    },
    {
      label: '累加',
      value: RuleActionType.Increase,
    },
    {
      label: '累减',
      value: RuleActionType.Decrease,
    },
  ];

  moment: any = moment;

  getStaffSelectorOpts(row) {
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
    };
    //
    // switch (row.propertyType) {
    //   case DataItemType.StaffSingle:
    //     obj.selectOrg = false;
    //     obj.selectUser = true;
    //     obj.mulpitle = false;
    //     break;
    //   case DataItemType.StaffMulti:
    //     obj.selectOrg = false;
    //     obj.selectUser = true;
    //     obj.mulpitle = true;
    //     break;
    //   case DataItemType.DeptSingle:
    //     obj.selectOrg = true;
    //     obj.selectUser = false;
    //     obj.mulpitle = false;
    //     break;
    //   case DataItemType.DeptMulti:
    //     obj.selectOrg = true;
    //     obj.selectUser = false;
    //     obj.mulpitle = true;
    //     break;
    // }
    return obj;
  }

  created() {
    this.getDataItems(Object.keys(this.value).length > 0);
    this.modalShow();
    this.getDefaultFiltersConditionData();
    this.getDefaultAssignData();
    const _this = this;
    this.currentDataItem = this.filterConditionCurrentDataItemList = [
      ...this.dataItems,
    ];
    if (this.triggerObjectCode) {
      const len = this.triggerObjectCode.indexOf('.');
      if (len > 0) {
        const sheetCode = this.triggerObjectCode.slice(len + 1);
        const sheet = this.currentDataItem.find(
          (res) => res.code === sheetCode,
        );
        if (sheet && sheet.subSchema && sheet.subSchema.properties) {
          const sheetDataItem = sheet.subSchema.properties.map((res) => {
            !res.code.includes('.') && (res.code = `${sheetCode}.${res.code}`);
            return res;
          });
          this.currentDataItem = [
            ...this.currentDataItem,
            ...sheetDataItem,
          ].filter(
            (res: any) =>
              res.code !== `${sheetCode}.${SystemDataItemCode.SortKey}`,
          );
        }
      }
    }
  }

  getDefaultFiltersConditionData() {
    if (this.showMainTable && this.actionType === 'createActions') {
      this.filtersCondition = [
        {
          targetSchemaDataItem: '',
          ruleConditionType: 'EQ',
          valueType: 'DYNAMIC',
          currentSchemaDataItem: '', // 动态值 当前数据项
          value: '', // 固定值数据
        },
      ];
    }
  }

  getDefaultAssignData() {
    this.assignDataList = [
      {
        targetSchemaDataItem: '',
        currentSchemaDataItem: '', // 动态值 当前数据项
        value: '', // 固定值数据
        valueType: 'DYNAMIC',
        ruleActionType: RuleActionType.Equals,
      },
    ];
  }

  dataWrite() {
    // 数据回写
    if (this.value) {
      if (this.value.filterCondition) {
        this.filtersCondition = [];
        this.ruleConditionJoinType =
          this.value.filterCondition.ruleConditionJoinType;
        if (this.value.filterCondition.mainTableConditions) {
          const mainTableConditions =
            this.value.filterCondition.mainTableConditions;
          mainTableConditions.forEach((res) => {
            const targetSource: any = this.targetMainDataItems.find(
              (t: any) => t.code === res.targetSchemaDataItem,
            );
            if (!targetSource) {
              return;
            }
            const currentSource: any =
              this.filterConditionCurrentDataItemList.find(
                (t: any) => t.code === res.currentSchemaDataItem,
              );
            let currentSchemaDataItem: string = res.currentSchemaDataItem;
            if (!currentSource) {
              currentSchemaDataItem = '';
            }
            const newRow: any = {
              targetSchemaDataItem: res.targetSchemaDataItem,
              ruleConditionType: res.ruleConditionType,
              valueType: res.ruleValueType,
              currentSchemaDataItem, // 动态值 当前数据项
              value: res.value, // 固定值数据
            };
            this.filtersCondition.push(newRow);
          });
          this.filtersCondition.length === 0 &&
            this.getDefaultFiltersConditionData();
        }
      }
      if (this.value[this.actionType].length > 0) {
        this.assignDataList = [];
        const createActions = this.value[this.actionType];
        createActions.forEach((res, index) => {
          const currentRowData = this.targetModelDataItems.find(
            (item: any) => item.code === res.targetDataItem,
          );
          if (!currentRowData) {
            return;
          }
          const source: any = this.currentDataItem.find(
            (c: any) => c.code === res.currentDataItemValue,
          );
          let currentSchemaDataItem: string = res.currentDataItemValue;
          if (!source) {
            currentSchemaDataItem = '';
          }

          const row: any = {
            targetSchemaDataItem: res.targetDataItem,
            currentSchemaDataItem, // 动态值 当前数据项
            value:
              res.ruleValueType === 'FIXED' &&
              currentRowData.propertyType === DataItemType.Date
                ? moment(res.value)
                : res.ruleValueType === 'FIXED' &&
                  currentRowData.propertyType === DataItemType.Time
                ? moment(res.value, 'HH:mm:ss')
                : res.value, // 固定值数据
            valueType: res.ruleValueType,
            ruleActionType: res.ruleActionType
              ? res.ruleActionType
              : RuleActionType.Equals,
          };
          this.assignDataList.push(row);
        });
        this.assignDataList.length === 0 && this.getDefaultAssignData();
      }
    }
  }

  modalShow() {
    const schemaCode = this.schemaCode;
    if (!schemaCode) {
      return false;
    }
    const len = schemaCode.indexOf('.');
    if (len > 0) {
      this.showMainTable = true;
    } else {
      this.showMainTable = false;
    }
  }

  modalCancel() {
    this.$emit('close');
  }

  modalOk() {
    //查找主表参数判断
    let filterBtn: boolean = false;
    this.filtersCondition.forEach((f: any) => {
      if (
        f.valueType === 'DYNAMIC' &&
        (!f.targetSchemaDataItem || !f.currentSchemaDataItem)
      ) {
        filterBtn = true;
      } else if (
        f.valueType === 'FIXED' &&
        (!f.targetSchemaDataItem || !f.value)
      ) {
        filterBtn = true;
      } else if (f.valueType === 'EMPTY' && !f.targetSchemaDataItem) {
        filterBtn = true;
      } else {
        //Else Empty block statement
      }
    });
    if (filterBtn) {
      this.$message.error('查找主表参数未设置完整');
      return;
    }
    const main = this.filtersCondition.map((res) => {
      const obj = {
        targetSchemaDataItem: res.targetSchemaDataItem,
        ruleConditionType: res.ruleConditionType,
        ruleValueType: res.valueType,
        value: res.value,
        currentSchemaDataItem: res.currentSchemaDataItem,
      };
      return obj;
    });
    //新增动作参数判断
    let assignBtn: boolean = false;
    this.assignDataList.forEach((f: any) => {
      if (
        f.valueType === 'DYNAMIC' &&
        (!f.targetSchemaDataItem || !f.currentSchemaDataItem)
      ) {
        const currentItem = this.currentDataItem.find(
          (item) => item.code === f.currentSchemaDataItem,
        );
        const targetItem = this.targetModelDataItems.find(
          (item) => item.code === f.targetSchemaDataItem,
        );
        if (
          currentItem &&
          targetItem &&
          currentItem.propertyType === DataItemType.RelevanceFormEx &&
          targetItem.propertyType === DataItemType.RelevanceFormEx
        ) {
          if (
            currentItem.relativeCode === targetItem.relativeCode &&
            currentItem.relativePropertyCode === targetItem.relativePropertyCode
          ) {
            assignBtn = true;
          } else {
            this.$message.error('关联表单多选所配置的业务模型不一致');
            return;
          }
        } else {
          assignBtn = true;
        }
      } else if (
        f.valueType === 'FIXED' &&
        (!f.targetSchemaDataItem || !f.value)
      ) {
        assignBtn = true;
      } else if (f.valueType === 'EMPTY' && !f.targetSchemaDataItem) {
        assignBtn = true;
      } else {
        //Else Empty block statement
      }
    });
    if (assignBtn) {
      this.$message.error('参数未设置完整');
      return;
    }

    if (this.showMainTable && this.actionType === 'createActions') {
      if (
        this.filtersCondition.length > 0 &&
        this.assignDataList.length === 0
      ) {
        this.$message.error('新增动作参数未设置');
        return;
      }
      if (
        this.filtersCondition.length === 0 &&
        this.assignDataList.length > 0
      ) {
        this.$message.error('查找主表参数未设置');
        return;
      }
    }

    const action = this.assignDataList.map((res) => {
      let value: string = '';
      const source = this.targetModelDataItems.find(
        (t: any) => res.targetSchemaDataItem === t.code,
      );
      if (
        res.valueType === 'FIXED' &&
        source.propertyType === DataItemType.Date
      ) {
        value = res.value.format('YYYY-MM-DD HH:mm:ss');
      } else if (
        res.valueType === 'FIXED' &&
        source.propertyType === DataItemType.Time
      ) {
        value = res.value.format('HH:mm:ss');
      } else {
        value = res.value;
      }

      const obj = {
        targetDataItem: res.targetSchemaDataItem,
        ruleValueType: res.valueType,
        value: value,
        ruleActionType: res.ruleActionType,
        currentDataItemValue: res.currentSchemaDataItem,
        targetDataItemName: '',
        currentDataItemValueName: '',
      };

      // 记录目标名称
      if (res.targetSchemaDataItem) {
        const currentTargetSchemaDataItem = this.targetModelDataItems.find(
          (el) => el.code === res.targetSchemaDataItem,
        );
        obj.targetDataItemName = currentTargetSchemaDataItem.name;
      }
      // 记录选中字段的名称
      if (res.currentSchemaDataItem) {
        const currentSchemaDataItem =
          this.filterConditionCurrentDataItemList.find(
            (el) => el.code === res.currentSchemaDataItem,
          );
        if (currentSchemaDataItem) {
          obj.currentDataItemValueName = currentSchemaDataItem.name;
        }
      }
      return obj;
    });

    const obj = {
      filterCondition: {
        ruleConditionJoinType: this.ruleConditionJoinType,
        mainTableConditions: main,
      },
      [this.actionType]: action,
    };
    this.$emit('ok', obj);
    this.modalCancel();
  }

  // 动作数据项
  targetModelDataItems: any[] = [];

  // 过滤条件数据项 只能是主表
  targetMainDataItems: any[] = [];

  currentDataItem: any[] = [];

  assignDataList: any[] = [];

  // 获取目标模型 数据项
  async getDataItems(isWrite?: boolean) {
    const targetOjectCode = this.targetOjectCode;
    let schemaCode = targetOjectCode;
    if (!schemaCode) {
      return;
    }
    const len = schemaCode.indexOf('.');
    if (len > 0) {
      schemaCode = schemaCode.slice(0, len);
    }
    // 获取数据字段
    const res = await appsApi.getDataItemList({ schemaCode: schemaCode });
    if (res && res.errcode === 0) {
      // 子表
      if (len > 0) {
        const sheetCode = targetOjectCode.slice(len + 1);
        const sheet = res.data.find((item) => item.code === sheetCode);
        if (sheet && sheet.subSchema) {
          this.targetModelDataItems = sheet.subSchema.properties;
        }
      } else {
        // 非子表
        //若是数据更新节点需过滤掉系统数据项
        this.targetModelDataItems = res.data;
        if (this.actionType === 'dataActions') {
          this.targetModelDataItems = this.targetModelDataItems.filter(
            (t: any) =>
              ['creater', 'createdDeptId', 'createdTime', 'sequenceNo'].indexOf(
                t.code,
              ) < 0,
          );
        }
      }

      this.targetMainDataItems = res.data;
      this.canAdd = true;

      if (isWrite) {
        this.dataWrite();
      }
    }
  }

  showMainTable = false;

  // 新增条件
  async addFilterCondition() {
    if (!this.canAdd) {
      await this.getDataItems();
    }
    const newRow: any = {
      targetSchemaDataItem: '',
      ruleConditionType: 'EQ',
      valueType: 'DYNAMIC',
      currentSchemaDataItem: '', // 动态值 当前数据项
      value: '', // 固定值数据
    };
    this.filtersCondition.push(newRow);
    console.log(this.filtersCondition);
  }

  // 新增动作
  async addAssignDataField() {
    if (!this.canAdd) {
      await this.getDataItems();
    }
    !this.targetModelDataItems.length && this.getDataItems();

    const newRow: any = {
      targetSchemaDataItem: '',
      currentSchemaDataItem: '', // 动态值 当前数据项
      value: '', // 固定值数据
      valueType: 'DYNAMIC',
      ruleActionType: RuleActionType.Equals,
    };
    this.assignDataList.push(newRow);
  }

  // 删除行
  delRows(index, type) {
    switch (type) {
      case 'filter':
        this.filtersCondition.splice(index, 1);
        break;
      case 'assign':
        this.assignDataList.splice(index, 1);
        break;
      default:
        break;
    }
  }

  //目标模型改变触发当前对象模型值清空
  targetChange(code: string, row: any) {
    row.currentSchemaDataItem = '';
    row.value = '';
    row.valueType = 'DYNAMIC';
    row.ruleActionType = RuleActionType.Equals;
  }

  DataItemTypes = DataItemType;

  getShowType(type) {
    switch (type) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.LongText:
      case DataItemType.DropdownMulti:
        return true;
      default:
        break;
    }
    return false;
  }

  getShowTypeStaff(type) {
    switch (type) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return true;
      default:
        break;
    }
    return false;
  }

  //获取数据项类型
  getPropertyType(row: any, type: string) {
    const data: any =
      type === 'filter' ? this.targetMainDataItems : this.targetModelDataItems;
    const source: any = data.find(
      (item: any) => row.targetSchemaDataItem === item.code,
    );
    if (!source) {
      return '';
    }
    return source.propertyType;
  }

  // 设置符合目标模式数据项的 值类型
  getRuleValueTypeList(row: any, type: string) {
    const data: any =
      type === 'filter' ? this.targetMainDataItems : this.targetModelDataItems;
    const source: any = data.find(
      (item: any) => row.targetSchemaDataItem === item.code,
    );
    let arrData: Array<any> = this.valueTypeList;
    if (!source) {
      return arrData;
    }
    switch (source.propertyType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
      case DataItemType.RelevanceForm:
        if (
          source.code === SystemDataItemCode.Creater ||
          source.code === SystemDataItemCode.Owner
        ) {
          arrData = this.valueTypeList.filter((val) => val.value === 'DYNAMIC');
        } else {
          arrData = this.valueTypeList.filter(
            (val) => val.value === 'DYNAMIC' || val.value === 'EMPTY',
          );
        }
        break;
      case DataItemType.RelevanceFormEx:
        arrData = this.valueTypeList.filter((val) => val.value === 'DYNAMIC');
        break;
      case DataItemType.Logic:
        arrData = this.valueTypeList.filter(
          (val) => val.value === 'DYNAMIC' || val.value === 'FIXED',
        );
        break;
      case DataItemType.Address:
      case DataItemType.Attachment:
        arrData = this.valueTypeList.filter(
          (val) => val.value === 'DYNAMIC' || val.value === 'EMPTY',
        );
        break;
      default:
        break;
    }
    //当位系统字段时需过滤为空的选项
    if (source.defaultProperty) {
      arrData = this.valueTypeList.filter((val) => val.value === 'DYNAMIC');
    }
    return arrData;
  }

  //设置符合查找主表目标模型数据项的对比函数
  getConditionTypeList(row): any[] {
    const source: any = this.targetMainDataItems.find(
      (item: any) => row.targetSchemaDataItem === item.code,
    );
    const dataCondition: any = new BizRuleDataCondition();
    if (!source) {
      return dataCondition.conditionType.arry;
    }
    if (source.propertyType === DataItemType.Number) {
      return dataCondition.conditionType.arry.filter(
        (a: any) => a.id > 0 && a.id < 7,
      );
    } else {
      return dataCondition.conditionType.arry.filter((a: any) => a.id === 1);
    }
  }

  //设置符合新增数据目标模型数据项的对比函数
  getRuleActionTypeList(row: any) {
    const source: any = this.targetModelDataItems.find(
      (item: any) => row.targetSchemaDataItem === item.code,
    );
    if (!source) {
      return this.ruleActionTypeList;
    }
    switch (source.propertyType) {
      case DataItemType.Number:
        if (this.actionType === 'createActions') {
          return this.ruleActionTypeList.filter(
            (val) => val.value === RuleActionType.Equals,
          );
        } else {
          return this.ruleActionTypeList;
        }
      default:
        return this.ruleActionTypeList.filter(
          (val) => val.value === RuleActionType.Equals,
        );
    }
  }

  //设置符合目标模型数据类型的 当前模式下数据项
  getCurrentDataItemList(row: any, type: string) {
    const data: any =
      type === 'filter' ? this.targetMainDataItems : this.targetModelDataItems;
    const sourceData: any =
      type === 'filter'
        ? this.filterConditionCurrentDataItemList
        : this.currentDataItem;
    const source: any = data.find(
      (item: any) => row.targetSchemaDataItem === item.code,
    );
    if (!source) {
      return [];
    }
    switch (source.propertyType) {
      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Dropdown:
        return sourceData.filter((val) => {
          return (
            val.propertyType === DataItemType.ShortText ||
            val.propertyType === DataItemType.Radio ||
            val.propertyType === DataItemType.Dropdown
          );
        });
      case DataItemType.Checkbox:
      case DataItemType.DropdownMulti:
        return sourceData.filter((val) => {
          return (
            val.propertyType === DataItemType.Checkbox ||
            val.propertyType === DataItemType.DropdownMulti
          );
        });
      case DataItemType.LongText:
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
      case DataItemType.Logic:
      case DataItemType.Address:
      case DataItemType.Attachment:
      case DataItemType.StaffDeptMix:
        return sourceData.filter((val) => {
          return (
            row.currentSchemaDataItem === val.code ||
            (val.propertyType === source.propertyType &&
              val.code !== SystemDataItemCode.Modifier)
          );
        });
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
        return sourceData.filter((val) => {
          return (
            (val.propertyType === source.propertyType ||
              val.propertyType === DataItemType.StaffDeptMix) &&
            val.code !== SystemDataItemCode.Modifier
          );
        });
      case DataItemType.RelevanceForm:
        let idArr: Array<any> = [];
        let trigger: string = this.triggerObjectCode;
        if (this.triggerObjectCode.includes('.')) {
          trigger = this.triggerObjectCode.split('.')[0];
          if (source.relativeCode === trigger) {
            idArr = sourceData.filter((v) => {
              return (
                v.code === SystemDataItemCode.Id ||
                v.code.split('.')[v.code.split('.').length - 1] ===
                  SystemDataItemCode.ParentId
              );
            });
          }
        } else {
          if (source.relativeCode === trigger) {
            idArr = sourceData.filter((v) => {
              return (
                v.code.split('.')[v.code.split('.').length - 1] ===
                SystemDataItemCode.Id
              );
            });
          }
        }

        return sourceData
          .filter((val) => {
            return (
              val.propertyType === source.propertyType &&
              source.relativeCode === val.relativeCode
            );
          })
          .concat(idArr);
      case DataItemType.RelevanceFormEx:
        return sourceData.filter((val) => {
          return (
            val.propertyType === source.propertyType &&
            source.relativeCode === val.relativeCode
          );
        });
      default:
        break;
    }
  }
}
</script>
<style lang="less">
.data-action-modal-content {
  .filters {
    margin-top: 12px;
    .ant-row {
      padding: 3px 8px;
    }
    .ant-row > div {
      font-size: 12px;
      color: #111218;
      line-height: 20px;
    }
    .condition-row:hover {
      background: #eef4fd;
    }
  }
  .data-action-modal-content-add-btn {
    margin-top: 6px;
  }
  .ant-modal-body {
    max-height: 500px;
    overflow-y: auto;
  }
  .data-filter {
    width: 115px;
  }
  .data-item-selected {
    .data-select {
      width: 215px !important;
    }
  }
  &-sub-title_div {
    width: 56px;
    height: 22px;
    font-size: 14px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #111218;
    line-height: 22px;
  }
  &-add-btn {
    color: @primary-color;
    cursor: pointer;
    text-align: center;
    span {
      margin-right: 8px;
    }
  }
  &-fieldlab {
    height: 20px;
    font-size: 12px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(17, 18, 24, 0.5);
    line-height: 20px;
  }
}
.mg-bt-10 {
  margin-bottom: 10px;
}
</style>
