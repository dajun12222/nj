<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="show"
    class="import-container"
    :title="modalTitle"
    :bodyStyle="{ maxHeight: '650px', overflow: 'auto' }"
    width="800px"
    destroyOnClose
    :maskClosable="false"
    :footer="null"
    :getPopupContainer="
      (triggerNode) => {
        return triggerNode.parentNode;
      }
    "
    @cancel="close"
  >
    <!-- <div v-if="!importType" class="import-type-layout">
      <div class="type-item" @click="onTypeItemClicked('LOCAL')">
        <span>
          <i class="icon aufontAll h-icon-all-a-ic_upload_localfile"></i
          >本地导入</span
        >
        <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
      </div>
      <div class="type-item" @click="onTypeItemClicked('MARKET')">
        <span>
          <i class="icon aufontAll h-icon-all-upload_am"></i> 应用市场</span
        >
        <span class="icon aufontAll h-icon-all-arrow-right-o"></span>
      </div>
    </div> -->
    <div v-if="importType" class="import-layout">
      <div class="step-content">
        <fileUpload
          v-if="curStep === 0"
          ref="fileUpload"
          :importType="importType"
          @nextStep="nextStep"
          @onTypeItemReturn="onTypeItemReturn"
        />

        <fileValidate
          v-else-if="curStep === 1"
          :fileName="uploadResult.fileName"
          :importType="importType"
          @onTypeItemReturn="onTypeItemReturn"
          @prevStep="prevStep"
          @nextStep="nextStep"
          @setModalTitle="setModalTitle"
        />

        <fileImport
          v-else-if="curStep === 2"
          :importType="importType"
          :uploadResult="uploadResult"
          :validResult="validResult"
          @onTypeItemReturn="onTypeItemReturn"
          @close="close"
        />
      </div>
    </div>

    <div v-if="!importType" class="modal-footer">
      <a-button type="default" @click="close"> 取消 </a-button>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { Modal, Steps, Button } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import fileImport from './file-import.vue';
import fileUpload from './file-upload.vue';
import fileValidate from './file-validate.vue';

@Component({
  name: '',
  components: {
    AModal: Modal,
    ASteps: Steps,
    AStep: Steps.Step,
    fileUpload,
    fileValidate,
    fileImport,
    AButton: Button,
  },
})
export default class ImportApp extends Vue {
  @Prop() value!: boolean;

  // 展示
  show: boolean = false;

  // 弹窗标题
  modalTitle: string = '导入-应用';

  // 当前步骤
  curStep: number = 0;

  //导入方式：LOCAL-本地、MARKET-应用市场
  importType: string = 'LOCAL';

  @Watch('value')
  onValueChange(v: boolean) {
    this.show = v;
  }

  /**
   * 选择导入方式事件
   */
  onTypeItemClicked(type) {
    this.importType = type;
  }

  /**
   * 返回导入方式选择界面
   */
  onTypeItemReturn() {
    this.importType = 'LOCAL';
    this.curStep = 0;
  }

  /**
   * 关闭
   * */
  close() {
    this.$emit('input', false);
    this.curStep = 0;
    this.modalTitle = '导入-应用';
    this.importType = 'LOCAL';
  }

  /**
   * 下一步逻辑
   * */
  uploadResult: any = {};

  validResult: any = {};

  nextStep(result) {
    //@ts-ignore
    if (this.curStep === 0) {
      this.uploadResult = result;
    } else if (this.curStep === 1) {
      this.validResult = result;
    } else {
      //Else Empty block statement
    }
    this.curStep += 1;
  }

  /**
   * 上一步
   * */
  prevStep() {
    this.curStep -= 1;
  }

  setModalTitle(title) {
    this.modalTitle = title;
  }
}
</script>
<style lang="less">
@import '~@/styles/import/index.less';
</style>
