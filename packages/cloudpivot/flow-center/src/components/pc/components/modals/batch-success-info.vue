<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:33
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-02 15:29:04
 * @FilePath: \yunshu6.0\modules\cloudpivot\flow-center\src\components\pc\components\modals\batch-success-info.vue
 * @Description:
-->
<template>
  <a-modal
    v-model="showModal"
    class="success-modal"
    :width="440"
    :maskClosable="false"
    :keyboard="false"
  >
    <div class="specification">
      <i class="icon aufontAll h-icon-all-check-circle"></i>{{ successNum }}条待办任务已批量处理完成
    </div>
    <template slot="footer">
      <a-button key="back" type="primary" @click="onClose">
        {{ $t('cloudpivot.flowCenter.pc.batchOk') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { Component, Vue, Prop, PropSync, Watch } from 'vue-property-decorator';
import { Modal, Input, Row, Col, Upload, Icon, Button } from '@h3/antd-vue';

Vue.use(Upload);
@Component({
  name: 'BatchSuccess',
  components: {
    AModal: Modal,
    ATextarea: Input.TextArea,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    AButton: Button,
    AUpload: Upload,
  },
})
export default class BatchInfo extends Vue {
  @Prop() value!: any;

  @Prop() successNum!: any;

  //@PropSync('syncShowModal',{default: false}) showModal!: Boolean = false;
  showModal: boolean = false;

  //isShowModal: boolean = false;

  fileList: any = []; // 已上传的文件信息列表

  //successNum = 80;
  @Watch('value')
  valueChange(val) {
    this.showModal = val;
  }

  onClose() {
    this.$emit('input', false);
    this.$emit('batchRefresh', false);
    //this.showModal = false;
  }
}
</script>

<style lang="less">
.success-modal .h-icon-all-check-circle {
  color: #17bc94;
  margin-right: 16px;
}
.success-modal /deep/.ant-modal-footer {
  border-top: none;
}
</style>
