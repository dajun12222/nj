<template>
  <a-modal
    v-model="showModal"
    :title="$t('cloudpivot.list.pc.printQrcode')"
    :width="800"
    wrapClassName="print-qrcode"
    :maskClosable="false"
    @cancel="closeModel"
  >
    <div class="print-content">
      <div class="print-left">
        <div class="print-group">
          <div class="print-title">
            {{ $t('cloudpivot.list.pc.chooseTagSize') }}
          </div>
          <div class="print-group-list">
            <div class="print-group-li">
              <span>{{ $t('cloudpivot.list.pc.width') }}（mm）</span>
              <a-input
                v-model="width"
                class="input-search"
                type="number"
                @change="onWidthChange"
              />
            </div>
            <div class="print-group-li">
              <span>{{ $t('cloudpivot.list.pc.height') }}（mm）</span>
              <a-input
                v-model="height"
                class="input-search"
                type="number"
                @change="onHeightChange"
              />
            </div>
          </div>
        </div>
        <div class="print-title subTitle">
          {{ $t('cloudpivot.list.pc.qrcodeSet') }}
        </div>
        <div class="print-group">
          <div class="print-title subTitle">
            {{ $t('cloudpivot.list.pc.qrcodeText') }}
          </div>
          <a-select
            v-model="qrcodeText"
            class="print-select print-text"
            mode="tags"
            :placeholder="$t('cloudpivot.list.pc.pleaseSelect')"
          >
            <a-select-opt-group>
              <span slot="label" class="select-title">{{
                $t('cloudpivot.list.pc.bizDataItem')
              }}</span>
              <a-select-option
                v-for="i in bizQrcodeTextList"
                :key="i.code"
                :value="i.code"
              >
                {{ i.name }}
              </a-select-option>
            </a-select-opt-group>
            <a-select-opt-group>
              <span slot="label" class="select-title">{{
                $t('cloudpivot.list.pc.sysDataItem')
              }}</span>
              <a-select-option
                v-for="i in defaultQrcodeTextList"
                :key="i.code"
                :value="i.code"
              >
                {{ i.name }}
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </div>
        <div class="print-group last">
          <div class="print-title subTitle">
            {{ $t('cloudpivot.list.pc.textNumber') }}
          </div>
          <a-select
            v-model="textNumber"
            class="print-select"
            :placeholder="$t('cloudpivot.list.pc.pleaseSelect')"
          >
            <a-select-option
              v-for="(text, index) in textNumberList"
              :key="index"
              :value="text.value"
            >
              {{ isChinese ? text.name : text.name_i18n }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="print-right">
        <div class="print-right-box">
          <div class="qrcode-box">
            <!-- <i class="icon aufontAll h-icon-all-qrcode-o"></i> -->
          </div>
          <p>{{ $t('cloudpivot.list.pc.qrcodeTextExample') }}</p>
        </div>
      </div>
    </div>
    <template slot="footer">
      <a-button key="cancel" @click="closeModel">
        {{ $t('cloudpivot.list.pc.Cancel') }}
      </a-button>
      <a-button key="print" type="primary" @click="print">
        {{ $t('cloudpivot.list.pc.print') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { Button, Input, Modal, Select } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

@Component({
  name: 'print-qrcode',
  components: {
    AModal: Modal,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    AInput: Input,
  },
})
export default class PrintQrcode extends Vue {
  @WorkflowCenterModule.State('dataItemList') dataItemList: any;

  @Prop() value!: boolean;

  @Prop() checkedLength!: number;

  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  get bizQrcodeTextList() {
    return this.dataItemList.filter(
      (d: any) =>
        !d.defaultProperty && this.dataItemTypeArr.includes(d.propertyType),
    );
  }

  get defaultQrcodeTextList() {
    return this.dataItemList.filter(
      (d: any) =>
        d.defaultProperty && this.dataItemTypeArr.includes(d.propertyType),
    );
  }

  width: number = 60;

  height: number = 60;

  showModal: boolean = false; // 弹窗显隐

  dataItemTypeArr: any = [0, 3, 9];

  textNumber: any = 12;

  maxNumber: number = 42;

  qrcodeText: any = [];

  textNumberList: any = [
    {
      name: '初号',
      name_i18n: '42pt',
      value: 42,
    },
    {
      name: '小初',
      name_i18n: '36pt',
      value: 36,
    },
    {
      name: '一号',
      name_i18n: '26pt',
      value: 26,
    },
    {
      name: '小一',
      name_i18n: '24pt',
      value: 24,
    },
    {
      name: '二号',
      name_i18n: '22pt',
      value: 22,
    },
    {
      name: '小二',
      name_i18n: '18pt',
      value: 18,
    },
    {
      name: '三号',
      name_i18n: '16pt',
      value: 16,
    },
    {
      name: '小三',
      name_i18n: '15pt',
      value: 15,
    },
    {
      name: '四号',
      name_i18n: '14pt',
      value: 14,
    },
    {
      name: '小四',
      name_i18n: '12pt',
      value: 12,
    },
    {
      name: '五号',
      name_i18n: '10.5pt',
      value: 10.5,
    },
    {
      name: '小五',
      name_i18n: '9pt',
      value: 9,
    },
    {
      name: '六号',
      name_i18n: '7.5pt',
      value: 7.5,
    },
    {
      name: '小六',
      name_i18n: '6.5pt',
      value: 6.5,
    },
    {
      name: '七号',
      name_i18n: '5.5pt',
      value: 5.5,
    },
    {
      name: '八号',
      name_i18n: '5pt',
      value: 5,
    },
  ];

  /*
   * 便签宽度变化事件
   */
  onWidthChange() {
    if (Number(this.width) < 0) {
      this.width = 0;
    }
  }

  /*
   * 便签高度变化事件
   */
  onHeightChange() {
    if (Number(this.height) < 0) {
      this.height = 0;
      return;
    }
    // 根据文字高度计算默认字体大小
    const textHeight: number =
      (this.getMmFromPx(Number(this.height)) * 0.1) / 1.5;
    // 文字默认最大高度
    const maxHeight: number =
      (this.getMmFromPx(Number(this.height)) * 0.5) / 1.5;
    let min: number = Number.POSITIVE_INFINITY;
    let defaultNumber: number = 0;
    let once: boolean = false;
    this.textNumberList.forEach((text: any) => {
      const result = Math.abs(text.value - textHeight);
      if (result < min) {
        min = result;
        defaultNumber = text.value;
      }
      if (text.value < maxHeight && !once) {
        once = true;
        this.maxNumber = text.value;
      }
    });
    this.textNumber = defaultNumber;
  }

  getMmFromPx(val) {
    return (val / 10 / 2.54) * 72;
  }

  /*
   * 二维码底部文字处理
   */
  qrcodeTextData() {
    const textArr = this.qrcodeText.filter((d: any) => d !== '');
    const dataItemArr = this.dataItemList.filter((d: any) =>
      this.dataItemTypeArr.includes(d.propertyType),
    );

    const codeArr = textArr.map((text: any) => {
      const index = this.dataItemList.findIndex(
        (item: any) => item.code === text,
      );
      let isDataItem = 0;
      if (index !== -1) {
        isDataItem = 1;
      }
      return {
        isDataItem,
        code: text,
      };
    });
    return codeArr;
  }

  /*
   * 打印预览
   */
  print() {
    let number = this.textNumber;
    if (this.textNumber > this.maxNumber) {
      number = this.maxNumber;
    }
    const qrcodeData = {
      width: this.getMmFromPx(Number(this.width)),
      height: this.getMmFromPx(Number(this.height)),
      fontSize: number,
      textData: this.qrcodeTextData(),
    };
    this.$emit('createPrintQrCodeData', qrcodeData);
  }

  closeModel() {
    this.resetData();
    this.$emit('input', false);
  }

  /*
   * 重置数据
   */
  resetData() {
    this.width = 60;
    this.height = 60;
    this.textNumber = 12;
    this.maxNumber = 42;
    this.qrcodeText = [];
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../application/src/components/pc/style/custom-themes';
/deep/.print-qrcode {
  .ant-modal-content {
    background: #ffffff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
  }
  .ant-modal-header {
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
  .ant-modal-close-x {
    width: 57px;
    height: 72px;
    line-height: 72px;
    &:hover {
      i {
        color: @highlightColor;
      }
    }
  }
  .ant-modal-footer {
    border-top: none;
    padding: 24px;
    .ant-btn {
      height: 32px;
      padding: 0 10px;
      > span {
        height: 22px;
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
  .ant-modal-body {
    padding-top: 0;
    padding-bottom: 0;
  }
  .print-content {
    overflow: hidden;
    .total-title {
      color: rgba(0, 0, 0, 0.65);
      font-size: 14px;
      i {
        color: #2970ff;
        margin-right: 8px;
        vertical-align: middle;
      }
    }
    .print-left {
      float: right;
      // margin-top: 16px;
      width: 432px;
      .print-title {
        height: 22px;
        font-size: 14px;
        font-weight: 500;
        color: rgba(17, 18, 24, 0.5);
        line-height: 22px;
      }
      .print-group {
        margin-bottom: 17px;
        .print-title {
          margin-bottom: 6px;
          font-size: 14px;
          // font-weight: 700;
          color: rgba(17, 18, 24, 0.5);
          &.subTitle {
            color: #111218;
            margin: 0 0 6px 0;
            font-weight: 400;
          }
        }
        .suffix-icon {
          color: rgba(0, 0, 0, 0.45);
        }
        .print-select {
          width: 100%;
        }
        .print-text {
          /deep/.ant-select-selection--multiple {
            max-height: 86px;
            overflow: auto;
          }
        }
        .print-tip {
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;
        }
        .ant-select-selection {
          border-radius: 2px;
          border: 1px solid #d4d5d6;
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          line-height: 22px;
        }
      }
      .last {
        margin-bottom: 0;
      }
    }
    .print-right {
      float: left;
      text-align: center;
      width: 296px;
      height: 434px;
      background: #f8f8fb;
      .print-right-box {
        margin: 48px auto 0;
        width: 212px;
        height: 252px;
        background: #ffffff;
        box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
        padding: 27px 22px;
      }
      .qrcode-title {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.85);
      }
      .qrcode-box {
        border-radius: 4px;
        width: 168px;
        height: 168px;
        background: rgba(17, 18, 24, 0.08);
        line-height: 168px;
        text-align: center;
        i {
          font-size: 130px;
          line-height: 168px;
        }
        p {
          margin-top: 8px;
          color: rgba(0, 0, 0, 0.85);
        }
      }
      p {
        margin-top: 16px;
        height: 22px;
        font-size: 14px;
        font-weight: 400;
        color: #111218;
        line-height: 22px;
      }
    }
  }
}
.print-group-list {
  display: flex;
  justify-content: space-between;
  margin-top: 17px;
  .print-group-li {
    width: 208px;
    display: flex;
    flex-direction: column;
    > span {
      height: 22px;
      font-size: 14px;
      // font-weight: 600;
      color: #111218;
      line-height: 22px;
    }
    .input-search {
      margin-top: 6px;
      border-radius: 2px;
      border: 1px solid #d4d5d6;
      font-size: 14px;
      font-weight: 400;
      color: #111218;
      line-height: 22px;
    }
  }
}
.print-title.subTitle {
  margin: 48px 0 17px;
  color: rgba(17, 18, 24, 0.5);
}
/deep/ .ant-modal-footer {
  border-top: none;
  padding-bottom: 24px;
}
</style>
<style lang="less">
.print-qrcode {
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
  .ant-btn {
    color: #111218;
    &.ant-btn-primary {
      color: #fff;
    }
  }
  .ant-modal-header {
    border-bottom: none;
  }
}
</style>
