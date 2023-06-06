<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-row class="row-wrap">
    <a-col :span="5">
      <label class="title">{{ $t('languages.Apps.OptionSetting') }}</label>
    </a-col>
    <a-col :span="19">
      <div class="add-option-wrap">
        <ul ref="condionwrap">
          <li v-for="(option, index) in options" :key="index" class="clearfix">
            <div class="input-wrap">
              <a-input
                v-model="option.value"
                class="input"
                :disabled="true"
                maxlength="200"
                :placeholder="
                  $t(
                    'languages.Apps.FormDesignPage.Placeholder.InputOptionName',
                  )
                "
              />
            </div>
          </li>
        </ul>
      </div>
    </a-col>
  </a-row>
</template>
<script lang="ts">
import { Row, Col, Input } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component({
  name: 'OptionsInput',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
  },
})
export default class OptionsInput extends Vue {
  @Prop() options!: any;

  created() {}
}
</script>
<style lang="less">
.row-wrap {
  .ant-col-5 {
    label {
      color: rgba(17, 18, 24, 0.5);
    }
  }
  .ant-col-19 {
    .add-option-wrap {
      .add {
        color: @primary-color;
        text-align: center;
        cursor: pointer;
        span {
          margin-right: 8px;
        }
      }
      li {
        margin-bottom: 16px;
        .default {
          float: left;
          margin-top: 4px;
          margin-right: 6px;
        }
        .input-wrap {
          float: left;
          width: 100%;
        }
        .delete {
          float: left;
          margin-top: 4px;
          margin-left: 6px;
        }
      }
    }
  }
}
</style>
