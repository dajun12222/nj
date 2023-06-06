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
          maxlength="200"
          :class="{ 'input-error': !backData.name_i18n['zh'] }"
        />
        <a-input
          v-else
          v-model="backData.name_i18n[$i18n.locale]"
          maxlength="200"
          :class="{ 'input-error': !backData.name_i18n[$i18n.locale] }"
        />
        <div v-if="!backData.name_i18n['zh']" class="empty-tip">
          {{ $t('languages.Apps.DisplayNameRequire') }}
        </div>
      </a-col>
    </a-row>

    <!-- 查询符号 -->
    <a-row class="row">
      <a-col :span="5">
        <label class="title">查询方式</label>
      </a-col>
      <a-col :span="19">
        <a-select
          v-model="backData.filterType"
          :getPopupContainer="getPopupContainer"
          :placeholder="$t('languages.PlaceHolder.Select')"
          class="select"
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

    <a-row class="row">
      <a-col :span="5">
        <label class="title">{{ $t('languages.Apps.DefaultStatus') }}</label>
      </a-col>
      <a-col :span="19">
        <!-- <ul class="options">
          <li
            v-for="(option,index) in options"
            :key="index"
          ><a-checkbox class="checkbox" v-model="option.default"/> <span>{{ option.value }}</span></li>
        </ul> -->

        <a-select
          v-model="backData.defaultValue"
          :getPopupContainer="getPopupContainer"
          :placeholder="$t('languages.PlaceHolder.Select')"
          class="select"
          mode="multiple"
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
    <div class="btn-group btn-group-fixed clearfix">
      <a-button class="btn" type="primary" @click="close">
        {{ $t('languages.Apps.Ok') }}
      </a-button>
      <a-button class="btn" @click="cancel">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
import {
  Row,
  Col,
  Switch,
  Select,
  Checkbox,
  Button,
  Input,
} from '@h3/antd-vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { FormStatusList } from '../../control-modals-map';
@Component({
  name: 'FormStatus',
  components: {
    ARow: Row,
    ACol: Col,
    ASwitch: Switch,
    ASelect: Select,
    ACheckbox: Checkbox,
    AButton: Button,
    ASelectOption: Select.Option,
    AInput: Input,
  },
})
export default class FormStatus extends Vue {
  @Prop() modalData!: any;

  @Prop() ruleList!: any[];

  plainOptions = FormStatusList;

  visible: boolean = true;

  backData: any = {
    choiceType: '',
    defaultValue: '',
    displayType: 3,
    startValue: '',
    endValue: '',
    name: '',
    options: '',
    propertyCode: '',
    propertyType: '',
    userOptionType: '',
    visible: true,
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

  options = [
    {
      default: false,
      value: '草稿',
    },
    {
      default: false,
      value: '进行中',
    },
    {
      default: false,
      value: '已完成',
    },
    {
      default: false,
      value: '已作废',
    },
  ];

  created() {
    if (this.modalData.data) {
      this.backData = this.modalData.data;
      if (this.modalData.data.optionList) {
        this.options = this.modalData.data.optionList;
      }
      if (this.modalData.data.defaultValue) {
        const defaultValue = this.modalData.data.defaultValue.split(';');
        this.modalData.data.defaultValue = defaultValue;
        console.log(defaultValue);
        this.options.forEach((item) => {
          if (defaultValue.includes(item.value)) {
            item.default = true;
          }
        });
      } else {
        this.modalData.data.defaultValue = [];
      }
      this.backData.displayType = 3;
    } else {
      this.backData.name = this.modalData.name;
    }
    (this.backData as any).name_i18n.en =
      zhToEn[(this.backData as any).name_i18n.en] ||
      (this.backData as any).name_i18n.en;
    (this.backData as any).name_i18n.zh =
      (this.backData as any).name_i18n.zh || this.backData.name;
  }

  close() {
    if (this.backData.name === '') {
      return;
    }
    this.backData.propertyCode = this.modalData.code;
    this.backData.propertyType = this.modalData.type;
    this.setOptionVal(this.options);

    const backData = JSON.parse(JSON.stringify(this.backData));
    if (Array.isArray(backData.defaultValue)) {
      backData.defaultValue = backData.defaultValue.join(';');
    }
    this.$emit('backData', backData);
  }

  setOptionVal(options: Array<any>) {
    // this.backData.defaultValue = '';
    this.backData.options = options.map((res: any) => res.value).join(';');

    // this.backData.defaultValue = options
    //   .map((res:any) => {
    //     if (res.default) {
    //       return res.value;
    //     }
    //   })
    //   .filter((res:any) => res).join(';');
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
<style lang="less" scoped>
.popover-wrap {
  padding: 0 6px;
  width: 328px;
  .row {
    /deep/.ant-select-selection--multiple {
      height: 32px;
    }
    .select {
      width: 100%;
    }
    margin-bottom: 16px;
    .ant-col-5 {
      label {
        line-height: 32px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    .ant-col-19 {
      .checkbox {
        /deep/ label {
          display: block;
          line-height: 32px;
        }
      }
      .l-h {
        line-height: 32px;
      }
    }
    .options {
      li {
        line-height: 32px;
        .checkbox {
          margin-right: 8px;
        }
      }
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
