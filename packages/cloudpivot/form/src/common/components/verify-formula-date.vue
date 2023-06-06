<template>
  <div>
    <div class="verify-item">
      <div class="label">校验方式</div>
      <div class="content">
        <a-radio-group v-model="verifyFormula.partterValue">
          <a-radio :value="1" style="width: 120px"> 常量 </a-radio>
          <a-radio :value="2"> 动态值 </a-radio>
        </a-radio-group>
      </div>
    </div>
    <div class="verify-item" style="margin-top: 16px; margin-bottom: 16px">
      <div class="label">
        校验规则
        <a-tooltip>
          <template slot="title">
            <div class="tool-tip">
              <p>1. 只能选择相同显示格式数据项;</p>
              <p>
                2.
                当选择当天时，输入框填写负数表示当天之前，零表示当天，正数表示当天之后，单位为天。
              </p>
            </div>
          </template>
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </div>
      <div class="content">
        <a-config-provider :locale="locale">
          <a-select
            v-model="verifyFormula.verifyRuleValue"
            style="width: 120px; flex-shrink: 0"
            :getPopupContainer="getPopupContainer"
          >
            <a-select-option
              v-for="item in rule"
              :key="item.value"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-config-provider>
        <!-- 常量 校验方式 填值框 -->
        <div v-show="isQuantity" style="margin-left: 8px; flex: 1">
          <!--非介于-->
          <a-date-picker
            v-show="!isRangeRule"
            v-model="verifyFormula.date"
            :placeholder="$t('languages.PlaceHolder.Select')"
            class="date-picker"
            format="YYYY-MM-DD"
            style="width: 100%"
          />
          <!--介于-->
          <div v-show="isRangeRule" class="content" style="align-items: center">
            <a-range-picker
              v-model="verifyFormula.rangeDate"
              :placeholder="['请选择', '请选择']"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
        <!-- 动态值 校验方式 填值框 -->
        <div v-show="!isQuantity" style="margin-left: 8px; flex: 1 100%">
          <a-config-provider :locale="locale">
            <a-select
              v-model="verifyFormula.dynamicTypeValue"
              placeholder="请选择数据项"
              style="width: 100%"
              :getPopupContainer="getPopupContainer"
              @change="dynamicTypeValueHandleChange"
            >
              <a-select-option
                v-for="(item, index) in dynamicTypeSelectList"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-config-provider>
        </div>
      </div>
    </div>
    <!--如果是动态值-->
    <div v-show="!isQuantity" class="verify-item" style="margin-bottom: 16px">
      <div class="label"></div>
      <div v-show="isDynamicDay" class="content">
        <a-input-number
          v-show="!isRangeRule"
          v-model="verifyFormula.numInput"
          placeholder="请输入数字"
          style="width: 100%"
        />
        <div v-show="isRangeRule" class="content" style="align-items: center">
          <a-input-number
            v-model="verifyFormula.numInput1"
            placeholder="请输入数字"
            style="width: 100%"
          />
          <div
            style="margin: 0 6px; color: rgba(0, 0, 0, 0.65); font-size: 14px"
          >
            ~
          </div>
          <a-input-number
            v-model="verifyFormula.numInput2"
            placeholder="请输入数字"
            style="width: 100%"
          />
        </div>
      </div>
      <div v-show="!isDynamicDay" class="content">
        <!--非介于-->
        <a-config-provider :locale="locale">
          <a-select
            v-show="!isRangeRule"
            :value="verifyFormula.selectDataItem"
            allowClear
            placeholder="请选择数据项"
            style="width: 100%"
            :getPopupContainer="getPopupContainer"
            @change="selectDataItemHandleChange"
          >
            <a-select-option
              v-for="item in selectListDataItemsDate"
              :key="item.id"
              :value="item.code"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-config-provider>
        <!--介于-->
        <div v-show="isRangeRule" class="content" style="align-items: center">
          <a-config-provider :locale="locale">
            <a-select
              :value="verifyFormula.rangeSelectDataItem1"
              allowClear
              placeholder="请选择数据项"
              style="width: 185px"
              :getPopupContainer="getPopupContainer"
              @change="rangeSelectDataItem1HandleChange"
            >
              <a-select-option
                v-for="item in selectListDataItemsDate"
                :key="item.id"
                :value="item.code"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-config-provider>
          <div
            style="margin: 0 6px; color: rgba(0, 0, 0, 0.65); font-size: 14px"
          >
            ~
          </div>
          <a-config-provider :locale="locale">
            <a-select
              :value="verifyFormula.rangeSelectDataItem2"
              allowClear
              placeholder="请选择数据项"
              style="width: 184px"
              :getPopupContainer="getPopupContainer"
              @change="rangeSelectDataItem2HandleChange"
            >
              <a-select-option
                v-for="item in selectListDataItemsDate"
                :key="item.id"
                :value="item.code"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-config-provider>
        </div>
      </div>
    </div>
    <div class="verify-item" style="margin-bottom: 16px">
      <div class="label" style="margin-top: 5px">校验失败提示语</div>
      <div class="content">
        <a-input
          v-model="verifyFormula.promptText"
          maxlength="200"
          placeholder="请输入"
        />
      </div>
    </div>
    <div class="verify-item">
      <div class="label">
        提示弹框
        <a-tooltip
          title="校验失败提示语字数较多时请使用长提示弹框，只针对web端"
        >
          <a-icon type="question-circle-o" />
        </a-tooltip>
      </div>
      <div class="content">
        <a-radio-group v-model="verifyFormula.errDialogboxType">
          <a-radio :value="1" style="width: 120px"> 短提示弹框 </a-radio>
          <a-radio :value="2"> 长提示弹框 </a-radio>
        </a-radio-group>
      </div>
    </div>
    <div class="verify-item-error-tip">
      <div class="content-tip">
        <div v-if="verifyFormula.errDialogboxType === 1" class="tip-body">
          <i class="icon aufontAll h-icon-all-close-circle"></i>
          <span>这是一条异常消息，会主动消失</span>
        </div>
        <div
          v-else-if="verifyFormula.errDialogboxType === 2"
          class="tip-body-long"
        >
          <div class="top">
            <i class="icon aufontAll h-icon-all-close-circle"></i>
            <span>错误提示</span>
            <div>
              一系列的信息描述，可能会很长。也可以是很短同样也可以带标点。
            </div>
          </div>
          <div class="bottom">
            <a-button size="small" type="primary"> 知道了 </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import {
  message,
  ConfigProvider,
  Radio,
  Tooltip,
  Icon,
  Select,
  DatePicker,
  InputNumber,
  Input,
  Button,
} from '@h3/antd-vue';

const VerifyRule = [
  { name: '等于', value: '=' },
  { name: '大于', value: '>' },
  { name: '小于', value: '<' },
  { name: '大于等于', value: '>=' },
  { name: '小于等于', value: '<=' },
  { name: '介于', value: '~' },
];
enum VerifyRuleEnum {
  '=' = '等于',
  '>' = '大于',
  '<' = '小于',
  '>=' = '大于等于',
  '<=' = '小于等于',
  '~' = '介于',
}
interface IVerifyRuleItem {
  name: string;
  value: string;
}
interface IVerifyFunctionReturn {
  value: Object;
  status: boolean;
}

@Component({
  name: 'VerifyFormulaDate',
  components: {
    AConfigProvider: ConfigProvider,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATooltip: Tooltip,
    AIcon: Icon,
    ASelect: Select,
    ASelectOption: Select.Option,
    ADatePicker: DatePicker,
    ARangePicker: DatePicker.RangePicker,
    AInputNumber: InputNumber,
    AInput: Input,
    AButton: Button,
  },
})
export default class VerifyFormulaDate extends Vue {
  @Prop() selectListDataItemsDate!: any;

  @Prop() modalData!: any;

  @Prop() verifyFormula!: any;

  @Prop() visible: any;

  // 是否是常量模式
  get isQuantity() {
    return this.verifyFormula.partterValue === 1;
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

  // 校验规则 数组
  rule: IVerifyRuleItem[] = VerifyRule;

  dateFormat = 'YYYY-MM-DD';

  // 动态值 选择类型 list
  dynamicTypeSelectList = [
    {
      name: '数据项',
      value: 1,
    },
    {
      name: '当天',
      value: 2,
    },
  ];

  dateControlOptions: any[] = [];

  // 动态值 选择类型 值变化回掉方法
  dynamicTypeValueHandleChange() {}

  // 动态值 类型是 当天
  get isDynamicDay() {
    return this.verifyFormula.dynamicTypeValue === 2;
  }

  // 判断当前校验规则是否是 介于
  get isRangeRule() {
    return this.verifyFormula.verifyRuleValue === '~';
  }

  // 动态值 非介于 值
  selectDataItemHandleChange(val: string) {
    this.verifyFormula.selectDataItem = val || '';
  }

  // 动态值 介于 第一个值
  rangeSelectDataItem1HandleChange(val: string) {
    this.verifyFormula.rangeSelectDataItem1 = val || '';
  }

  // 动态值 介于 第二个值
  rangeSelectDataItem2HandleChange(val: string) {
    this.verifyFormula.rangeSelectDataItem2 = val || '';
  }

  closeModal() {
    this.$emit('closeModal');
  }

  isChild: boolean = false;

  @Watch('visible')
  changeModelData(val: any) {
    if (val) {
      if (this.modalData && this.modalData.options) {
        this.modalData.options.verifyFormula &&
          this.parseModalData(this.modalData.options.verifyFormula);
      }
    }
  }

  // 反解析 值
  parseModalData(val: string) {
    if (typeof val === 'object') {
      const obj = JSON.parse(JSON.stringify(val));
      for (const key of Object.keys(obj)) {
        const v = obj[key];
        var st: any[] = [];
        switch (key) {
          case 'type':
            this.verifyFormula.partterValue = +v as 1 | 2;
            break;
          case 'rule':
            this.verifyFormula.verifyRuleValue = v;
            break;
          case 'lInput':
            this.verifyFormula.numInput1 = +v as number;
            break;
          case 'rInput':
            this.verifyFormula.numInput2 = +v as number;
            break;
          case 'input':
            this.verifyFormula.numInput = +v as number;
            break;
          case 'select':
            st = this.selectListDataItemsDate.filter(
              (item: any) => item.code === v,
            ).length;
            if (st) {
              this.verifyFormula.selectDataItem = v;
            }
            break;
          case 'lSelect':
            st = this.selectListDataItemsDate.filter(
              (item: any) => item.code === v,
            ).length;
            if (st) {
              this.verifyFormula.selectDataItem = v;
            }
            const [obj] = this.selectListDataItemsDate.filter(
              (val) => val.code === v,
            );
            this.verifyFormula.rangeSelectDataItem1 = obj ? v : '';
            break;
          case 'rSelect':
            st = this.selectListDataItemsDate.filter(
              (item: any) => item.code === v,
            ).length;
            if (st) {
              this.verifyFormula.selectDataItem = v;
            }

            const [objs] = this.selectListDataItemsDate.filter(
              (val) => val.code === v,
            );
            this.verifyFormula.rangeSelectDataItem2 = objs ? v : '';
            break;
          case 'prompt':
            this.verifyFormula.promptText = decodeURIComponent(v);
            break;
          case 'day':
            this.verifyFormula.dynamicTypeValue = +v === 1 ? 2 : 1;
            break;
          case 'date':
            this.verifyFormula.date = moment(v);
            break;
          case 'lDate':
            if (!this.verifyFormula.rangeDate) {
              this.verifyFormula.rangeDate = [];
            }

            this.verifyFormula.rangeDate[0] = moment(v);
            break;
          case 'rDate':
            if (!this.verifyFormula.rangeDate) {
              this.verifyFormula.rangeDate = [];
            }

            this.verifyFormula.rangeDate[1] = moment(v);
            break;
          case 'dialogBox':
            this.verifyFormula.errDialogboxType = +v as 1 | 2;
            break;
          default:
            break;
        }
      }
    } else {
      const arr = val.split('_');
      for (const value of arr) {
        const [key, v] = value.split(':');
        switch (key) {
          case 'type':
            this.verifyFormula.partterValue = +v as 1 | 2;
            break;
          case 'rule':
            this.verifyFormula.verifyRuleValue = v;
            break;
          case 'lInput':
            this.verifyFormula.numInput1 = +v as number;
            break;
          case 'rInput':
            this.verifyFormula.numInput2 = +v as number;
            break;
          case 'input':
            this.verifyFormula.numInput = +v as number;
            break;
          case 'select':
            st = this.selectListDataItemsDate.filter(
              (item: any) => item.code === v,
            ).length;
            if (st) {
              this.verifyFormula.selectDataItem = v;
            }
            break;
          case 'lSelect':
            st = this.selectListDataItemsDate.filter(
              (item: any) => item.code === v,
            ).length;
            if (st) {
              this.verifyFormula.selectDataItem = v;
            }
            const [obj] = this.dateControlOptions.filter(
              (val) => val.code === v,
            );
            this.verifyFormula.rangeSelectDataItem1 = obj ? v : '';
            break;
          case 'rSelect':
            st = this.selectListDataItemsDate.filter(
              (item: any) => item.code === v,
            ).length;
            if (st) {
              this.verifyFormula.selectDataItem = v;
            }
            const [objs] = this.dateControlOptions.filter(
              (val) => val.code === v,
            );
            this.verifyFormula.rangeSelectDataItem2 = objs ? v : '';
            break;
          case 'prompt':
            this.verifyFormula.promptText = decodeURIComponent(v);
            break;
          case 'day':
            this.verifyFormula.dynamicTypeValue = +v === 1 ? 2 : 1;
            break;
          case 'date':
            this.verifyFormula.date = moment(v);
            break;
          case 'lDate':
            if (!this.verifyFormula.rangeDate) {
              this.verifyFormula.rangeDate = [];
            }

            this.verifyFormula.rangeDate[0] = moment(v);
            break;
          case 'rDate':
            if (!this.verifyFormula.rangeDate) {
              this.verifyFormula.rangeDate = [];
            }

            this.verifyFormula.rangeDate[1] = moment(v);
            break;
          case 'dialogBox':
            this.verifyFormula.errDialogboxType = +v as 1 | 2;
            break;
          default:
            break;
        }
      }
    }
  }

  // 校验常量模式下
  verifyQuantity(
    date: any,
    rangeDate: any[],
    rValue: Object,
  ): IVerifyFunctionReturn {
    const value = '',
      status = true;
    if (!this.isRangeRule) {
      // 非介于!~ 规则
      if (date) {
        const t = moment(date).format(this.dateFormat);
        return { value: { ...rValue, date: t }, status };
      } else {
        return { value: '请选择日期', status: false };
      }
    } else {
      // 介于~ 规则
      if (rangeDate && rangeDate.length) {
        let [l, r] = rangeDate;
        l = moment(l).format(this.dateFormat);
        r = moment(r).format(this.dateFormat);
        return { value: { ...rValue, lDate: l, rDate: r }, status };
      } else {
        return { value: '请选择日期范围', status: false };
      }
    }
  }

  // 校验动态值 模式
  verifyDynamic(
    selectDataItem: string | [],
    rangeSelectDataItem1: string | [],
    rangeSelectDataItem2: string | [],
    numInput: number | '',
    numInput1: number | '',
    numInput2: number | '',
    rValue: Object,
  ): IVerifyFunctionReturn {
    const value = '',
      status = true;
    if (this.isDynamicDay) {
      // 选择当天作为判断值
      if (!this.isRangeRule) {
        // 非介于!~ 规则
        if (
          ('' + numInput).length > 0 &&
          !/^[\+\-]?\d*?\.?\d*?$/.test('' + numInput)
        ) {
          message.error('校验规则不合法!');
          return { value, status: false };
        } else if (('' + numInput).length > 0) {
          return { value: { ...rValue, day: 1, input: numInput }, status };
        } else {
          //Else Empty block statement
        }
      } else {
        //  介于~ 规则
        if (('' + numInput1).length > 0 && ('' + numInput2).length === 0) {
          // 只填写左侧边界值
          message.error('请输入右侧边界值!');
          return { value, status: false };
        } else if (
          ('' + numInput1).length === 0 &&
          ('' + numInput2).length > 0
        ) {
          // 只填写右侧边界值
          message.error('请输入左侧边界值!');
          return { value, status: false };
        } else if (('' + numInput1).length > 0 && ('' + numInput2).length > 0) {
          // 左右边界值 都有填写
          if (!/^[\+\-]?\d*?\.?\d*?$/.test('' + numInput1)) {
            // 左侧边界值 格式不对
            message.error('校验规则,左侧边界值不合法!');
            return { value, status: false };
          } else if (!/^[\+\-]?\d*?\.?\d*?$/.test('' + numInput2)) {
            // 右侧边界值 格式不对
            message.error('校验规则,右侧边界值不合法!');
            return { value, status: false };
          } else {
            //Else Empty block statement
          }
          return {
            value: { ...rValue, day: 1, lInput: numInput1, rInput: numInput2 },
            status,
          };
        } else {
          //Else Empty block statement
        }
      }
    } else {
      // 选择数据项
      if (!this.isRangeRule) {
        // 非介于判断
        if (selectDataItem.length > 0) {
          // 如果大于0说明选择了值
          return {
            value: { ...rValue, day: 0, select: selectDataItem },
            status,
          };
        }
      } else {
        // 介于判断
        if (
          rangeSelectDataItem1.length > 0 &&
          rangeSelectDataItem2.length === 0
        ) {
          // 左侧边界有值 右边界没有
          message.error('请选择右侧边界值!');
          return { value, status: false };
        } else if (
          rangeSelectDataItem1.length === 0 &&
          rangeSelectDataItem2.length > 0
        ) {
          // 左侧边界没值, 右边界有值
          message.error('请选择左侧边界值!');
          return { value, status: false };
        } else if (
          rangeSelectDataItem1.length > 0 &&
          rangeSelectDataItem2.length > 0
        ) {
          return {
            value: {
              ...rValue,
              day: 0,
              lSelect: rangeSelectDataItem1,
              rSelect: rangeSelectDataItem2,
            },
            status,
          };
        } else {
          //Else Empty block statement
        }
      }
    }
    return { value, status };
  }

  // 失败提示语
  verifyPrompt(
    promptText: string,
    partterValue: number,
    verifyRuleValue: any,
    rValue: Object,
  ): IVerifyFunctionReturn {
    if (promptText.length === 0) {
      // 没有填写 失败提示语,使用默认的提示语
      // 数据项名称+必须+等于/大于/小于/大于等于/小于等于/介于+校验规则
      if (partterValue === 1) {
        // 常量
        let v = '';
        if (this.isRangeRule) {
          let [l, r] = this.verifyFormula.rangeDate;
          l = moment(l).format(this.dateFormat);
          r = moment(r).format(this.dateFormat);
          v = `${this.verifyFormula.currControlOptions.name as any}必须${
            VerifyRuleEnum[verifyRuleValue]
          }${l}~${r}`;
        } else {
          const t = moment(this.verifyFormula.date).format(this.dateFormat);
          v = `${this.verifyFormula.currControlOptions.name as any}必须${
            VerifyRuleEnum[verifyRuleValue]
          }${t}`;
        }
        return { value: { ...rValue, defaultPrompt: v }, status: true };
      } else {
        if (this.isDynamicDay) {
          //动态值 当天模式
          const v = `${this.verifyFormula.currControlOptions.name as any}必须${
            VerifyRuleEnum[verifyRuleValue]
          }`;
          return { value: { ...rValue, defaultPrompt: v }, status: true };
        } else {
          let v = '';
          if (this.isRangeRule) {
            // 介于 规则
            const [cname1] = this.selectListDataItemsDate.filter(
              (val) => val.code === this.verifyFormula.rangeSelectDataItem1,
            );
            const [cname2] = this.selectListDataItemsDate.filter(
              (val) => val.code === this.verifyFormula.rangeSelectDataItem2,
            );
            v = `${this.verifyFormula.currControlOptions.name as any}必须${
              VerifyRuleEnum[verifyRuleValue]
            }${cname1.name}~${cname2.name}`;
          } else {
            // 非介于 规则
            const [cname] = this.selectListDataItemsDate.filter(
              (val) => val.code === this.verifyFormula.selectDataItem,
            );
            v = `${this.verifyFormula.currControlOptions.name as any}必须${
              VerifyRuleEnum[verifyRuleValue]
            }${cname.name}`;
          }
          return { value: { ...rValue, defaultPrompt: v }, status: true };
        }
      }
    } else {
      const encodeText = encodeURIComponent(promptText);
      return { value: { ...rValue, prompt: encodeText }, status: true };
    }
  }

  backData() {
    const value = this.getData();
    this.$emit('backData', { value: value ? JSON.stringify(value) : '' });
  }

  getData() {
    let rValue: any = {
      type: this.verifyFormula.partterValue,
      rule: this.verifyFormula.verifyRuleValue,
      dialogBox: this.verifyFormula.errDialogboxType,
    };
    if (this.verifyFormula.partterValue === 1) {
      const { value, status } = this.verifyQuantity(
        this.verifyFormula.date,
        this.verifyFormula.rangeDate,
        rValue,
      );
      if (!status) {
        this.$message.error(value as string);
        return;
      }
      rValue = value;
    } else {
      const { value, status } = this.verifyDynamic(
        this.verifyFormula.selectDataItem,
        this.verifyFormula.rangeSelectDataItem1,
        this.verifyFormula.rangeSelectDataItem2,
        this.verifyFormula.numInput,
        this.verifyFormula.numInput1,
        this.verifyFormula.numInput2,
        rValue,
      );
      if (!status) {
        return;
      }
      rValue = value;
    }
    // 如果 校验规则 输入框或下拉框没有填写 则默认为 校验组件为空
    if (rValue) {
      const { value } = this.verifyPrompt(
        this.verifyFormula.promptText,
        this.verifyFormula.partterValue,
        this.verifyFormula.verifyRuleValue,
        rValue,
      );
      rValue = value;
      return rValue;
      // this.$emit("backData", { value: JSON.stringify(rValue) });
    } else {
      return '';
      // this.$emit("backData", { value: "" });
    }
  }

  created() {
    if (this.modalData && this.modalData.options) {
      this.modalData.options.verifyFormula &&
        this.parseModalData(this.modalData.options.verifyFormula);
    }
  }
}
</script>
<style lang="less" scoped>
.verify-item {
  display: flex;
  width: 100%;
  height: 32px;
  align-items: center;
  .label {
    width: 16.66666667%;
    flex-shrink: 0;
    /*margin-right: 10px;*/
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }
  .content {
    display: flex;
    flex: 1;
  }
}
.tool-tip {
  width: 240px;
}

.verify-item-error-tip {
  margin-left: 16.66666667%;

  .content-tip {
    width: 100%;
    height: 124px;
    background: #f4f5f8;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    .tip-body {
      width: 278px;
      background: #ffffff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      padding: 5px;

      i {
        color: #f4454e;
        margin-right: 10px;
        margin-left: 10px;
      }
    }

    .tip-body-long {
      padding: 12px 12px 10px;
      width: 284px;
      height: 108px;
      background: #ffffff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 2px;

      .top {
        i {
          color: #f4454e;
          float: left;
          margin-right: 12px;
          height: 20px;
          line-height: 20px;
          font-size: 14px;
        }

        span {
          display: block;
          overflow: hidden;
          color: rgba(0, 0, 0, 0.85);
          font-weight: 500;
          font-size: 14px;
          line-height: 1.4;
        }

        div {
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.65);
          font-size: 12px;
          margin-left: 26px;
        }
      }

      .bottom {
        float: right;
      }
    }
  }
}
</style>
<style lang="less" scoped>
.verify-item {
  .content {
    .ant-input-number-input {
      font-size: 14px;
    }
  }
}
</style>
