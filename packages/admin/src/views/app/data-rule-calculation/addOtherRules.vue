<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    id="condRuleModal"
    :cancelText="$t('languages.Apps.Cancel')"
    class="other-rules-modal"
    :keyboard="false"
    :maskClosable="false"
    :okText="$t('languages.Save')"
    :title="title"
    :visible="visible"
    width="640px"
    @cancel="closeModal"
    @ok="backData"
  >
    <a-row class="required-type">
      <a-col :span="4">
        <span>{{ inputType }}</span>
      </a-col>
      <a-col :span="20">
        <a-select
          v-model="modalData.propertyCode"
          :disabled="!isAdd"
          class="data-item-select-content"
          style="width: 100%"
          placeholder="请选择"
          :showSearch="true"
          optionFilterProp="children"
          :filterOption="filterOption"
          @change="handleChangeData"
        >
          <a-select-option
            v-for="i in formatDataItemFiler"
            :key="i.id"
            :value="i.code"
            :disabled="i.isDisabled"
          >
            <div class="select-option-flex">
              <div class="left">
                {{ i.name }}
              </div>
              <div :style="{ background: i.color }" class="right">
                {{ i.text }}
              </div>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <template v-if="type === 'other'">
      <a-row class="required-type">
        <a-col :span="4">
          <span>检验方式</span>
        </a-col>
        <a-col :span="20">
          <a-radio-group v-model="requiredType" name="radioGroup">
            <a-radio :value="1"> 必填 </a-radio>
            <a-radio :value="2"> 满足条件必填 </a-radio>
          </a-radio-group>
        </a-col>
      </a-row>
      <template>
        <dataitem-condition
          v-show="requiredType === 2"
          v-model="model"
          :items="dataItems"
          :currControlOptions="currControlOptions"
        />
      </template>
    </template>
    <dataitem-condition
      v-if="
        (type === 'display' || type === 'readonly') && modalData.propertyCode
      "
      v-model="model"
      :items="filterDataItems"
      :currControlOptions="currControlOptions"
      :currentPropertyCode="modalData.propertyCode"
    />
  </a-modal>
</template>
<script lang="ts">
import { DataItemState } from '@/components/apps/form-design/stores/data-items.store';
import {
  DataItemType,
  DataItemTypeColor,
  DataItemTypeText,
} from '@/components/apps/form-design/typings';
import { Modal, Row, Col, Select, Radio } from '@h3/antd-vue';
import DataitemCondition from 'cloudpivot/form/src/common/data-item/dataitem-condition2.vue';
import cloneDeep from 'lodash/cloneDeep';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'AddOtherRules',
  components: {
    DataitemCondition,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
})
export default class AddOtherRules extends Vue {
  @DataModelModule.State('dataItem') dataItem: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({
    default: false,
  })
  visible!: boolean;

  @Prop({
    default: true,
  })
  isAdd!: boolean;

  @Prop() type: any;

  @Prop() list: any;

  @Prop() bizSchemaCode: any;

  formatDataItem: any[] = [];

  formatDataItemFiler: any[] = [];

  dataItems: DataItemState[] = [];

  model: any = {
    type: 1,
    conditions: '',
  };

  requiredType = 1;

  currControlOptions = null;

  /**
   * 输入框Label名称
   */
  get inputType() {
    switch (this.type) {
      case 'other':
        return '校验数据项';
      case 'display':
        return '显示数据项';
      case 'readonly':
        return '只读数据项';
      default:
        break;
    }
  }

  /**
   * 弹窗标题
   */
  get title() {
    switch (this.type) {
      case 'other':
        return this.isAdd ? '新建必填规则' : '编辑必填规则';
      case 'display':
        return this.isAdd ? '新建显示规则' : '编辑显示规则';
      case 'readonly':
        return this.isAdd ? '新建只读规则' : '编辑只读规则';
      default:
        break;
    }
  }

  handleChangeData(value) {
    this.currControlOptions = this.formatDataItemFiler.find(
      (i) => i.code === value,
    );
  }

  get filterDataItems() {
    const value = this.modalData.propertyCode;
    if (value) {
      return this.dataItems.filter((item) => {
        if (item.parentCode) {
          return `${item.parentCode}.${item.code}` !== value;
        } else {
          return item.code !== value;
        }
      });
    }
    return this.dataItems;
  }

  filterOption(input, option) {
    return (
      option.componentOptions.children[0].children[0].children[0].text
        .trim()
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  @Watch('visible')
  changeVisible(val) {
    this.formatDataItem = [];
  }

  @Watch('formatDataItem')
  changeDataItem() {
    this.currControlOptions = this.formatDataItem.find(
      (i) => i.code === this.modalData.propertyCode,
    );
    if (this.type === 'other' || this.type === 'readonly') {
      this.formatDataItemFiler = this.formatDataItem
        .filter((i) => {
          return i.code !== 'parentId';
        })
        .map((i) => {
          const icon = DataItemType[i.type];
          if (icon) {
            i.color = DataItemTypeColor[icon];
            i.text = DataItemTypeText[icon];
          }
          return i;
        });
    } else {
      this.formatDataItemFiler = this.formatDataItem.map((i) => {
        const icon = DataItemType[i.type];
        if (icon) {
          i.color = DataItemTypeColor[icon];
          i.text = DataItemTypeText[icon];
        }
        return i;
      });
    }
  }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData || !modalData.options) {
      this.formatDataItem = [];
      return;
    }
    if (this.isAdd) {
      this.model = {
        type: 1,
        conditions: '',
      };
      this.requiredType = 1;
    }
    this.formatDataItem = this.dataItem.filter((i) => {
      switch (i.type) {
        case DataItemType.ShortText:
        case DataItemType.Radio:
        case DataItemType.Checkbox:
        case DataItemType.Dropdown:
        case DataItemType.DropdownMulti:
        case DataItemType.LongText:
        case DataItemType.Number:
        case DataItemType.Date:
        case DataItemType.StaffSingle:
        case DataItemType.StaffMulti:
        case DataItemType.DeptSingle:
        case DataItemType.DeptMulti:
        case DataItemType.StaffDeptMix:
        case DataItemType.Attachment:
        case DataItemType.Address:
        case DataItemType.RelevanceFormEx:
        case DataItemType.RelevanceForm:
          return i && !i.isSystem;
        default:
          break;
      }
    });

    const data =
      this.type === 'other'
        ? modalData.options.requiredFormula
        : this.type === 'display'
        ? modalData.options.displayFormula
        : modalData.options.readonlyCondition;
    const items = this.dataItem;
    const itemsSelect = cloneDeep(this.dataItem);
    if (this.modalData.showSheet) {
      // const sheet = items.find((x) => x.code === this.modalData.schemaCode);
      // if (sheet && sheet.properties) {
      //   const sheetItems = sheet.properties.filter(
      //     (x: any) => x.code !== this.modalData.propertyCode
      //   ) as any;
      //   itemsSelect = itemsSelect.concat(sheet.properties);
      //   items = items.concat(sheetItems);
      // }
    }

    if (!this.isAdd) {
      this.formatDataItem = itemsSelect;
    } else {
      if (this.type === 'display') {
        this.formatDataItem = itemsSelect.filter((i) => !i.isSystem);
      }
    }
    this.formatDataItem.forEach((item) => {
      if (item.parentCode) {
        const sheet = this.dataItem.find((x) => x.code === item.parentCode);
        item.code = `${sheet.code}.${item.code}`;
        item.name = `${sheet.name}.${item.name}`;
      }
      item.isDisabled = false;
    });

    this.formatDataItem.forEach((item) => {
      if (item.parentCode) {
        const existItem: any = this.list.find(
          (x) =>
            x.propertyCode === item.code.split('.')[1] &&
            x.schemaCode !== item.schemaCode,
        );
        if (existItem) {
          item.isDisabled = true;
        }
      } else {
        const existItem: any = this.list.find(
          (x) =>
            x.propertyCode === item.code && x.schemaCode === item.schemaCode,
        );
        if (existItem) {
          item.isDisabled = true;
        }
      }
    });

    //若schemaCode值不等于模型编码，则用于拼接字表code
    if (
      this.modalData.propertyCode &&
      this.modalData.schemaCode !== this.bizSchemaCode &&
      this.modalData.propertyCode.indexOf('.') === -1
    ) {
      this.modalData.propertyCode = `${this.modalData.schemaCode}.${this.modalData.propertyCode}`;
    }

    const dataChange = items.filter((item: any) => {
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
        if (
          this.modalData.propertyCode &&
          this.modalData.propertyCode.indexOf('.') > -1
        ) {
          // 子表控件的规则可以配置子表\主表字段
          return item;
        } else {
          // 主表控件的规则只能配置主表的字段
          return !item.parentCode;
        }
      }
    });

    this.dataItems = dataChange;
    if (data) {
      this.initModel(String(data));
      this.handleChangeData(this.modalData.propertyCode);
    }
  }

  initModel(exp: string) {
    let type = 1;
    if (exp && exp !== 'true') {
      this.requiredType = 2;
    } else {
      this.requiredType = 1;
    }
    if (exp.indexOf('||') > -1) {
      type = 2;
    }
    this.model = {
      type,
      conditions: exp,
    };
  }

  backData() {
    const errorList: any[] = [];
    if (errorList.length) {
      this.$message.error(errorList[0]);
      return;
    }
    if (!this.modalData.propertyCode) {
      this.$message.error('请选择数据项');
      return;
    }

    if (this.type === 'other') {
      if (this.requiredType === 1) {
        this.model.conditions = 'true';
      }
      if (this.requiredType === 2 && !this.model.conditions) {
        this.$message.error('请填写规则');
        return;
      }
      const param = { requiredFormula: this.model.conditions };
      this.modalData.options = JSON.stringify(param);
    } else if (this.type === 'display') {
      if (!this.model.conditions) {
        this.$message.error('请填写规则');
        return;
      }
      this.modalData.options = JSON.stringify({
        displayFormula: this.model.conditions,
      });
    } else {
      if (!this.model.conditions) {
        this.$message.error('请填写规则');
        return;
      }
      this.modalData.options = JSON.stringify({
        readonlyCondition: this.model.conditions,
      });
    }
    this.$emit('backData', this.modalData, this.currControlOptions);
  }

  closeModal() {
    // this.requiredType = 1;
    this.$emit('closeModal');
    //点击新增或条件时需要滚动到最底端，使用的是获取模态框的ID，因此取消的时候需要移除模态框
    setTimeout(() => {
      const modalEl: any = document.getElementById('condRuleModal');
      modalEl.remove();
    }, 100);
  }
}
</script>

<style lang="less">
.other-rules-modal {
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
  line-height: 32px;
  padding-left: 16px;
}
</style>
