<template>
  <div class="regular-wrap">
    <div class="clearfix row">
      <div class="left">
        <span>正则校验类型</span>
      </div>
      <div class="right">
        <a-select
          v-model="regularData.selectOption"
          :placeholder="$t('languages.PlaceHolder.Select')"
          allowClear
          class="select"
          :getPopupContainer="getPopupContainer"
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
        <span>{{ $t('languages.Apps.FormDesignPage.Regular') }}</span>
      </div>
      <div class="right">
        <a-input
          v-model="regularData.regularText"
          :disabled="disabled"
          :placeholder="$t('languages.PlaceHolder.Input')"
          class="input"
          @change="handleChangeText"
        />
      </div>
    </div>
    <div class="clearfix row">
      <div class="left">
        <span>{{ $t('languages.Apps.FormDesignPage.ErrorTips') }}</span>
      </div>
      <div class="right">
        <a-input
          v-model="langObj[lang]"
          :placeholder="$t('languages.PlaceHolder.Input')"
          class="input"
          @change="handleChangeTip"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Options from '../../typings/form-modals-map';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Select, Input } from '@h3/antd-vue';

@Component({
  name: 'RegularModal',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    AInput: Input,
  },
})
export default class RegularModal extends Vue {
  @Prop({
    type: Object,
    default: () => ({}),
  })
  modalData!: any;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  currentItem!: any;

  @Prop() visible: any;

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

  get regularRules() {
    if (this.currentItem.type === 1) {
      return Options.defaultRegularList.slice(
        Options.defaultRegularList.length - 2,
      );
    }

    return this.modalData.options &&
      this.modalData.options.type &&
      this.modalData.options.type === 'number'
      ? Options.defaultRegularList.slice(0, 3)
      : Options.defaultRegularList;
  }

  created() {
    this.getInit();
  }

  @Watch('visible')
  changeModelData(val: any) {
    if (val) {
      this.getInit();
    }
  }

  getInit() {
    const data = this.modalData.options as any;
    if (data) {
      this.regularData = {
        tips: data.regexpText || '',
        regularText: data.regexp || '',
        selectOption: data.regexp || '',
      };
      this.langObj = data.regexpText
        ? JSON.parse(data.regexpText)
        : this.langObj;
      //判断是否为出自定义以外的正则表达示模板
      const rules = this.regularRules.find((r) => {
        return r.rule === data.regexp && r.text !== '自定义';
      });
      if (rules) {
        this.disabled = true;
      } else if (!rules && data.regexp) {
        this.regularRules.forEach((r) => {
          if (r.text === '自定义') {
            r.rule = data.regexp;
            this.disabled = false;
          }
        });
      } else {
        this.regularData.selectOption = 'xx';
        this.disabled = false;
      }
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
        this.modalData.options.regexp = val;
      } else {
        this.disabled = false;
        this.regularData.regularText = '';
        this.modalData.options.regexp = '';
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
        this.modalData.options.regexpText = JSON.stringify(this.langObj);
        // this.regularData.tips = JSON.stringify()
      } else {
        // this.regularData.tips = '';
        this.langObj = {
          en: '',
          zh: '',
        };
        this.modalData.options.regexpText = JSON.stringify(this.langObj);
      }
    } else {
      this.disabled = false;
      this.regularData.selectOption = '';
      this.regularData.regularText = '';
      this.modalData.options.regexp = '';
      this.langObj = {
        en: '',
        zh: '',
      };
    }
  }

  handleChangeText() {
    if (typeof this.modalData.options === 'string') {
      this.modalData.options = {};
    }
    this.modalData.options.regexp = this.regularData.regularText;
  }

  handleChangeTip(e) {
    // if (!this.langObj.en) {
    //   this.langObj.en = this.langObj.zh;
    // }
    //
    // if (!this.langObj.zh) {
    //   this.langObj.zh = this.langObj.en;
    // }
    if (typeof this.modalData.options === 'string') {
      this.modalData.options = {};
    }
    this.modalData.options.regexpText = JSON.stringify(this.langObj);
  }

  closeModal() {
    this.$emit('closeModal');
  }
}
</script>

<style lang="less" scoped>
.regular-wrap {
  .row {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .left {
      width: 16.66666667%;
      float: left;

      span {
        line-height: 32px;
      }
    }

    .right {
      width: 83.33333333%;
      float: left;

      .input,
      .select {
        width: 100%;
      }
    }
  }
}
</style>
