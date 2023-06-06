<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="radio-group clearfix">
    <a-col :span="5">
      <label class="title">{{ $t('languages.Apps.OptionSetting') }}</label>
    </a-col>
    <a-col :span="19">
      <a-radio-group
        ref="condionwrap"
        v-model="defaultValue"
        class="radio-box"
        @change="radioChange"
      >
        <div
          v-for="(option, index) in options"
          :key="index"
          class="radio-item-wrap clearfix"
        >
          <div class="radio-wrap">
            <a-radio :value="index" class="radio-item" />
          </div>
          <div class="input-wrap">
            <a-input
              v-model="option.value"
              :placeholder="
                $t('languages.Apps.FormDesignPage.Placeholder.InputOptionName')
              "
              class="input"
              maxlength="200"
            />
          </div>
          <div class="delete-wrap" @click="deleteRow(index)">
            <span class="delete"><i class="icon aufontAll h-icon-all-delete-o"></i></span>
          </div>
        </div>
      </a-radio-group>
      <div class="add">
        <span @click="addRows">
          <span><i class="icon aufontAll h-icon-all-plus-o"></i></span>
          <span>{{ $t('languages.Apps.FormDesignPage.AddOptins') }}</span>
        </span>
      </div>
    </a-col>
  </div>
</template>
<script lang="ts">
import { Col, Input, Radio } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component({
  name: 'RadioOptios',
  components: {
    ACol: Col,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
})
export default class RadioOptios extends Vue {
  @Prop() options!: any[];

  defaultValue = 0;

  created() {
    const len: number = this.options.length | 0;
    for (let i = 0; i < len; i += 1) {
      if (this.options[i].default) {
        this.defaultValue = i;
      }
    }
  }

  addRows() {
    const el: any = (this.$refs.condionwrap as any).$el;
    const option = {
      default: false,
      value: '',
    };
    this.options.push(option);
    this.$nextTick(() => {
      el.scrollTop = el.scrollHeight;
    });
  }

  deleteRow(index: number) {
    this.options.splice(index, 1);
    if (this.defaultValue === index) {
      this.defaultValue = index - 1;
    }
  }

  /**
   * 选择框改变时候 处理options数据
   */
  radioChange(val: any) {
    const index: number = this.defaultValue;
    this.options.forEach((res: any) => {
      res.default = false;
    });
    this.options[index].default = true;
  }
}
</script>
<style lang="less" scoped>
.radio-group {
  .ant-col-5 {
    label {
      color: rgba(17, 18, 24, 0.5);
    }
  }
  .ant-col-19 {
    /deep/.radio-box {
      max-height: 170px;
      overflow-x: auto;
    }

    .radio-wrap {
      float: left;
      margin-top: 4px;
    }
    .input-wrap {
      float: left;
      .input {
        width: 185px;
      }
    }
    .delete-wrap {
      float: left;
      margin-top: 4px;
      margin-left: 6px;
    }
    .radio-item-wrap {
      margin-bottom: 16px;
    }
    .add {
      color: @primary-color;
      cursor: pointer;
      text-align: center;
      span {
        margin-right: 8px;
      }
    }
  }
}
</style>
