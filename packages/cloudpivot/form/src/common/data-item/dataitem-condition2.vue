<template>
  <div>
    <div class="row-tip">
      <p>
        <i class="icon aufontAll h-icon-all-Components_Warning"></i>条件组之间是or关系，最多设置10组，组内是and关系
      </p>
    </div>
    <div
      v-for="(item, conditionIndex) in conditions"
      :key="conditionIndex"
      class="condContent"
    >
      <p class="connect-line" :class="{ hide: conditionIndex === 0 }">
        <span>或</span>
      </p>
      <a-row class="row-header">
        <a-col :span="8"> 数据项 </a-col>
        <a-col :span="6"> 运算符 </a-col>
        <a-col :span="8"> 值 </a-col>
      </a-row>
      <a-row
        v-for="(cond, itemIndex) in item.conditionItemList"
        :key="itemIndex"
        type="flex"
        class="rowStyle"
      >
        <a-col :span="8">
          <a-config-provider :locale="locale">
            <a-select
              v-model="cond.propertyCode"
              showSearch
              :filterOption="filterOption"
              @select="(e) => onItemSelect(cond, conditionIndex)"
              @change="(e) => onItemChange(cond, conditionIndex)"
            >
              <a-select-opt-group>
                <span slot="label" class="select-title">业务数据项</span>
                <template v-for="(i, index) in dataOptions">
                  <a-select-option
                    v-if="!i.isSystem"
                    :key="index"
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

                <template v-for="(i, index) in dataOptions">
                  <a-select-option
                    v-if="i.isSystem"
                    :key="index"
                    :title="i.label"
                    :value="i.value"
                    :disabled="i.disabled"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>
            </a-select>
          </a-config-provider>
        </a-col>
        <a-col :span="6">
          <a-config-provider :locale="locale">
            <a-select
              v-model="cond.operatorType"
              :options="getOperators(cond.propertyType, cond.propertyCode)"
              @change="onChange(cond)"
            />
          </a-config-provider>
        </a-col>
        <a-col v-show="operatorAboutNull(cond.operatorType)" :span="8" />
        <a-col v-show="!operatorAboutNull(cond.operatorType)" :span="8">
          <a-config-provider :locale="locale">
            <a-select
              v-if="isSequenceStatus(cond.propertyCode)"
              v-model="cond.value"
              @change="onChange(cond)"
            >
              <a-select-option :value="'DRAFT'"> 草稿 </a-select-option>
              <a-select-option :value="'PROCESSING'"> 进行中 </a-select-option>
              <a-select-option :value="'CANCELED'"> 已作废 </a-select-option>
              <a-select-option :value="'COMPLETED'"> 已完成 </a-select-option>
            </a-select>

            <a-input
              v-else-if="isText(cond.propertyType) || isTime(cond.propertyType)"
              v-model="cond.value"
              :placeholder="
                isText(cond.propertyType)
                  ? '请输入'
                  : isTime(cond.propertyType)
                  ? '时间格式12:00:00'
                  : ''
              "
              @change="onChange"
            />

            <a-input-number
              v-else-if="isNumber(cond.propertyType)"
              v-model="cond.value"
              placeholder="请输入"
              @change="onChange"
            />

            <a-date-picker
              v-else-if="isDate(cond.propertyType)"
              :defaultValue="cond.value"
              placeholder="请选择日期"
              @change="(d, ds) => onDateChange(cond, ds)"
            />

            <a-select
              v-else-if="isLogic(cond.propertyType)"
              v-model="cond.value"
              @change="onChange(cond)"
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
          <i
            class="icon aufontAll h-icon-all-delete1"
            @click="removeAndCondition(conditionIndex, itemIndex)"
          ></i>
        </a-col>
      </a-row>
      <div class="actions">
        <span class="add-new" @click="addAndCondition(conditionIndex)">
          <i class="icon aufontAll h-icon-all-plus-o"></i>添加且条件
        </span>
      </div>
    </div>

    <div v-if="conditions.length < 10" class="actions add-or-actions">
      <span class="add-new" @click="addOrCondition">
        <i class="icon aufontAll h-icon-all-plus-o"></i>添加或条件
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Col,
  Row,
  Select,
  ConfigProvider,
  Input,
  DatePicker,
  InputNumber,
} from '@h3/antd-vue';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { DataItemType } from '../.././schema';
import { DataItemState } from '../../stores/data-items.store';
import StaffSelector from '../components/form-staff-selector/pc/staff-selector.vue';
import {
  DataItem,
  DateItemOperatorType,
  logicDataItemOperators,
  numberDataItemOperators,
  OperatorService,
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
  conditions: any[];
}

@Component({
  name: 'dataitem-condition',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ARow: Row,
    ACol: Col,
    StaffSelector,
    AConfigProvider: ConfigProvider,
    AInput: Input,
    ADatePicker: DatePicker,
    AInputNumber: InputNumber,
  },
})
export default class DataitemCondition extends Vue {
  @Prop()
  items!: Array<DataItem>;

  @Model('change')
  value!: DataitemConditionValue;

  dataItems: any = [];

  type = 1; // 全部1、任一2条件值

  conditions: any = [];

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

  get locale() {
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;

      case 'en':
        return enUS;
    }
  }

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

      // 选人控件没有属于、不属于
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
    return (
      type === DataItemType.StaffSingle ||
      type === DataItemType.StaffMulti ||
      type === DataItemType.DeptSingle ||
      type === DataItemType.DeptMulti ||
      type === DataItemType.StaffDeptMix
    );
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
      this.dataItems = items.slice(0);
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
            const disabled = false;
            let code = item.code;
            const idx = item.code.indexOf('.');
            if (idx === -1) {
              code = item.parentCode
                ? `${item.parentCode}.${item.code}`
                : item.code;
            }

            if (this.conditions.length > 0) {
              const c = this.conditions.find(
                (co: any) => co.propertyCode === code,
              );

              if (c) {
                c.propertyType = item.type;
                //disabled = true;
              }
            }

            let label = `${item.name}[${item.code}]`;
            if (idx === -1) {
              const sheet = items.find((x) => x.code === item.parentCode);
              if (sheet) {
                label = item.parentCode
                  ? `${sheet.name}.${item.name}[${item.parentCode}.${item.code}]`
                  : `${item.name}[${item.code}]`;
              }
            }

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
  onValueChange(val) {
    if (!val) {
      return;
    }
    if (val.type) {
      this.type = val.type;
    }

    //默认值
    if (val.conditions.length === 0 && this.conditions.length === 0) {
      this.conditions.push({
        conditionItemList: [],
      });
      return;
    }

    let segs: string[] = [];
    if (val.conditions.indexOf('||') > -1) {
      segs = val.conditions.split(' || ');
    } else {
      segs = [val.conditions];
    }
    this.conditions = [];
    for (const seg of segs) {
      if (seg.indexOf('&&') > -1) {
        const segList = seg.split(' && ');
        const conditionItemList = [];
        for (const segItem of segList) {
          const node: any = this.getConditionItem(segItem);
          if (node) {
            // @ts-ignore
            conditionItemList.push(node);
          } else {
            this.conditions.push({
              conditionItemList: [],
            });
          }
        }
        this.conditions.push({
          conditionItemList: conditionItemList,
        });
      } else {
        const node: any = this.getConditionItem(seg);
        if (node) {
          this.conditions.push({
            conditionItemList: [node],
          });
        } else {
          this.conditions.push({
            conditionItemList: [],
          });
        }
      }
    }
  }

  /**
   * 获取条件组中表达式值，返回对象格式
   */
  getConditionItem(seg: string) {
    // 先判断空格出现的次数
    const countOfSpace: number = seg.split(' ').length - 1;
    let fields: string[] = [];
    if (countOfSpace === 1) {
      // 一次直接切割
      fields = seg.split(' ');
    } else {
      // 多次则 按空格标识分割 但是非字符串中的空格 例：{ShortText1618474250748} === '121 12 1'
      const point1 = seg.indexOf(' ');
      const point2 = seg.indexOf(' ', point1 + 1);
      fields[0] = seg.substring(0, point1);
      fields[1] = seg.substring(point1 + 1, point2);
      fields[2] = seg.substring(point2 + 1);
    }
    const code = fields[0].substring(1, fields[0].length - 1);

    let item: DataItemState | undefined;

    const idx = code.indexOf('.');
    if (idx > -1) {
      const parentCode = code.substring(0, idx);
      const childCode = code.substring(idx + 1);
      const sheet = this.dataItems.find((x) => x.code === parentCode);
      if (sheet && sheet.properties) {
        item = sheet.properties.find(
          (x) => x.code === childCode || x.code.includes('.' + childCode),
        ) as any;
      }
    } else {
      item = this.dataItems.find((x) => x.code === code);
    }
    if (item) {
      const operator = OperatorService.findByLabel(item.type, fields[1]);
      if (operator) {
        let val: any;
        if (
          !(
            operator.value === DateItemOperatorType.IsNull ||
            operator.value === DateItemOperatorType.IsNotNull
          )
        ) {
          val = fields[2];
          switch (item.type) {
            case DataItemType.Number:
              val = Number(val);
              break;
            case DataItemType.Logic:
              val = val === 'true' ? 1 : 0;
              break;
            case DataItemType.Date:
            case DataItemType.Time:
            case DataItemType.ShortText:
            case DataItemType.Radio:
            case DataItemType.Checkbox:
            case DataItemType.Dropdown:
            case DataItemType.DropdownMulti:
            case DataItemType.LongText:
              val = val.substring(1, val.length - 1);
              break;
            case DataItemType.StaffMulti:
            case DataItemType.StaffSingle:
            case DataItemType.DeptSingle:
            case DataItemType.DeptMulti:
            case DataItemType.StaffDeptMix:
              if (val) {
                try {
                  val = JSON.parse(val);
                } catch (e) {
                  console.log('initModel', e);
                }
              }
              break;
            default:
              break;
          }
        }
        return {
          propertyCode: code,
          propertyType: item.type,
          operatorType: operator.value,
          value: val,
        };
      }
    }
  }

  /**
   * 添加且条件
   */
  addAndCondition(conditionIndex) {
    const currentConditionItemList =
      this.conditions[conditionIndex].conditionItemList;
    //根据当前组内的选项对下拉选项dataOptions进行禁用启用控制
    this.dataOptions = this.dataOptions.map((ele) => {
      const has = currentConditionItemList.find((ower) => {
        return ower.propertyCode === ele.value;
      });
      //ele.disabled = has ? true : false;
      return ele;
    });

    const item = this.dataOptions.find((op) => !op.disabled);
    if (!item) {
      this.$message.error('已无更多数据选项');
      return;
    }

    const operators = this.getOperators(item.type, item.value);
    if (!operators) {
      return;
    }

    //item.disabled = true;

    currentConditionItemList.push({
      propertyCode: item.value,
      propertyType: item.type,
      operatorType: operators[0].value,
      value: '',
    });
    this.onChange();
  }

  /**
   * 添加或条件
   */
  addOrCondition() {
    const isEmpty = this.conditions.some(
      (res: any) => res.conditionItemList.length === 0,
    );
    if (isEmpty) {
      this.$message.error('请将空的条件组填写完整再进行添加');
      return;
    }
    this.conditions.push({
      conditionItemList: [],
    });

    //点击添加或条件滚动条拉到最底端
    this.$nextTick(() => {
      const modalEl: any = document.getElementById('condRuleModal');
      const aModalBody: any =
        modalEl.getElementsByClassName('ant-modal-body')[0];
      aModalBody.scrollTop = aModalBody.scrollHeight;
    });
  }

  /**
   * 移除条件组中的条件
   */
  removeAndCondition(conditionIndex, itemIndex) {
    const currentConditionItemList =
      this.conditions[conditionIndex].conditionItemList;
    if (currentConditionItemList) {
      const item = this.dataOptions.find(
        (op) => op.value === currentConditionItemList[itemIndex].propertyCode,
      );
      if (item) {
        item.disabled = false;
      }

      currentConditionItemList.splice(itemIndex, 1);
      if (currentConditionItemList.length === 0) {
        this.conditions.splice(conditionIndex, 1);
      }

      //根据当前组内的选项对下拉选项dataOptions进行禁用启用控制
      this.dataOptions = this.dataOptions.map((ele) => {
        const has = currentConditionItemList.find((ower) => {
          return ower.propertyCode === ele.value;
        });
        //ele.disabled = has ? true : false;
        return ele;
      });

      this.onChange();
    }
  }

  /**
   * 数据项选择事件
   */
  onItemSelect(cond: DataitemConditionItem, conditionIndex) {
    const currentConditionItemList =
      this.conditions[conditionIndex].conditionItemList;
    this.dataOptions = this.dataOptions.map((ele) => {
      const has = currentConditionItemList.find((ower) => {
        return ower.propertyCode === ele.value;
      });
      //ele.disabled = has ? true : false;
      return ele;
    });
  }

  /**
   * 数据项切换事件
   */
  onItemChange(cond: DataitemConditionItem, conditionIndex) {
    const currentConditionItemList =
      this.conditions[conditionIndex].conditionItemList;
    const item = this.dataOptions.find((x) => x.value === cond.propertyCode);
    if (item) {
      cond.propertyType = item.type;
      Array.isArray(cond.value) &&
      [
        DataItemType.StaffSingle,
        DataItemType.StaffMulti,
        DataItemType.DeptSingle,
        DataItemType.DeptMulti,
      ].includes(cond.propertyType)
        ? (cond.value = [])
        : (cond.value = '');

      const operators = this.getOperators(item.type, item.value);
      if (operators) {
        cond.operatorType = operators[0].value;
      }

      this.dataOptions = this.dataOptions.map((ele) => {
        const has = currentConditionItemList.find((ower) => {
          return ower.propertyCode === ele.value;
        });
        //ele.disabled = has ? true : false;
        return ele;
      });
    }
    this.onChange(cond);
  }

  /**
   * 日期切换事件
   */
  onDateChange(cond: DataitemConditionItem, dateText: string) {
    cond.value = dateText;
    this.onChange(cond);
  }

  /**
   * 整个条件组的数据改变监听
   */
  onChange(conditionItem?: any) {
    if (
      conditionItem &&
      conditionItem.value &&
      Array.isArray(conditionItem.value)
    ) {
      conditionItem.value = [];
    }

    // let symbol = this.type === 1 ? "&&" : "||";

    // this.conditions = this.conditions.filter((item)=>{
    //   return item.conditionItemList.length>0;
    // });

    const errorList: any[] = [];
    const exp = this.conditions
      .map((item) => {
        const conditionsText = item.conditionItemList.map((cond) => {
          const operator = OperatorService.findByValue(
            cond.propertyType,
            cond.operatorType,
          );

          if (!operator) {
            return null;
          }

          let text = '';
          let val =
            cond.value === undefined || cond.value === null ? '' : cond.value;
          if (cond.propertyType === DataItemType.Number) {
            if (
              cond.operatorType === DateItemOperatorType.IsNull ||
              cond.operatorType === DateItemOperatorType.IsNotNull
            ) {
              text = '';
            } else {
              val = val === '' ? 0 : Number(val);
              if (!Number.isNaN(val)) {
                text = val.toString();
              }
            }
          } else if (cond.propertyType === DataItemType.Logic) {
            val = val === 'true' || val === 1;
            text = `${val}`;
          } else if (
            cond.propertyType === DataItemType.StaffSingle ||
            cond.propertyType === DataItemType.StaffMulti ||
            cond.propertyType === DataItemType.StaffDeptMix ||
            cond.propertyType === DataItemType.DeptMulti ||
            cond.propertyType === DataItemType.DeptSingle
          ) {
            if (val && Array.isArray(val)) {
              const arr = val.map((x: any) => {
                return {
                  id: x.id,
                  name: x.name,
                  type: x.type,
                  parentId: x.parentId,
                  parentDepartmentName: x.parentDepartmentName,
                };
              });

              text = JSON.stringify(arr);
            }
          } else {
            text = `'${val}'`;
          }

          const code = `{${cond.propertyCode}}`;
          if (
            operator.value === DateItemOperatorType.IsNull ||
            operator.value === DateItemOperatorType.IsNotNull
          ) {
            return `${code} ${operator.label}`;
          }

          if (
            ['包含', '不包含', '位于', '不位于', '属于', '不属于'].includes(
              operator.label,
            ) &&
            text === ''
          ) {
            const currentItem: any =
              this.dataItems.find(
                (el) =>
                  el.code === cond.propertyCode ||
                  el.parentCode + '.' + el.code === cond.propertyCode,
              ) || {};

            errorList.push(
              `${currentItem.name}[${cond.propertyCode}]不能${operator.label}空值,请设置值`,
            );
          }
          return `${code} ${operator.label} ${text}`;
        });
        const result = conditionsText.filter((x) => x !== null).join(` && `);
        //条件组内使用并且符号拼接
        return result;
      })
      .filter((x) => x !== null)
      .join(` || `);
    //条件组之间使用||符号拼接
    const value = {
      type: this.type,
      conditions: exp,
    };
    if (errorList.length) {
      this.$message.warning(errorList[0]);
      return;
    }
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

  @Watch('$i18n.locale')
  onLanguageChange(l: string) {
    this.placeHolderLang();
  }

  filterOption(input: any, option: any) {
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
@import './../../../../common/common';
/deep/.ant-row-flex {
  & > div > *:not(i) {
    width: 100%;
  }
}

/deep/.ant-col-6,
/deep/.ant-col-8 {
  display: flex;
  padding-right: 10px;
}

/deep/.ant-col-1 {
  display: flex;
  padding-top: 0.5em;
  & > i {
    margin-top: -3px;
    cursor: pointer;
  }
}

/deep/ .condContent .h3-organization {
  background: #fff;
}

.row-tip {
  padding: 8px 16px;
  margin-bottom: 16px;
  background: #fffbe6;
  border-radius: 4px;
  border: 1px solid #ffe58f;
  p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
    .icon {
      margin-right: 8px;
      font-size: 14px;
      color: #f1941f;
    }
  }
}

.row-header {
  padding-top: 16px;
  padding-left: 24px;
  margin-bottom: 0;
  font-size: 12px;
  color: rgba(17, 18, 24, 0.5);
  line-height: 20px;
}

.condContent {
  margin: 10px 0;
  background: #f4f5f8;
  border-radius: 4px;
  .connect-line {
    margin-top: 20px;
    padding-bottom: 20px;
    width: 100%;
    background: #fff;
    position: relative;
    border-top: 1px solid #d8d8d8;
    span {
      display: inline-block;
      position: absolute;
      top: -11px;
      width: 56px;
      left: 43%;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
      background: #fff;
      text-align: center;
    }
  }
  .connect-line.hide {
    display: none;
  }
}
.rowStyle {
  padding: 8px 0 0 24px;
}
.actions {
  padding: 10px 0;
  text-align: center;
  .add-new {
    font-size: 14px;
    color: @primary-color;
    cursor: pointer;
    i {
      padding-right: 5px;
      font-size: 14px;
    }
  }
  & > button {
    border: 0;
  }
}
.add-or-actions {
  text-align: left;
  padding: 0;
}
.disabled {
  .add-new {
    color: #ccc;
    cursor: not-allowed;
  }
}
</style>
