<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-title">
    <!-- <div slot="title" class="title-wrap">
      <span class="title-wrap-title"> {{ title }} </span>
      <span class="title-wrap-tips"> {{ tips }} </span>
    </div> -->
    <data-title
      class="data-title-textarea"
      :list="list"
      :value="backData"
      label="请选择或填写消息提醒标题"
      :labelTips="true"
      :dataTitleToTop="true"
      @change="change"
    />
  </div>
</template>
<script lang="ts">
import DataTitle from '../../../views/app/biz-rule/property-desgner-extend/data-title.vue';
import { Modal } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'data-title-nomodal',
  components: {
    DataTitle,
    AModal: Modal,
  },
})
export default class DataTitleNomodal extends Vue {
  @Prop() value!: any;

  @Prop() list!: any;

  @Prop()
  title!: string;

  @Prop()
  tips!: string;

  /*   closeModal() {
    this.$emit('close');
  } */

  created() {
    if (this.value && this.value.length > 0) {
      this.backData = this.value;
    }
  }

  backData = [];

  handleOk() {
    this.$emit('ok', this.backData);
  }

  change(val: any) {
    // this.backData = val;
    // this.handleOk();
    this.$emit('ok', val);
  }
}
</script>

<style lang="less" scoped>
.data-title {
  .title-wrap {
    overflow: hidden;
    margin-left: -24px;
    margin-right: -24px;
    .title-wrap-title {
      margin-left: 24px;
      font-size: 16px;
      color: rgba(17, 18, 24, 0.5);
      font-weight: 600;
    }
    .title-wrap-tips {
      margin-left: 8px;
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
    }
  }
  .data-title-textarea {
    height: 100%;
    /* border: 1px solid rgba(17, 18, 24, 0.3); */
    border-radius: 5px;
    /* overflow: hidden; */
  }
}
</style>
