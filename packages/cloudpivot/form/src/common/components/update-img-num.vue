<!-- <a-modal
    title="上传数量"
    :visible="true"
    width="500px"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Save')"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="backData"
  > -->
<!-- <div class="integer-block">
      <a-input />
      <div class="up">
        <i class="aufontAll h-icon-all-caret-up"></i>
      </div>
      <div class="down">
        <i class="aufontAll h-icon-all-caret-down"></i>
      </div>
    </div>
    <div class="integer-block">
      <a-input />
      <div class="up">
        <i class="aufontAll h-icon-all-caret-up"></i>
      </div>
      <div class="down">
        <i class="aufontAll h-icon-all-caret-down"></i>
      </div>
    </div> -->
<!-- </a-modal> -->
<template>
  <div class="image-number">
    <a-radio-group
      v-model="updateType"
      :disabled="$route.path.includes('apps/versionDetail/')"
    >
      <a-radio :value="1"> 单张 </a-radio>
      <a-radio :value="2"> 多张 </a-radio>
    </a-radio-group>

    <div v-show="isMultiple" class="tips">
      <span>数量范围</span>
    </div>

    <a-tooltip :visible="tips.length > 0">
      <span slot="title">{{ tips }}</span>
      <div v-show="isMultiple" class="verify-item">
        <div class="content">
          <a-tooltip :visible="minTips.length > 0">
            <span slot="title">{{ minTips }}</span>
            <a-form-item
              :validateStatus="
                minTips.length > 0 || tips.length > 0 ? 'error' : ''
              "
            >
              <a-input-number
                ref="min"
                v-model="min"
                placeholder="请输入"
                :disabled="$route.path.includes('apps/versionDetail/')"
              />
            </a-form-item>
          </a-tooltip>

          <div class="line"></div>
          <a-tooltip :visible="maxTips.length > 0">
            <span slot="title">{{ maxTips }}</span>
            <a-form-item
              :validateStatus="
                maxTips.length > 0 || tips.length > 0 ? 'error' : ''
              "
            >
              <a-input-number
                ref="max"
                v-model="max"
                placeholder="请输入"
                :disabled="$route.path.includes('apps/versionDetail/')"
              />
            </a-form-item>
          </a-tooltip>
        </div>
      </div>
    </a-tooltip>
  </div>
</template>
<script lang="ts">
import {
  message,
  Modal,
  Radio,
  InputNumber,
  Form,
  Tooltip,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
@Component({
  name: 'UpdateImgNum',
  components: {
    AModal: Modal,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AInputNumber: InputNumber,
    AFormItem: Form.Item,
    AForm: Form,
    ATooltip: Tooltip,
  },
})
export default class UpdateImgNum extends Vue {
  @Prop()
  modalData!: any;

  updateType: 1 | 2 = 1; // 上传数量方式 1/单张 2/多张

  min: number | '' = ''; // 最少数量

  max: number | '' = ''; // 最大数量

  minTips: string = '';

  maxTips: string = '';

  tips: string = '';

  rules: any = null;

  @Watch('updateType')
  onUpdateChange() {
    this.backData();
  }

  @Watch('min')
  onminChange() {
    this.backData();
  }

  @Watch('max')
  onMaxChange() {
    this.backData();
  }

  // 是否是 上传多张模式
  get isMultiple() {
    return this.updateType === 2;
  }

  backData() {
    let value = `${this.updateType === 1 ? 'unique' : 'batch'}`;
    if (this.updateType === 2) {
      if (this.min) {
        if (!/^[1-9]\d*$/.test('' + this.min)) {
          this.minTips = '最小值不合法!';
          return;
        }
        value = `${value}_min:${this.min}`;
      }
      this.minTips = '';
      if (this.max) {
        if (!/^[1-9]\d*$/.test('' + this.max)) {
          this.maxTips = '最大值不合法!';
          return;
        }
        value = `${value}_max:${this.max}`;
      }
      this.maxTips = '';
      if (this.min && this.max && this.min > this.max) {
        this.tips = '最大值必须大于最小值!';
        return;
      }
      this.tips = '';
    }
    this.$emit('backData', value);
  }

  closeModal() {
    this.$emit('closeModal');
  }

  created() {
    // value unique/单张 batch/多张
    const arr = this.modalData.data.value.split('_');
    const type = arr.shift();
    if (type === 'batch') {
      this.updateType = 2;
    }
    if (arr.length) {
      for (const item of arr) {
        const [key, val] = item.split(':');
        switch (key) {
          case 'min':
            this.min = +val;
            break;
          case 'max':
            this.max = +val;
            break;
          default:
            break;
        }
      }
    }
    this.setRules();
  }

  setRules() {
    this.rules = {
      min: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.RequiredListName'),
          },
        ],
      },
      max: {
        rules: [
          {
            required: true,
            message: this.$t('languages.Apps.RequiredListCode'),
          },
        ],
      },
    };
  }
}
</script>
<style lang="less" scoped>
.tips {
  font-size: 12px;
  line-height: 20px;
  color: #88888b;
  margin-bottom: 4px;
}

/deep/ .ant-form-item {
  margin-bottom: 0;
  .ant-form-explain {
    position: absolute;
  }
  .ant-input-number {
    width: 116px;
  }
}
/deep/ .verify-item {
  display: flex;
  width: 100%;
  height: 32px;
  align-items: center;
  .label {
    width: 100px;
    flex-shrink: 0;
    margin-right: 10px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
  }
  .line {
    width: 18px;
    border-top: thin solid #d8d8d8;
    padding-top: 1px;
  }
  .content {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }
  /deep/ .ant-radio-group {
    white-space: nowrap;
    .ant-radio-wrapper {
      margin-right: 24px;
      font-size: 13px;
      color: #111218;
      line-height: 22px;
    }
  }
}
</style>
