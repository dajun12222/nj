<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="modal-wrap">
    <component
      :is="currentModal"
      :modalData="modalMsg"
      @backData="backData"
      @closeModal="closeModal"
      @setWorkflowForm="
        () => {
          _self.$emit('setWorkflowForm');
        }
      "
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AddBtn from './add-btn.vue';
import DeleteOrImportBtn from './delete-import-btn.vue';
import EditBtn from './edit-btn.vue';
import QrcodeBtn from './qrcode-btn.vue';

@Component({
  name: 'BtnSetting',
  components: {
    AddBtn,
    DeleteOrImportBtn,
    EditBtn,
    QrcodeBtn,
  },
})
export default class BtnSetting extends Vue {
  @Prop() modalData!: any;

  currentModal: string = '';

  created() {
    switch (this.modalData.actionCode) {
      case 'add':
        this.currentModal = 'AddBtn';
        break;
      case 'edit':
        this.currentModal = 'EditBtn';
        break;
      case 'qr_code':
        this.currentModal = 'QrcodeBtn';
        break;
      default:
        this.currentModal = 'DeleteOrImportBtn';
        break;
    }
  }

  backData(val: any) {
    // console.log(val ,'confirm++++++++++++++++++++++++++')
    this.$emit('confirm', val);
  }

  closeModal(val: any) {
    this.$emit('cancel', val);
  }

  get modalMsg() {
    return JSON.parse(JSON.stringify(this.modalData));
  }
}
</script>
<style lang="less" scoped>
.modal-wrap {
  padding-top: 12px;
  padding-bottom: 4px;
}
</style>
