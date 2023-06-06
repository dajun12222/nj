<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    title="上传数量"
    :visible="true"
    width="500px"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Save')"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
    @ok="backData"
  >
    <div class="verify-item">
      <div class="label">上传数量</div>
      <div class="content">
        <a-radio-group v-model="updateType">
          <a-radio :value="1" style="width: 120px">单张</a-radio>
          <a-radio :value="2">多张</a-radio>
        </a-radio-group>
      </div>
    </div>
    <div
      v-show="isMultiple"
      class="verify-item"
      style="margin-top: 10px; margin-bottom: 10px"
    >
      <div class="label">最小数量</div>
      <div class="content">
        <a-input-number
          v-model="min"
          style="width: 100%"
          placeholder="请输入"
        />
      </div>
    </div>
    <div v-show="isMultiple" class="verify-item">
      <div class="label">最大数量</div>
      <div class="content">
        <a-input-number
          v-model="max"
          style="width: 100%"
          placeholder="请输入"
        />
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { InputNumber, message, Modal, Radio } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
@Component({
  name: 'UpdateImgNum',
  components: {
    AModal: Modal,
    AInputNumber: InputNumber,
    ARadio: Radio,
  },
})
export default class UpdateImgNum extends Vue {
  @Prop()
  modalData!: any;

  updateType: 1 | 2 = 1; // 上传数量方式 1/单张 2/多张

  min: number | '' = ''; // 最少数量

  max: number | '' = ''; // 最大数量

  // 是否是 上传多张模式
  get isMultiple() {
    return this.updateType === 2;
  }

  backData() {
    let value = `${this.updateType === 1 ? 'unique' : 'batch'}`;
    if (this.updateType === 2) {
      if (this.min) {
        if (!/^[1-9]\d*$/.test('' + this.min)) {
          message.error('最小值不合法!');
          return;
        }
        value = `${value}_min:${this.min}`;
      }
      if (this.max) {
        if (!/^[1-9]\d*$/.test('' + this.max)) {
          message.error('最大值不合法!');
          return;
        }
        value = `${value}_max:${this.max}`;
      }
      if (this.min && this.max && this.min > this.max) {
        message.error('最大值必须大于最小值!');
        return;
      }
    }
    this.$emit('backData', { value });
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
  }
}
</script>
<style lang="less" scoped>
.verify-item {
  display: flex;
  width: 100%;
  height: 32px;
  align-items: center;
  .label {
    width: 100px;
    flex-shrink: 0;
    margin-right: 10px;
    color: rgba(17, 18, 24, 0.5);
    font-size: 14px;
  }
  .content {
    display: flex;
    flex: 1;
  }
}
</style>
