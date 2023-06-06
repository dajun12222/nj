<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-02 09:23:29
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-12 12:01:29
 * @FilePath: \yunshu6.0\packages\cloudpivot\form\src\common\components\document-strategy-modal2.vue
 * @Description:
-->
<template>
  <a-modal
    title="单据号配置"
    width="700px"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
    destroyOnClose
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Ok')"
    wrapClassName="strategyModal"
    @cancel="closeModal"
  >
    <doc-strategy-modal
      ref="docStrategyRef"
      :isModal="true"
      :options="{ seqNoSetting: modalData.attributes[0].value }"
      :dataItems="dataItems"
    />
    <template slot="footer">
      <a-button @click="closeModal"> 取消 </a-button>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { utils } from '../../../../common';
import { DataItemType } from '../../../schema';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';
import DocStrategyModal from './document-strategy-modal.vue';
import { Modal, Button } from '@h3/antd-vue';

const DataModelModule = namespace('Apps/DataModel');

export enum DataEnum {
  none = 1,
  DAY = 10,
  MONTH = 8,
  YEAR = 6,
}

export enum SeqNoSettingType {
  CONSTANT = 'CONSTANT',
  DELIMITER = 'DELIMITER',
  DATE = 'DATE',
  PROPERTY = 'PROPERTY',
  SEQNO = 'SEQNO',
}

const DateHandle = utils.DateHandle;
@Component({
  name: 'DataItemDocStrategy',
  components: {
    Draggable,
    DocStrategyModal,
    AModal: Modal,
    AButton: Button,
  },
})
export default class DataItemDocStrategy extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  created(): void {}

  mounted() {
    console.log(this.dataItems, this.modalData);
  }

  closeModal() {
    this.$emit('closeModal');
  }

  handleOk() {
    let backData: any = '';
    backData = (this.$refs.docStrategyRef as any).seqNoSetting.map(
      (item: any) => {
        return {
          type: item.type,
          value: item.value,
        };
      },
    );
    let sequenceNoLength = 0;
    for (let i = 0; i < backData.length; i++) {
      if (backData[i].type === 'CONSTANT') {
        if (/^(\s)/.test(backData[i].value)) {
          this.$message.error('单据号固定值类型不能以空格开头');
          return;
        }
        if (backData[i].value.length > 60) {
          this.$message.error('单据号固定值长度不能超过60个字符');
          return;
        }
        sequenceNoLength += backData[i].value.length;
      } else if (
        backData[i].type === 'DELIMITER' ||
        backData[i].type === 'DATE'
      ) {
        sequenceNoLength += backData[i].value.length;
      } else if (backData[i].type === 'SEQNO') {
        sequenceNoLength += Number(backData[i].value.maxLength);
      } else {
        //Else Empty block statement
      }
    }
    if (sequenceNoLength > 200) {
      this.$message.error(
        '当前单据号设置可能超出最大长度限制（200字符），请修改',
      );
      return;
    }

    console.log(backData);

    this.$emit('backData', {
      value: backData,
    });
  }
}
</script>
<style lang="less" scoped></style>
