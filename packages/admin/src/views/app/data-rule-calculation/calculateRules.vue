<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="content">
    <a-spin :spinning="spinning" tip="Loading...">
      <a-button block style="width: 100px" type="link" @click="addRule">
        <span class="icon aufontAll h-icon-all-plus"></span>
        新建规则
      </a-button>
      <data-item-list :columns="columns" :dataSource="list" :noSort="true">
        <span slot="nameTitle" class="resize">显示数据项</span>
        <span slot="typeTitle" class="resize">规则</span>
        <span slot="actionTitle" class="resize"></span>
        <p
          slot="name"
          slot-scope="{ record, text }"
          :title="text"
          class="text-ellipsis"
        >
          <a-tooltip placement="top">
            <template #title>
              <span>{{ record.name }}</span>
            </template>
            <span v-if="text" v-hight-light="{ value: text }"></span>
          </a-tooltip>
        </p>
        <p
          slot="checkType"
          slot-scope="{ record, text }"
          class="text-ellipsis"
          :title="text"
        >
          <span>{{
            record.options && formatOptions(record.options.shortTextStitch)
          }}</span>
        </p>
        <span
          slot="action"
          slot-scope="{ record, text }"
          class="action-list-operating right"
        >
          <i :key="text" @click="handleUpdate(record)">编辑</i>
          <a-popconfirm
            placement="left"
            title="您确定要删除吗?"
            @confirm="handleDelete(record)"
          >
            <i>删除</i>
          </a-popconfirm>
        </span>
      </data-item-list>
    </a-spin>
    <add-calculate-rule
      :isAdd="isAdd"
      :list="list"
      :modalData="updateData"
      :visible.sync="showModel"
      :bizSchemaCode="bizSchemaCode"
      @backData="backData"
      @closeModal="closeModal"
    />
  </div>
</template>

<script lang="ts">
import * as DataRuleApi from '@/apis/data-rule';
import { DataItemType } from '@/components/apps/form-design/typings';
import DataItemList from '@/components/apps/model/data-item-list.vue';
import {
  DateItemOperatorType,
  logicDataItemOperators,
  numberDataItemOperators,
  OperatorService,
  relevanceFormDataItemOperators,
  sequenceStatusOperators,
  staffDataItemOperators,
  textDataItemOperators,
} from '@/components/shared/data-item/data-item2';
import AddCalculateRule from '@/views/app/data-rule-calculation/addCalculateRule.vue';
import { Button, Popconfirm, Spin, Tooltip } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'calculateRules',
  components: {
    DataItemList,
    AddCalculateRule,
    ASpin: Spin,
    AButton: Button,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
  },
})
export default class calculateRules extends Vue {
  @Prop() lists: any;

  @Prop() activeKey: any;

  @Prop() columns: any;

  @DataModelModule.State('dataItem') dataItems: any;

  @DataModelModule.State('dataItemList') dataItemList: any;

  @DataModelModule.Action('getFormRuleList') getFormRuleList: any;

  @DataModelModule.State('formRuleList') formRuleList: any;

  @DataModelModule.Action('getDataItemList') getDataItemListX: any;

  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  showModel: boolean = false;

  isAdd: boolean = true;

  updateData: any = {
    propertyCode: undefined,
    options: {},
  };

  list: any = [];

  spinning: boolean = false;

  created() {
    this.setBizSchemaCodeX(this.bizSchemaCode);
  }

  initData() {
    this.spinning = true;
    this.getDataItemListX()
      .then(() => {
        this.getFormRuleList()
          .then(() => {
            this.list = this.formRuleList
              .filter((x) => x.dataRuleType === 2)
              .map((i) => {
                const currentParent = this.dataItemList.find(
                  (item) => item.code === i.schemaCode,
                );
                if (
                  currentParent &&
                  currentParent.subSchema &&
                  Array.isArray(currentParent.subSchema.properties)
                ) {
                  const currentItem = currentParent.subSchema.properties.find(
                    (item) => item.code === i.propertyCode,
                  );
                  if (currentItem) {
                    i.name = currentParent.name + '.' + currentItem.name;
                  }
                } else {
                  const currentItem = this.dataItemList.find(
                    (item) => item.code === i.propertyCode,
                  );
                  if (currentItem) {
                    i.name = currentItem.name;
                  }
                }
                if (typeof i.options === 'string') {
                  i.options = JSON.parse(i.options);
                }
                return i;
              })
              .map((i) => {
                const arr = this.dataItems.filter((v) => {
                  if (
                    v.type === DataItemType.Sheet &&
                    v.code !== i.propertyCode
                  ) {
                    if (Array.isArray(v.properties)) {
                      const l = v.properties.filter(
                        (n) =>
                          n.schemaCode === i.schemaCode &&
                          n.code === i.propertyCode,
                      );
                      if (l.length > 0) {
                        i.showSheet = true;
                        i.name = l[0].name;
                      }
                    }
                  } else {
                    return (
                      v.code === i.propertyCode && v.schemaCode === i.schemaCode
                    );
                  }
                });
                if (arr.length > 0) {
                  i.name = arr[0].name;
                }
                return i;
              });
            this.spinning = false;
          })
          .catch(() => {
            this.spinning = false;
          });
      })
      .catch(() => {
        this.spinning = false;
      });
  }

  mounted() {
    this.initData();
  }

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  formatOptions(options) {
    let res: string = '';
    try {
      const ruleObj: any = JSON.parse(options);
      if (ruleObj && ruleObj.formula) {
        const relevantDataItems: string[] | null =
          ruleObj.formula.match(/\{.*?\}/g);
        if (Array.isArray(relevantDataItems)) {
          relevantDataItems.forEach((item: string) => {
            const key: string = item.substring(1, item.length - 1);
            const iIndex: number = key.indexOf('.');
            if (iIndex > -1) {
              const sheetCode: string = key.substring(0, iIndex);
              const subCode: string = key.substring(iIndex + 1);
              const sheetItem: any = this.dataItems.find((x: any) => {
                return x.code === sheetCode;
              });
              const subItem: any = this.dataItems.find((x: any) => {
                return x.code === subCode;
              });
              if (sheetItem && subItem) {
                ruleObj.formula = ruleObj.formula.replace(
                  new RegExp('\{' + key + '\}', 'g'),
                  `${sheetItem.name}.${subItem.name}`,
                );
              }
            } else {
              const searchItem: any = this.dataItems.find((x: any) => {
                return x.code === key;
              });
              if (searchItem) {
                ruleObj.formula = ruleObj.formula.replace(
                  new RegExp('\{' + key + '\}', 'g'),
                  searchItem.name,
                );
              }
            }
          });
          res = ruleObj.formula;
        } else {
          res = ruleObj.formula;
        }
      }
    } catch (err) {
      console.log(err);
    }
    return res;
  }

  initModel(exp: string) {
    let segs: string[] = [];
    let type = 1;
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
    const conditions: any[] = [];

    for (const seg of segs) {
      // 先判断空格出现的次数
      const countOfSpace: number = seg.split(' ').length - 1;
      let fields: string[] = [];
      if (countOfSpace === 1) {
        // 一次直接切割
        fields = seg.split(' ');
      } else {
        // 多次则 按空格标识分割 但是非字符串中的空格 例：{ShortText1618474250748} === '121 12 1'
        const point1 = seg.indexOf(' ');
        const point2 = seg.indexOf(' ', point1 + 1);
        fields[0] = seg.substring(0, point1);
        fields[1] = seg.substring(point1 + 1, point2);
        fields[2] = seg.substring(point2 + 1);
      }
      const code = fields[0].substring(1, fields[0].length - 1);

      let item: any = [];

      const idx = code.indexOf('.');
      if (idx > -1) {
        const parentCode = code.substring(0, idx);
        const childCode = code.substring(idx + 1);
        const sheet = this.dataItems.find((x) => x.code === parentCode);
        if (sheet && sheet.properties) {
          item = sheet.properties.find((x) => x.code === childCode) as any;
        }
      } else {
        item = this.dataItems.find((x) => x.code === code);
      }

      if (!item) {
        continue;
      }

      const operator = OperatorService.findByLabel(item.type, fields[1]);

      if (!operator) {
        continue;
      }

      let val: any;

      if (
        !(
          operator.value === DateItemOperatorType.IsNull ||
          operator.value === DateItemOperatorType.IsNotNull
        )
      ) {
        val = fields[2];
        switch (item.type) {
          case DataItemType.Number:
            val = Number(val);
            break;
          case DataItemType.Logic:
            val = val === 'true' ? 1 : 0;
            break;
          case DataItemType.Date:
          case DataItemType.Time:
          case DataItemType.ShortText:
          case DataItemType.Radio:
          case DataItemType.Checkbox:
          case DataItemType.Dropdown:
          case DataItemType.DropdownMulti:
          case DataItemType.LongText:
            val = val.substring(1, val.length - 1);
            break;
          case DataItemType.StaffMulti:
          case DataItemType.StaffDeptMix:
          case DataItemType.StaffSingle:
          case DataItemType.DeptMulti:
          case DataItemType.DeptSingle:
            if (val) {
              try {
                val = JSON.parse(val);
              } catch (e) {
                console.log('initModel', e);
              }
            }
            break;
          default:
            break;
        }
      }

      const operators: any = this.getOperators(item.type, operator.value);

      const codes = code.split('.');
      let name = '';
      const obj = this.dataItems.forEach((v) => {
        if (codes.length > 1) {
          if (v.code === codes[0]) {
            const child = v.properties.find((n) => n.code === codes[1]);
            name = child.name;
          }
        } else {
          if (v.code === codes[0]) {
            name = v.name;
          }
        }
      });
      if (Array.isArray(val)) {
        val = val.map((i) => i.name).join();
      }
      conditions.push({
        name,
        operators: operators.find((i) => i.value === operator.value).label,
        value: val,
      });
    }
    return conditions;
  }

  getOperators(type: DataItemType, code: string) {
    switch (type) {
      case DataItemType.Number:
      case DataItemType.Date:
      case DataItemType.Time:
        return numberDataItemOperators;

      case DataItemType.Logic:
        return logicDataItemOperators;

      case DataItemType.ShortText:
      case DataItemType.Radio:
      case DataItemType.Checkbox:
      case DataItemType.Dropdown:
      case DataItemType.DropdownMulti:
      case DataItemType.LongText:
        if (code === 'sequenceStatus') {
          return this.getOperatorsByCode(code);
        } else {
          return textDataItemOperators;
        }

      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.StaffSingle:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        return staffDataItemOperators;

      case DataItemType.RelevanceForm:
      case DataItemType.RelevanceFormEx:
        return relevanceFormDataItemOperators;
      default:
        break;
    }
  }

  getOperatorsByCode(code: string) {
    switch (code) {
      case 'sequenceStatus':
        return sequenceStatusOperators;
      default:
        break;
    }
  }

  handleUpdate(record: any) {
    this.isAdd = false;
    this.showModel = true;
    this.updateData = record;
  }

  handleDelete(record: any) {
    DataRuleApi.deleteDataRules({ id: record.id }).then(() => {
      this.initData();
    });
  }

  addRule() {
    this.isAdd = true;
    this.showModel = true;
    this.updateData = {
      propertyCode: undefined,
      options: {},
    };
  }

  closeModal() {
    this.showModel = false;
  }

  async backData(data, currControlOptions) {
    data.dataRuleType = 2;
    if (currControlOptions) {
      if (currControlOptions.parentCode) {
        data.schemaCode = currControlOptions.parentCode;
      } else {
        data.schemaCode = currControlOptions.schemaCode;
      }
      if (currControlOptions.code.indexOf('.') > -1) {
        data.propertyCode = currControlOptions.code.split('.')[1];
      } else {
        data.propertyCode = currControlOptions.code;
      }
    }
    if (!data.schemaCode) {
      data.schemaCode = this.bizSchemaCode;
    }
    let res: any = {};
    if (this.isAdd) {
      res = await DataRuleApi.createDataRules(data);
    } else {
      res = await DataRuleApi.updateDataRules(data);
    }
    if (res.errcode === 0) {
      this.closeModal();
      this.initData();
    } else {
      this.$message.error(res.errmsg);
    }
  }
}
</script>
<style lang="less" scoped>
.content {
  padding-top: 16px;
  .action-list-operating {
    i {
      font-style: normal;
      color: @primary-color;
    }
  }
}
</style>
