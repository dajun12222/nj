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
        <span slot="nameTitle" class="resize">规则数据项</span>
        <span slot="typeTitle" class="resize">规则类型</span>
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
        <p slot="checkType" slot-scope="{ record, text }" :title="text">
          {{
            formulaTypeList[
              record.options && record.options.requiredFormula !== 'true'
                ? 3
                : 2
            ]
          }}
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
      type="other"
      @backData="backData"
      @closeModal="closeModal"
    />
  </div>
</template>

<script lang="ts">
import * as DataRuleApi from '@/apis/data-rule';
import DataItemList from '@/components/apps/model/data-item-list.vue';
import AddOtherRules from '@/views/app/data-rule-calculation/addOtherRules.vue';
import { Spin, Tooltip, Popconfirm, Button } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'OtherRules',
  components: {
    DataItemList,
    AddOtherRules,
    ASpin: Spin,
    AButton: Button,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
  },
})
export default class OtherRules extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @DataModelModule.State('dataItemList') dataItemList: any;

  @DataModelModule.Action('getFormRuleList') getFormRuleList: any;

  @DataModelModule.State('formRuleList') formRuleList: any;

  @DataModelModule.Action('getDataItemList') getDataItemListX: any;

  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  @Prop() activeKey: any;

  @Prop() columns: any;

  formulaTypeList: any = {
    2: '必填',
    3: '满足条件必填',
  };

  showModel: boolean = false;

  isAdd: boolean = true;

  updateData: any = {
    propertyCode: undefined,
    name: '',
    schemaCode: '',
    options: {},
  };

  list: any[] = [];

  spinning: boolean = false;

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
              .filter((x) => x.dataRuleType === 4)
              .map((i) => {
                console.log(this.dataItemList);
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
      name: '',
      schemaCode: '',
      options: {},
    };
  }

  closeModal() {
    this.showModel = false;
    this.initData();
  }

  async backData(data, currControlOptions) {
    data.dataRuleType = 4;
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
