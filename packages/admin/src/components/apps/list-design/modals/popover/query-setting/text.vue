<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="popover-wrap">
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DataItem') }}</label>
      </a-col>
      <a-col :span="19">
        <span class="l-h">{{
          `${
            (typeof modalData.name_i18n === 'string'
              ? JSON.parse(modalData.name_i18n)[$i18n.locale]
              : modalData.name_i18n[$i18n.locale]) ||
            modalData.name ||
            modalData.propertyName
          }[${modalData.code}]`
        }}</span>
      </a-col>
    </a-row>
    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayName') }}</label>
      </a-col>
      <a-col :span="19">
        <a-input
          v-if="isChinese"
          v-model="backData.name_i18n['zh']"
          :class="{ 'input-error': !backData.name_i18n['zh'] }"
          maxlength="200"
        />
        <a-input
          v-else
          v-model="backData.name_i18n[$i18n.locale]"
          :class="{ 'input-error': !backData.name_i18n[$i18n.locale] }"
          maxlength="200"
        />
        <div v-if="!backData.name && isChinese" class="empty-tip">
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
        <div
          v-if="!backData.name_i18n[$i18n.locale] && !isChinese"
          class="empty-tip"
        >
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
      </a-col>
    </a-row>

    <!-- 显示类型: 单选、多选、下拉单选、下拉多选才显示-->
    <!-- <a-row class="row" v-if="[
        DataItemType.Radio, 
        DataItemType.Checkbox, 
        DataItemType.Dropdown, 
        DataItemType.DropdownMulti
      ].includes(modalData.data.propertyType)">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DisplayType') }}</label>
      </a-col>
      <a-col :span="19">
        <a-select
          :getPopupContainer="getPopupContainer"
          :placeholder="$t('languages.PlaceHolder.Select')"
          @change="typeChange"
          class="select"
          v-model="backData.displayType"
        >
          <a-select-option
            :key="index"
            :value="option.type"
            v-for="(option, index) in textType"
            >{{ $t(`languages.Apps.${option.text}`) }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row> -->

    <!-- 查询符号 -->
    <a-row v-if="!isUseDictionaries && !isUseBusinessData" class="row">
      <a-col :span="5">
        <label class="title">查询方式</label>
      </a-col>
      <a-col :span="19">
        <a-select
          v-model="backData.filterType"
          :getPopupContainer="getPopupContainer"
          :placeholder="$t('languages.PlaceHolder.Select')"
          class="select"
          @change="filterTypeChange"
        >
          <a-select-option
            v-for="(rule, index) in ruleList"
            :key="index"
            :value="rule.value"
          >
            {{ rule.name }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>

    <!-- 默认值 -->
    <a-row
      v-if="
        [0, 3].includes(backData.displayType) &&
        !['IsNull', 'IsNotNull'].includes(backData.filterType) &&
        !isUseDictionaries &&
        !isUseBusinessData
      "
      class="row"
    >
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DefaultValue') }}</label>
      </a-col>
      <a-col :span="19">
        <template v-if="backData.displayType === 0">
          <a-input v-model="backData.defaultValue" />
        </template>

        <template v-if="backData.displayType === 3">
          <a-select
            v-model="backData.defaultValue"
            :getPopupContainer="getPopupContainer"
            :placeholder="$t('languages.PlaceHolder.Select')"
            class="select"
            :mode="Getmultiple()"
            :allowClear="true"
            :maxTagCount="2"
          >
            <a-select-option
              v-for="(option, index) in options"
              :key="index"
              :value="option.value"
            >
              {{ option.value }}
            </a-select-option>
          </a-select>
        </template>
      </a-col>
    </a-row>

    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.Visible') }}</label>
      </a-col>
      <a-col :span="19">
        <a-switch v-model="backData.visible" />
      </a-col>
    </a-row>

    <!-- <options-input
      :options="options"
      ref="options"
      v-if="visible && !isUseDictionaries && !isUseBusinessData"
    ></options-input> -->

    <template v-if="visible && isUseBusinessData">
      <a-row class="row-wrap" style="margin-bottom: 16px">
        <a-col :span="5">
          <label class="title">{{ $t('languages.Apps.OptionSetting') }}</label>
        </a-col>
        <a-col :span="19">
          <div class="add-option-wrap">
            <ul ref="condionwrap">
              <li style="margin: 0">
                <div class="input-wrap">
                  <a-input
                    class="input"
                    :disabled="true"
                    :value="'使用业务数据'"
                  />
                </div>
              </li>
            </ul>
          </div>
        </a-col>
      </a-row>
    </template>

    <!-- 使用了数据字典 -->
    <template v-if="visible && isUseDictionaries">
      <a-row class="row-wrap" style="margin-bottom: 16px">
        <a-col :span="5">
          <label class="title">数据字典</label>
        </a-col>
        <a-col :span="19">
          <div class="add-option-wrap">
            <ul ref="condionwrap">
              <li style="margin: 0">
                <div class="input-wrap">
                  <a-input
                    class="input"
                    :disabled="true"
                    :value="useDictionariesName"
                  />
                </div>
              </li>
            </ul>
          </div>
        </a-col>
      </a-row>
      <a-row class="row-wrap" style="margin-bottom: 16px">
        <a-col :span="5">
          <label class="title">数据内容</label>
        </a-col>
        <a-col :span="19">
          <span style="color: #2970ff" @click="dictionariesDataVisible = true">
            查看数据
          </span>
        </a-col>
      </a-row>
    </template>

    <div class="btn-group btn-group-fixed clearfix">
      <a-button class="btn" type="primary" @click="close">
        {{ $t('languages.Apps.Ok') }}
      </a-button>
      <a-button class="btn" @click="cancel">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
    </div>
    <div></div>

    <a-modal
      v-model="dictionariesDataVisible"
      height="600px"
      title="字典数据"
      okText="确定"
      cancelText="取消"
      :maskClosable="false"
      :closable="true"
      class="add-data-dictionary-modal"
      @cancel="dictionariesDataVisible = false"
      @ok="dictionariesDataVisible = false"
    >
      <template>
        <!-- <div>
            <a-spin tip="Loading..." v-if="spinning">
              <div class="spin-content">
                数据加载中...
              </div>
            </a-spin>
          </div> -->
        <div
          class="dictionaries-data-wrapper"
          style="max-height: 240px; overflow: auto"
        >
          <a-checkbox-group v-model="checkedList">
            <!-- 历史已选中，字典已删除数据 -->
            <!-- <template v-for="item in isDisableData">
              <a-checkbox :value="item.id" :key="item.id">
                {{item.name}}
              </a-checkbox>
              <br :key="item.id + 'br'" />
            </template> -->

            <template v-for="item in plainOptions">
              <a-checkbox
                :key="item.id"
                :disabled="true"
                class="dictionaries-data-items"
                :value="item.id"
              >
                {{ item.name }}
              </a-checkbox>
              <br :key="item.id + 'br'" />
            </template>
          </a-checkbox-group>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { dictionaryApi } from 'cloudpivot/api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { textType } from '../../control-modals-map';
import OptionsInput from './options-input.vue';
import { DataItemType } from 'cloudpivot/form/schema';
import {
  Row,
  Col,
  Modal,
  Checkbox,
  Select,
  Switch,
  Input,
  Button,
} from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';

@Component({
  name: 'Text',
  components: {
    OptionsInput,
    ARow: Row,
    ACol: Col,
    AModal: Modal,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ASwitch: Switch,
    AInput: Input,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class DateComponent extends Vue {
  @Prop() modalData!: any;

  @Prop() ruleList!: any[];

  DataItemType: any = DataItemType;

  Getmultiple() {
    if (
      this.backData.propertyType === DataItemType.DropdownMulti ||
      this.backData.propertyType === DataItemType.Checkbox
    ) {
      return 'multiple';
    }
    return;
  }

  filterTypeChange(value) {
    if (['IsNull', 'IsNotNull'].includes(value)) {
      this.backData.defaultValue = '';
    }

    if (
      [
        DataItemType.Radio,
        DataItemType.Checkbox,
        DataItemType.Dropdown,
        DataItemType.DropdownMulti,
      ].includes(this.modalData.data.propertyType)
    ) {
      if (['Like', 'NotLike'].includes(value)) {
        this.backData.displayType = 0;
        this.typeChange();
        this.backData.defaultValue = '';
      }
      if (['Eq', 'NotEq'].includes(value)) {
        this.backData.displayType = 3;
        this.typeChange();
        this.backData.defaultValue = [];
      }
    }
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  visible: boolean = false;

  get textType() {
    if (this.modalData.propertyType === 0 && this.backData.displayType !== 3) {
      return [
        {
          text: 'TextBox',
          type: 0,
        },
      ];
    }
    return textType;
  }

  currentModal: string = '';

  options: Array<any> = [
    {
      default: false,
      value: '',
    },
    {
      default: false,
      value: '',
    },
    {
      default: true,
      value: '',
    },
  ];

  backData: any = {
    choiceType: '',
    defaultValue: '',
    displayType: 0,
    startValue: '',
    endValue: '',
    name: '',
    options: '',
    propertyCode: '',
    propertyType: '',
    userOptionType: '',
    visible: true,
    filterType: '',
  };

  oldData = {
    ...this.backData,
  };

  @Watch('modalData', {
    deep: true,
    immediate: true,
  })
  onBackDataChange() {
    this.oldData = JSON.parse(JSON.stringify(this.modalData.data));
  }

  /**
   * 弹框确定
   */
  close() {
    if (this.backData.name === '') {
      return;
    }
    const childData: any = this.$refs.options;
    if (childData) {
      // this.backData.options = childData.options;
      this.setOptionVal(childData.options);
    }
    this.backData.propertyCode = this.modalData.code;
    this.backData.propertyType = this.modalData.type;
    const backData = JSON.parse(JSON.stringify(this.backData));
    if (Array.isArray(backData.defaultValue)) {
      backData.defaultValue = backData.defaultValue.join(';');
    }
    this.$emit('backData', backData);
  }

  @Watch('dictionariesDataVisible')
  onDictionariesDataVisibleChange(value) {
    this.$emit('isOpenChileMoadl', value);
  }

  isUseDictionaries: boolean = false;

  isUseBusinessData: boolean = false;

  useDictionariesName: string = '';

  useDictionariesId: string = '';

  checkedList: string[] = [];

  dictionariesDataVisible: boolean = false;

  plainOptions: any[] = [];

  async getDictionariesNameById() {
    this.useDictionariesName = this.useDictionariesId;
    const res: any = await dictionaryApi.getDictionaryById({
      id: this.useDictionariesId,
    });
    if (res.errcode === 0) {
      this.useDictionariesName = res.data.name;
    }
  }

  initCheckedDictionaryList(list: any[]) {
    this.checkedList = list.map((el) => el.id);
  }

  // 查询字典数据项
  spinning: boolean = true;

  async searchDictionaryRecord() {
    this.spinning = true;
    const res: any = await dictionaryApi.getEnableRecordsByDictionaryId({
      dicId: this.useDictionariesId,
    });
    this.spinning = false;
    if (res.errcode === 0) {
      this.plainOptions = res.data;
    }
  }

  created() {
    if (this.modalData.data) {
      const backData = JSON.parse(JSON.stringify(this.modalData.data));
      if (backData.displayType === 3) {
        if (backData.defaultValue) {
          backData.defaultValue = backData.defaultValue.split(';');
        } else {
          backData.defaultValue = [];
        }
      }

      this.backData = backData;
      if (
        Array.isArray(this.modalData.data.optionList) &&
        this.modalData.data.optionList[0] &&
        this.modalData.data.optionList[0].value
      ) {
        if (
          this.modalData.data.optionList[0].value.includes('dictionariesType')
        ) {
          // 使用了数据字典
          this.isUseDictionaries = true;
          try {
            const dictionariesData = JSON.parse(
              this.modalData.data.optionList[0].value,
            );
            this.useDictionariesId = dictionariesData.checkedDictionary;
            this.getDictionariesNameById();
            this.initCheckedDictionaryList(
              dictionariesData.useDictionariesData,
            );
            // this.searchDictionaryRecord()
            this.plainOptions = dictionariesData.useDictionariesData;
          } catch (error) {}
        }
      }
      this.options = this.modalData.data.optionList;
      try {
        if (this.options[0].value.includes('schemaCode')) {
          // 使用了业务数据
          this.isUseBusinessData = true;
        }
      } catch (error) {}
      this.typeChange();
    } else {
      this.backData.name = this.modalData.name;
    }
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
  }

  typeChange() {
    this.visible = !this.visible;
    switch (this.backData.displayType) {
      case 1:
      case 3:
      case 2:
        if (!this.options) {
          this.options = [];
        }
        if (this.modalData.data.options) {
          try {
            const obj = this.modalData.data;
            if (!obj.schemaCode) {
              this.visible = false;
            }
          } catch (e) {}
        }
        break;
      default:
        this.visible = false;
        break;
    }
  }

  setOptionVal(options: Array<any>) {
    this.backData.defaultValue = '';
    this.backData.options = '';
    const optionArr: Array<string> = [];
    const defaultValue: Array<string> = [];
    options.forEach((res: any) => {
      optionArr.push(res.value);
      if (res.default) {
        defaultValue.push(res.value);
      }
    });
    this.backData.defaultValue = defaultValue.join(';');
    this.backData.options = optionArr.join(';');
  }

  cancel() {
    this.backData = JSON.parse(JSON.stringify(this.oldData));
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
    this.$emit('closeModal');
  }

  closeModal() {
    this.$emit('cancel');
  }
}
</script>
<style lang="less">
.popover-wrap {
  .ant-col {
    display: flex;
    min-height: 32px;
    align-items: center;
  }
  .ant-modal-mask {
    z-index: 1031;
  }
  .ant-modal-wrap {
    z-index: 1032;
  }
}
</style>
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 328px;

  .row {
    margin-bottom: 16px;

    .ant-col-5 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
    }

    .ant-col-19 {
      .l-h {
        line-height: 32px;
      }
    }

    .select {
      width: 100%;
    }
  }

  .btn-group {
    .btn {
      &:last-child {
        margin-right: 8px;
      }

      float: right;
    }

    .left {
      margin-right: 16px;
    }
  }

  .empty-tip {
    color: #f5222d;
    font-size: 12px;
  }

  input.input-error {
    border-color: #f5222d;
  }
}
</style>
