<template>
  <div class="querycondition-warp">
    <div v-if="selected.length" class="mappingDiv">
      <a-row class="mappingHeader" type="flex" justify="space-between">
        <a-col :span="6" class="fieldlab"> 关联模型字段 </a-col>
        <a-col :span="4" class="fieldlab"> 默认操作符 </a-col>
        <a-col :span="4" class="fieldlab"> 常量 </a-col>
        <a-col :span="6" class="fieldlab"> 值或当前表单字段 </a-col>
        <a-col :span="2" class="fieldlab" />
      </a-row>
      <a-row
        v-for="(item, index) in selected"
        :key="index"
        type="flex"
        justify="space-between"
        class="mappingHeader"
      >
        <a-col :span="6">
          <config-provider :locale="locale">
            <a-select
              v-model="item.source.code"
              :getPopupContainer="getPopupContainer"
              showSearch
              :filterOption="filterOption"
              @select="
                (e) => findSourceOptionAndDisabled(item.source.code, false)
              "
              @change="(e) => onSourceItemChange(item)"
            >
              <a-select-opt-group>
                <span slot="label" class="select-title">业务数据项</span>
                <template v-for="(i, ids) in sourceOptions">
                  <a-select-option
                    v-if="!i.isSystem"
                    :key="ids"
                    :value="i.value"
                    :disabled="
                      selected.map((el) => el.source.code).includes(i.value)
                    "
                    :title="i.label"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>
              <a-select-opt-group>
                <span slot="label" class="select-title">系统数据项</span>
                <template v-for="(i, ids) in sourceOptions">
                  <a-select-option
                    v-if="i.isSystem"
                    :key="ids"
                    :value="i.value"
                    :disabled="
                      selected.map((el) => el.source.code).includes(i.value)
                    "
                    :title="i.label"
                  >
                    {{ i.label }}
                  </a-select-option>
                </template>
              </a-select-opt-group>
            </a-select>
          </config-provider>
        </a-col>

        <a-col v-if="!editable" class="col" :span="4">
          <a-select
            v-model="item.op"
            defaultValue="eq"
            @change="(d, ds) => onOpChange(item, d, ds)"
          >
            <a-select-option
              v-for="(option, idx) in getQueryOptionTypeList(item)"
              :key="idx"
              :value="option.op"
            >
              {{ option.text }}
            </a-select-option>
          </a-select>
        </a-col>

        <a-col v-if="!editable" :span="4">
          <!-- <a-switch
            :checked="item.isConst"
            @change="(e) => onIsConstChange(e, item)"
          /> -->
          <template
            v-if="
              !(
                ['IS_NULL', 'IS_NOT_NULL'].includes(item.op) ||
                ([
                  QueryOptionType.Between,
                  QueryOptionType.Not_Between,
                ].includes(item.op) &&
                  item.source.type === 2)
              )
            "
          >
            <a-select
              :defaultValue="item.isConst ? 'true' : 'false'"
              @change="(e) => onIsConstChange(e, item)"
            >
              <a-select-option value="true"> 常量 </a-select-option>
              <a-select-option value="false"> 变量 </a-select-option>
            </a-select>
          </template>
        </a-col>
        <a-col :span="6">
          <template v-if="item.op !== 'IS_NULL' && item.op !== 'IS_NOT_NULL'">
            <template v-if="item.isConst">
              <staff-selector
                v-if="[5, 50, 51, 60, 61].includes(item.source.type)"
                v-model="item.target"
                style="width: 100%"
                :options="getStaffSelectorOpts(item.source.type)"
                @change="onChange"
              />

              <pca-selector
                v-else-if="[DataItemType.Address].includes(item.source.type)"
                v-model="item.target"
                :format="'pp-cc-aa'"
                :showEmpty="true"
                @change="(res, res2) => onAddressChange(item, res, res2)"
              />

              <a-range-picker
                v-else-if="
                  item.source.type === 3 &&
                  [
                    QueryOptionType.Between,
                    QueryOptionType.Not_Between,
                  ].includes(item.op)
                "
                v-model="item.target"
                :ranges="pickerRanges"
                @change="(d, ds) => onDateChange(item, ds)"
              >
                <a-icon slot="suffixIcon" type="calendar" />
              </a-range-picker>

              <a-date-picker
                v-else-if="3 === item.source.type"
                v-model="item.target"
                @change="(d, ds) => onDateChange(item, ds)"
              />

              <a-input-group
                v-else-if="
                  item.source.type === 2 &&
                  [
                    QueryOptionType.Between,
                    QueryOptionType.Not_Between,
                  ].includes(item.op)
                "
                compact
                style="display: flex"
                @change="(d) => onNumberChange(item, d)"
              >
                <a-input-number
                  id="groupNumber0"
                  v-model="item.target[0]"
                  style="flex: 1; text-align: center; border-right: 0"
                />
                <span
                  style="
                    width: 30px;
                    height: 32px;
                    line-height: 30px;
                    text-align: center;
                    background-color: #fff;
                    border: 1px solid #d9d9d9;
                    color: #a0a0a0;
                  "
                  >~</span>
                <a-input-number
                  id="groupNumber1"
                  v-model="item.target[1]"
                  style="flex: 1; text-align: center; border-left: 0"
                />
              </a-input-group>

              <a-input-number
                v-else-if="item.source.type === 2"
                v-model="item.target"
                style="width: 100%"
                @change="onChange"
              />

              <a-select
                v-else-if="item.source.type === 4"
                v-model="item.target"
                showSearch
                @change="onChange"
              >
                <a-select-option :value="1"> 是 </a-select-option>
                <a-select-option :value="0"> 否 </a-select-option>
                <a-select-option :value="2"> 全部 </a-select-option>
              </a-select>

              <a-select
                v-else-if="
                  item.source.type === 0 &&
                  item.source.code === 'sequenceStatus'
                "
                v-model="item.target"
                placeholder="请选择"
                showSearch
                @change="onChange"
              >
                <a-select-option value="PROCESSING"> 进行中 </a-select-option>
                <a-select-option value="COMPLETED"> 已完成 </a-select-option>
              </a-select>

              <a-input
                v-else
                v-model="item.target"
                :placeholder="
                  item.source.type === 3 ? '日期格式: 2019-05-10' : ''
                "
                @change="onChange"
              />
            </template>
            <config-provider v-else :locale="locale">
              <a-select
                v-if="
                  item.source.type === 3 &&
                  [
                    QueryOptionType.Between,
                    QueryOptionType.Not_Between,
                  ].includes(item.op)
                "
                v-model="item.target"
                defaultValue="1"
                placeholder="请选择"
                @change="onChange"
              >
                <a-select-option
                  v-for="(option, ids) in QueryDateTypeList"
                  :key="ids"
                  :value="option.type"
                >
                  {{ $t(`languages.Apps.ListControl.${option.text}`) }}
                </a-select-option>
              </a-select>
              <a-select
                v-else
                :value="item.target.code"
                :allowClear="!editable"
                :getPopupContainer="getPopupContainer"
                showSearch
                :filterOption="filterOption"
                @change="(e) => onTargetItemChange(e, item)"
              >
                <a-select-opt-group>
                  <span slot="label" class="select-title">业务数据项</span>
                  <template v-for="(i, idx) in targetOptions">
                    <a-select-option
                      v-if="!i.isSystem && isTargetShow(i, index)"
                      :key="idx"
                      :value="i.value"
                      :title="i.label"
                    >
                      {{ i.label }}
                    </a-select-option>
                  </template>
                </a-select-opt-group>
                <a-select-opt-group>
                  <span slot="label" class="select-title">系统数据项</span>
                  <template v-for="(i, idx) in sourceOptions">
                    <a-select-option
                      v-if="i.isSystem && isTargetShow(i, index)"
                      :key="idx"
                      :value="i.value"
                      :title="i.label"
                    >
                      {{ i.label }}
                    </a-select-option>
                  </template>
                </a-select-opt-group>
              </a-select>
            </config-provider>
          </template>
        </a-col>
        <a-col :span="2">
          <a-icon type="delete" @click="remove(index)" />
        </a-col>
      </a-row>
    </div>
    <div v-if="canAdd" class="add">
      <span>
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span @click="add">新增条件</span>
      </span>
    </div>
    <div v-if="showMsg" class="message">
      <div v-if="isMultiRelevantInSheet">
        在子表中的关联多选控件不支持映射功能
      </div>
      <div v-else>
        请检测当前表单是否已发布，或绑定的列表
        <template v-if="editable"> 展示字段是否有同类型数据项！ </template>
        <template v-else> 是否设置了查询条件！ </template>
        <!-- 请检查当前表单是否发布或绑定的列表 -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Col,
  ConfigProvider,
  Row,
  Select,
  DatePicker,
  Input,
  InputNumber,
  Icon,
} from '@h3/antd-vue';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { Component, Model, Prop, Vue, Watch } from 'vue-property-decorator';
import { DataItemType } from '../../../schema';
import { DataItem } from './data-item';
import StaffSelector from './form-staff-selector/pc/staff-selector.vue';
import {
  QueryDateTypeList,
  QueryOptionType,
  QueryOptionTypeList,
} from '../../schema/query-type';
import moment from 'moment';
import pcaSelector from 'cloudpivot/form/src/common/components/pca-selector/pca-selector.vue';

export interface DataitemSource {
  title: string;

  items: DataItem[];
}

export interface DataitemMappingValueItem {
  source: DataItem;
  isConst: boolean;
  target: DataItem | string | undefined;
  op: string;
}

interface SelectOption {
  title?: string;
  label: string;
  value: string;
  type: DataItemType;
  disabled: boolean;
  item: DataItem;
}

@Component({
  name: 'query-condition2',
  components: {
    ASelect: Select,
    ARow: Row,
    ACol: Col,
    ASelectOption: Select.Option,
    StaffSelector,
    ConfigProvider,
    pcaSelector,
    ASelectOptGroup: Select.OptGroup,
    ARangePicker: DatePicker.RangePicker,
    ADatePicker: DatePicker,
    AInputNumber: InputNumber,
    AInputGroup: Input.Group,
    AInput: Input,
    AIcon: Icon,
  },
})
export default class QueryCondition2 extends Vue {
  @Prop({
    default: false,
  })
  isMultiRelevantInSheet!: boolean;

  @Prop({
    default: {},
  })
  source!: DataitemSource;

  @Prop({
    default: {},
  })
  target!: DataitemSource;

  @Model('change')
  value!: DataitemMappingValueItem[];

  @Prop({
    default: () => [],
  })
  query!: DataitemMappingValueItem;

  @Prop({
    default: false,
  })
  editable!: boolean;

  taffSelectorOpts = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '',
  };

  selected: DataitemMappingValueItem[] = [];

  sourceOptions: SelectOption[] = [];

  targetOptions: SelectOption[] = [];

  sourceTargetOptionsMap: any = {};

  // canAdd = false;

  showMsg = false;

  // getTargetOptions(type: DataItemType) {
  //   return this.targetOptions.filter(p => p.type === type);
  // }

  getTargetOptions(item: DataItem) {
    return this.targetOptions.filter((p) => {
      const sameType = p.type === item.type;
      if (
        sameType &&
        (item.type === DataItemType.RelevanceForm ||
          item.type === DataItemType.RelevanceFormEx)
      ) {
        return item.relativeCode === p.item.relativeCode;
      }
      if (
        [
          DataItemType.ShortText,
          DataItemType.Radio,
          DataItemType.Dropdown,
          DataItemType.Checkbox,
          DataItemType.DropdownMulti,
        ].includes(item.type)
      ) {
        return [
          DataItemType.ShortText,
          DataItemType.Radio,
          DataItemType.Dropdown,
        ].includes(item.type)
          ? [
              DataItemType.ShortText,
              DataItemType.Radio,
              DataItemType.Dropdown,
            ].includes(p.type)
          : [DataItemType.Checkbox, DataItemType.DropdownMulti].includes(
              p.type,
            );
      }
      return sameType;
    });
  }

  onDateChange(cond: any, dateText: string) {
    cond.target = dateText;
    this.onChange();
  }

  getStaffSelectorOpts(cond) {
    const obj = {
      selectOrg: true,
      selectUser: true,
      mulpitle: true,
      showModel: true,
      showSelect: true,
      placeholder: '请选择',
    };
    switch (cond) {
      case DataItemType.StaffSingle:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = false;
        break;
      case DataItemType.StaffMulti:
        obj.selectOrg = false;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
      case DataItemType.DeptSingle:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = false;
        break;
      case DataItemType.DeptMulti:
        obj.selectOrg = true;
        obj.selectUser = false;
        obj.mulpitle = true;
        break;
      case DataItemType.StaffDeptMix:
        obj.selectOrg = true;
        obj.selectUser = true;
        obj.mulpitle = true;
        break;
      default:
        break;
    }
    return obj;
  }

  mapToOption(x: DataItem) {
    const label = x.parentCode
      ? `${x.name}[${x.parentCode}.${x.code}]`
      : `${x.name}[${x.code}]`;
    const value = x.parentCode ? `${x.parentCode}.${x.code}` : `${x.code}`;

    return {
      // value: x.code,
      value: value,
      label,
      type: x.type,
      disabled: false,
      isSystem: x.isSystem,
      item: x,
    };
  }

  mapToDataItem(x: SelectOption): DataItem {
    // return {
    //   code: x.value,
    //   name: x.label,
    //   type: x.type
    // } as any;
    return x.item;
  }

  @Watch('source', {
    immediate: true,
    deep: true,
  })
  onSourceChange(source: DataitemSource) {
    if (!source) {
      return;
    }
    console.log('aaa', source);

    this.sourceOptions = source.items
      .filter(this.filterDataItemType)
      .map(this.mapToOption);
    this.onTargetChange(this.target);
    this.showMsg = !this.canAdd;
  }

  @Watch('target', {
    immediate: true,
    deep: true,
  })
  onTargetChange(target: DataitemSource) {
    if (!target) {
      return;
    }
    this.targetOptions = target.items
      .filter(this.filterDataItemType)
      .map(this.mapToOption);
  }

  @Watch('value', {
    immediate: true,
  })
  onValueChange(val: DataitemMappingValueItem[]) {
    this.selected.forEach((item: any) => {
      if (
        [QueryOptionType.Between, QueryOptionType.Not_Between].includes(
          item.op,
        ) &&
        item.source.type === DataItemType.Number
      ) {
        item.isConst = true;
      }
    });
    if (val) {
      setTimeout(() => {
        this.selected = JSON.parse(JSON.stringify(val));
        const map = {} as any;
        this.selected.forEach((item) => {
          // @ts-ignore
          this.findSourceOptionAndDisabled(item.source.code, true);
          if (typeof item.target !== 'string') {
            // @ts-ignore
            this.findTargetOptionAndDisabled(item.target.code, true);
          }
          const temp = this.getTargetOptions(item.source);
          temp.forEach((el) => {
            el.title = el.label;
          });
          map[item.source.code] = temp;
        });
        this.sourceTargetOptionsMap = map;
      }, 10);
    }
  }

  onIsConstChange(checked: string, item: DataitemMappingValueItem) {
    if (checked === 'true') {
      if (typeof item.target !== 'string') {
        // @ts-ignore
        this.findTargetOptionAndDisabled(item.target.code, false);
      }
      item.target = '';
    } else {
      (item as any).target = {};
    }
    item.isConst = checked === 'true';
    this.onChange();
  }

  findSourceOptionAndDisabled(code: string, disabled: boolean) {
    const so = this.sourceOptions.find((soItem) => soItem.value === code);
    if (so) {
      so.disabled = disabled;
    }
  }

  onSourceItemChange(item: DataitemMappingValueItem) {
    this.findSourceOptionAndDisabled(item.source.code, true);
    const item2 = this.source.items.find((x) => x.code === item.source.code);
    if (item2) {
      item.source = Object.assign({}, item2);

      const targetOpts = this.getTargetOptions(item2);

      if (typeof item.target !== 'string') {
        const target = item.target;
        if (
          targetOpts.length &&
          // @ts-ignore
          !targetOpts.some((x) => x.value === target.code)
        ) {
          // @ts-ignore
          this.findTargetOptionAndDisabled(target.code, false);
          item.target = this.mapToDataItem(targetOpts[0]);
        } else {
          // @ts-ignore
          this.findTargetOptionAndDisabled(target.code, false);
          item.target = {
            code: '',
          } as any;
        }
      }

      this.sourceTargetOptionsMap[item2.code] = targetOpts;
    }
    let itemTarget: any = {};
    if (item.isConst) {
      switch (item.source.type) {
        case DataItemType.StaffSingle:
        case DataItemType.DeptSingle:
          itemTarget = [];
          break;
        case DataItemType.DeptMulti:
        case DataItemType.StaffMulti:
        case DataItemType.StaffDeptMix:
          itemTarget = [];
          break;
        default:
          itemTarget = '';
          break;
      }
      item.target = itemTarget as DataItem;
    }
    this.onChange();
    this.$nextTick(() => {
      const ops = this.getQueryOptionTypeList(item);
      if (ops.find((i) => i.op !== item.op)) {
        item.op = ops[0].op;
      }
    });
  }

  findTargetOptionAndDisabled(code: string, disabled: boolean) {
    const so = this.targetOptions.find((soItem) => soItem.value === code);
    if (so) {
      so.disabled = disabled;
    }
  }

  onTargetItemChange(selectedCode: string, item: DataitemMappingValueItem) {
    // allowClear:true时，点击清楚item.target.code为undefined，
    // 但我们需要将选中的选项disabled设为false

    if (typeof item.target !== 'string') {
      // @ts-ignore
      if (item.target.code !== selectedCode) {
        // @ts-ignore
        if (item.target.code) {
          // @ts-ignore
          this.findTargetOptionAndDisabled(item.target.code, false);
        }
        // @ts-ignore
        item.target.code = selectedCode;
      }
    }
    this.onChange();
  }

  findNext() {
    const sourceItems = this.sourceOptions.filter((op) => !op.disabled);

    let targetItem: any;
    let sourceItem: any;
    for (const option of sourceItems) {
      sourceItem = option;
      targetItem = this.getTargetOptions(option.item).find((x) => !x.disabled);
      if (targetItem) {
        break;
      }
    }

    if (!targetItem) {
      return;
    }

    return [sourceItem, targetItem];
  }

  get canAdd() {
    const next = this.findNext();
    console.log('next===>', !!next);
    return !!next;
  }

  add() {
    const next = this.findNext();
    if (!next) {
      return;
    }

    const sourceItem = next[0];
    const targetItem = next[1];

    sourceItem.disabled = true;

    this.selected.push({
      source: this.mapToDataItem(sourceItem),
      isConst: false,
      target: this.mapToDataItem(targetItem) as DataItem,
      op: 'eq',
    });

    this.onChange();
  }

  remove(index: number) {
    const item = this.selected[index];
    // @ts-ignore
    this.findSourceOptionAndDisabled(item.source.code, false);
    if (typeof item.target !== 'string') {
      // @ts-ignore
      this.findTargetOptionAndDisabled(item.target.code, false);
    }
    this.selected.splice(index, 1);
    this.onChange();
  }

  onChange() {
    this.selected.forEach((item: any) => {
      if (
        !item.isConst &&
        item.target &&
        this.isHasBetweenOrNot(item) &&
        typeof item.target !== 'number'
      ) {
        item.target = 1;
      }
    });
    this.$emit('change', this.selected);
  }

  get locale() {
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;
      case 'en':
        return enUS;
    }
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
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

  isHasBetweenOrNot(item) {
    return [QueryOptionType.Between, QueryOptionType.Not_Between].includes(
      item.op,
    );
  }

  onNumberChange(cond: any, res: any) {
    const id = res.target.id;
    let start: any = '';
    let end: any = '';
    if (cond.target && cond.target.length === 2) {
      start = Number(cond.target[0]);
      end = Number(cond.target[1]);
    }
    if (id === 'groupNumber0') {
      start = Number(res.target.value);
      // end = Math.max(start, end)
    } else {
      end = Number(res.target.value);
      // start = Math.min(start, end)
    }
    cond.target = [start, end];
    this.onChange();
  }

  onOpChange(cond: any, res: any, res2: any) {
    if (
      [QueryOptionType.Between, QueryOptionType.Not_Between].includes(cond.op)
    ) {
      cond.target = ['', ''];
    } else if (Array.isArray(cond.target)) {
      cond.target = '';
    } else {
      //Else Empty block statement
    }
    this.onChange();
  }

  onAddressChange(cond: any, res: any, res2: any) {
    this.onChange();
  }

  // 过滤不参与的数据项
  filterDataItemType(item) {
    const bl = !(
      [
        DataItemType.Attachment,
        DataItemType.Sheet,
        DataItemType.LongText,
      ].includes(item.type) ||
      ['ownerDeptQueryCode', 'workflowInstanceId'].includes(item.code)
    );
    return bl;
  }

  isTargetShow(target, index) {
    const source = this.selected[index].source;
    switch (source.type) {
      case DataItemType.ShortText:
      case DataItemType.LongText:
      case DataItemType.Radio:
      case DataItemType.Dropdown:
        return [
          DataItemType.ShortText,
          DataItemType.LongText,
          DataItemType.Radio,
          DataItemType.Dropdown,
        ].includes(target.type);
      case DataItemType.DropdownMulti:
      case DataItemType.Checkbox:
        return [DataItemType.DropdownMulti, DataItemType.Checkbox].includes(
          target.type,
        );
      case DataItemType.Date:
        return [DataItemType.Date].includes(target.type);
      case DataItemType.Number:
        return [DataItemType.Number].includes(target.type);
      case DataItemType.StaffSingle:
        return [DataItemType.StaffSingle].includes(target.type);
      case DataItemType.StaffMulti:
        return [DataItemType.StaffMulti].includes(target.type);
      case DataItemType.DeptSingle:
        return [DataItemType.DeptSingle].includes(target.type);
      case DataItemType.DeptMulti:
        return [DataItemType.DeptMulti].includes(target.type);
      case DataItemType.StaffDeptMix:
        return [DataItemType.StaffDeptMix].includes(target.type);
      case DataItemType.Address:
        return [DataItemType.Address].includes(target.type);
      case DataItemType.Logic:
        return [DataItemType.Logic].includes(target.type);
      default:
        return false;
    }
  }

  get QueryDateTypeList() {
    return QueryDateTypeList.filter((item) => item.type !== 0);
  }

  get QueryOptionType() {
    return QueryOptionType;
  }

  get DataItemType() {
    return DataItemType;
  }

  getQueryOptionTypeList({ source }) {
    const { type, code } = source;
    return QueryOptionTypeList.filter((item) => {
      switch (item.op) {
        case QueryOptionType.eq:
          return true;
        case QueryOptionType.NotEq:
        case QueryOptionType.IS_NULL:
        case QueryOptionType.IS_NOT_NULL:
          return ![DataItemType.Logic].includes(type);
        case QueryOptionType.IS_Contains:
        case QueryOptionType.IS_NOT_Contains:
          return [
            DataItemType.ShortText,
            DataItemType.LongText,
            DataItemType.Radio,
            DataItemType.Dropdown,
            DataItemType.Checkbox,
            DataItemType.DropdownMulti,
            DataItemType.StaffMulti,
            DataItemType.DeptMulti,
            DataItemType.StaffDeptMix,
            DataItemType,
          ].includes(type);
        case QueryOptionType.Greater_Than:
        case QueryOptionType.Less_Than:
        case QueryOptionType.Greater_Than_Or_Equal_To:
        case QueryOptionType.Less_Than_Or_Equal_To:
        case QueryOptionType.Between:
        case QueryOptionType.Not_Between:
          return [DataItemType.Date, DataItemType.Number].includes(type);
        default:
          return false;
      }
    });
  }

  get pickerRanges() {
    return {
      当天: [moment(), moment()],
      昨天: [moment().add(-1, 'days'), moment().add(-1, 'days')],
      本周: [moment().startOf('week'), moment().endOf('week')],
      上周: [
        moment()
          .week(moment().week() - 1)
          .startOf('week'),
        moment()
          .week(moment().week() - 1)
          .endOf('week'),
      ],
      本月: [moment().startOf('month'), moment().endOf('month')],
      上月: [
        moment()
          .month(moment().month() - 1)
          .startOf('month'),
        moment()
          .month(moment().month() - 1)
          .endOf('month'),
      ],
      本季度: [moment().startOf('quarter'), moment().endOf('quarter')],
      本年度: [moment().startOf('year'), moment().endOf('year')],
    };
  }
}
</script>

<style lang="less" scoped>
.querycondition-warp {
  background: #f4f5f8;
  padding: 16px;
  border-radius: 4px;
}
.mappingHeader {
  margin-bottom: 8px;
}

.message {
  margin-top: 2em;
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
  color: #000;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
}
.mappingHeader {
  .pca-selector {
    background: #fff;
    /deep/.pca-selector--content {
      &:hover {
        border-color: @primary-color;
      }
      &.focus,
      &.selected {
        border-color: @primary-color;
        box-shadow: 0 0 0 2px rgba(23, 188, 148, 0.2);
      }
    }
  }
  .h3-organization {
    background: #fff;
  }
}
</style>
