<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-02 10:59:03
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-11 22:20:55
-->
<template>
  <div class="urge-record">
    <a-modal
      title="催办记录"
      :visible="true"
      :maskClosable="false"
      wrapClassName="form-btn-modal"
      :destroyOnClose="true"
      :footer="null"
      :width="640"
      @cancel="cancel"
    >
      <div class="form-record-list">
        <div
          v-for="(item, index) in urgeList"
          :key="index"
          class="form-record-li"
        >
          <div class="record-li-top">
            {{ item.opTime }}
          </div>
          <div class="record-li-cn">
            {{ item.text }}
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Modal } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'urge-record',
  components: {
    AModal: Modal,
  },
})
export default class UrgeRecord extends Vue {
  @Prop() urgeList!: Array<any>;

  cancel() {
    console.log('关闭了...');
    this.$emit('cancel');
  }
}
</script>

<style lang="less">
.form-record-list {
  min-height: 270px;
  max-height: 350px;
  overflow-y: auto;
  .form-record-li {
    padding: 0 24px 0 44px;
    margin-bottom: 16px;
    position: relative;
    &::before {
      content: '';
      left: 27px;
      top: 16px;
      position: absolute;
      width: 1px;
      height: 100%;
      border-left: 1px dashed rgba(17, 18, 24, 0.25);
    }
    .record-li-top {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      font-weight: 400;
      margin-bottom: 4px;
      position: relative;
      &::before {
        content: '';
        width: 8px;
        height: 8px;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid #2970ff;
        border-radius: 50%;
        left: -20px;
        top: 4px;
        position: absolute;
      }
    }
    .record-li-cn {
      width: 100%;
      height: auto;
      background: #f1f2f6;
      border-radius: 2px;
      padding: 12px 190px 12px 12px;
      text-align: justify;
      font-size: 14px;
      color: #111218;
      line-height: 22px;
    }
    &:last-child {
      &::before {
        border: none !important;
      }
    }
  }
}
</style>
