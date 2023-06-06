<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="show"
    class="import-container"
    :title="title"
    :width="800"
    :destroyOnClose="true"
    :maskClosable="false"
    :keyboard="false"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="import-layout">
      <div class="step-content">
        <file-upload
          v-if="curStep === 0"
          :accept="accept"
          :action="action"
          @nextStep="nextStep"
        />
        <file-validate
          v-else-if="curStep === 1"
          ref="fileValidate"
          :uploadResult="uploadResult"
          :strategy="getImporter()"
          @handleCancel="handleCancel"
          @prevStep="prevStep"
          @nextStep="nextStep"
        />

        <file-import
          v-else-if="curStep === 2"
          :uploadResult="uploadResult"
          :validResult="validResult"
          :strategy="getImporter()"
          @handleCancel="handleCancel"
        />
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Button, Modal, Steps } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import FileImport from './file-import.vue';
import FileUpload from './file-upload.vue';
import FileValidate from './file-validate.vue';
import bizModelStrategy from './importStrategy/bizModelStrategy';
import reportStrategy from './importStrategy/reportStrategy';

@Component({
  name: 'DataImport',
  components: {
    AModal: Modal,
    ASteps: Steps,
    AStep: Steps.Step,
    AButton: Button,
    FileUpload,
    FileValidate,
    FileImport,
  },
})
export default class DataImport extends Vue {
  @Prop() value!: any;

  @Prop() accept!: any;

  @Prop() action!: any;

  //导入类型 报表？ 模型？
  @Prop() importType!: any;

  show = true;

  curStep: number = 0; // 当前步骤

  uploadResult: any = {}; //上传界面中间数据

  validResult: any = {}; //校验页面中间数据

  /**
   * 关闭弹窗重置
   */
  reset() {
    this.curStep = 0;
    this.show = false;
  }

  /**
   * 关闭弹窗
   */
  handleCancel() {
    this.$emit('importEnd', false);
    this.reset();
  }

  /**
   * 上一步
   */
  prevStep() {
    this.curStep -= 1;
  }

  /**
   * 下一步
   */
  nextStep(result) {
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
   * 关闭弹窗
   */
  closeModal() {
    this.$emit('input', false);
  }

  get title() {
    return this.importType === 'report' ? '导入-数据分析' : '导入-业务模型';
  }

  /**
   * 策略模式
   * 根据导入类型是模型还是报表
   * 选择不同的导入策略，不同的策略对导入过程
   * 中需要执行的操作有不同的实现方式
   */
  getImporter() {
    return this.importType === 'report'
      ? (reportStrategy as any)
      : (bizModelStrategy as any);
  }
}
</script>

<style lang="less">
@import '~@/styles/import/index.less';
</style>
