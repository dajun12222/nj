<template>
  <a-modal
    title="数据字典"
    width="640px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <!-- <span>看看是否可复用data-dictionaries.vue</span> -->
    <data-dictionaries
      ref="DataDictionariesRef"
      :modalData="dataDictionaryData"
    />
    <template slot="footer">
      <a-button @click="closeModal"> 取消 </a-button>
      <a-button
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="delDataDictionary"
      >
        删除字典
      </a-button>
      <a-button
        type="primary"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="handleOk"
      >
        保存
      </a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { ConfigProvider, Modal, Button } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DataDictionaries from './data-dictionaries.vue';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'DictionaySetting',
  components: {
    ConfigProvider,
    DataDictionaries,
    AModal: Modal,
    AButton: Button,
  },
})
export default class DictionaySetting extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  created() {
    this.initData();
  }

  dataDictionaryData: any = {}; // 数据字典数据

  initData() {
    const data = this.modalData.data;
    if (data.value) {
      this.dataDictionaryData = data.value.options;
    }
  }

  getData() {
    let backData: any = '';
    backData = (this.$refs.DataDictionariesRef as any).bizmodeBack();
    return backData;
  }

  closeModal() {
    this.$emit('closeModal');
  }

  handleOk() {
    const backdata = this.getData();
    if (!backdata) {
      this.delDataDictionary();
      return;
    }
    this.$emit('backData', {
      value: {
        options: backdata,
        isUseDataDictionary: true,
      },
    });
  }

  delDataDictionary() {
    this.$emit('backData', {
      value: '',
    });
  }
}
</script>
<style lang="less" scoped></style>
