<template>
  <a-modal
    id="condRuleModal"
    :title="title"
    :visible="true"
    width="640px"
    class="required-cond-modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <a-row v-if="type === 'requiredRule'">
      <a-col :span="4"> 检查类型 </a-col>
      <a-col :span="20">
        <a-select
          v-model="checkType"
          :disabled="true"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
        >
          <a-select-option :key="1" value="requiredRule">
            必填
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row v-if="type === 'requiredRule' && requiredType !== 2">
      <a-col :span="4">
        {{ checkTitle }}
      </a-col>
      <a-col :span="20">
        <a-select
          v-model="dataItem.code"
          :disabled="true"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
        >
          <a-select-option
            v-for="i in showDataItems"
            :key="i.id"
            :value="i.code"
          >
            {{ i.name }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>

    <a-row v-if="type === 'requiredRule'">
      <a-col :span="4"> 必填方式 </a-col>
      <a-col :span="20">
        <a-radio-group v-model="requiredType" name="radioGroup">
          <a-radio :value="0" :disabled="isShowRequired"> 非必填 </a-radio>
          <a-radio :disabled="isShowRequired" :value="1"> 必填 </a-radio>
          <a-radio :disabled="isShowRequired" :value="2">
            满足条件必填
          </a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <template v-if="type === 'requiredRule'">
      <dataitem-condition
        v-show="requiredType === 2"
        v-model="model"
        :items="dataItems"
      />
    </template>
    <template v-else>
      <dataitem-condition v-model="model" :items="dataItems" />
    </template>
    <template slot="footer">
      <a-button @click="closeModal">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
      <a-button
        type="primary"
        :disabled="$route.path.includes('apps/versionDetail/')"
        @click="backData"
      >
        保存
      </a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import DataitemCondition from '../data-item/dataitem-condition2.vue';
import { DataItemState } from '../../stores/data-items.store';
import * as dataitemStore from '../../stores/data-items.store-helper';
import cloneDeep from 'lodash/cloneDeep';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Modal, Row, Col, Radio, Select, Button } from '@h3/antd-vue';

@Component({
  name: 'RequiredConditon',
  components: {
    DataitemCondition,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
  },
})
export default class RequiredConditon extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({ type: Object })
  modalOptions!: any;

  @Prop({
    default: () => ({}),
  })
  dataItem!: DataItemState;

  @Prop({ default: false })
  isShowRequired!: any;

  dataItems: DataItemState[] = [];

  showDataItems: DataItemState[] = [];

  model: any = {
    type: 1,
    conditions: '',
  };

  type = ''; //显示条件：showRule、必填条件

  requiredType: number = 0;

  checkType: string = 'requiredRule';

  currControlOptions = null;

  get title(): string {
    if (this.type === 'showRule') {
      return this.$t('languages.Apps.FormDesignPage.IsShowRule') as string;
    } else if (this.type === 'requiredRule') {
      return this.$t('languages.Apps.FormDesignPage.NecessaryRule') as string;
    } else {
      return '只读条件';
    }
  }

  get checkTitle(): string {
    if (this.type === 'showRule') {
      return '显示数据项';
    } else {
      return '校验数据项';
    }
  }

  get isRequireConditon(): boolean {
    return this.type !== 'showRule';
  }

  @Watch('modalOptions', { immediate: true })
  onModalOptions(modalOptions: any) {
    this.type = modalOptions.modalType;
  }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData.data) {
      return;
    }

    const data = modalData.data;
    const type = modalData.type;

    let items = dataitemStore.getDataItems(this).filter((item: any) => {
      if (item.isSystem) {
        switch (item.code) {
          case 'creater':
          case 'createdTime':
          case 'sequenceNo':
          case 'modifier':
          case 'modifiedTime':
          case 'owner':
          case 'ownerDeptId':
          case 'createdDeptId':
            return item;
          default:
            break;
        }
      } else {
        return item;
      }
    });
    console.log(modalData, 'modalData');
    console.log(items, 'items');
    console.log(this.dataItem, 'this.dataItem');
    // if (this.dataItem.parentCode) {
    //   const sheet = items.find((x) => x.code === this.dataItem.parentCode);
    //   if (sheet && sheet.properties) {
    //     const sheetItems = sheet.properties.filter((x: any) => x.used) as any;
    //     items = items.concat(sheetItems);
    //   }
    // }
    // this.showDataItems = JSON.parse(JSON.stringify(items));
    items.forEach((el) => {
      if (el.type === 8 && el.properties) {
        const sheetItems = el.properties.filter((x: any) => x.used) as any;
        items = items.concat(sheetItems);
      }
    });
    this.showDataItems = cloneDeep(items);
    console.log(this.showDataItems, 'this.showDataItems');
    items = items.filter((x) => x.code !== this.dataItem.code);

    this.dataItems = items;

    if (data.value) {
      this.initModel(String(data.value));
    }
  }

  initModel(exp: string) {
    let segs: string[] = [];
    let type = 1;
    if (exp && exp !== 'true') {
      this.requiredType = 2;
    } else {
      this.requiredType = 1;
    }
    if (exp.indexOf('||') > -1) {
      type = 2;
      segs = exp.split(' || ');
    } else {
      if (exp.indexOf('&&') > -1) {
        segs = exp.split(' && ');
      } else {
        segs = [exp];
      }
    }
    this.model = {
      type,
      conditions: exp,
    };
  }

  /**
   * 保存显示条件、必填条件的值
   */
  backData() {
    if (this.type === 'requiredRule') {
      if (this.requiredType === 1) {
        this.model.conditions = 'true';
      } else if (this.requiredType === 0) {
        this.model.conditions = '';
      }
    }

    this.$emit('backData', { value: this.model.conditions });
  }

  closeModal() {
    this.$emit('closeModal');
    //点击新增或条件时需要滚动到最底端，使用的是获取模态框的ID，因此取消的时候需要移除模态框
    setTimeout(() => {
      if (this.$route.path.includes('apps/versionDetail/')) {
        return;
      }
      const modalEl: any = document.getElementById('condRuleModal');
      modalEl.remove();
    }, 100);
  }
}
</script>

<style lang="less">
.required-cond-modal {
  .ant-modal-body {
    max-height: calc(100vh - 308px);
    overflow: auto;
  }
  .data-item-select-content {
    width: 300px !important;
  }
}
.required-type {
  margin-bottom: 16px;
  padding-left: 16px;
}
.ant-row {
  margin-bottom: 10px;
  .ant-col-4 {
    line-height: 32px;
  }
  .ant-col-20 {
    line-height: 32px;
  }
}
</style>
