<template>
  <div class="datarange-selection-warp">
    <div v-if="conditions.length" class="mappingDiv">
      <a-row class="mappingHeader" type="flex" justify="space-between">
        <a-col :span="8" class="fieldlab"> 数据名称 </a-col>
        <a-col :span="5" class="fieldlab"> 操作符 </a-col>
        <a-col :span="8" class="fieldlab"> 值 </a-col>
        <a-col :span="2" class="fieldlab" />
      </a-row>
      <a-row
        v-for="(cond, index) in conditions"
        :key="index"
        type="flex"
        justify="space-between"
        class="mappingHeader"
      >
        <a-col :span="8">
          <config-provider :locale="locale">
            <a-select
              v-model="cond.propertyCode"
              :getPopupContainer="getPopupContainer"
              showSearch
              :filterOption="filterOption"
              @select="(e) => onItemSelect(cond)"
              @change="(e) => onItemChange(cond)"
            >
              <a-select-opt-group>
                <span slot="label" class="select-title">业务数据项</span>
                <template v-for="(i, ids) in dataOptions">
                  <a-select-option
                    v-if="!i.isSystem"
                    :key="ids"
                    :value="i.value"
                    :disabled="i.disabled"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>

              <a-select-opt-group>
                <span slot="label" class="select-title">系统数据项</span>

                <template v-for="(i, ids) in dataOptions">
                  <a-select-option
                    v-if="i.isSystem"
                    :key="ids"
                    :value="i.value"
                    :disabled="i.disabled"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>
            </a-select>
          </config-provider>
        </a-col>

        <a-col :span="5">
          <config-provider :locale="locale">
            <a-select
              v-model="cond.operatorType"
              :options="getOperators(cond.propertyType, cond.propertyCode)"
              :getPopupContainer="getPopupContainer"
              @change="onChange"
            />
          </config-provider>
        </a-col>

        <a-col v-show="operatorAboutNull(cond.operatorType)" :span="8" />

        <a-col v-show="!operatorAboutNull(cond.operatorType)" :span="8">
          <config-provider :locale="locale">
            <a-select
              v-if="isSequenceStatus(cond.propertyCode)"
              v-model="cond.value"
              :getPopupContainer="getPopupContainer"
            >
              <!-- <a-select-option :value="'DRAFT'">草稿</a-select-option> -->
              <a-select-option :value="'PROCESSING'"> 进行中 </a-select-option>
              <a-select-option :value="'CANCELED'"> 已取消 </a-select-option>
              <a-select-option :value="'COMPLETED'"> 已完成 </a-select-option>
            </a-select>

            <a-input
              v-else-if="
                isText(cond.propertyType) ||
                isDate(cond.propertyType) ||
                isTime(cond.propertyType)
              "
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

            <a-select
              v-else-if="isLogic(cond.propertyType)"
              v-model="cond.value"
              :getPopupContainer="getPopupContainer"
            >
              <a-select-option :value="1"> true </a-select-option>
              <a-select-option :value="0"> false </a-select-option>
            </a-select>

            <staff-selector
              v-else-if="isStaffSelector(cond.propertyType)"
              v-model="cond.value"
              :options="getStaffSelectorOpts(cond)"
              @change="onChange"
            />
          </config-provider>
        </a-col>

        <a-col :span="2">
          <i
            class="icon aufontAll h-icon-all-delete1"
            @click="remove(index)"
          ></i>
        </a-col>
      </a-row>
    </div>
    <div v-if="dataOptions.length" class="add">
      <span>
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="addAndConditions">添加且条件</span>
        <a-icon type="delete" @click="deleteOr" />
      </span>
    </div>
    <div v-else class="message">请检查是否配置了业务模型</div>
  </div>
</template>

<script lang="ts">
import {
  Col,
  ConfigProvider,
  Row,
  Select,
  Input,
  InputNumber,
  Icon,
} from '@h3/antd-vue';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { DataItemType } from '../../../schema';
import {
  DataItem,
  DateItemOperatorType,
  logicDataItemOperators,
  numberDataItemOperators,
  relevanceFormDataItemOperators,
  sequenceStatusOperators,
  staffDataItemOperators,
  textDataItemOperators,
} from '../data-item/data-item2';
import StaffSelector from './form-staff-selector/pc/staff-selector.vue';

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
  name: 'data-range-mapping',
  components: {
    ASelect: Select,
    ARow: Row,
    ACol: Col,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInput: Input,
    AInputNumber: InputNumber,
    AIcon: Icon,
    ConfigProvider,
    StaffSelector,
  },
})
export default class DataRangeMapping extends Vue {
  @Prop()
  items!: Array<DataItem>;

  @Prop()
  customStyle!: Object;

  @Model('change')
  value!: DataitemConditionValue;

  conditions: DataitemConditionItem[] = [];

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
    const opts = Object.assign({}, this.staffSelectorOpts);
    if (
      cond.operatorType === DateItemOperatorType.Of ||
      cond.operatorType === DateItemOperatorType.NotOf
    ) {
      opts.selectUser = false;
      // opts.mulpitle = false;
    }
    // else if(cond.operatorType === DateItemOperatorType.Have || cond.operatorType === DateItemOperatorType.NotHave){
    //   // opts.selectOrg = false;
    //   opts.mulpitle = true;
    // }
    return opts;
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

      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return staffDataItemOperators;

      case DataItemType.RelevanceForm:
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
              // item.type !== DataItemType.RelevanceForm &&
              // item.type !== DataItemType.StaffSingle &&
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

  deleteOr() {
    this.$emit('deleteOr');
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

  get locale() {
    // @ts-ignore
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;

      case 'en':
        return enUS;
    }
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
.datarange-selection-warp {
  background: #f4f5f8;
  padding: 16px;
  border-radius: 4px;
}
.mappingHeader {
  margin-bottom: 8px;
  /deep/ .h3-organization__label {
    background: #fff;
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
.fieldlab {
  color: rgba(17, 18, 24, 0.5);
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
}
.message {
  margin-top: 2em;
}
</style>
