<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="content">
    <a-spin :spinning="spinning" tip="Loading...">
      <div class="title-row">
        <a-button block style="width: 100px" type="link" @click="addRule">
          <span class="icon aufontAll h-icon-all-plus"></span>
          新建规则
        </a-button>
        <div class="title-tip">
          <i class="icon aufontAll h-icon-all-exclamation-circle-o"></i>
          <span>在提交数据时满足以下校验规则的数据才允许提交，多条规则之间请避免输入互斥条件，以免校验出错</span>
        </div>
      </div>
      <data-item-list :columns="columns" :dataSource="list" :noSort="true">
        <span slot="nameTitle" class="resize">校验数据项</span>
        <span slot="typeTitle" class="resize">校验类型</span>
        <span slot="actionTitle" class="resize"></span>
        <p
          slot="name"
          slot-scope="{ record, text }"
          :title="text"
          class="text-ellipsis"
        >
          <a-tooltip placement="top">
            <template #title>
              <span>{{ text }}</span>
            </template>
            <span
              v-if="record.name || record.propertyCode"
              v-hight-light="{ value: record.name || record.propertyCode }"
            ></span>
          </a-tooltip>
        </p>
        <p slot="checkType" slot-scope="{ text }">
          {{ formulaTypeList[text] }}
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
            <i v-if="record.checkType !== 4">删除</i>
          </a-popconfirm>
        </span>
      </data-item-list>
    </a-spin>
    <add-verify-rules
      :list="list"
      :isAdd="isAdd"
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
import DataItemList from '@/components/apps/model/data-item-list.vue';
import AddVerifyRules from '@/views/app/data-rule-calculation/addVerifyRules.vue';
import { Spin, Tooltip, Popconfirm, Button } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'VerifyRules',
  components: {
    DataItemList,
    AddVerifyRules,
    ASpin: Spin,
    AButton: Button,
    ATooltip: Tooltip,
    APopconfirm: Popconfirm,
  },
})
export default class VerifyRules extends Vue {
  @DataModelModule.State('dataItem') dataItems: any;

  @DataModelModule.State('dataItemList') dataItemList: any;

  @DataModelModule.Action('getFormRuleList') getFormRuleList: any;

  @DataModelModule.State('formRuleList') formRuleList: any;

  @DataModelModule.Action('getDataItemList') getDataItemListX: any;

  @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  @Prop() activeKey: any;

  @Prop() columns: any;

  showModel: boolean = false;

  isAdd: boolean = true;

  updateData: any = {
    propertyCode: undefined,
    name: '',
    checkType: undefined,
    schemaCode: '',
    options: {},
  };

  list: any[] = [];

  spinning: boolean = false;

  formulaTypeList: any = {
    1: '正则校验',
    2: '提交校验',
    3: '空行校验',
    4: '文本最大长度校验',
    5: '去重',
  };

  get bizSchemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  created() {
    this.setBizSchemaCodeX(this.bizSchemaCode);
  }

  initData() {
    this.spinning = true;
    this.getDataItemListX().then(() => {
      this.getFormRuleList()
        .then(() => {
          this.list = this.formRuleList
            .filter((x) => x.dataRuleType === 1)
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
            });
          this.spinning = false;
        })
        .catch(() => {
          this.spinning = false;
        });
    });
  }

  mounted() {
    this.initData();
  }

  handleUpdate(record: any) {
    this.isAdd = false;
    this.showModel = true;
    if (
      record.options &&
      record.options.verifyFormula &&
      typeof record.options.verifyFormula === 'string'
    ) {
      record.options.verifyFormula = JSON.parse(record.options.verifyFormula);
    }
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
      checkType: undefined,
      schemaCode: '',
      options: {},
    };
  }

  closeModal() {
    this.showModel = false;
    this.initData();
  }

  async backData(data, currControlOptions) {
    data.dataRuleType = 1;
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
.title-row {
  display: flex;
  align-items: center;

  .title-tip {
    margin-left: 20px;

    i {
      font-size: 12px;
    }

    span {
      margin-left: 8px;
      font-size: 12px;
    }
  }
}
</style>
