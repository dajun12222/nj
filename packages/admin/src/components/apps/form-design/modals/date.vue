<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    :title="dateTitle"
    width="422px"
    :visible="true"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="handleOk"
  >
    <div class="date-wrap">
      <div class="clearfix row">
        <div class="left">
          <span>{{ $t('languages.Apps.FormDesignPage.Setting') }}:</span>
        </div>
        <div class="right">
          <a-radio-group
            name="radioGroup"
            :defaultValue="selectWay"
            @change="selectWayChange"
          >
            <a-radio :value="'date'">{{
              $t('languages.Apps.FormDesignPage.Manualsetting')
            }}</a-radio>
            <a-radio :value="'dataItem'">{{
              $t('languages.Apps.FormDesignPage.SelectDataItem')
            }}</a-radio>
          </a-radio-group>
        </div>
      </div>
      <div class="clearfix row">
        <div class="left">
          <span>{{ $t('languages.Apps.FormDesignPage.Date') }}:</span>
        </div>
        <div v-if="selectWay === 'date'" class="right">
          <!-- <a-tooltip>
            <template slot="title">
              <span>{{ $t('languages.PlaceHolder.Select') }}</span>
          </template>-->
          <a-date-picker
            v-model="date"
            class="date-picker"
            format="YYYY-MM-DD"
            :class="{ error: form.date.errors.length }"
            :disabledDate="disabledDate"
            :placeholder="$t('languages.PlaceHolder.Select')"
            @change="dateChange"
          />
          <!-- </a-tooltip> -->
        </div>
        <div v-else class="right">
          <!-- <a-tooltip>
            <template slot="title">
              <span>{{ $t('languages.PlaceHolder.Select') }}</span>
          </template>-->
          <a-select
            v-model="date"
            class="select"
            :placeholder="$t('languages.PlaceHolder.Select')"
            :class="{ error: form.date.errors.length }"
            @change="dateItemChange"
          >
            <a-select-opt-group>
              <span slot="label" class="select-title">业务数据项</span>
              <template v-for="(dataItem, i) in dateDataItems">
                <a-select-option
                  v-if="!dataItem.isSystem"
                  :key="i"
                  :value="dataItem.code"
                  :title="`${dataItem.name}[${dataItem.code}]`"
                >
                  {{ `${dataItem.name}[${dataItem.code}]` }}
                </a-select-option>
              </template>
            </a-select-opt-group>
            <a-select-opt-group>
              <span slot="label" class="select-title">系统数据项</span>
              <template v-for="(dataItem, i) in dateDataItems">
                <a-select-option
                  v-if="dataItem.isSystem"
                  :key="i"
                  :value="dataItem.code"
                  :title="`${dataItem.name}[${dataItem.code}]`"
                >
                  {{ `${dataItem.name}[${dataItem.code}]` }}
                </a-select-option>
              </template>
            </a-select-opt-group>
          </a-select>
          <!-- </a-tooltip> -->
          <!-- <a-select
            class="select"
            @change="dateItemChange"
            placeholder="请选择"
            v-else
          >
            <a-select-option
              v-for="(dataItem, index) in dateDataItems"
              :key="index"
              :value="dataItem.code"
            >{{ dataItem.name }}</a-select-option>
          </a-select>-->
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Modal, DatePicker, Select, Radio } from '@h3/antd-vue';
import { FormBuilder, FormControlType, FormGroup } from 'cloudpivot-forms';
import moment from 'moment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as dataitemStore from '../stores/data-items.store-helper';

@Component({
  name: 'DateModal',
  components: {
    AModal: Modal,
    ADatePicker: DatePicker,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
})
export default class DateModal extends Vue {
  @Prop() modalData!: any;

  selectWay: string = 'date';

  dateTitle: any = '';

  date: any = null;

  dateDataItems = [];

  dateDefaultValue: any = '';

  formGroup: FormGroup;

  constructor() {
    super();
    this.formGroup = this.createFormGroup();
  }

  createFormGroup() {
    // const addExp = "type === 'add'";
    // const bindExp = "type !== 'add'";
    // const keys = ['type'];

    const group = FormBuilder.build({
      date: {
        type: FormControlType.Radio,
        options: {
          required: true,
        },
      },
    });

    return group;
  }

  get form() {
    return this.formGroup.children;
  }

  // beforeCreate() {
  // }

  created() {
    this.dateTitle = this.$t('languages.Apps.FormDesignPage.MaxDate');
    if (this.modalData.type.indexOf('min') > -1) {
      this.dateTitle = this.$t('languages.Apps.FormDesignPage.MinDate');
    }

    if (this.modalData.data.value) {
      const value = this.modalData.data.value || '';
      if (value.indexOf('{') < 0) {
        this.selectWay = 'date';
        this.date = moment(value, 'YYYY-MM-DD');
      } else {
        this.selectWay = 'dataItem';
        this.date = value.slice(1, -1);
      }
    }
    this.dateDataItems = this.items.filter((res: any) => res.type === 3) as any;
  }

  get items() {
    const initiallyArr = dataitemStore
      .getDataItems(this)
      .filter((res: any) => res.published);
    const dataArr = JSON.parse(JSON.stringify(initiallyArr));
    const targetArr = [];
    const length: number = dataArr.length | 0;
    return dataArr.filter(
      (res: any) =>
        res.type !== 5 ||
        res.type !== 6 ||
        res.type !== 7 ||
        res.type !== 8 ||
        res.type !== 9,
    );
  }

  disabledDate(val: moment.Moment) {
    if (!val) {
      return false;
    }

    const max = this.modalData.data.maxDate;
    if (max) {
      if (val.valueOf() > moment(max).valueOf()) {
        return true;
      }
    }

    const min = this.modalData.data.minDate;
    if (min) {
      if (val.valueOf() < moment(min).valueOf()) {
        return true;
      }
    }

    return false;
  }

  dateChange(val: any) {
    this.date = val ? moment(val) : val;
  }

  dateItemChange(val: any) {
    this.date = val;
  }

  selectWayChange(val: any) {
    this.selectWay = val.target.value;
    this.dateDefaultValue = '';
    this.form.date.value = '';
    this.date = null;
  }

  closeModal() {
    this.$emit('closeModal');
  }

  handleOk() {
    // if(!this.formGroup.validate()){
    //   return;
    // }
    let propertyBarText = '';
    if (this.selectWay === 'date') {
      propertyBarText = this.date ? this.date.format('YYYY-MM-DD') : '';
    } else {
      propertyBarText = `{${this.date}}`;
    }
    const backData = {
      default: '',
      value: propertyBarText,
    };
    this.$emit('backData', backData);
  }
}
</script>
<style lang="less">
.date-wrap {
  .row {
    margin-bottom: 21px;
    &:last-child {
      margin-bottom: 0;
    }
    & > div {
      float: left;
    }
    .left {
      text-align: left;
      width: 70px;
    }
    .right {
      /deep/.ant-calendar-picker {
        width: 300px !important;
      }
      /deep/.select {
        width: 300px;
      }
    }
  }
}
.select-title {
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  font-size: 14px !important;
}
</style>
