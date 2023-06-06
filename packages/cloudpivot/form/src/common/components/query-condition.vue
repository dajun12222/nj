<template>
  <a-modal
    :title="type === 'query' || type === 'onlyQuery' ? '查询条件' : '映射字段'"
    :visible="true"
    :maskClosable="false"
    :keyboard="false"
    :width="1000"
    @cancel="onCancel"
  >
    <div class="content">
      <dataitem-mapping2
        v-if="type === 'query' || type === 'onlyQuery'"
        v-model="queryDatas"
        :source="querySource"
        :target="target"
      />
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
import { bizproperty, bizpropertyApi, listApi } from '../../../../api';
import { DataItemType } from '../../../schema';
import * as dataitemStore from '../../stores/data-items.store-helper';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import DataitemMapping, {
  DataitemMappingValueItem,
  DataitemSource,
} from './dataitem-mapping.vue';
import DataitemMapping2 from './dataitem-mapping2.vue';
import { Button, Modal } from '@h3/antd-vue';

/**
 * 关联表单查询条件
 */
@Component({
  name: 'query-condition',
  components: {
    DataitemMapping,
    DataitemMapping2,
    AModal: Modal,
    AButton: Button,
  },
})
export default class QueryCondition extends Vue {
  @Prop({
    default: {},
  })
  modalData!: any;

  @Prop({ type: Object })
  modalOptions!: any;

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

  mappingSource: DataitemSource = {
    title: '展示字段',
    items: [],
  };

  mappingTarget: DataitemSource = {
    title: '当前表单字段',
    items: [],
  };

  query: DataitemMappingValueItem[] = [];

  mapping: DataitemMappingValueItem[] = [];

  isMultiRelevantInSheet: boolean = false;

  get onlyQuery() {
    return true;
  }

  clientType = '';

  @Watch('type', {
    immediate: true,
  })
  onTypeChange() {
    if (this.modalData.data.dataItem.type === DataItemType.RelevanceFormEx) {
      if (this.type === 'mapping') {
        this.mappingSource.items = this.mappingSource.items.filter(
          (x) => x.type === DataItemType.Sheet,
        );
        this.mappingTarget.items = this.mappingTarget.items.filter(
          (x) => x.type === DataItemType.Sheet,
        );
      }
    }
  }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    if (this.modalOptions.modalType) {
      this.type = this.modalOptions.modalType;
    }
    const clientType = this.modalOptions.clientType || 'PC';

    this.clientType = clientType;
    if (!modalData.data || !modalData.data.schemaCode) {
      return;
    }

    const hideLoader = (this.$message as any).loading();

    const schemaCode: string = modalData.data.schemaCode;
    const queryCode = modalData.data.queryCode;
    const dataItem = modalData.data.dataItem;
    const _this = this;
    Promise.all([
      listApi.getDataItemList({ schemaCode }),
      listApi.getDataItemList({ schemaCode: schemaCode, isPublish: true }),
    ]).then(
      (resList: any[]) => {
        hideLoader();

        const res = resList[0];
        const res2 = resList[1];

        const data = res.data;

        const map = (x: any) => ({
          code: x.propertyCode || x.code,
          type: x.propertyType,
          name: x.name,
          relativeCode: x.relativeCode || x.relativeSchemaCode,
          isSystem: x.defaultProperty,
        });

        const items = dataitemStore.getDataItems(this);

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

            const currentSelectItem: any = sheet.properties.find(
              (x: any) => x.code === dataItem.code,
            );
            if (currentSelectItem.type === DataItemType.RelevanceFormEx) {
              this.isMultiRelevantInSheet = true;
            } else {
              this.isMultiRelevantInSheet = false;
            }

            this.mappingTarget = {
              title: this.target.title,
              items: sheetItems,
            };

            this.target = {
              title: this.target.title,
              items: this.target.items.concat(sheetItems),
            };
          }
        } else {
          this.mappingTarget = {
            title: this.target.title,
            items: items.filter((x) => x.code !== dataItem.code),
          };
        }

        const types = this.mappingTarget.items.map((x) => x.type);

        // const filter = (x: any) => types.indexOf(x.propertyType) > -1
        //   && x.propertyType !== DataItemType.Attachment && x.propertyType !== DataItemType.ApprovalOpinion
        //   && x.propertyType !== DataItemType.Sheet;

        if (data) {
          this.querySource = {
            title: this.querySource.title,
            items: data.map(map),
          };
        }

        const msItems = res2.data
          .filter(
            (x: any) =>
              types.indexOf(x.propertyType) > -1 &&
              // && x.propertyType !== DataItemType.Attachment
              x.propertyType !== DataItemType.ApprovalOpinion,
          )
          .map(map);

        this.mappingSource = {
          title: this.mappingSource.title,
          items: msItems.filter((x: any) => {
            return (
              x.code !== 'workflowInstanceId' && x.code !== 'ownerDeptQueryCode'
            );
          }),
        };

        if (
          this.type === 'mapping' &&
          this.modalData.data.dataItem.type === DataItemType.RelevanceFormEx
        ) {
          this.mappingSource.items = this.mappingSource.items.filter(
            (x) => x.type === DataItemType.Sheet,
          );
          this.mappingTarget.items = this.mappingTarget.items.filter(
            (x) => x.type === DataItemType.Sheet,
          );
        }

        const value = modalData.data.value;
        let options: any = '';
        try {
          const query: any = JSON.parse(value.query);
          value.query = query.queryText;

          options = JSON.parse(JSON.stringify(query)).$queryData;
        } catch (error) {
          console.log(error);
        }

        this.query = this.querySource.items.map(
          (x) =>
            ({
              source: x,
              isConst: false,
              target: {},
            } as any),
        );
        if (value && value.query) {
          this.handleQueryValue(value.query, options);
        }
      },
      () => hideLoader(),
    );
  }

  handleMappingValue(value: string) {
    this.mapping = value
      .split(';')
      .map((s: string) => {
        let [sourceCode, targetCode] = s.split(':');
        const sourceItem = this.mappingSource.items.find(
          (m) => m.code === sourceCode,
        );
        if (!sourceItem) {
          return;
        }

        targetCode = targetCode.substring(1, targetCode.length - 1);
        const idx = targetCode.indexOf('.');
        if (idx > -1) {
          targetCode = targetCode.substr(idx + 1);
        }
        const targetItem = this.mappingTarget.items.find(
          (i) => i.code === targetCode,
        );
        if (!targetItem) {
          return;
        }

        return {
          source: sourceItem,
          target: targetItem,
        };
      })
      .filter((x) => x !== undefined) as any;
  }

  queryDatas: any[] = [];

  handleQueryValue(value: string, options?: any) {
    value.split(';').forEach((s: string, index: number) => {
      const idx = s.indexOf(':');
      const sourceCode = s.substring(0, idx);
      let targetCode = s.substr(idx + 1);
      const sourceItem = this.query.find((q) => q.source.code === sourceCode);
      if (!sourceItem) {
        return;
      }
      if (targetCode[0] === '{' && !targetCode.includes(':')) {
        if (
          sourceItem.isConst === true &&
          sourceItem.source.type === DataItemType.Address
        ) {
          sourceItem.target = JSON.parse(targetCode);
          sourceItem.isConst = true;
        } else {
          targetCode = targetCode.substring(1, targetCode.length - 1);
          const index = targetCode.indexOf('.');
          if (index > -1) {
            targetCode = targetCode.substr(index + 1);
          }
          const targetItem = this.target.items.find(
            (i) => i.code === targetCode,
          );
          if (!targetItem) {
            return;
          }
          sourceItem.target = targetItem;
        }
      } else {
        sourceItem.isConst = true;
        try {
          targetCode = JSON.parse(targetCode); //该值可能是一个选人控件对应的json字符，尝试解析；
        } catch (e) {}
        (sourceItem as any).target = targetCode;
        if (
          sourceItem.source.type === DataItemType.Date &&
          !Array.isArray(sourceItem.target) &&
          typeof sourceItem.target === 'number'
        ) {
          sourceItem.isConst = false;
        }
      }

      // 增加查询条件操作符回显
      const opOption =
        options &&
        options.find((el) => el.propertyCode === sourceItem.source.code);
      if (opOption) {
        sourceItem.op = opOption.op || 'eq';
        sourceItem.num = opOption.num;
      } else {
        sourceItem.op = 'eq';
      }
      this.queryDatas.push(JSON.parse(JSON.stringify(sourceItem)));
    });
  }

  onCancel() {
    this.$emit('closeModal');
  }

  onOk() {
    const reg =
      /^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))$/;
    const join = (items: DataitemMappingValueItem[], parentCode?: string) =>
      items
        .map((q: any) => {
          if (Array.isArray(q.target)) {
            return `${q.source.code}:${JSON.stringify(q.target)}`;
          } else if (
            typeof q.target === 'string' ||
            typeof q.target === 'number'
          ) {
            if (q.target || q.target === 0) {
              return `${q.source.code}:${q.target}`;
            } else {
              return `${q.source.code}:""`;
            }
          } else if (q.target.code) {
            if (!parentCode) {
              parentCode = q.target.parentCode;
            }
            if (parentCode) {
              return `${q.source.code}:{${parentCode}.${q.target.code}}`;
            }
            return `${q.source.code}:{${q.target.code}}`;
          } else if ([5, 50, 51, 60, 61].includes(q.source.type)) {
            //为常量的时候，需要处理选人的情况，转换成json字符
            if (q.target) {
              return `${q.source.code}:${JSON.stringify(q.target)}`;
            }
            return `${q.source.code}:""`;
          } else if (q.source && q.source.type === DataItemType.Address) {
            return `${q.source.code}:${JSON.stringify(q.target)}`;
          } else if (q.source) {
            return `${q.source.code}:""`;
          } else {
            //Else Empty block statement
          }
          return null;
        })
        .filter((s) => s)
        .join(';');

    for (let i = 0; i < this.queryDatas.length; i++) {
      const res = this.queryDatas[i];
      if (res.source.type === 3 && res.isConst) {
        const val = res.target as string;
        if (!Array.isArray(val) && !reg.test(val)) {
          this.$message.error('只支持日期格式: 2019-05-10');
          return;
        }
      }
    }

    const getQueryData = (queryDatas) => {
      const arr: any[] = [];
      if (Array.isArray(queryDatas)) {
        queryDatas.forEach((el) => {
          arr.push({
            propertyCode: el.source.code,
            propertyType: el.source.type,
            name: el.source.name,
            isSystem: el.source.isSystem,
            num: el.num,
            op: el.op,
            isConst: el.isConst,
          });
        });
      }
      return arr;
    };

    const isConstEmpty = this.queryDatas.some((x) => {
      return (
        x.isConst &&
        !x.target &&
        x.target !== 0 &&
        x.op !== 'IS_NULL' &&
        x.op !== 'IS_NOT_NULL'
      );
    });

    if (isConstEmpty) {
      this.$message.error('条件常量不能为空');
      return;
    }

    const parentCode = this.modalData.data.dataItem.parentCode;
    const schemaCode = this.modalData.data.dataItem.schemaCode;
    const relativeCode = this.modalData.data.dataItem.relativeCode;
    const queryText = join(this.queryDatas);
    const mappingText = join(this.mapping, parentCode);
    const $queryData = getQueryData(this.queryDatas);
    if (queryText === '' && $queryData.length === 0) {
      this.$emit('backData', {
        value: '',
      });
      return;
    }

    if (this.modalData.data.dataItem.type === DataItemType.RelevanceFormEx) {
      // if (!schemaCode) {
      //   this.$message.error('当前表单未发布, 请先保存、发布');
      //   return;
      // }
      const mappingArr: any[] = [];

      this.mapping.forEach((item) => {
        const mappingItem = Object.create(null);
        mappingItem[item.source.code] =
          typeof item.target === 'object' ? item.target.code : '';
        mappingArr.push(mappingItem);
      });

      if (mappingArr.length > 0) {
        const params: bizproperty.CheckSheetMappingParam = {
          schemaCode: schemaCode,
          relativeCode: relativeCode,
          mappings: mappingArr,
        };

        bizpropertyApi
          .checkSheetMapping(params)
          .then((res) => {
            if (res) {
              //@ts-ignore
              if (res.errcode === 0) {
                const backData = {
                  value: {
                    query: queryText,
                    mapping: mappingText,
                  },
                };

                this.$emit('backData', backData);
              } else {
                //@ts-ignore
                this.$message.error(res.errmsg);
              }
            }
          })
          .catch((err) => {
            console.log(JSON.stringify(err));
          });
      } else {
        const backData = {
          value: {
            query: JSON.stringify({
              queryText,
              $queryData: $queryData,
            }),
            mapping: mappingText,
          },
        };
        this.$emit('backData', backData);
      }
    } else {
      const backData = {
        value: {
          query: JSON.stringify({
            queryText,
            $queryData: $queryData,
          }),
          mapping: mappingText,
        },
      };
      this.$emit('backData', backData);
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  text-align: center;
  margin: -10px -24px 0 -24px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e8e8e8;
  // .header_title {
  //   float: left;
  // }
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
}
</style>
