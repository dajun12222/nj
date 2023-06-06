<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <!-- 文件校验通过但是编码重复 -->
  <div class="validate-box">
    <!-- 修改编码 -->
    <div v-if="repeated && !isCoverable" class="file-status repeat">
      <span class="icon aufontAll warning">&#xe99a;</span>
      <span class="file-status-txt">检测到编码重名，修改后导入将生成新的业务模型</span>
    </div>

    <a-tabs :activeKey="tabKey" @tabClick="tabClick">
      <!-- codeList一直会有但是只有存在重复时repeat才会为真 -->
      <a-tab-pane
        v-if="list.codeList.length !== 0 && repeated && !isCoverable"
        key="1"
      >
        <span slot="tab"> 模型<i style="color: red">*</i> </span>

        <a-table
          :pagination="false"
          :columns="codeColumns"
          :data-source="list.codeList"
        >
          <template slot="newCode" slot-scope="text, record">
            <div class="model-item">
              <a-input
                v-model="record.newCode"
                :placeholder="$t('languages.Apps.PlzFillInDataModelCode')"
                :maxLength="24"
                @change="inputChange"
              />
            </div>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane
        v-if="list.sheetList.length !== 0 && repeated && !isCoverable"
        key="2"
      >
        <span slot="tab"> 子表<i style="color: red">*</i> </span>
        <a-input
          v-model="searchSubCodeText"
          placeholder="请输入子表名称"
          class="input-search"
          style="width: 260px; margin-bottom: 8px"
          @pressEnter="getSubCodeItem"
        >
          <a-icon
            v-if="searchSubCodeText.length > 0"
            slot="suffix"
            class="suffix-icon close-icon"
            type="close-circle"
            @click="clearSubCodeText"
          />
          <a-icon
            slot="suffix"
            class="suffix-icon"
            type="search"
            @click="getSubCodeItem"
          />
        </a-input>
        <a-table
          :pagination="false"
          :columns="sheetColumns"
          :data-source="getSubCodeItem()"
        >
          <template slot="newCode" slot-scope="text, record">
            <div class="model-item">
              <a-input
                v-model="record.newCode"
                :placeholder="$t('languages.Apps.PlzFillInSubsheetCode')"
                :maxLength="28"
                @change="inputChange"
              />
            </div>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane v-if="list.bizFormsList.length !== 0" key="3" forceRender>
        <span slot="tab"> 表单 </span>
        <a-input
          v-model="searchFormModelText"
          placeholder="请输入表单名称"
          class="input-search"
          style="width: 260px; margin-bottom: 8px"
          @pressEnter="getFormModelItem"
        >
          <a-icon
            v-if="searchFormModelText.length > 0"
            slot="suffix"
            class="suffix-icon close-icon"
            type="close-circle"
            @click="clearKeyword"
          />

          <a-icon
            slot="suffix"
            class="suffix-icon"
            type="search"
            @click="getFormModelItem"
          />
        </a-input>
        <a-table
          :pagination="false"
          :columns="bizFormsColumns"
          :data-source="getFormModelItem()"
        >
          <template slot="newCode" slot-scope="text, record">
            <a-input
              v-model="record.newCode"
              type="text"
              placeholder="请输入"
              :maxLength="24"
              @change="inputChange"
            />
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane v-if="list.workflowsList.length !== 0" key="4">
        <span slot="tab"> 流程 </span>
        <a-table
          :pagination="false"
          :columns="workflowsColumns"
          :data-source="list.workflowsList"
        >
          <template slot="newCode" slot-scope="text, record">
            <a-input
              v-model="record.newCode"
              type="text"
              placeholder="请输入"
              :maxLength="28"
              @change="inputChange"
            />
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane v-if="list.reportsList.length !== 0" key="5">
        <span slot="tab"> 报表<i style="color: red">*</i> </span>
        <a-table
          :pagination="false"
          :columns="reportColumns"
          :data-source="list.reportsList"
        >
          <template slot="newCode" slot-scope="text, record">
            <a-input
              v-model="record.newCode"
              type="text"
              placeholder="请输入"
              :maxLength="28"
              @change="inputChange"
            />
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Icon, Input, Table, Tabs } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import ImportStrategy from './importStrategy/importStrategy';

@Component({
  name: 'updateCode',
  components: {
    AIcon: Icon,
    AInput: Input,
    ATable: Table,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class UpdateCode extends Vue {
  @Prop() list!: any;

  @Prop() repeated!: any; //记录模型是否重复

  @Prop() isCoverable!: any;

  @Prop() strategy!: ImportStrategy;

  mounted() {
    this.strategy.afterUpdateMounted(this);
  }

  tabKey: string = '1';

  sheetColumns: any[] = [
    {
      title: '子表',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  codeColumns: any[] = [
    {
      title: '模型',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  bizFormsColumns: any[] = [
    {
      title: '表单',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  workflowsColumns: any[] = [
    {
      title: '流程',
      key: 'workflowName',
      dataIndex: 'workflowName',
    },
    {
      title: '原编码',
      key: 'workflowCode',
      dataIndex: 'workflowCode',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  reportColumns: any[] = [
    {
      title: '报表',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '原编码',
      key: 'code',
      dataIndex: 'code',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  searchSubCodeText: string = '';

  getSubCodeItem() {
    return this.list.sheetList.filter(
      (el) => el.name.indexOf(this.searchSubCodeText) > -1,
    );
  }

  clearSubCodeText() {
    this.searchSubCodeText = '';
    this.getSubCodeItem();
  }

  searchFormModelText: string = '';

  getFormModelItem() {
    return this.list.bizFormsList.filter(
      (el) => el.name.indexOf(this.searchFormModelText) > -1,
    );
  }

  clearKeyword() {
    this.searchFormModelText = '';
    this.getFormModelItem();
  }

  // 切换tab
  tabClick(val) {
    this.tabKey = val;
  }

  submit() {
    return this.strategy.updateCodeSubmit(this);
  }

  inputChange() {
    this.$emit('inputChange', this.list);
  }
}
</script>

<style lang="less">
@import '~@/styles/import/update-code.less';
</style>
