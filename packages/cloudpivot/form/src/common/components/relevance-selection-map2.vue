<template>
  <a-modal
    title="映射关系"
    width="640px"
    :visible="visible"
    class="modal"
    :maskClosable="false"
    :keyboard="false"
    @cancel="closeModal"
  >
    <div v-if="hasMapping" class="relevant-selection-warp">
      <div v-if="mappingList.length" class="mappingDiv">
        <a-row class="mappingHeader" type="flex" justify="space-between">
          <a-col :span="10" class="fieldlab"> 联动模型数据项 </a-col>
          <a-col :span="10" class="fieldlab"> 当前模型数据项 </a-col>
          <a-col :span="3" class="fieldlab" style="text-align: center">
            删除
          </a-col>
        </a-row>
        <a-row
          v-for="(row, index) in mappingList"
          :key="index"
          type="flex"
          justify="space-between"
          class="mappingHeader"
        >
          <a-col :span="10">
            <config-provider :locale="locale">
              <a-select
                v-model="row.currentDataItem"
                style="width: 100%"
                placeholder="请选择"
                showSearch
                :filterOption="filterOption"
                @change="currentDataItemChange(row.currentDataItem, index)"
              >
                <a-select-opt-group>
                  <span slot="label" class="select-title">业务数据项</span>

                  <a-select-option
                    v-for="(i, key) in row.currentDataItemList.filter(
                      (item) => !item.isSystem,
                    )"
                    :key="key"
                    :value="i.value"
                    :title="i.name"
                  >
                    {{ i.name }}
                  </a-select-option>
                </a-select-opt-group>
                <a-select-opt-group>
                  <span slot="label" class="select-title">系统数据项</span>
                  <a-select-option
                    v-for="(i, key) in row.currentDataItemList.filter(
                      (item) => item.isSystem,
                    )"
                    :key="key"
                    :value="i.value"
                    :title="i.name"
                  >
                    {{ i.name }}
                  </a-select-option>
                </a-select-opt-group>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="10">
            <config-provider :locale="locale">
              <a-select
                v-model="row.targetDataItem"
                style="width: 100%"
                placeholder="请选择"
                showSearch
                :filterOption="filterOption"
                @change="targetDataItemChange(row.targetDataItem, index)"
              >
                <template v-for="item in row.targetDataItemList">
                  <a-select-option
                    :key="item.value"
                    :value="item.value"
                    :disabled="item.disabled"
                    :title="item.name"
                  >
                    {{ item.name }}
                  </a-select-option>
                </template>
              </a-select>
            </config-provider>
          </a-col>
          <a-col :span="3" style="text-align: center; padding-top: 4px">
            <span
              v-if="mappingList.length >= 1"
              class="delete"
              @click="deleteMapping(index)"
            >
              <a-icon type="delete" />
            </span>
          </a-col>
        </a-row>
      </div>
      <div v-if="showAddBtn" class="add">
        <span>
          <span>
            <i class="icon aufontAll h-icon-all-plus-o"></i>
          </span>
          <span @click="addMapping(null)">新增条件</span>
        </span>
      </div>
    </div>
    <div v-else-if="isMulti" class="tips">
      <span>当前模型或关联模型没有子表，不能映射</span>
    </div>
    <div v-else class="tips">
      <span>
        与关联模型数据项不匹配，请检查<br />
        1、关联模型没有相关匹配字段<br />
        2、当前模型没有保存
      </span>
    </div>

    <template slot="footer">
      <template v-if="hasMapping">
        <a-button @click="closeModal"> 取消 </a-button>
        <a-button
          type="primary"
          :disabled="$route.path.includes('apps/versionDetail/')"
          @click="handleOk"
        >
          保存
        </a-button>
      </template>
      <template v-else>
        <a-button type="primary" @click="closeModal"> 确定 </a-button>
      </template>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { bizproperty, bizpropertyApi, listApi } from '../../../../api';
import { schema } from '../../../../form';
import * as dataitemStore from '../../stores/data-items.store-helper';
import { ConfigProvider } from '@h3/antd-vue';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { DataItem } from './data-item';
import { Modal, Button, Select, Row, Col, Icon } from '@h3/antd-vue';

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'RelevantSelectionMap2',
  components: {
    ConfigProvider,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    AButton: Button,
  },
})
export default class RelevantSelectionMap2 extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @Prop({
    type: Object,
  })
  modalData!: any;

  relativeDataItem: Array<any> = [];

  mappingList: Array<any> = [];

  // 目标模型字段数据源
  targetFieldList: { main: any[] } = { main: [] };

  // 当前模型数据字段数据源
  currentFieldList: { main: any[]; origin: any[] } = { main: [], origin: [] };

  visible: boolean = true;

  get locale() {
    // @ts-ignore
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;

      case 'en':
        return enUS;
    }
  }

  get hasMapping() {
    if (this.currentFieldList.main.length && this.targetFieldList.main.length) {
      return true;
    } else {
      return false;
    }
  }

  get isMulti() {
    return this.modalData.data.dataItem.formPropertyType === 81;
  }

  get showAddBtn() {
    // 根据目标项确定新增按钮是否显示
    const remain: any = this.targetFieldList.main.filter((x) => {
      const iIndex = this.mappingList.findIndex(
        (i) => i.targetDataItem === x.value,
      );
      return iIndex === -1;
    });
    return remain.length;
  }

  async created() {
    this.initData();
  }

  async initData() {
    if (this.modalData.data && this.modalData.data.schemaCode) {
      const { schemaCode } = this.modalData.data;
      const { errcode, data, errmsg } = await listApi.getDataItemList({
        schemaCode: schemaCode,
        isPublish: true,
      });
      if (errcode === 0) {
        this.relativeDataItem = data;
      }
      const initiallyArr: any[] = dataitemStore
        .getDataItems(this)
        .filter((res: any) => !res.isSystem);
      let dataArr: any[] = [];
      if (this.modalData.data && this.modalData.data.dataItem) {
        // 如果是子表的关联表单
        if (this.modalData.data.dataItem.parentCode) {
          if (Array.isArray(initiallyArr) && initiallyArr.length > 0) {
            initiallyArr.forEach((item) => {
              if (
                item.type === schema.DataItemType.Sheet &&
                item.code === this.modalData.data.dataItem.parentCode
              ) {
                if (Array.isArray(item.properties)) {
                  dataArr = item.properties.filter(
                    (p: any) =>
                      p.code !== 'sortKey' &&
                      p.code !== this.modalData.data.dataItem.code,
                  );
                }
              }
            });
          }
        } else {
          dataArr = initiallyArr.filter(
            (res: any) => res.code !== this.modalData.data.dataItem.code,
          );
        }
      }
      this.currentFieldList.main = this.formatOrigin(this.relativeDataItem).map(
        this.mapToOption,
      );
      this.targetFieldList.main = dataArr.map(this.mapToOption);
      const { dataItem, value: exp } = this.modalData.data;
      // 关联多选只能子表映射子表
      if (dataItem && dataItem.type === schema.DataItemType.RelevanceFormEx) {
        this.currentFieldList.main = this.currentFieldList.main.filter(
          (x) => x.type === schema.DataItemType.Sheet,
        );
        this.targetFieldList.main = this.targetFieldList.main.filter(
          (x) => x.type === schema.DataItemType.Sheet,
        );
      } else {
        // this.currentFieldList.main = this.currentFieldList.main.filter(x => x.type !== schema.DataItemType.Sheet);
        // this.targetFieldList.main = this.targetFieldList.main.filter(x => x.type !== schema.DataItemType.Sheet);
      }
      if (exp) {
        const arr = exp.split(';');
        if (/;$/.test(exp)) {
          arr.pop();
        }
        this.mappingList = [];
        const length: number = arr.length | 0;
        for (let i = 0; i < length; i += 1) {
          const chars = arr[i].split(':');
          const code = chars[1].substr(1, chars[1].length - 2);

          const currentDataItem = this.currentFieldList.main.find(
            (x) => x.value === chars[0],
          );
          let chosenItem: any = null;
          let rowCurrentDataItemList: any[] =
            this.currentFieldList.main.slice();
          if (currentDataItem) {
            chosenItem = this.targetFieldList.main.find((item) => {
              return item.value === code;
            });
            if (chosenItem) {
              chosenItem.disabled = true;
              rowCurrentDataItemList = rowCurrentDataItemList.filter((x) =>
                [0, 12, 13, 14, 15].includes(x.type)
                  ? [0, 12, 14].includes(x.type)
                    ? [0, 12, 14].includes(chosenItem.type)
                    : [13, 15].includes(chosenItem.type)
                  : x.type === chosenItem.type,
              );
            }
          }
          //当前模型数据项code存在targetFieldList中才展示已经设置的映射记录
          if (chosenItem) {
            const obj = {
              currentDataItem: chars[0],
              targetDataItem: code,
              currentDataItemList: rowCurrentDataItemList,
            };
            this.mappingList.push(obj);
            this.currentDataItemChange(chars[0], this.mappingList.length - 1);
          }
        }
      } else {
        this.mappingList = [];
      }
    } else {
      this.$message.error('当前表单未指定业务模型');
      this.closeModal();
    }
    console.log('modalDadta=======>', this.modalData);
  }

  getTargetOptions(item: DataItem) {
    const targetDataItemList = this.targetFieldList.main.slice();

    return targetDataItemList.filter((p) => {
      const sameType = p.type === item.type;
      if (
        sameType &&
        (item.type === schema.DataItemType.RelevanceForm ||
          item.type === schema.DataItemType.RelevanceFormEx)
      ) {
        return item.relativeCode === p.relativeCode;
      }
      if ([0, 12, 13, 14, 15].includes(item.type)) {
        return [0, 12, 14].includes(item.type)
          ? [0, 12, 14].includes(p.type)
          : [13, 15].includes(p.type);
      }
      return sameType;
    });
  }

  getSourceOptions(item: DataItem) {
    return this.currentFieldList.main.filter((p) => {
      const sameType = p.type === item.type;
      if (
        sameType &&
        (item.type === schema.DataItemType.RelevanceForm ||
          item.type === schema.DataItemType.RelevanceFormEx)
      ) {
        return item.relativeCode === p.item.relativeCode;
      }
      return sameType;
    });
  }

  // 当前项发生变化后，目标项控件过滤
  currentDataItemChange(val: any, index: number) {
    const dataItem: any = this.currentFieldList.main.find((x) => {
      return x.value === val;
    });
    // 判断当前项与当前目标项是否是同一类型， 如果不是统一类型 则清空当前目标项
    const targetKey: any = this.mappingList[index].targetDataItem;
    if (targetKey) {
      const currentTargetItem: any = this.targetFieldList.main.find((x) => {
        return x.value === targetKey;
      });
      if (
        currentTargetItem &&
        dataItem &&
        currentTargetItem.type !== dataItem.type
      ) {
        if (
          ![0, 12, 13, 14, 15].includes(currentTargetItem.type) &&
          ![0, 12, 13, 14, 15].includes(dataItem.type)
        ) {
          this.mappingList[index].targetDataItem = undefined;
        }
      }
    }
    this.mappingList[index].targetDataItemList =
      this.getTargetOptions(dataItem);
  }

  // 目标项发生变化时， disabled
  targetDataItemChange(val, index) {
    let currentTargetItem: any = null;
    this.targetFieldList.main.forEach((item: any) => {
      if (
        this.mappingList.findIndex((x: any) => {
          return x.targetDataItem === item.value;
        }) > -1
      ) {
        item.disabled = true;
      } else {
        item.disabled = false;
      }
      if (item.value === val) {
        currentTargetItem = item;
      }
    });
    if (currentTargetItem) {
      this.mappingList[index].currentDataItemList =
        this.currentFieldList.main.filter((x) =>
          [0, 12, 13, 14, 15].includes(x.type)
            ? [0, 12, 14].includes(x.type)
              ? [0, 12, 14].includes(currentTargetItem.type)
              : [13, 15].includes(currentTargetItem.type)
            : x.type === currentTargetItem.type,
        );
    }
  }

  deleteMapping(index: number) {
    // 删除时释放
    const item: any = this.mappingList[index];
    if (item.targetDataItem) {
      const key = item.targetDataItem;
      const chosenItem = this.targetFieldList.main.find((x) => {
        return x.value === key;
      });
      if (chosenItem) {
        chosenItem.disabled = false;
      }
    }
    this.mappingList.splice(index, 1);
  }

  addMapping(val?: any) {
    if (val) {
      this.mappingList.push(val);
    } else {
      const remain: any = this.targetFieldList.main.filter((x) => {
        const iIndex = this.mappingList.findIndex(
          (i) => i.targetDataItem === x.value,
        );
        return iIndex === -1;
      });
      let initTargetDataItem = undefined;
      let bizSourceArr: any[] = [];
      let bizTargetArr: any = remain.filter((x) => !x.isSystem);
      if (bizTargetArr.length) {
        // initTargetDataItem = bizTargetArr[0].value;
        // bizTargetArr[0].disabled = true;
      } else {
        bizTargetArr = remain.filter((x) => x.isSystem);
        if (bizTargetArr.length) {
          initTargetDataItem = bizTargetArr[0].value;
          bizTargetArr[0].disabled = true;
        }
      }

      if (bizTargetArr.length) {
        bizSourceArr = this.currentFieldList.main.slice();

        this.mappingList.push({
          currentDataItem: undefined,
          targetDataItem: initTargetDataItem,
          currentDataItemList: bizSourceArr,
          targetDataItemList: bizTargetArr,
        });
        if (initTargetDataItem) {
          this.targetDataItemChange(
            initTargetDataItem,
            this.mappingList.length - 1,
          );
        }
      }
    }
  }

  filterType(item: any): boolean {
    return true;
  }

  mapToOption(x: DataItem) {
    const label = x.parentCode
      ? `${x.name}[${x.parentCode}.${x.code}]`
      : `${x.name}[${x.code}]`;
    return {
      value: x.parentCode ? `${x.parentCode}.${x.code}` : `${x.code}`,
      name: label,
      type: x.type,
      disabled: false,
      isSystem: x.isSystem,
      item: x,
    };
  }

  formatOrigin(arr: any[]) {
    const convert = (x: any) => {
      const item: any = {
        id: x.id,
        code: x.code,
        name: x.name,
        type: x.propertyType,
        isSystem: x.defaultProperty,
        published: x.published,
        used: false,
        defaultValue: x.defaultValue,
        formPropertyType: x.formPropertyType,
        propertyIndex: x.propertyIndex,
        propertyEmpty: x.propertyEmpty,
        schemaCode: x.schemaCode,
        relativeCode: x.relativeCode,
        relativeName: x.relativeName,
        appPackageCode: x.appPackageCode,
        appFunctionCode: x.appFunctionCode,
        relativePropertyCode: x.relativePropertyCode,
        name_i18n: x.name_i18n,
        noRepeat: x.repeated,
      };

      if (x.subSchema && x.subSchema.properties) {
        item.properties = x.subSchema.properties
          .filter(
            (p: any) =>
              !p.defaultProperty || (p.defaultProperty && p.code === 'sortKey'),
          )
          .map(convert);

        if (item.properties) {
          item.properties.forEach((p) => (p.parentCode = item.code));
        }
      }

      return item;
    };
    let items = arr
      .filter((x: any) => {
        return (
          x.type !== schema.DataItemType.ApprovalOpinion &&
          x.type !== schema.DataItemType.Sheet
        );
      })
      .map(convert);
    // items.forEach(i => {
    //   if (i && i.properties) {
    //     items = items.concat(i.properties);
    //   }
    // });
    items = items.filter((item) => {
      return (
        item.code !== 'workflowInstanceId' &&
        item.code !== 'ownerDeptQueryCode' &&
        item.code !== 'sortKey'
      );
    });
    return items;
  }

  getMaping() {
    let propertyBarText = '';
    const length = this.mappingList.length | 0;
    for (let i = 0; i < length; i += 1) {
      propertyBarText = `${propertyBarText}${
        this.mappingList[i].currentDataItem
          ? this.mappingList[i].currentDataItem
          : ''
      }:{${
        this.mappingList[i].targetDataItem
          ? this.mappingList[i].targetDataItem
          : ''
      }};`;
    }
    const backData = {
      value: propertyBarText,
    };
    return backData;
  }

  closeModal() {
    this.visible = false;
  }

  handleOk() {
    let backData: any = '';
    const mappingArr: any[] = [];
    backData = this.getMaping();

    // 检验设置是否合法 后续再优化
    const mapArr: any = backData.value.split(';');
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

    const { dataItem, schemaCode } = this.modalData.data;
    if (dataItem && dataItem.type === schema.DataItemType.RelevanceFormEx) {
      mapArr.forEach((item) => {
        const keyvaluePair = item.split(':');
        if (Array.isArray(keyvaluePair)) {
          const mappingItem = Object.create(null);
          mappingItem[keyvaluePair[0]] = keyvaluePair[1].substring(
            1,
            keyvaluePair[1].length - 1,
          );
          mappingArr.push(mappingItem);
        }
      });
    }

    if (mappingArr.length > 0) {
      const params: bizproperty.CheckSheetMappingParam = {
        schemaCode: this.$route.params.bizSchemaCode,
        relativeCode: schemaCode,
        mappings: mappingArr,
      };
      bizpropertyApi
        .checkSheetMapping(params)
        .then((res: any) => {
          if (res.errcode === 0) {
            this.$emit('backData', backData);
          } else {
            this.$message.error(res.errmsg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.$emit('backData', backData);
    }
  }

  filterOption(input, option) {
    return (
      option.componentOptions.children &&
      option.componentOptions.children[0].text &&
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.trim().toLowerCase()) >= 0
    );
  }
}
</script>
<style lang="less" scoped>
@import '../../../../common/common.less';
.relevant-selection-warp {
  background: #f4f5f8;
  padding: 10px;
  border-radius: 4px;
}
.mappingHeader {
  margin: 8px 0;
}
.add {
  color: @primary-color;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  line-height: 48px;
  span {
    margin-top: 16px;
    margin-right: 8px;
  }
}
.fieldlab {
  color: #000;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
}
.tips {
  span {
    font-size: 14px;
    font-weight: 600;
    color: #000 85%;
    margin-bottom: 8px;
  }
  background: #fffbe6;
  border: 1px solid rgba(255, 229, 143, 1);
  padding: 16px;
  font-size: 12px;
}
</style>
