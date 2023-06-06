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
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DateSetting from './date-setting.vue';
import NumberSetting from './number-setting.vue';
import TextSetting from './text-setting.vue';
import TimeSetting from './time-setting.vue';
import zhToEn from 'cloudpivot/list/src/components/pc/locales/zhToEn';

@Component({
  name: 'TableDesign',
  components: {
    DateSetting,
    TextSetting,
    NumberSetting,
    TimeSetting,
  },
})
export default class TableDesign extends Vue {
  @Prop() modalData!: any;

  currentModal: string = '';

  created() {
    //
    switch (this.modalData.type) {
      /** 数值型 */
      case 2:
        this.currentModal = 'NumberSetting';
        break;
      /** 日期型 */
      case 3:
        this.currentModal = 'DateSetting';
        break;
      /** 文本型 */
      // case 12:
      //   this.currentModal = 'TimeSetting';
      //   break;
      default:
        this.currentModal = 'TextSetting';
        break;
    }
  }

  backData(val: any) {
    this.$emit('confirm', val);
  }

  closeModal() {
    this.$emit('cancel');
  }

  get modalMsg() {
    if (!this.modalData.data.name) {
      this.modalData.data.name = this.modalData.name;
    }

    (this.modalData.data as any).name_i18n.en =
      zhToEn[(this.modalData.data as any).name_i18n.en] ||
      (this.modalData.data as any).name_i18n.en;

    (this.modalData.data as any).name_i18n.zh =
      (this.modalData.data as any).name_i18n.zh ||
      (this.modalData.data as any).name;
    return this.modalData;
  }
}
</script>
<style lang="less" scoped>
.modal-wrap {
  padding-top: 12px;
  padding-bottom: 4px;
}
</style>
