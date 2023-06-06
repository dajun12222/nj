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
          slot-scope="{ text }"
          :title="text"
          class="text-ellipsis"
        >
          <a-tooltip placement="top">
            <template #title>
              <span>{{ text }}</span>
            </template>
            <span v-if="text" v-hight-light="{ value: text }"></span>
          </a-tooltip>
        </p>
        <p slot="checkType" slot-scope="{ record }">
          <span
            v-for="(conditionItem, itemIndex) in record.checkType"
            :key="itemIndex"
          >
            <span
              v-for="(item, index) in conditionItem.conditionItemList"
              :key="index"
            >
              {{ `[ ${item.name} ]`
              }}<span style="color: rgba(17, 18, 24, 0.5); margin: 0 8px">{{
                item.operators
              }}</span>
              <span v-if="item.value">{{ `[ ${item.value} ]` }}</span>
              <span
                v-if="index + 1 !== conditionItem.conditionItemList.length"
                class="and-or"
                >且</span>
            </span>
            <span
              v-if="itemIndex + 1 !== record.checkType.length"
              class="and-or"
              >或</span>
          </span>
        </p>
        <span
          slot="action"
          slot-scope="{ record, text }"
          class="action-list-operating right"
          :title="text"
        >
          <i @click="handleUpdate(record)">编辑</i>
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
    <add-other-rules
      :isAdd="isAdd"
      :list="list"
      :modalData="updateData"
      :visible.sync="showModel"
      :bizSchemaCode="bizSchemaCode"
      type="display"
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
import AddOtherRules from '@/views/app/data-rule-calculation/addOtherRules.vue';
import { Spin, Tooltip, Popconfirm, Button } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'DisplayRules',
  components: {
    DataItemList,
    AddOtherRules,
    ASpin: Spin,
    AButton: Button,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
  },
})
export default class DisplayRules extends Vue {
  @Prop() lists: any;

  @Prop() activeKey: any;

  @Prop() columns: any;

  @DataModelModule.State('dataItem') dataItem: any;

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

  list: Array<any> = [];

  spinning: boolean = false;

  dataItems: any[] = [];

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

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
              .filter((x) => x.dataRuleType === 3)
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
                  } else {
                    i.name = i.propertyCode;
                  }
                } else {
                  const currentItem = this.dataItemList.find(
                    (item) => item.code === i.propertyCode,
                  );
                  if (currentItem) {
                    i.name = currentItem.name;
                  } else {
                    i.name = i.propertyCode;
                  }
                }
                if (typeof i.options === 'string') {
                  i.options = JSON.parse(i.options);
                }
                return i;
              })
              .map((i) => {
                if (i.options.displayFormula) {
                  i.checkType = this.initModel(i.options.displayFormula);
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

  /**
   * 获取条件组中表达式值，返回对象格式
   */
  getConditionItem(seg: string) {
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
      const sheet = this.dataItem.find((x) => x.code === parentCode);
      if (sheet && sheet.properties) {
        item = sheet.properties.find((x) => x.code === childCode) as any;
      }
    } else {
      item = this.dataItem.find((x) => x.code === code);
    }

    if (item) {
      const operator = OperatorService.findByLabel(item.type, fields[1]);

      if (operator) {
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
              val = val === 'true' ? 'true' : 'false';
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
        const obj = this.dataItem.forEach((v) => {
          if (codes.length > 1) {
            if (v.code === codes[0]) {
              const child = v.properties.find((n) => n.code === codes[1]);
              name = `${v.name}.${child.name}`;
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
        return {
          name,
          operators:
            operators &&
            operators.find((i) => i.value === operator.value).label,
          value: val,
        };
      }
    }
  }

  initModel(exp: string) {
    let segs: string[] = [];
    let type = 1;
    if (exp.indexOf('||') > -1) {
      type = 2;
      segs = exp.split(' || ');
    } else {
      segs = [exp];
    }
    const conditions: any[] = [];

    for (const seg of segs) {
      if (seg.indexOf('&&') > -1) {
        const segList = seg.split(' && ');
        const conditionItemList = [];
        for (const segItem of segList) {
          const node: any = this.getConditionItem(segItem);
          if (node) {
            // @ts-ignore
            conditionItemList.push(node);
          } else {
            conditions.push({
              conditionItemList: [],
            });
          }
        }
        conditions.push({
          conditionItemList: conditionItemList,
        });
      } else {
        const node: any = this.getConditionItem(seg);
        if (node) {
          conditions.push({
            conditionItemList: [node],
          });
        } else {
          conditions.push({
            conditionItemList: [],
          });
        }
      }
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
    this.initData();
  }

  async backData(datas, currControlOptions) {
    const data = JSON.parse(JSON.stringify(datas));
    data.checkType = null;
    data.dataRuleType = 3;
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
