<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    :cancelText="$t('languages.Apps.Cancel')"
    :keyboard="false"
    :maskClosable="false"
    :okText="$t('languages.Save')"
    :title="title"
    :visible="visible"
    width="670px"
    @cancel="closeModal"
    @ok="backData"
  >
    <a-row class="required-type">
      <a-col :span="4">
        <span>校验类型</span>
      </a-col>
      <a-col :span="20">
        <a-select
          v-model="modalData.checkType"
          :disabled="!isAdd"
          placeholder="请选择"
          style="width: 100%"
          :getPopupContainer="getPopupContainer"
          @change="handleChangeType"
        >
          <a-select-option :value="1">正则校验</a-select-option>
          <a-select-option :value="2">提交校验</a-select-option>
          <a-select-option :value="3">子表空行校验</a-select-option>
          <a-select-option :value="4">文本最大长度校验</a-select-option>
          <a-select-option :value="5">去重</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row v-if="modalData.checkType" class="required-type">
      <a-col :span="4">
        <span>校验数据项</span>
      </a-col>
      <a-col :span="20">
        <a-select
          v-model="modalData.propertyCode"
          :disabled="!isAdd"
          class="data-item-select-content"
          placeholder="请选择"
          style="width: 100%"
          :showSearch="true"
          optionFilterProp="children"
          :filterOption="filterOption"
          :getPopupContainer="getPopupContainer"
          @change="handleChangeData"
        >
          <a-select-option
            v-for="i in formatDataItemFiler"
            :key="i.id"
            :value="i.code"
            :disabled="i.isDisabled"
          >
            <div class="select-option-flex">
              <div
                class="left"
                :title="i.name"
                style="
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  word-break: break-all;
                "
              >
                {{ i.name }}
              </div>
              <div :style="{ background: i.color }" class="right">
                {{ i.text }}
              </div>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <template v-if="modalData.checkType === 1 && modalData.propertyCode">
      <regular-modal
        :modalData="modalData"
        :visible="visible"
        :currentItem="currentItem"
        @backData="backData"
        @closeModal="closeModal"
      />
    </template>
    <template v-if="modalData.checkType === 2 && modalData.propertyCode">
      <verify-formula-date
        v-if="typeToShow === DataItemTypes.Date"
        ref="verifyFormulaDataModelDate"
        :modalData="modalData"
        :selectListDataItemsDate="selectListDataItemsDate"
        :verifyFormula="verifyFormula"
        :visible="visible"
      />
      <verify-formula-number
        v-if="typeToShow === DataItemTypes.Number"
        ref="verifyFormulaDataModelNumber"
        :modalData="modalData"
        :selectListDataItemsNumber="selectListDataItemsNumber"
        :verifyFormula="verifyFormula"
        :visible="visible"
      />
    </template>
    <template v-if="modalData.checkType === 3 && modalData.propertyCode">
      <a-row class="required-type">
        <a-col :span="4">
          <span>验证失败提示语</span>
        </a-col>
        <a-col :span="20">
          <a-input v-model="modalData.options.isEmptyRowTips" />
        </a-col>
      </a-row>
    </template>
    <template v-if="modalData.checkType === 4 && modalData.propertyCode">
      <a-row class="required-type">
        <a-col :span="4">
          <span>最大长度</span>
        </a-col>
        <a-col :span="20">
          <a-input-number
            v-model="number"
            :formatter="(value) => `${value.replace(/\D/g, '')}`"
            defaultValue="200"
            style="width: 100%"
            @change="handeleChangeNumber"
          />
        </a-col>
      </a-row>
      <a-row v-if="modalData.checkType !== 4" class="required-type">
        <a-col :span="4">
          <span>验证失败提示语</span>
        </a-col>
        <a-col :span="20">
          <a-input v-model="modalData.options.maxLengthTips" />
        </a-col>
      </a-row>
    </template>
  </a-modal>
</template>
<script lang="ts">
import {
  DataItemType,
  DataItemTypeColor,
  DataItemTypeText,
} from '@/components/apps/form-design/typings';
import {
  Col,
  Icon,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from '@h3/antd-vue';
import RegularModal from 'cloudpivot/form/src/common/components/regular-modal.vue';
import VerifyFormulaDate from 'cloudpivot/form/src/common/components/verify-formula-date.vue';
import VerifyFormulaNumber from 'cloudpivot/form/src/common/components/verify-formula-number.vue';
import cloneDeep from 'lodash/cloneDeep';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'AddVerifyRules',
  components: {
    RegularModal,
    VerifyFormulaDate,
    VerifyFormulaNumber,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
    AIcon: Icon,
    AInputNumber: InputNumber,
  },
})
export default class AddVerifyRules extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({
    default: false,
  })
  visible!: boolean;

  @Prop({
    default: true,
  })
  isAdd!: boolean;

  @Prop() list: any;

  @Prop() bizSchemaCode: any;

  DataItemTypes = DataItemType;

  formatDataItem: any[] = [];

  formatDataItemFiler: any[] = [];

  typeToShow = null;

  selectListDataItemsDate: any[] = [];

  selectListDataItemsNumber: any[] = [];

  number: number = 200;

  get title(): string {
    return this.isAdd ? '新建校验规则' : '编辑校验规则';
  }

  get currentItem() {
    return this.formatDataItemFiler.find(
      (el) => el.code === this.modalData.propertyCode,
    );
  }

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

  @Watch('visible')
  changeVisible(val) {
    this.formatDataItem = [];
  }

  @Watch('formatDataItem')
  changeDataItem() {
    this.verifyFormula.currControlOptions = this.formatDataItem.find(
      (i) => i.code === this.modalData.propertyCode,
    );
    this.formatDataItemFiler = this.formatDataItem.map((i) => {
      const icon = DataItemType[i.type];
      if (icon) {
        i.color = DataItemTypeColor[icon];
        i.text = DataItemTypeText[icon];
      }
      return i;
    });
  }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData || !modalData.options) {
      this.formatDataItem = [];
      return;
    }
    this.dataItems.forEach((item) => {
      if (item.parentCode) {
        const sheet = this.dataItems.find((x) => x.code === item.parentCode);
        item.name = `${sheet.name}.${item.name}`;
        item.code = `${sheet.code}.${item.code}`;
      }
      item.isDisabled = false;
    });

    //若schemaCode值不等于模型编码，则用于拼接字表code
    if (
      this.modalData.propertyCode &&
      this.modalData.schemaCode !== this.bizSchemaCode &&
      this.modalData.propertyCode.indexOf('.') === -1
    ) {
      this.modalData.propertyCode = `${this.modalData.schemaCode}.${this.modalData.propertyCode}`;
    }
    if (!this.isAdd) {
      if (this.modalData.options.maxLength) {
        this.number = this.modalData.options.maxLength;
      }

      this.formatDataItem = cloneDeep(this.dataItems);
      this.modalData.checkType === 2 &&
        this.handleChangeData(this.modalData.propertyCode);
    } else {
      this.number = 200;
    }
  }

  /**
   * 校验类型切换事件
   */
  handleChangeType(val) {
    this.modalData.options = {};
    this.modalData.propertyCode = undefined;
    this.dataItems.forEach((item) => {
      let existItem: any = null;
      if (item.parentCode) {
        existItem = this.list.find(
          (x) =>
            x.propertyCode === item.code.split('.')[1] &&
            x.schemaCode !== item.schemaCode &&
            x.checkType === val,
        );
      } else {
        existItem = this.list.find(
          (x) =>
            x.propertyCode === item.code &&
            x.schemaCode === item.schemaCode &&
            x.checkType === val,
        );
      }
      if (existItem) {
        item.isDisabled = true;
      } else {
        item.isDisabled = false;
      }
    });

    let arr = [];
    switch (val) {
      case 1: // 正则
        arr = this.dataItems.filter(
          (i) =>
            [DataItemType.ShortText, DataItemType.LongText].includes(i.type) &&
            !i.isSystem,
        );
        break;
      case 2: // 提交
        arr = this.dataItems.filter(
          (i) =>
            (i.type === DataItemType.Number || i.type === DataItemType.Date) &&
            !i.isSystem,
        );
        break;
      case 3: // 空行
        arr = this.dataItems.filter(
          (i) => i.type === DataItemType.Sheet && !i.isSystem,
        );
        break;
      case 4: // 最大长度
        arr = this.dataItems.filter(
          (i) =>
            (i.type === DataItemType.ShortText ||
              i.type === DataItemType.LongText) &&
            !i.isSystem,
        );
        break;
      case 5: // 去重
        arr = this.dataItems.filter(
          (i) => i.type === DataItemType.ShortText && !i.isSystem,
        );
        break;
      default:
        break;
    }
    this.formatDataItem = arr;
  }

  /**
   * 校验数据项切换事件
   */
  handleChangeData(value) {
    const obj = this.formatDataItem.find((i) => i.code === value);
    this.modalData.schemaCode = obj.parentCode
      ? obj.parentCode
      : obj.schemaCode;
    const items = cloneDeep(this.formatDataItem);
    this.typeToShow = obj.type;
    if (obj.parentCode) {
      const validDateList = items.filter(
        (i) => !i.isSystem && i.code !== value && i.type === DataItemType.Date,
      );
      this.selectListDataItemsDate = validDateList;
      const validNumberList = items.filter(
        (i) =>
          !i.isSystem && i.code !== value && i.type === DataItemType.Number,
      );
      this.selectListDataItemsNumber = validNumberList;
    } else {
      this.selectListDataItemsDate = items.filter(
        (i) =>
          !i.parentCode && i.code !== value && i.type === DataItemType.Date,
      );
      this.selectListDataItemsNumber = items.filter(
        (i) =>
          !i.parentCode && i.code !== value && i.type === DataItemType.Number,
      );
    }
    this.handleClear();
    this.verifyFormula.currControlOptions = obj;
    if (this.modalData.checkType === 4) {
      this.modalData.options.maxLength = 200;
    }
  }

  /**
   * 校验数据项过滤函数
   */
  filterOption(input, option) {
    return (
      option.componentOptions.children[0].children[0].children[0].text
        .trim()
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  handeleChangeNumber(value) {
    if (value === 0) {
      this.number = 1;
      this.modalData.options.maxLength = 1;
      return;
    }
    this.modalData.options.maxLength = value;
  }

  // 获取数据联动配置
  getVerifyFormulaDataModelDate() {
    return (this.$refs.verifyFormulaDataModelDate as any).getData();
  }

  getverifyFormulaDataModelNumber() {
    return (this.$refs.verifyFormulaDataModelNumber as any).getData();
  }

  backData() {
    if (!this.modalData.propertyCode) {
      this.$message.error('请选择数据项');
      return;
    }
    if (this.modalData.checkType === 1) {
      if (!this.modalData.options.regexp) {
        this.$message.error('请输入正则表达式');
        return;
      }
      const reg = new RegExp(/^(\/\^).+?(\$\/)$/);
      if (reg.test(this.modalData.options.regexp)) {
        try {
          const temp = new RegExp(this.modalData.options.regexp).test('');
        } catch (err) {
          this.$message.error('输入正则不合法');
          return;
        }
      } else {
        this.$message.error('输入正则不合法');
        return;
      }
    } else if (this.modalData.checkType === 2) {
      console.log(this.modalData, 'this.modalData');
      if (this.typeToShow === DataItemType.Date) {
        this.backDataTwoDate();
        return;
      } else if (this.typeToShow === DataItemType.Number) {
        this.backDataTwoNumber();
        return;
      } else {
        //Else Empty block statement
      }
    } else if (this.modalData.checkType === 3) {
      this.modalData.options.isEmptyRow = true;
    } else if (this.modalData.checkType === 4) {
    } else if (this.modalData.checkType === 5) {
      this.modalData.options.noRepeat = true;
    } else {
      //Else Empty block statement
    }

    let existItem: any;
    //判断是否已经添加最大文本长度记录
    if (this.modalData.propertyCode.indexOf('.') > -1) {
      existItem = this.list.find(
        (x) =>
          x.propertyCode === this.modalData.propertyCode.split('.')[1] &&
          x.schemaCode === this.modalData.schemaCode &&
          x.checkType === 4,
      );
    } else {
      existItem = this.list.find(
        (x) =>
          x.propertyCode === this.modalData.propertyCode &&
          x.schemaCode === this.modalData.schemaCode &&
          x.checkType === 4,
      );
    }
    if (existItem) {
      this.modalData.options.maxLength = existItem.options.maxLength;
    }
    const item = this.formatDataItemFiler.find(
      (el) => el.code === this.modalData.propertyCode,
    );
    if (['短文本', '长文本'].includes(item.text)) {
      if (!this.modalData.options.maxLength) {
        this.$message.error('最大长度不能为空');
        return;
      }
      if (item.text === '短文本' && this.modalData.options.maxLength > 200) {
        this.$message.error('短文本最大长度只能在200以内');
        return;
      }
      if (item.text === '长文本' && this.modalData.options.maxLength > 2000) {
        this.$message.error('长文本最大长度只能在2000以内');
        return;
      }
    }
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit(
      'backData',
      this.modalData,
      this.verifyFormula.currControlOptions,
    );
  }

  backDataTwoNumber() {
    if (!this.getverifyFormulaDataModelNumber()) {
      this.$message.error('请填写规则');
      return;
    }
    this.modalData.options.verifyFormula = JSON.stringify(
      this.getverifyFormulaDataModelNumber(),
    );
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit(
      'backData',
      this.modalData,
      this.verifyFormula.currControlOptions,
    );
  }

  backDataTwoDate() {
    if (!this.getVerifyFormulaDataModelDate()) {
      this.$message.error('请填写规则');
      return;
    }
    this.modalData.options.verifyFormula = JSON.stringify(
      this.getVerifyFormulaDataModelDate(),
    );
    this.modalData.options = JSON.stringify(this.modalData.options);
    this.$emit(
      'backData',
      this.modalData,
      this.verifyFormula.currControlOptions,
    );
  }

  handleClear() {
    this.verifyFormula = {
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
  }

  closeModal() {
    this.handleClear();
    this.$emit('closeModal');
  }
}
</script>

<style lang="less">
.required-type {
  margin-bottom: 16px;
  line-height: 32px;
  padding-left: 0px;
}
</style>
