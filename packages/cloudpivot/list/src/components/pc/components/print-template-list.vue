<template>
  <a-modal
    v-model="showModal"
    :title="'选择打印模板'"
    :width="640"
    class="print-template-list"
    :maskClosable="false"
    :destroyOnClose="true"
    :footer="null"
    @cancel="closeModel"
    @ok="handleBatchPrint"
  >
    <a-radio-group
      v-model="selectedTemp.printTemplateCode"
      name="print-template"
      class="print-template-list-items"
    >
      <template v-for="(item, index) in printTempList">
        <a-radio
          :key="index"
          :value="item.printTemplateCode"
          class="print-template-list-item"
          @click="selectId(item)"
        >
          <div class="print-template-item">
            <svg class="icon svg-icon print-template-icon" aria-hidden="true">
              <use xlink:href="#h-icon-all-print-template" />
            </svg>
            <span class="print-template-label">{{
              item.printTemplateName
            }}</span>
            <div class="check-icon">
              <span class="icon aufontAll print-template-check-icon">&#xe98e;</span>
              <span class="icon aufontAll print-template-check-icon-checked">&#xe992;</span>
            </div>
          </div>
        </a-radio>
      </template>
    </a-radio-group>
  </a-modal>
</template>
<script lang="ts">
import { Button, Input, Modal, Radio, Select } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  name: 'print-template-list',
  components: {
    AModal: Modal,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
})
export default class PrintTemplateList extends Vue {
  @Prop() value!: boolean;

  @Prop() printTempList!: any[];

  showModal: boolean = false; // 弹窗显隐

  selectedTemp: any = {
    printTemplateCode: '',
    printTemplateName: '',
  };

  @Watch('printTempList')
  initSelectedTemp() {
    this.selectedTemp = this.printTempList[0];
  }

  selectId(item: any) {
    this.selectedTemp = item;

    this.handleBatchPrint();
  }

  handleBatchPrint() {
    this.$emit('chosenTemplate', this.selectedTemp.printTemplateCode);
    this.$emit('input', false);
  }

  closeModel() {
    this.$emit('input', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
.print-template-list {
  /deep/.ant-modal-content {
    background: #ffffff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  /deep/.ant-modal-header {
    border-bottom: none;
    padding: 24px;
    .ant-modal-title {
      height: 24px;
      font-size: 16px;
      font-weight: 600;
      color: #111218;
      line-height: 24px;
    }
  }
  /deep/.ant-modal-close-x {
    width: 57px;
    height: 72px;
    line-height: 72px;
  }
  /deep/.ant-modal-footer {
    border-top: none;
    padding: 24px;
    .ant-btn {
      height: 32px;
      > span {
        height: 22px;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
  /deep/.ant-modal-body {
    display: inline-block;
    width: 100%;
    padding: 21px 0 25px 22px;
    max-height: 300px;
  }
  /deep/span.ant-radio + * {
    padding: 0 !important;
  }
  .print-template-list-items {
    padding-right: 20px;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    max-height: 230px;

    .print-template-list-item {
      margin-right: 18px;
      margin-bottom: 6px;
      &:nth-child(even) {
        margin-right: 0;
      }
      height: 40px;
      /deep/.ant-radio {
        display: none;
      }
      .print-template-item {
        width: 286px;
        height: 40px;
        background: #ffffff;
        border-radius: 2px;
        border: 1px solid #e8eaed;
        line-height: 40px;
        display: flex;
        align-items: center;
        position: relative;
        padding-left: 16px;

        .print-template-icon {
          width: 24px;
          height: 24px;
          margin-right: 10px;
        }
        .print-template-label {
          height: 22px;
          font-size: 14px;
          color: #111218;
          line-height: 22px;
          width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .check-icon {
          position: absolute;
          right: 16px;
          top: 0;
          height: 40px;
          line-height: 40px;
          .print-template-check-icon {
            height: 16px;
            line-height: 16px;
            color: rgba(17, 18, 24, 0.25);
            font-size: 16px;
          }
          .print-template-check-icon-checked {
            display: none;
            height: 16px;
            line-height: 16px;
            color: @highlightColor;
            font-size: 16px;
          }
        }
      }
      &.ant-radio-wrapper-checked {
        .print-template-check-icon {
          display: none !important;
        }
        .print-template-check-icon-checked {
          display: inline-block !important;
        }
      }
    }
  }
}
</style>
