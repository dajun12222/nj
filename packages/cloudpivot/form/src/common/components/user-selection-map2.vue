<template>
  <a-modal
    title="映射关系"
    width="800px"
    :visible="true"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <a-row type="flex" style="align-items: center" class="type">
      <a-col :span="4"> 数据项类型 </a-col>
      <a-col :span="20">
        <a-select
          v-model="currentDataType"
          style="width: 100%"
          :disabled="true"
        >
          <template v-for="item in dataItemTypeList">
            <a-select-option :key="item.key" :value="item.key">
              {{ item.value }}
            </a-select-option>
          </template>
        </a-select>
      </a-col>
    </a-row>
    <div class="mappingBody">
      <user-selection-map
        ref="user1SelectMapRef"
        :dataItem="dataItems"
        :maping="selectMappingData"
        :control="control"
      />
    </div>

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
import { ConfigProvider, Modal, Row, Col, Select, Button } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { DataItemType, DataItemTypeText } from '../../../schema';
import UserSelectionMap from './user-selection-map.vue';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'UserSelectionMap2',
  components: {
    UserSelectionMap,
    ConfigProvider,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    ASelect: Select,
    ASelectOption: Select.Option,
    AButton: Button,
  },
})
export default class UserSelectionMap2 extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  selectMappingData: any = '';

  control: any = {};

  dataItemTypeList: any[] = [];

  currentDataType = '';

  created() {
    this.initData();
  }

  initData() {
    // 获取数据类型
    for (const key in DataItemTypeText) {
      if (DataItemTypeText.hasOwnProperty(key)) {
        this.dataItemTypeList.push({
          key,
          value: DataItemTypeText[key],
        });
      }
    }
    const dataItemTypeArr: any[] = [];
    for (const key in DataItemType) {
      if (DataItemType.hasOwnProperty(key)) {
        dataItemTypeArr.push({
          key,
          value: DataItemType[key],
        });
      }
    }

    const dataItem: any = this.$attrs.dataItem;
    const findItem: any = dataItemTypeArr.find(
      (x) => x.value === dataItem.type || x.value === dataItem.propertyType,
    );
    if (findItem) {
      this.currentDataType = findItem.key;
      this.control = dataItem;
      this.control.parentKey = dataItem.parentCode;
    }
    const exp = this.modalData ? this.modalData.data : null;
    if (exp && exp.value) {
      this.selectMappingData = exp.value;
    }
  }

  closeModal() {
    this.$emit('closeModal');
  }

  handleOk() {
    let backData: any = '';
    backData = (this.$refs.user1SelectMapRef as any).getMaping();
    // 检验设置是否合法 后续再优化
    if (backData) {
      const mapArr: any = backData.split(';');
      mapArr.pop();
      if (Array.isArray(mapArr)) {
        const isMatch = mapArr.every((val) => {
          //修改为可以携带.的字符，匹配子表编码拼接子表数据项编码
          if (val.indexOf('.') > -1) {
            return /\w+:\{\w+\.\w+\}/.test(val);
          } else {
            return /\w+:{\w+}/.test(val);
          }
        });
        if (!isMatch) {
          this.$message.error('映射不合法');
          return;
        }
      }
    }

    this.$emit('backData', {
      value: backData,
    });
  }
}
</script>
<style lang="less" scoped>
.mappingBody {
  margin-top: 15px;
}

/deep/ .ant-select-selection__rendered {
  line-height: 32px;
}

/deep/ .ant-modal .ant-modal-body {
  .type {
    padding-left: 10px;
    > div {
      color: #111218;
      line-height: 22px;
      font-size: 14px;
    }
  }
}
</style>
