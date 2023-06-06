<template>
  <a-modal
    :width="640"
    title="数据限定范围"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
    @cancel="onCancel"
  >
    <div class="formula-row-tip">
      <p>
        <i class="icon aufontAll h-icon-all-Components_Warning"></i>
        条件组之间是or关系，最多设置10组，组内是and关系
      </p>
    </div>
    <div class="content">
      <template v-for="(AModel, index) in modelAll">
        <div :key="index">
          <dataitem-condition
            :value="AModel"
            :items="querySource.items"
            @deleteOr="deleteOrConditions(index)"
          />
          <div v-show="index !== modelAll.length - 1" class="or">或</div>
        </div>
      </template>

      <div v-if="modelAll.length < 10" class="add" @click="addOrConditions">
        <span>
          <i class="icon aufontAll h-icon-all-plus-o"></i>
        </span>
        <span>添加或条件</span>
      </div>
    </div>

    <template slot="footer">
      <a-button key="cancel" @click="onCancel">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
      <a-button
        key="ok"
        :disabled="$route.path.includes('apps/versionDetail/')"
        type="primary"
        @click="onOk"
      >
        {{ $t('languages.Apps.Ok') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { listApi } from '../../../../api';
import { convertDataItemExp, DataItemType } from '../../../schema';
import { OperatorService } from '../data-item/data-item4';
import DataitemCondition from '../data-item/dataitem-condition3.vue';
import * as dataitemStore from '../../stores/data-items.store-helper';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  DataitemMappingValueItem,
  DataitemSource,
} from './dataitem-mapping.vue';

import { Button, Modal } from '@h3/antd-vue';

/**
 * 关联表单查询条件
 */
@Component({
  name: 'RelevanceFormDefaultValue',
  components: {
    DataitemCondition,
    AModal: Modal,
    AButton: Button,
  },
})
export default class RelevanceFormDefaultValue extends Vue {
  @Prop({
    default: {},
  })
  modalData!: any;

  type = 'query';

  /**
   * 列表数据
   */
  listData: any = {
    queryConditions: [],
  };

  target: DataitemSource = {
    title: '当前表单字段',
    items: [],
  };

  querySource: DataitemSource = {
    title: '查询条件',
    items: [],
  };

  modelAll: any[] = [];

  /* query: DataitemMappingValueItem[] = []; */

  created() {
    if (this.modalData.data.value.query) {
      const result = JSON.parse(this.modalData.data.value.query);
      if (!Array.isArray(result)) {
        this.modelAll.push(result);
      } else {
        this.modelAll = result;
      }
    }
  }

  get onlyQuery() {
    return true;
  }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (!modalData.data || !modalData.data.schemaCode) {
      return;
    }

    this.type = modalData.data.type;

    const hideLoader = (this.$message as any).loading();

    const schemaCode = modalData.data.schemaCode;
    const queryCode = modalData.data.queryCode;
    const dataItem = modalData.data.dataItem;
    const clientType = modalData.data.clientType || 'PC';

    Promise.all([
      listApi.getDataItemList({ schemaCode: schemaCode, isPublish: true }),
    ]).then(
      (resList: any[]) => {
        hideLoader();

        const res = resList[0];
        const data = res.data.filter((item) =>
          [
            DataItemType.ShortText,
            DataItemType.LongText,
            DataItemType.Number,
            DataItemType.Logic,
            DataItemType.RelevanceForm,
            DataItemType.RelevanceFormEx,
            DataItemType.StaffSingle,
            DataItemType.StaffMulti,
            DataItemType.DeptSingle,
            DataItemType.DeptMulti,
            DataItemType.StaffDeptMix,
            DataItemType.Date,

            DataItemType.Radio,
            DataItemType.Checkbox,
            DataItemType.Dropdown,
            DataItemType.DropdownMulti,
          ].includes(item.propertyType),
        );

        const map = (x: any) => ({
          code: x.propertyCode || x.code,
          type: x.propertyType,
          name: x.name,
          relativeCode: x.relativeCode || x.relativeSchemaCode,
          isSystem: x.defaultProperty,
        });

        const items = dataitemStore.getDataItems(this).filter((x) => x.used);

        this.target = {
          title: this.target.title,
          items,
        };

        if (dataItem.parentCode) {
          const sheet = items.find((x) => x.code === dataItem.parentCode);
          if (sheet && sheet.properties) {
            const sheetItems = sheet.properties.filter(
              (x: any) => x.used && x.code !== dataItem.code,
            );

            this.target = {
              title: this.target.title,
              items: this.target.items.concat(sheetItems),
            };
          }
        }

        if (data) {
          this.querySource = {
            title: this.querySource.title,
            items: data.map(map),
          };
        }

        const value = modalData.data.value;

        if (value.query) {
          value.query = value.query.trim();

          if (value.query[0] === '[') {
            value.query = convertDataItemExp(value.query);
          }
        }
        /*         if (value && value.query) {
          this.handleQueryValue(value.query);
        } else {
          this.query = [];
        } */
      },
      () => hideLoader(),
    );
  }

  /*   handleQueryValue(value: string) {
    this.query = value
      .split(" && ")
      .map((s: string) => {
        const fields = s.split(" ");
        let sourceCode = fields[0];
        let targetCode = fields[2].substring(1, fields[2].length - 1);

        const sourceItem = this.querySource.items.find(
          (q) => q.code === sourceCode
        );
        if (!sourceItem) {
          return null;
        }

        const index = targetCode.indexOf(".");
        if (index > -1) {
          targetCode = targetCode.substr(index + 1);
        }

        const targetItem = this.target.items.find((i) => i.code === targetCode);
        if (!targetItem) {
          return null;
        }

        let operator = OperatorService.findByLabel(sourceItem.type, fields[1]);

        if (!operator) {
          return null;
        }

        return {
          source: sourceItem,
          operatorType: operator.value,
          target: targetItem,
        };
      })
      .filter((item) => item !== null) as any;
  } */

  addOrConditions() {
    if (
      this.modelAll.length === 0 ||
      this.modelAll[this.modelAll.length - 1].conditions.length > 0
    ) {
      this.modelAll.push({
        conditions: [],
        type: 1,
      });
    } else {
      this.$message.error('请将空的条件组填写完整再进行添加');
    }
  }

  deleteOrConditions(index) {
    console.log(index);
    if (this.modelAll.length > 1) {
      this.modelAll.splice(index, 1);
    }
  }

  onCancel() {
    this.$emit('closeModal');
  }

  modelAllClearEmpty(model) {
    let modelArr: any[] = model.map((item) => {
      if (
        item &&
        Array.isArray(item.conditions) &&
        item.conditions.length === 0
      ) {
        return null;
      } else {
        return item;
      }
    });
    modelArr = modelArr.filter((item) => {
      return item !== null;
    });
    return modelArr;
  }

  onOk() {
    this.modelAll = this.modelAllClearEmpty(this.modelAll);
    if (this.modelAll.length === 0) {
      this.$emit('backData', {
        value: '',
      });
      return;
    }
    this.$emit('backData', {
      value: JSON.stringify(this.modelAll),
    });
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/common.less';
.formula-row-tip {
  padding: 8px 16px;
  margin-bottom: 16px;
  background: #fffbe6;
  border-radius: 4px;
  border: 1px solid #ffe58f;
  p {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
    .icon {
      margin-right: 8px;
      font-size: 14px;
      color: #f1941f;
    }
  }
}

.header {
  text-align: center;
  margin: -10px -24px 0 -24px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e8e8e8;
}
.header.header_title {
  text-align: left;
  div {
    margin-left: 24px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    font-size: 16px;
  }
}

.content {
  height: 300px;
  max-height: 300px;
  overflow: auto;
  .or {
    color: #000000;
    font-weight: 400;
    font-size: 14px;
    text-align: center;
    line-height: 48px;
  }
}

.add {
  color: @primary-color;
  font-weight: 400;
  font-size: 14px;
  /* text-align: center; */
  cursor: pointer;
  line-height: 48px;
  span {
    margin-top: 16px;
    margin-right: 8px;
  }
}
</style>
