<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-rule-info">
    <div class="data-rule-info__header">
      <div class="clearfix">
        <smart-search @reset="resetParams" @search="query">
          <div slot="search">
            <div class="header__item">
              <span>模型名称:</span>
              <biz-models-selector
                ref="datarule"
                class="w"
                :width="216"
                @change="treeSelect"
              />

              <!-- <tree
                class="w"
                :width="216"
                @select="treeSelect"
                ref="datarule"
              /> -->
            </div>
            <div class="header__item">
              <span>规则名称:</span>
              <a-input
                v-model="dataRuleName"
                class="w"
                :placeholder="'请输入'"
              />
            </div>

            <div class="header__item">
              <span>执行时间:</span>
              <a-range-picker
                v-model="implementTime"
                class="w"
                :placeholder="['开始时间', '结束时间']"
              />
            </div>

            <div class="header__item">
              <span>执行状态:</span>
              <a-select v-model="implementState" class="w" placeholder="请选择">
                <a-select-option
                  v-for="(item, index) in executionState"
                  :key="index"
                  :value="item.code"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </smart-search>
      </div>
    </div>
    <div class="data-rule-info__content">
      <div>
        <a-table
          :columns="columns"
          size="small"
          :pagination="false"
          :loading="false"
          :locale="{ emptyText: $t('languages.NoRelevantData') }"
          :scroll="{ y: 500 }"
          :dataSource="dataSource"
          class="table"
        >
          <!-- 表格头部 -->
          <span slot="indexTitle">{{ $t('languages.NO') }}</span>
          <span slot="sourceAppNameTitle" class="text-ellipsis resize">应用</span>
          <span slot="sourceSchemaNameTitle" class="text-ellipsis resize">模型</span>
          <span slot="ruleNameTitle" class="text-ellipsis resize">数据规则名称</span>
          <span slot="modifiedTimeTitle" class="text-ellipsis resize">执行时间</span>
          <span slot="targetSchemaNameTitle" class="text-ellipsis resize">目标模型</span>
          <span slot="successTitle" class="text-ellipsis resize">执行状态</span>
          <span slot="actionTitle" class="text-ellipsis resize">操作</span>

          <!-- 表格内容 -->
          <span
            slot="action"
            slot-scope="text, record"
            class="action right text-ellipsis"
            @click="openDetail(record.id)"
            >打开详情</span>
        </a-table>
      </div>
    </div>
    <!-- <span @click="openDetail"> 详情 </span> -->
    <div class="data-rule-info__footer">
      <div>
        <a-pagination
          :defaultPageSize="size"
          :total="totalPage"
          :showTotal="(total) => `共${totalPage}条`"
          :current="page + 1"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="pageChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
    </div>

    <!-- 详情 -->
    <a-drawer
      :title="'详情'"
      width="850"
      placement="right"
      :closable="true"
      :visible="showDrawer"
      wrapClassName="user-info-drawer"
      @close="showDrawer = false"
    >
      <data-rule-info-detail :id="id" v-if="showDrawer" />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import BizModelsSelector from '@/components/global/biz-models-selector/index.vue';
import SmartSearch from '@/components/global/smart-search.vue';
import Tree from '@/views/app/data-rule/tree/tree2.vue';
import {
  DatePicker,
  Drawer,
  Input,
  Pagination,
  Select,
  Table,
} from '@h3/antd-vue';
import { systemManage, systemManageApi } from 'cloudpivot/api';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';
import DataRuleInfoDetail from './data-rule-info-detail.vue';
import * as dataType from './typings/data-rule';
import { getNearWork } from './typings/help';

@Component({
  name: 'data-rule-info',
  components: {
    SmartSearch,
    Tree,
    DataRuleInfoDetail,
    BizModelsSelector,
    AInput: Input,
    ATable: Table,
    APagination: Pagination,
    ADrawer: Drawer,
    ARangePicker: DatePicker.RangePicker,
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class DataRuleInfo extends Vue {
  isShow: boolean = false;

  dataSource: any[] = [];

  executionState: Array<dataType.ImplementState> = [];

  totalPage: number = 0; // 分页

  implementTime: any[] = []; // 执行时间

  implementState: dataType.State = dataType.State.All; // 执行装填

  schemaCode: string = ''; // 模型编码

  dataRuleName: string = ''; // 数据规则名称

  id = '';

  page = 0;

  size = 20;

  columns: any[] = [];

  showDrawer = false; // 抽屉显隐

  pageSizeOptions: string[] = []; // 分页选项

  mounted() {
    this.resetParams();

    this.executionState = dataType.executionState;
    this.columns = dataType.columns;
    this.pageSizeOptions = dataType.pageSizeOptions;
  }

  resetParams() {
    const nearWeek = getNearWork();
    this.implementTime = [moment(nearWeek[0]), moment(nearWeek[1])];
    this.implementState = dataType.State.All;
    this.schemaCode = '';
    this.clearTree();
    this.dataRuleName = '';
    this.getList();
  }

  query() {
    this.page = 0;
    this.getList();
  }

  treeSelect(val: any) {
    this.schemaCode = val;
  }

  clearTree() {
    (this.$refs.datarule as any).clearVal();
  }

  getList() {
    const params = this.getParams();
    console.log('params', params);
    const vm: any = this;
    systemManageApi.listBizRuleLog(params).then((res) => {
      if (res.errcode === 0) {
        vm.dataSource = res.data.content;
        vm.totalPage = res.data.totalElements;
        vm.dataSource.forEach((item: any, index: number) => {
          item.index = index + 1 + params.page * params.size;
          item.state = item.success ? '成功' : '失败';
        });
      }
    });
  }

  getParams(): systemManage.ListBizRuleLog {
    let startTime = '';
    let endTime = '';
    if (this.implementTime.length > 0) {
      startTime = moment(this.implementTime[0]).format('YYYY-MM-DD');
      endTime = moment(this.implementTime[1]).format('YYYY-MM-DD');
    }
    const params = {
      startTime,
      endTime,
      schemaCode: this.schemaCode,
      ruleName: this.dataRuleName,
      status: this.implementState,
      page: this.page,
      size: this.size,
    };
    return params;
  }

  /**
   * 分页变化
   */
  pageChange(page: number, pageSize: number) {
    this.page = page - 1;
    this.size = pageSize;
    this.getList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.page = 0;
    this.size = pageSize;
    this.getList();
  }

  openDetail(id: string) {
    this.id = id;
    this.showDrawer = !this.showDrawer;
  }
}
</script>
<style lang="less" scoped>
.data-rule-info {
  position: relative;
  height: calc(100vh - 122px);
  &__header {
    & > div {
      margin: 0 -23px;
      .header__item {
        height: 32px;
        margin-bottom: 16px;
        margin-right: 16px;
        float: left;
        font-size: 0;
        > span:first-child {
          display: inline-block;
          vertical-align: middle;
          min-width: 4.2em;
          font-size: 14px;
        }
        .w {
          width: 216px;
          margin-left: 8px;
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
  &__content {
    margin-top: 16px;
    /deep/.ant-table-body {
      max-height: calc(100vh - 272px) !important;
      .action {
        cursor: pointer;
        color: @primary-color;
      }
    }
  }
  &__footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin-left: -24px;
    margin-right: -24px;
    border-top: 1px solid rgba(232, 232, 232, 1);
    padding: 8px 24px;
    & > div {
      float: right;
    }
  }
}
</style>
