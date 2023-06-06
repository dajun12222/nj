<template>
  <div
    :style="customStyle ? customStyle.bgStyle : ''"
    class="data-range-setting-wrap"
  >
    <a-row class="mappingHeader" type="flex" justify="space-between">
      <a-col :span="8" class="fieldlab"> 数据名称 </a-col>
      <a-col :span="6" class="fieldlab"> 操作符 </a-col>
      <a-col :span="8" class="fieldlab"> 值 </a-col>
      <a-col :span="2" class="fieldlab"> 删除 </a-col>
    </a-row>
    <a-row v-for="(cond, index) in conditions" :key="index" type="flex">
      <a-col :span="8">
        <a-select
          v-model="cond.propertyCode"
          showSearch
          :filterOption="filterOption"
          @select="(e) => onItemSelect(cond)"
          @change="(e) => onItemChange(cond)"
        >
          <a-select-opt-group>
            <span slot="label" class="select-title">业务数据项</span>
            <template v-for="(i, key) in dataOptions">
              <a-select-option
                v-if="!i.isSystem"
                :key="key"
                :title="i.label"
                :value="i.value"
                :disabled="i.disabled"
              >
                {{ i.label }}
              </a-select-option>
            </template>
          </a-select-opt-group>

          <a-select-opt-group>
            <span slot="label" class="select-title">系统数据项</span>

            <template v-for="(i, key) in dataOptions">
              <a-select-option
                v-if="i.isSystem"
                :key="key"
                :title="i.label"
                :value="i.value"
                :disabled="i.disabled"
              >
                {{ i.label }}
              </a-select-option>
            </template>
          </a-select-opt-group>
        </a-select>
      </a-col>

      <a-col :span="6">
        <a-select
          v-model="cond.operatorType"
          :options="getOperators(cond.propertyType, cond.propertyCode)"
          :getPopupContainer="getPopupContainer"
          @change="onChange"
        />
      </a-col>

      <a-col v-show="operatorAboutNull(cond.operatorType)" :span="8" />

      <a-col v-show="!operatorAboutNull(cond.operatorType)" :span="8">
        <a-config-provider :locale="locale">
          <a-select
            v-if="isSequenceStatus(cond.propertyCode)"
            v-model="cond.value"
            :getPopupContainer="getPopupContainer"
          >
            <!-- <a-select-option :value="'DRAFT'"> 草稿 </a-select-option> -->
            <a-select-option :value="'PROCESSING'"> 进行中 </a-select-option>
            <a-select-option :value="'CANCELED'"> 已取消 </a-select-option>
            <a-select-option :value="'COMPLETED'"> 已完成 </a-select-option>
          </a-select>

          <a-input
            v-else-if="isText(cond.propertyType) || isTime(cond.propertyType)"
            v-model="cond.value"
            :placeholder="
              isDate(cond.propertyType)
                ? '日期格式2019-05-10 12:00:00'
                : isTime(cond.propertyType)
                ? '时间格式12:00:00'
                : [7, 8].includes(cond.operatorType)
                ? '请输入，多个值以“;”连接'
                : '请输入'
            "
            @change="onChange"
          />

          <a-input-number
            v-else-if="isNumber(cond.propertyType)"
            v-model="cond.value"
            @change="onChange"
          />

          <a-date-picker
            v-else-if="isDate(cond.propertyType)"
            :defaultValue="cond.value"
            @change="(d, ds) => onDateChange(cond, ds)"
          />

          <a-select
            v-else-if="isLogic(cond.propertyType)"
            v-model="cond.value"
            :getPopupContainer="getPopupContainer"
          >
            <a-select-option :value="1"> true </a-select-option>
            <a-select-option :value="0"> false </a-select-option>
          </a-select>

          <!-- isSequenceStatus -->

          <staff-selector
            v-else-if="isStaffSelector(cond.propertyType)"
            v-model="cond.value"
            :options="getStaffSelectorOpts(cond)"
            :showDetail="true"
            @change="onChange"
          />
        </a-config-provider>
      </a-col>

      <a-col :span="1">
        <a-icon type="delete" @click="remove(index)" />
      </a-col>
    </a-row>

    <div v-if="dataOptions.length" class="add">
      <span>
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="addAndConditions">添加且条件</span>
        <!-- <a-icon type="delete" @click="deleteOr" /> -->
      </span>
    </div>
    <div v-else class="message">请检查是否配置了业务模型</div>
  </div>
</template>

<script lang="ts">
import {
  Col,
  Row,
  Select,
  ConfigProvider,
  Icon,
  Input,
  InputNumber,
  DatePicker,
} from '@h3/antd-vue';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { DataItemType } from '../.././schema';
import StaffSelector from '../components/form-staff-selector/pc/staff-selector.vue';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import {
  DataItem,
  DateItemOperatorType,
  logicDataItemOperators,
  numberDataItemOperators,
  relevanceFormDataItemOperators,
  sequenceStatusOperators,
  staffDataItemOperators,
  textDataItemOperators,
} from './data-item2';

export interface DataitemConditionItem {
  propertyCode: string;

  propertyType: DataItemType;

  operatorType: DateItemOperatorType;

  value: any;
}

export interface DataitemConditionValue {
  type: number;

  conditions: DataitemConditionItem[];
}

@Component({
  name: 'dataitem-condition',
  components: {
    StaffSelector,
    ASelect: Select,
    ARow: Row,
    ACol: Col,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AIcon: Icon,
    AInput: Input,
    AInputNumber: InputNumber,
    ADatePicker: DatePicker,
    AConfigProvider: ConfigProvider,
  },
})
export default class DataitemCondition extends Vue {
  @Prop()
  items!: Array<DataItem>;

  @Prop()
  customStyle!: Object;

  @Model('change')
  value!: DataitemConditionValue;

  conditions: DataitemConditionItem[] = [];

  get locale() {
    switch (this.$i18n.locale) {
      case 'en':
        return enUS;
      case 'zh':
      default:
        return zhCN;
    }
  }

  dataOptions: {
    label: string;
    value: string;
    type: DataItemType;
    disabled: boolean;
  }[] = [];

  staffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '',
  };

  getStaffSelectorOpts(cond: DataitemConditionItem) {
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
    };
    switch (cond.propertyType) {
      case DataItemType.StaffSingle:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = false;
        if ([16, 15].includes(cond.operatorType)) {
          // 位于/不位于
          obj.mulpitle = true;
        }
        if ([11, 12].includes(cond.operatorType)) {
          // 属于/不属于
          obj.mulpitle = true;
          obj.selectUser = false;
          obj.selectOrg = true;
        }
        break;
      case DataItemType.StaffMulti:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = true;
        if ([11, 12].includes(cond.operatorType)) {
          // 属于/不属于
          obj.mulpitle = true;
          obj.selectUser = false;
          obj.selectOrg = true;
        }
        break;
      case DataItemType.DeptSingle:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = false;
        if ([16, 15].includes(cond.operatorType)) {
          // 位于/不位于
          obj.mulpitle = true;
        }
        if ([11, 12].includes(cond.operatorType)) {
          // 属于/不属于
          obj.mulpitle = true;
        }
        if ([13, 14].includes(cond.operatorType)) {
          // 拥有/不拥有
          obj.mulpitle = true;
          obj.selectUser = true;
        }
        break;
      case DataItemType.DeptMulti:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = true;
        if ([13, 14].includes(cond.operatorType)) {
          // 拥有/不拥有
          obj.mulpitle = true;
          obj.selectUser = true;
        }
        break;

      case DataItemType.StaffDeptMix:
        if ([11, 12].includes(cond.operatorType)) {
          // 属于/不属于
          obj.selectUser = false;
        }
        break;
      default:
        break;
    }
    return obj;
  }

  getOperators(type: DataItemType, code: string) {
    switch (type) {
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        return numberDataItemOperators;

      case DataItemType.Logic:
        return logicDataItemOperators;

      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        if (code === 'sequenceStatus') {
          return this.getOperatorsByCode(code);
        } else {
          return textDataItemOperators;
        }
      // 选人控件没有拥有、不拥有
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
        return staffDataItemOperators.slice(
          0,
          staffDataItemOperators.length - 2,
        );

      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return staffDataItemOperators;

      case DataItemType.RelevanceForm:
        return relevanceFormDataItemOperators;
      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        return relevanceFormDataItemOperators;
      default:
        break;
    }
  }

  getOperatorsByCode(code: string) {
    switch (code) {
      case 'sequenceStatus':
        return sequenceStatusOperators;
      default:
        break;
    }
  }

  isText(type: DataItemType) {
    return [
      DataItemType.ShortText,
      DataItemType.LongText,
      DataItemType.Checkbox,
      DataItemType.Radio,
      DataItemType.DropdownMulti,
      DataItemType.Dropdown,
    ].includes(type);
  }

  isNumber(type: DataItemType) {
    return type === DataItemType.Number;
  }

  isDate(type: DataItemType) {
    return type === DataItemType.Date;
  }

  isTime(type: DataItemType) {
    return type === DataItemType.Time;
  }

  isLogic(type: DataItemType) {
    return type === DataItemType.Logic;
  }

  isStaffSelector(type: DataItemType) {
    return [
      DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
    ].includes(type);
  }

  isSequenceStatus(code: string) {
    //
    return code === 'sequenceStatus';
  }

  operatorAboutNull(type: DateItemOperatorType) {
    return (
      type === DateItemOperatorType.IsNull ||
      type === DateItemOperatorType.IsNotNull
    );
  }

  @Watch('items', {
    immediate: true,
  })
  onItemsChange(items: DataItem[]) {
    if (items) {
      setTimeout(() => {
        this.dataOptions = items
          .filter(
            (item) =>
              item.type !== DataItemType.Attachment &&
              item.type !== DataItemType.ApprovalOpinion &&
              item.type !== DataItemType.Sheet &&
              item.type !== DataItemType.Address,
          )
          .map((item) => {
            let disabled = false;

            const code = item.parentCode
              ? `${item.parentCode}.${item.code}`
              : item.code;

            if (this.conditions) {
              const c = this.conditions.find(
                (co: any) => co.propertyCode === code,
              );

              if (c) {
                c.propertyType = item.type;
                disabled = true;
              }
            }

            const label = item.parentCode
              ? `${item.name}[${item.parentCode}.${item.code}]`
              : `${item.name}[${item.code}]`;

            return {
              label,
              value: code,
              type: item.type,
              isSystem: item.isSystem,
              disabled,
            };
          });
      }, 10);
    }
  }

  @Watch('value', {
    immediate: true,
  })
  onValueChange(val: DataitemConditionValue) {
    if (!val) {
      return;
    }

    if (val.conditions) {
      this.conditions = val.conditions; /* .slice(0); */
    } else {
      this.conditions = [];
    }
  }

  @Watch('conditions', {
    immediate: true,
  })
  onChangeConditions(conditions) {
    console.log(conditions, 'conditions==>');
    this.dataOptions.forEach((its) => {
      its.disabled = false;
    });
    conditions.forEach((item) => {
      this.dataOptions.forEach((el) => {
        if (el.value === item.propertyCode) {
          el.disabled = true;
        }
      });
    });
  }

  deleteOr() {
    this.$emit('deleteOr');
  }

  addAndConditions() {
    const item = this.dataOptions.find((op) => !op.disabled);
    if (!item) {
      this.$message.error('已无更多数据选项');
      return;
    }

    const operators = this.getOperators(item.type, item.value);
    if (!operators) {
      return;
    }

    item.disabled = true;

    this.conditions.push({
      propertyCode: item.value,
      propertyType: item.type,
      operatorType: operators[0].value,
      value: '',
    });

    this.onChange();
  }

  remove(index: number) {
    const item = this.dataOptions.find(
      (op) => op.value === this.conditions[index].propertyCode,
    );
    if (item) {
      item.disabled = false;
    }
    this.conditions.splice(index, 1);
    this.onChange();
    if (!this.conditions.length) {
      this.deleteOr();
    }
  }

  onItemSelect(cond: DataitemConditionItem) {
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    if (item) {
      item.disabled = false;
    }
  }

  onItemChange(cond: DataitemConditionItem) {
    this.onChangeConditions(this.conditions);
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    if (item) {
      cond.propertyType = item.type;
      cond.value = '';

      const operators = this.getOperators(item.type, item.value);
      if (operators) {
        cond.operatorType = operators[0].value;
      }

      item.disabled = true;
    }
    this.onChange();
  }

  onDateChange(cond: DataitemConditionItem, dateText: string) {
    cond.value = dateText;
    this.onChange();
  }

  onChange() {
    const value = {
      conditions: this.conditions,
    };
    this.$emit('change', value);
  }

  /**
   * 选人控件placeholder多语言
   */
  placeHolderLang() {
    this.staffSelectorOpts.placeholder = this.$t(
      'Languages.Apps.PlzSetOrgOrUser',
    ) as string;
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  @Watch('$i18n.locale')
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }

  filterOption(input, option) {
    return (
      option.componentOptions.children &&
      option.componentOptions.children[0].text &&
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.trim().toLowerCase()) >= 0
    );
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/common.less';
.data-range-setting-wrap {
  background: #f4f5f8;
  border-radius: 4px;
}

.fieldlab {
  color: #000;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
}

/deep/.ant-row-flex {
  padding: 5px 10px;

  & > div > *:not(i) {
    width: 100%;
  }
}

/deep/.ant-col-6,
/deep/.ant-col-8 {
  display: flex;
  // align-items: center;
  padding-right: 10px;
}

/deep/.ant-col-1 {
  display: flex;
  padding-top: 0.5em;
  // align-items: center;
  // justify-content: center;

  & > i {
    cursor: pointer;
  }
}

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

.add {
  color: @primary-color;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  line-height: 48px;
  span {
    margin-top: 16px;
    margin-right: 8px;
  }
}
</style>
