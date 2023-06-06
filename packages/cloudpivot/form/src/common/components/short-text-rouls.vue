<template>
  <a-modal
    :cancelText="$t('languages.Apps.Cancel')"
    :keyboard="false"
    :maskClosable="false"
    :okText="$t('languages.Save')"
    title="计算规则"
    :visible="true"
    width="800px"
    @cancel="closeModal"
  >
    <a-row class="required-type">
      <a-col :span="4">
        <span>计算数据项</span>
      </a-col>
      <a-col :span="14">
        <a-select
          v-model="currentCode"
          :disabled="true"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
        >
          <a-select-option
            v-for="i in formatDataItemFiler"
            :key="i.id"
            :value="i.code"
            :disabled="i.isDisabled"
          >
            <div class="select-option-flex">
              <div class="left">
                {{ i.name }}
              </div>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
      <a-col v-if="currentCode" :span="3" style="padding-left: 15px">
        <span>数据项类型</span>
      </a-col>
      <a-col v-if="currentCode" :span="3" style="padding-left: 15px">
        <div class="calcItemType">
          {{ currControlOptions ? currControlOptions.text : '' }}
        </div>
      </a-col>
    </a-row>
    <div class="calcFlexContainer">
      <div class="iLeft">
        <div class="icons">
          <div :class="{ active: dataActive }" title="数据项">
            <i
              class="aufontAll h-icon-all-yiyue-zj"
              style="display: block"
              @click="showDatas"
            ></i>
          </div>
          <div :class="{ active: CalculateActive }" title="函数">
            <i
              class="aufontAll h-icon-all-hanshushezhi"
              style="display: block"
              @click="showCalculates"
            ></i>
          </div>
        </div>

        <div v-if="showLeftAll" class="leftAll">
          <div v-if="showData" class="inserData">
            <div class="iCommon iTitle iActive">插入数据项</div>
            <div class="iCommon iSearch">
              <a-input v-model="searchDataField" placeholder="搜索数据项">
                <a-icon slot="prefix" type="search" />
              </a-input>
            </div>
            <div class="itemList borderBottom">
              <div class="title" @click="changeBusiness">
                <i
                  v-if="!showBusiness"
                  class="aufontAll h-icon-all-caret-right"
                  :style="{ fontSize: '1px' }"
                ></i>
                <i
                  v-if="showBusiness"
                  class="aufontAll h-icon-all-caret-down"
                  :style="{ fontSize: '1px' }"
                ></i>
                业务字段
              </div>
              <div v-show="showBusiness">
                <a-row
                  v-for="i in dataItemListShow.filter(
                    (x) => x.code !== modalData.propertyCode && !x.isSystem,
                  )"
                  :key="i.id"
                  :value="i.code"
                  class="iCommonRow"
                  @click.native="insertField(i.code)"
                >
                  <a-col :span="12">
                    {{ i.name }}
                  </a-col>
                  <a-col :span="12" style="text-align: right">
                    <span
                      class="absoluteRight"
                      :style="{ background: i.color }"
                    >
                      {{ i.text }}
                    </span>
                  </a-col>
                </a-row>
              </div>
              <div class="title" @click="changeSystem">
                <i
                  v-if="!showSystem"
                  class="aufontAll h-icon-all-caret-right"
                  :style="{ fontSize: '1px' }"
                ></i>
                <i
                  v-if="showSystem"
                  class="aufontAll h-icon-all-caret-down"
                  :style="{ fontSize: '1px' }"
                ></i>
                系统字段
              </div>
              <div v-show="showSystem">
                <a-row
                  v-for="i in dataItemListShow.filter(
                    (x) => x.code !== modalData.propertyCode && x.isSystem,
                  )"
                  :key="i.id"
                  :value="i.code"
                  class="iCommonRow"
                  @click.native="insertField(i.code)"
                >
                  <a-col :span="12">
                    {{ i.name }}
                  </a-col>
                  <a-col :span="12" style="text-align: right">
                    <span
                      class="absoluteRight"
                      :style="{ background: i.color }"
                    >
                      {{ i.text }}
                    </span>
                  </a-col>
                </a-row>
              </div>
              <!-- <a-row v-for="i in dataItemListShow" :key="i.id" :value="i.code" class="iCommonRow" @click.native="insertField(i.code)">
                <a-col :span="12">
                  {{ i.name }}
                </a-col>
                <a-col :span="12" style="text-align: right">
                  <span class="absoluteRight" :style="{ background: i.color }">{{ i.text }}</span>
                </a-col>
              </a-row> -->
            </div>
          </div>

          <div v-if="showCalculate" class="calculation">
            <div class="iCommon iTitle">
              <span
                class="marginR10"
                :class="{
                  iActive: funcActiveTab === 1,
                  iUnActive: funcActiveTab !== 1,
                }"
                @click="changeTab(1)"
              >
                全部
              </span>
              <span
                class="marginR10"
                :class="{
                  iActive: funcActiveTab === 2,
                  iUnActive: funcActiveTab !== 2,
                }"
                @click="changeTab(2)"
              >
                文本
              </span>
              <span
                class="marginR10"
                :class="{
                  iActive: funcActiveTab === 3,
                  iUnActive: funcActiveTab !== 3,
                }"
                @click="changeTab(3)"
              >
                数值
              </span>
              <span
                class="marginR10"
                :class="{
                  iActive: funcActiveTab === 4,
                  iUnActive: funcActiveTab !== 4,
                }"
                @click="changeTab(4)"
              >
                日期
              </span>
            </div>
            <div class="iCommon iSearch">
              <a-input v-model="searchFunc" placeholder="搜索函数">
                <a-icon slot="prefix" type="search" />
              </a-input>
            </div>
            <div class="itemList">
              <a-row
                v-for="i in funcListShow"
                :key="i.name"
                class="iCommonRow"
                :value="i.name"
              >
                <a-col
                  class="itemPos"
                  @click.native="ruleBtnClick(i)"
                  @mouseenter="mouseEnterFunc(i)"
                >
                  {{ i.name }}
                </a-col>
              </a-row>
            </div>
          </div>
        </div>
        <div class="hide-menu">
          <div v-if="!showLeftAll" class="to-left" @click="showAll"></div>
          <div v-if="showLeftAll" class="to-right" @click="closeAll"></div>
        </div>
      </div>
      <div class="iRight">
        <div class="marginTB5">
          <span
            class="iOperator marginL24 marginR24"
            @click="insertOperator(1)"
          >
            +
          </span>
          <span class="iOperator marginR24" @click="insertOperator(2)">-</span>
          <span class="iOperator marginR24" @click="insertOperator(3)">*</span>
          <span class="iOperator marginR24" @click="insertOperator(4)">/</span>
          <span class="iOperator marginR24" @click="insertOperator(5)">(</span>
          <span class="iOperator marginR24" @click="insertOperator(6)">)</span>
        </div>
        <div class="text-area">
          <formula-editor
            ref="formulaEditor"
            :value="value"
            :fields="fields"
            :disabled="disabled"
            @change="fireChange"
            @focus="fireFocus"
            @blur="fireBlur"
            @tip="fireTip"
          />
          <span class="checkFormula" @click="checkFormula">检验公式</span>
          <div class="successTip">
            <a-alert
              v-if="successTipVisible"
              message="校验通过"
              type="warning"
            />
          </div>
          <div class="errorTip">
            <a-alert
              v-if="errorTipVisible"
              :message="errorMsg"
              :afterClose="handleClose"
              type="error"
              showIcon
              closable
            />
          </div>
        </div>
        <div v-if="activeFunc.code" class="iFuncWrap">
          <div class="iFunc">
            <span class="iFuncTitle">{{ activeFunc.name }}函数:</span>
            <span class="iFuncCont">{{ activeFunc.desc }}</span>
          </div>
          <div class="iFunc">
            <span class="iFuncTitle">用法:</span>
            <span class="iFuncCont">{{ activeFunc.usage }}</span>
          </div>
          <div class="iFunc">
            <span class="iFuncTitle">示例:</span>
            <span class="iFuncCont">{{ activeFunc.example }}</span>
          </div>
        </div>
      </div>
    </div>
    <template slot="footer">
      <a-button @click="closeModal"> 取消 </a-button>
      <a-button
        type="primary"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="clearRule"
      >
        清空规则
      </a-button>
      <a-button
        type="primary"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="backData"
      >
        保存
      </a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import funcList from '../../../utils/function';
import cloneDeep from 'lodash/cloneDeep';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { dataRuleApi } from '../../../../api';
import {
  DataItemType,
  DataItemTypeColor,
  DataItemTypeText,
} from '../../../schema';
import * as dataitemStore from '../../stores/data-items.store-helper';
import { DataitemConditionValue } from '../data-item/dataitem-condition2.vue';
import formulaEditor from './formula-editor/formula-editor.vue';
import {
  Modal,
  Row,
  Col,
  Select,
  Input,
  Icon,
  Alert,
  Button,
} from '@h3/antd-vue';
const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'AddCalculateRule',
  components: {
    formulaEditor,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
    AIcon: Icon,
    AAlert: Alert,
    AButton: Button,
  },
})
export default class AddCalculateRule extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  showLeftAll: boolean = true;

  showData: boolean = true;

  showCalculate: boolean = false;

  dataActive: boolean = true;

  CalculateActive: boolean = false;

  formatDataItem: any[] = [];

  formatDataItemFiler: any[] = [];

  dataItemListShow: any[] = []; // 数据项显示列表

  funcActiveTab: number = 1; // 函数tab标签 是全部、文本、数值、日期

  funcListShow: any[] = []; // 显示的函数列表

  model: DataitemConditionValue = {
    type: 1,
    conditions: [],
  };

  requiredType = 1;

  currControlOptions: any = {}; // 当前选中的数据项

  searchDataField: string = ''; // 搜索数据项关键字

  searchFunc: string = ''; // 搜索函数关键字

  activeFunc: any = {
    code: '',
    name: '',
    desc: '',
    usage: '',
    example: '',
    type: '',
  }; // 当前选中或激活的函数

  successTipVisible: boolean = false;

  errorTipVisible: boolean = false;

  errorMsg: string = '';

  code: string = '';

  disabled: boolean = false;

  value: any = {};

  readonly: boolean = false;

  fields: any[] = [];

  currentCode: string = '';

  get getcurrentCode() {
    //@ts-ignore
    return this.$attrs.dataItem.code;
  }

  get getDateItem() {
    //@ts-ignore
    return this.$attrs.dataItem;
  }

  showDatas() {
    if (this.showData) {
      this.showLeftAll = !this.showLeftAll;
      return;
    }
    this.showData = !this.showData;
    this.showCalculate = false;

    this.dataActive = true;
    this.CalculateActive = false;
  }

  showCalculates() {
    if (this.showCalculate) {
      this.showLeftAll = !this.showLeftAll;
      return;
    }

    this.showData = false;
    this.showCalculate = !this.showCalculate;

    this.dataActive = false;
    this.CalculateActive = true;
  }

  showBusiness: boolean = false;

  showSystem: boolean = false;

  changeBusiness() {
    this.showBusiness = !this.showBusiness;
  }

  changeSystem() {
    this.showSystem = !this.showSystem;
  }

  closeAll() {
    this.showLeftAll = false;
  }

  showAll() {
    this.showLeftAll = true;
  }

  ruleBtnClick(func: any) {
    (this.$refs.formulaEditor as any).insertIdentifier(func.name);
    this.activeFunc = func;
  }

  mouseEnterFunc(func: any) {
    this.activeFunc = func;
  }

  initFuncList() {
    console.log('initFuncList:', funcList);
    // 函数排序
    funcList.sort((a: any, b: any) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name === b.name) {
        return 0;
      } else {
        return -1;
      }
    });
    this.funcListShow = funcList;
    // 字段
  }

  @Watch('searchDataField')
  onSearchDataFieldChange(val: string) {
    const keyword: string = val.toLowerCase();
    this.dataItemListShow = this.formatDataItem
      .filter((item) => {
        return (
          item.type === DataItemType.ShortText ||
          item.type === DataItemType.Dropdown ||
          item.type === DataItemType.DropdownMulti ||
          item.type === DataItemType.Date ||
          item.type === DataItemType.Number ||
          item.type === DataItemType.Radio ||
          item.type === DataItemType.Checkbox ||
          item.type === DataItemType.StaffSingle ||
          item.type === DataItemType.StaffMulti ||
          item.type === DataItemType.DeptSingle ||
          item.type === DataItemType.DeptMulti ||
          item.type === DataItemType.StaffDeptMix ||
          item.type === DataItemType.Address
        );
      })
      .slice()
      .filter((item: any) => item.name.toLowerCase().indexOf(keyword) > -1);
  }

  @Watch('searchFunc')
  onSearchFuncChange(val: string) {
    const keyword: string = val.toLowerCase();
    if (this.funcActiveTab === 1) {
      this.funcListShow = funcList.filter(
        (item: any) => item.name.toLowerCase().indexOf(keyword) > -1,
      );
    } else if (this.funcActiveTab === 2) {
      this.funcListShow = funcList.filter(
        (item: any) =>
          item.type === 'text' && item.name.toLowerCase().indexOf(keyword) > -1,
      );
    } else if (this.funcActiveTab === 3) {
      this.funcListShow = funcList.filter(
        (item: any) =>
          item.type === 'number' &&
          item.name.toLowerCase().indexOf(keyword) > -1,
      );
    } else if (this.funcActiveTab === 4) {
      this.funcListShow = funcList.filter(
        (item: any) =>
          item.type === 'date' && item.name.toLowerCase().indexOf(keyword) > -1,
      );
    } else {
      //Else Empty block statement
    }
  }

  changeTab(index: number) {
    this.searchFunc = '';
    this.funcActiveTab = index;
    if (index === 1) {
      this.funcListShow = funcList;
    } else if (index === 2) {
      this.funcListShow = funcList.filter((item: any) => item.type === 'text');
    } else if (index === 3) {
      this.funcListShow = funcList.filter(
        (item: any) => item.type === 'number',
      );
    } else if (index === 4) {
      this.funcListShow = funcList.filter((item: any) => item.type === 'date');
    } else {
      //Else Empty block statement
    }
  }

  @Watch('formatDataItem')
  changeDataItem() {
    const itemListFilter: any[] = this.formatDataItem
      .filter((item) => {
        return (
          item.type === DataItemType.ShortText ||
          item.type === DataItemType.Number ||
          item.type === DataItemType.Date ||
          item.type === DataItemType.LongText
        );
      })
      .map((i) => {
        const icon = DataItemType[i.type];
        if (icon) {
          i.color = DataItemTypeColor[icon];
          i.text = DataItemTypeText[icon];
        }
        i.isDisabled = false;
        return i;
      });

    const copyArr: any = cloneDeep(itemListFilter);
    this.formatDataItemFiler = copyArr;

    this.currControlOptions = this.formatDataItemFiler.find(
      (i) => i.code === this.currentCode,
    );
    let itemList: any[] = this.formatDataItem;
    if (this.currControlOptions) {
      itemList = itemList.filter((item) => item.code !== this.currentCode);
    }
    this.dataItemListShow = itemList
      .filter((item) => {
        return (
          item.type === DataItemType.ShortText ||
          item.type === DataItemType.Dropdown ||
          item.type === DataItemType.DropdownMulti ||
          item.type === DataItemType.Date ||
          item.type === DataItemType.Number ||
          item.type === DataItemType.Radio ||
          item.type === DataItemType.Checkbox ||
          item.type === DataItemType.StaffSingle ||
          item.type === DataItemType.StaffMulti ||
          item.type === DataItemType.DeptSingle ||
          item.type === DataItemType.DeptMulti ||
          item.type === DataItemType.StaffDeptMix ||
          item.type === DataItemType.Address
        );
      })
      .slice()
      .map((item: any) => {
        const icon = DataItemType[item.type];
        return {
          code: `${item.code}`,
          name: item.name,
          type: item.type,
          color: DataItemTypeColor[icon],
          text: DataItemTypeText[icon],
          isSystem: item.isSystem,
        };
      });

    this.fields = this.dataItemListShow.map((item) => {
      const { code, name, type } = item;
      return {
        id: code,
        name,
        sourceType: 'field',
        paramType: this.getParamType(type),
        value: '',
      };
    });

    if (this.currentCode.indexOf('.') > -1) {
      const sheetCode: string = this.currentCode.split('.')[0];
      this.dataItemListShow = this.dataItemListShow.filter((el: any) => {
        if (el.code.indexOf('.') > -1) {
          return sheetCode === el.code.split('.')[0];
        } else {
          return true;
        }
      });
    }
  }

  getParamType(type: number) {
    switch (type) {
      case DataItemType.ShortText:
        return 'text';
      case DataItemType.Number:
        return 'number';
      case DataItemType.Date:
        return 'date';
      case DataItemType.Logic:
        return 'bool';
      case DataItemType.Address:
        return 'address';
      case DataItemType.Radio:
        return 'radio';
      case DataItemType.Checkbox:
        return 'checkbox';
      case DataItemType.Dropdown:
        return 'dropdown';
      case DataItemType.DropdownMulti:
        return 'dropdownmulti';
      case DataItemType.StaffSingle:
        return 'staffsingle';
      case DataItemType.StaffMulti:
        return 'staffmulti';
      case DataItemType.DeptSingle:
        return 'deptsingle';
      case DataItemType.DeptMulti:
        return 'deptmulti';
      case DataItemType.StaffDeptMix:
        return 'staffdeptmix';
      default:
        return 'text';
    }
  }

  // @Watch("visible")
  // onVisibleChange(v) {
  //   if (v) {
  //     if(this.modalData.options && this.modalData.options.hasOwnProperty('value')) {
  //       try {
  //         this.value = JSON.parse(this.modalData.options.value);
  //       }catch(err) {
  //         console.log(err);
  //       }
  //     } else {
  //       this.value = {};
  //     }
  //   }
  // }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    this.initFuncList();
    console.log('根据modalData初始化弹窗', this.dataItems);
    // 根据modalData初始化弹窗
    const items: any[] = dataitemStore.getDataItems(this);

    const sheetItem: any[] = [];

    items.forEach((x) => {
      if (x.type === DataItemType.Sheet) {
        if (Array.isArray(x.properties)) {
          const subItemArr: any = JSON.parse(JSON.stringify(x.properties));
          subItemArr.forEach((i) => {
            i.code = `${i.parentCode}.${i.code}`;
            i.name = `${x.name}.${i.name}`;
          });
          sheetItem.push.apply(sheetItem, subItemArr);
        }
      }
    });

    const itemArr = [...items, ...sheetItem];
    // items.push.apply(items, sheetItem);
    // @ts-ignore
    // const parentCode = this.$attrs.dataItem.parentCode;
    // if (parentCode) {
    //   const sheet = items.find(x => x.code === parentCode);
    //   if (sheet && sheet.properties) {
    //     const sheetItems = sheet.properties.filter(
    //       (x: any) => x.used
    //     ) as any;
    //     items = items.concat(sheetItems);
    //   }
    // }
    const arr: any[] = itemArr.filter((i: any) => {
      switch (i.type) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
        case DataItemType.LongText:
        case DataItemType.Number:
        case DataItemType.Date:
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.Attachment:
        case DataItemType.Address:
        case DataItemType.RelevanceFormEx:
        case DataItemType.RelevanceForm:
          return (
            i &&
            !(
              [
                'id',
                'name',
                'createdDeptId',
                'ownerDeptId',
                'workflowInstanceId',
                'ownerDeptQueryCode',
              ].indexOf(i.code) > -1
            )
          );
        default:
          break;
      }
    });
    this.formatDataItem = arr;
    //若schemaCode值不等于模型编码，则用于拼接字表code
    // @ts-ignore
    if (this.getDateItem.code && this.getDateItem.parentCode) {
      //@ts-ignore
      this.currentCode = `${this.getDateItem.parentCode}.${this.getDateItem.code}`;
    } else {
      this.currentCode = this.getcurrentCode;
    }
    if (this.modalData.data && this.modalData.data.hasOwnProperty('value')) {
      try {
        this.value = JSON.parse(this.modalData.data.value);
      } catch (err) {
        console.log(err);
        this.value = this.modalData.data.value;
      }
    } else {
      this.value = {};
    }
  }

  async backData() {
    const { result, err } = (this.$refs.formulaEditor as any).validate();
    if (!result) {
      this.checkFormula();
      /* this.$emit('backData', null); */
      return;
    }
    const codeValue: any = (this.$refs.formulaEditor as any).getValue();
    if (
      codeValue.formula === 'TODAY()' &&
      this.currControlOptions.type === DataItemType.Number
    ) {
      this.$message.error('TODAY函数只能赋值给文本， 不能赋值给数值');
      return;
    }

    if (
      codeValue.formula.indexOf('UPPERMONEY') !== -1 &&
      this.currControlOptions.type === DataItemType.Number
    ) {
      this.$message.error('UPPERMONEY函数只能赋值给文本， 不能赋值给数值');
      return;
    }

    const res: any = await this.checkFormulaOnline();
    if (res.errcode !== 0 || !res.data) {
      this.$message.error(res.errmsg as string);
      return;
    }
    const data = { value: JSON.stringify(codeValue) };
    this.$emit('backData', data);
  }

  closeModal() {
    this.model = {
      type: 1,
      conditions: [],
    };
    this.requiredType = 1;
    this.successTipVisible = false;
    this.errorTipVisible = false;
    this.$emit('closeModal');
  }

  checkFormulaOnline() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res, rej) => {
      const codeValue: any = (this.$refs.formulaEditor as any).getValue();
      if (
        codeValue.formula === 'TODAY()' &&
        this.currControlOptions.type === DataItemType.Number
      ) {
        this.$message.error('TODAY函数只能赋值给文本， 不能赋值给数值');
        return;
      }
      const param = { shortTextStitch: JSON.stringify(codeValue) };
      this.modalData.options = JSON.stringify(param);

      const data = JSON.parse(JSON.stringify(this.modalData));
      data.dataRuleType = 2;
      if (this.currControlOptions) {
        if (this.currControlOptions.parentCode) {
          data.schemaCode = this.currControlOptions.parentCode;
        } else {
          data.schemaCode = this.currControlOptions.schemaCode;
        }
        if (this.currControlOptions.code.indexOf('.') > -1) {
          data.propertyCode = this.currControlOptions.code.split('.')[1];
        } else {
          data.propertyCode = this.currControlOptions.code;
        }
      }
      if (!data.schemaCode) {
        data.schemaCode = this.$route.params.bizSchemaCode;
      }
      const _res = await dataRuleApi.testRules(data);
      res(_res);
    });
  }

  savedRange: any = {};

  async checkFormula() {
    const { result, err } = (this.$refs.formulaEditor as any).validate();
    if (result) {
      const codeValue: any = (this.$refs.formulaEditor as any).getValue();
      if (
        codeValue.formula === 'TODAY()' &&
        this.currControlOptions.type === DataItemType.Number
      ) {
        this.errorTipVisible = true;
        this.errorMsg = 'TODAY函数只能赋值给文本， 不能赋值给数值';
      } else {
        const res: any = await this.checkFormulaOnline();
        if (res.errcode === 0 && res.data) {
          this.successTipVisible = true;
          setTimeout(() => {
            this.successTipVisible = false;
          }, 2000);
        } else {
          this.errorTipVisible = true;
          this.errorMsg = res.errmsg;
        }
      }
    } else {
      this.errorTipVisible = true;
      this.errorMsg = err.info;
    }
  }

  handleClose() {
    this.errorTipVisible = false;
  }

  fireChange(value) {
    console.log(`change formula is`, value);
  }

  fireFocus() {
    console.log('focus');
  }

  fireBlur() {
    console.log('blur');
  }

  fireTip(funcName) {
    const func: any = funcList.find((item: any) => item.name === funcName);
    if (func) {
      this.activeFunc = func;
    }
    console.log(`tip funcName is ${funcName}`);
  }

  insertField(code: string) {
    (this.$refs.formulaEditor as any).insertField(code);
  }

  insertOperator(type: number) {
    let operator: string = '';
    switch (type) {
      case 1:
        operator = '+';
        break;
      case 2:
        operator = '-';
        break;
      case 3:
        operator = '*';
        break;
      case 4:
        operator = '/';
        break;
      case 5:
        operator = '(';
        break;
      case 6:
        operator = ')';
        break;
      default:
        break;
    }
    (this.$refs.formulaEditor as any).insertIdentifier(operator);
  }

  clearRule() {
    const self = this;
    this.$confirm({
      title: '计算规则',
      content: '清空规则会清空当前设置的计算规则数据,确定要清空规则吗?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        (self.$refs.formulaEditor as any).setEditorText('');
      },
    });
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/common.less';
.required-type {
  margin-bottom: 16px;
  line-height: 32px;
  padding-left: 16px;
}
.calcItemType {
  padding: 0 15px;
  display: inline-block;
  background: #e7edfc;
  border-radius: 16px;
}
.calcFlexContainer {
  height: 420px;
  border: 1px solid #e8e8e8;
  background: #fff;
  border-radius: 2px;
  display: flex;
}
.iLeft {
  flex: 0 0 auto;
  border-right: 1px solid #e8e8e8;
  height: 100%;
  font-size: 12px;
  display: flex;
}
.leftAll {
  width: 180px;
}
.iRight {
  flex: 1 1 auto;
}
.icons {
  margin-top: 5px;
  border-right: 1px solid #e8e8e8;
  .aufontAll {
    margin: 5px;
    cursor: pointer;
  }
}
.active {
  background-color: @primary-color;
  i {
    color: #e7edfc;
  }
}
.to-right {
  position: relative;
  left: 12px;
  width: 12px;
  height: 30px;
  background-image: url('../images/toleft.svg');
}
.to-left {
  position: absolute;
  left: 51px;
  width: 12px;
  height: 30px;
  background-image: url('../images/toright.svg');
}
.iTitle {
  color: rgba(0, 0, 0, 0.85);
  line-height: 20px;
}
.iActive {
  font-weight: 600;
}
.iUnActive {
  font-weight: 400;
}
.iUnActive:hover {
  font-weight: 800;
  cursor: pointer;
}
.iCommon {
  padding: 8px 12px;
}
.iSearch {
  font-size: 12px;
  line-height: 20px;
  padding-top: 0;
}
.iCommonRow {
  padding: 5px 8px;
  margin-left: 18px;
}
.itemPos {
  position: relative;
}
.absoluteRight {
  border-radius: 16px;
  padding: 0 5px;
}
.itemList {
  height: 340px;
  overflow: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
  }
  & .iCommonRow:hover {
    background: rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
  .title {
    padding: 5px 10px;
    cursor: pointer;
  }
  .transActive {
    transform: rotate(90deg);
  }
}
/* .borderBottom {
  border-bottom: 1px solid #e8e8e8;
} */
.borderTop {
  border-top: 1px solid #e8e8e8;
}
.marginR10 {
  margin-right: 10px;
}
.marginR24 {
  margin-right: 24px;
}
.marginL24 {
  margin-left: 24px;
}
.marginTB5 {
  padding: 5px 0;
  border-bottom: 1px solid #e8e8e8;
}
.iOperator {
  position: relative;
  display: inline-block;
  border: 6px solid transparent;
}
.iOperator:hover {
  transform: scale(2);
  cursor: pointer;
}
.text-area {
  position: relative;
  width: 100%;
  height: calc(100% - 158px);
  border-bottom: 1px solid #e8e8e8;
  & textarea,
  & > div.inputCls {
    width: 100%;
    height: 100%;
    word-break: break-all;
  }
  & .CodeMirror {
    width: 100%;
    height: 100%;
    word-break: break-all;
  }
}
.checkFormula {
  position: absolute;
  bottom: 8px;
  right: 12px;
  color: #eb2f96;
  font-size: 14px;
  cursor: pointer;
}
.successTip {
  position: absolute;
  bottom: 30px;
  right: 0;
}
.errorTip {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.iFuncWrap {
  height: 126px;
  overflow: scroll;
  &::-webkit-scrollbar {
    width: 0;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
  }
}
.iFunc {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
  line-height: 20px;
  margin: 5px;
}
.iFuncTitle {
  margin-right: 5px;
}
.iFuncCont {
  font-weight: 400;
}
.inputCls {
  box-sizing: border-box;
  margin: 0;
  font-variant: tabular-nums;
  list-style: none;
  -webkit-font-feature-settings: 'tnum';
  font-feature-settings: 'tnum';
  position: relative;
  display: inline-block;
  width: 100%;
  height: 32px;
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 1.5;
  background-color: #fff;
  background-image: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}
.CodeMirror-hints {
  z-index: 9999;
}
</style>
