<template>
  <a-modal
    :title="title"
    :visible="true"
    width="750px"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <div class="regular-wrap">
      <div class="clearfix row">
        <div class="left">
          <span>校验类型:</span>
        </div>
        <div class="right">
          <a-select
            v-model="checkType"
            placeholder="请选择"
            class="select"
            @change="handleChangeType"
          >
            <a-select-option v-if="isShowRegex" :value="1">
              正则校验
            </a-select-option>
            <a-select-option v-if="isShowVerifyFormula" :value="2">
              提交校验
            </a-select-option>
            <!-- <a-select-option :value="3" v-if="isShowEmptyRow">空行校验</a-select-option>
          <a-select-option :value="4" v-if="isShowMaxlength">文本最大长度校验</a-select-option>
          <a-select-option :value="5" v-if="isShowNorepeat">去重</a-select-option> -->
          </a-select>
        </div>
      </div>
      <div class="clearfix row">
        <div class="left">
          <span>校验数据项:</span>
        </div>
        <div class="right">
          <a-select
            v-model="dataItem.code"
            class="select"
            :disabled="true"
            placeholder="请选择"
          >
            <a-select-option v-for="i in dataItems" :key="i.id" :value="i.code">
              {{ i.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <template v-if="isShowRegex && checkType === 1">
        <div class="clearfix row">
          <div class="left">
            <span>{{
                $t('languages.Apps.FormDesignPage.SelectRegularTemp')
              }}:</span>
          </div>
          <div class="right">
            <a-select
              v-model="regularData.selectOption"
              class="select"
              :placeholder="$t('languages.PlaceHolder.Select')"
              allowClear
              @change="changeRegularOptions"
            >
              <a-select-option
                v-for="(regular, index) in regularRules"
                :key="index"
                :value="regular.rule"
              >
                {{ regular.text }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="clearfix row">
          <div class="left">
            <span>{{ $t('languages.Apps.FormDesignPage.Regular') }}:</span>
          </div>
          <div class="right">
            <a-input
              v-model="regularData.regularText"
              class="input"
              :placeholder="$t('languages.PlaceHolder.Input')"
              :disabled="disabled"
            />
          </div>
        </div>
        <div class="clearfix row">
          <div class="left">
            <span>{{ $t('languages.Apps.FormDesignPage.ErrorTips') }}:</span>
          </div>
          <div class="right">
            <a-input
              v-model="langObj[lang]"
              class="input"
              :placeholder="$t('languages.PlaceHolder.Input')"
            />
          </div>
        </div>
      </template>
      <template v-if="isShowVerifyFormula && checkType === 2">
        <verify-formula-date
          v-if="
            dataItem.type === DataItemTypes.Date ||
            dataItem.propertyType === DataItemTypes.Date
          "
          ref="verifyFormulaDataModelDate"
          :modalData="modalData"
          :selectListDataItemsDate="selectListDataItemsDate"
          :verifyFormula="verifyFormula"
          :visible="true"
        />
        <verify-formula-number
          v-if="
            dataItem.type === DataItemTypes.Number ||
            dataItem.propertyType === DataItemTypes.Number
          "
          ref="verifyFormulaDataModelNumber"
          :modalData="modalData"
          :selectListDataItemsNumber="selectListDataItemsNumber"
          :verifyFormula="verifyFormula"
          :visible="true"
        />
      </template>
    </div>
    <template slot="footer">
      <a-button key="cancel" @click="closeModal">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
      <a-button
        key="ok"
        :disabled="$route.path.includes('apps/versionDetail/')"
        type="primary"
        @click="backData"
      >
        {{ $t('languages.Apps.Ok') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { DataItemType } from '../../../schema';
import VerifyFormulaDate from './verify-formula-date.vue';
import VerifyFormulaNumber from './verify-formula-number.vue';
import { DataItemState } from '../../stores/data-items.store';
import * as dataitemStore from '../../stores/data-items.store-helper';
import Options from '../../typings/form-modals-map';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Modal, Input, Select, Button } from '@h3/antd-vue';

@Component({
  name: 'RegularModal',
  components: {
    VerifyFormulaDate,
    VerifyFormulaNumber,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
    AButton: Button,
  },
})
export default class RegularModal extends Vue {
  @Prop({
    type: Object,
    default: () => ({}),
  })
  modalData!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: DataItemState;

  dataItems: DataItemState[] = [];

  disabled: boolean = false;

  regularData: any = {
    selectOption: '',
    regularText: '',
    tips: '',
    propertyBarText: '',
  };

  lang: string = localStorage.getItem('locale') || 'zh';

  langObj: any = {
    en: '',
    zh: '',
  };

  title: string = '';

  checkType: number = 1;

  typeToShow = null;

  selectListDataItemsDate: any[] = [];

  selectListDataItemsNumber: any[] = [];

  DataItemTypes = DataItemType;

  // 提交校验的数据
  verifyFormula: any = {
    currControlOptions: {},
    verifyRuleValue: '=',
    partterValue: 1,
    date: null,
    rangeDate: [], // 常量下 介于 数据
    dynamicTypeValue: 1, // 动态值 选择类型 数据项/当天加减
    numInput: '', // 常数值 非介于 值
    numInput1: '', // 常数值 介于 第一个值
    numInput2: '', // 常数值 介于 第二个值
    promptText: '', // 失败提示语
    selectDataItem: [], // 动态值 非介于 值
    rangeSelectDataItem1: [], // 动态值 介于 第一个值
    rangeSelectDataItem2: [], // 动态值 介于 第二个值
    errDialogboxType: 1, // 错误提示框 类型 1/短 2/对话框
  };

  get regularRules() {
    if (this.dataItem.formPropertyType === 2) {
      return Options.defaultRegularList.slice(
        Options.defaultRegularList.length - 2,
      );
    }

    switch (this.modalData.data.type) {
      case 'number':
        return Options.defaultRegularList.slice(0, 3);
      default:
        return Options.defaultRegularList;
    }
  }

  get isShowRegex() {
    return (
      [DataItemType.ShortText, DataItemType.LongText].includes(
        this.dataItem.type,
      ) ||
      [DataItemType.ShortText, DataItemType.LongText].includes(
        (this.dataItem as any).propertyType,
      )
    );
  }

  get isShowVerifyFormula() {
    return (
      this.dataItem.type === DataItemType.Date ||
      this.dataItem.type === DataItemType.Number ||
      (this.dataItem as any).propertyType === DataItemType.Date ||
      (this.dataItem as any).propertyType === DataItemType.Number
    );
  }

  get isShowEmptyRow() {
    return this.dataItem.type === DataItemType.Sheet;
  }

  get isShowMaxlength() {
    return (
      this.dataItem.type === DataItemType.ShortText ||
      this.dataItem.type === DataItemType.LongText
    );
  }

  get isShowNorepeat() {
    return this.dataItem.type === DataItemType.ShortText;
  }

  created() {}

  initModel() {
    const type = this.modalData.type;
    const data = this.modalData.data as any;
    if (type === 'regularModal') {
      this.title = '正则校验规则';
      this.checkType = 1;
      if (data) {
        this.regularData = {
          tips: data.default || '',
          regularText: data.value || '',
          selectOption: data.value || '',
        };
        this.langObj = data.default ? JSON.parse(data.default) : this.langObj;
      }
      //判断是否为出自定义以外的正则表达示模板
      const rules = this.regularRules.find((r) => {
        return r.rule === data.value && r.text !== '自定义';
      });
      if (rules) {
        this.disabled = true;
      } else if (!rules && data.value) {
        this.regularRules.forEach((r) => {
          if (r.text === '自定义') {
            r.rule = data.value;
            this.disabled = false;
          }
        });
      } else {
        this.regularData.selectOption = 'xx';
        this.disabled = false;
      }
    } else if (type === 'verifyFormula') {
      this.title = '提交校验规则';
      this.checkType = 2;
      if (data) {
        if (!this.modalData.options) {
          this.modalData.options = Object.create(null);
        }
        try {
          const obj =
            typeof data.value === 'object'
              ? data.value
              : JSON.parse(data.value);
          this.modalData.options.verifyFormula = obj;
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      //Else Empty block statement
    }
  }

  changeRegularOptions(val: any, arg: any) {
    if (val) {
      //判断是否为出自定义以外的正则表达示模板
      const rules = this.regularRules.find((r) => {
        return r.rule === val && r.text !== '自定义';
      });
      const index: number = arg.data.key;
      if (rules) {
        this.disabled = true;
        this.regularData.regularText = val;
      } else {
        this.disabled = false;
        this.regularData.regularText = '';
        this.langObj = {
          en: '',
          zh: '',
        };
      }
      this.regularData.selectOption = val;
      //非自定义下
      if (this.regularData.selectOption && rules) {
        this.langObj = {
          en: this.regularRules[index].en,
          zh: this.regularRules[index].text,
        };
        // this.regularData.tips = JSON.stringify()
      } else {
        // this.regularData.tips = '';
        this.langObj = {
          en: '',
          zh: '',
        };
      }
    } else {
      this.disabled = false;
      this.regularData.selectOption = '';
      this.regularData.regularText = '';
      this.langObj = {
        en: '',
        zh: '',
      };
    }
  }

  backData() {
    if (this.checkType === 1) {
      if (!this.langObj.en) {
        this.langObj.en = this.langObj.zh;
      }

      if (!this.langObj.zh) {
        this.langObj.zh = this.langObj.en;
      }

      const data = {
        value: this.regularData.regularText,
        default: JSON.stringify(this.langObj),
      };

      // 正则为空的允许提交
      if (!this.regularData.regularText) {
        this.$emit('backData', data);
        return;
      }
      const reg = new RegExp(/^(\/\^).+?(\$\/)$/);
      if (reg.test(this.regularData.regularText)) {
        try {
          const temp = new RegExp(
            this.regularData.regularText.regularText,
          ).test('');
          this.regularData.propertyBarText = this.regularData.regularText;
          console.log(data);
          this.$emit('backData', data);
        } catch (err) {
          this.$message.error('输入正则不合法');
        }
      } else {
        this.$message.error('输入正则不合法');
      }
    } else if (this.checkType === 2) {
      if (this.dataItem.type === DataItemType.Date) {
        this.backDataToDate();
        return;
      } else if (this.dataItem.type === DataItemType.Number) {
        this.backDataToNumber();
        return;
      }
    } else if (this.checkType === 3) {
      this.modalData.options.isEmptyRow = true;
    } else if (this.checkType === 5) {
      this.modalData.options.noRepeat = true;
    }
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit(
      'backData',
      this.modalData,
      this.verifyFormula.currControlOptions,
    );
  }

  backDataToNumber() {
    if (!this.getverifyFormulaDataModelNumber()) {
      this.$message.error('请填写规则');
      return;
    }
    this.$emit('backData', {
      value: JSON.stringify(this.getverifyFormulaDataModelNumber()),
    });
  }

  backDataToDate() {
    if (!this.getVerifyFormulaDataModelDate()) {
      this.$message.error('请填写规则');
      return;
    }
    this.$emit('backData', {
      value: JSON.stringify(this.getVerifyFormulaDataModelDate()),
    });
  }

  // 获取数据联动配置
  getVerifyFormulaDataModelDate() {
    return (this.$refs.verifyFormulaDataModelDate as any).getData();
  }

  getverifyFormulaDataModelNumber() {
    return (this.$refs.verifyFormulaDataModelNumber as any).getData();
  }

  closeModal() {
    this.$emit('closeModal');
  }

  handleChangeType() {}

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData.data) {
      return;
    }

    const data = modalData.data;
    const type = modalData.type;

    let items = JSON.parse(JSON.stringify(dataitemStore.getDataItems(this)));
    // let items = dataitemStore.getDataItems(this).filter(x => x.used);

    if (this.dataItem.parentCode) {
      const sheet = items.find((x) => x.code === this.dataItem.parentCode);
      if (sheet && sheet.properties) {
        const sheetItems = sheet.properties.filter((x: any) => x.used) as any;
        items = items.concat(sheetItems);
      }
      const validDateList = items.filter(
        (i) =>
          !i.isSystem &&
          i.code !== this.dataItem.code &&
          i.type === DataItemType.Date,
      );
      validDateList.forEach((x) => {
        if (x.parentCode) {
          x.code = `${x.parentCode}.${x.code}`;
        }
      });
      this.selectListDataItemsDate = validDateList;
      const validNumberList = items.filter(
        (i) =>
          !i.isSystem &&
          i.code !== this.dataItem.code &&
          i.type === DataItemType.Number,
      );
      validNumberList.forEach((x) => {
        if (x.parentCode) {
          x.code = `${x.parentCode}.${x.code}`;
        }
      });
      this.selectListDataItemsNumber = validNumberList;
    } else {
      this.selectListDataItemsDate = items.filter(
        (i) =>
          !i.parentCode &&
          i.code !== this.dataItem.code &&
          i.type === DataItemType.Date,
      );
      this.selectListDataItemsNumber = items.filter(
        (i) =>
          !i.parentCode &&
          i.code !== this.dataItem.code &&
          i.type === DataItemType.Number,
      );
    }

    this.verifyFormula.currControlOptions = this.dataItem;

    this.dataItems = items;

    this.initModel();
  }
}
</script>

<style lang="less" scoped>
.regular-wrap {
  .row {
    display: flex;
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
    .left {
      width: 20%;
      float: left;
      span {
        line-height: 32px;
      }
    }
    .right {
      display: flex;
      flex: 1;
      .input,
      .select {
        width: 100%;
      }
    }
  }
}
</style>
