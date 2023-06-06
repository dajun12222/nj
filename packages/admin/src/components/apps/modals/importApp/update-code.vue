<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="update-code">
    <div class="table-box">
      <div class="table-box-tip">
        <span class="icon aufontAll warning">&#xe99a;</span>
        <span class="file-status-txt">检测到编码重名，修改后导入将生成新的应用或业务模型</span>
      </div>
      <a-tabs :activeKey="tabKey" @tabClick="tabClick">
        <a-tab-pane
          v-if="
            (type.appCodeRepeat || type.recycleCodeRepeat) &&
            list.appCodeList.length > 0
          "
          key="1"
        >
          <span slot="tab"> 应用<i style="color: red">*</i> </span>

          <a-table
            :pagination="false"
            :columns="appCodeColumns"
            :data-source="list.appCodeList"
          >
            <template slot="newCode" slot-scope="text, record">
              <div class="model-item">
                <a-input
                  v-model="record.newCode"
                  :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                  :maxLength="28"
                />
              </div>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane
          v-if="type.modelCodeRepeat && list.modelCodeList.length > 0"
          key="2"
        >
          <span slot="tab"> 模型<i style="color: red">*</i> </span>

          <a-table
            :pagination="false"
            :columns="modelCodeColumns"
            :data-source="list.modelCodeList"
          >
            <template slot="newCode" slot-scope="text, record">
              <div class="model-item">
                <a-input
                  v-model="record.newCode"
                  :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                  :maxLength="24"
                />
              </div>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane
          v-if="type.modelCodeRepeat && list.subCodeList.length > 0"
          key="3"
        >
          <span slot="tab"> 子表<i style="color: red">*</i> </span>
          <InputSearch
            v-model="searchSubCodeText"
            placeholder="请输入子表名称"
            style="width: 260px; margin-bottom: 8px"
            :isAsync="true"
            :allowClear="true"
          />
          <template v-for="(item, key) in subClassificationList">
            <div :key="key" class="collapse">
              <div class="collapse-title" @click="toogleShow(item)">
                <span class="collapse-icon">
                  <a-icon v-if="item[0].show" type="right" />
                  <a-icon v-else type="down" />
                </span>
                <span>{{ item[0].parentSchemaName }}</span>
              </div>
              <div
                v-show="!item[0].show && getSubCodeItem(item).length"
                class="collapse-content"
              >
                <a-table
                  :pagination="false"
                  :columns="modelCodeColumns"
                  :data-source="getSubCodeItem(item)"
                >
                  <template slot="newCode" slot-scope="text, record">
                    <div class="model-item">
                      <a-input
                        v-model="record.newCode"
                        :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                        :maxLength="28"
                      />
                    </div>
                  </template>
                </a-table>
              </div>
            </div>
          </template>
        </a-tab-pane>

        <a-tab-pane v-if="Object.keys(list.formModelMap).length" key="4">
          <span slot="tab"> 表单 </span>
          <InputSearch
            v-model="searchFormModelText"
            placeholder="请输入表单名称"
            style="width: 260px; margin-bottom: 8px"
            :isAsync="true"
            :allowClear="true"
          />
          <template v-for="(item, key) in list.formModelMap">
            <div :key="key" class="collapse">
              <div class="collapse-title" @click="toogleShow(item)">
                <span class="collapse-icon">
                  <a-icon v-if="item[0].show" type="right" />
                  <a-icon v-else type="down" />
                </span>
                <span>{{ item[0].schemaName }}</span>
              </div>
              <div
                v-show="!item[0].show && getFormModelItem(item).length"
                class="collapse-content"
              >
                <a-table
                  :pagination="false"
                  :columns="formModelColumns"
                  :data-source="getFormModelItem(item)"
                >
                  <template slot="newCode" slot-scope="text, record">
                    <div class="model-item">
                      <a-input
                        v-model="record.newCode"
                        :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                        :maxLength="24"
                      />
                    </div>
                  </template>
                </a-table>
              </div>
            </div>
          </template>
        </a-tab-pane>

        <a-tab-pane v-if="list.workflowList.length" key="5">
          <span slot="tab"> 流程 </span>

          <a-table
            :pagination="false"
            :columns="workflowColumns"
            :data-source="list.workflowList"
          >
            <template slot="newCode" slot-scope="text, record">
              <div class="model-item">
                <a-input
                  v-model="record.newCode"
                  :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                  :maxLength="28"
                />
              </div>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane v-if="list.reportCodeList.length" key="6">
          <span slot="tab"> 报表<i style="color: red">*</i> </span>

          <a-table
            :pagination="false"
            :columns="reportColumns"
            :data-source="list.reportCodeList"
          >
            <template slot="newCode" slot-scope="text, record">
              <div class="model-item">
                <a-input
                  v-model="record.newCode"
                  :placeholder="$t('languages.Apps.PlzFillInNewCode')"
                  :maxLength="28"
                />
              </div>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts">
import { Input, Table, Tabs, Icon } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

@Component({
  name: 'update-code',
  components: {
    AInput: Input,
    ATable: Table,
    AIcon: Icon,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    InputSearch,
  },
})
export default class UpdateCode extends Vue {
  @Prop() type!: any;

  /*
  {
    appCodeList: [],
    modelCodeList: []
  }
  */
  @Prop() list!: any;

  initTabKey() {
    const appLen = this.list.appCodeList.length;
    const modelLen = this.list.modelCodeList.length;
    const subLen = this.list.subCodeList.length;
    const reportLen = this.list.reportCodeList.length;
    if (appLen === 0 && modelLen > 0) {
      this.tabKey = '2';
    } else if (appLen === 0 && modelLen === 0 && subLen > 0) {
      this.tabKey = '3';
    } else if (appLen === 0 && reportLen > 0) {
      this.tabKey = '6';
    } else if (appLen === 0 && modelLen === 0 && subLen === 0) {
      this.tabKey = '4';
    } else {
      //Else Empty block statement
    }
  }

  mounted() {
    this.initTabKey();
  }

  toogleShow(item) {
    this.$set(item[0], 'show', !item[0].show);
    this.$nextTick(() => {
      console.log(item);
      this.$forceUpdate();
    });
  }

  get subClassificationList() {
    const res: any = {};
    const subCodeList = this.list.subCodeList;
    this.list.subCodeList.forEach((el: any) => {
      if (res[el.parentSchemaCode]) {
        res[el.parentSchemaCode].push(el);
      } else {
        res[el.parentSchemaCode] = [el];
      }
    });
    return res;
  }

  searchFormModelText: string = '';

  getFormModelItem(item) {
    return item.filter(
      (el) => el.sheetName.indexOf(this.searchFormModelText) > -1,
    );
  }

  searchSubCodeText: string = '';

  getSubCodeItem(item) {
    return item.filter(
      (el) => el.modelName.indexOf(this.searchSubCodeText) > -1,
    );
  }

  // 切换tab
  tabClick(val) {
    this.tabKey = val;
  }

  tabKey: string = '1';

  appCodeColumns: any[] = [
    {
      title: '应用',
      key: 'appName',
      dataIndex: 'appName',
    },
    {
      title: '原编码',
      key: 'appCode',
      dataIndex: 'appCode',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  workflowColumns: any[] = [
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

  modelCodeColumns: any[] = [
    {
      title: '模型',
      key: 'modelName',
      dataIndex: 'modelName',
    },
    {
      title: '原编码',
      key: 'modelCode',
      dataIndex: 'modelCode',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  formModelColumns: any[] = [
    {
      title: '表单',
      key: 'sheetName',
      dataIndex: 'sheetName',
    },
    {
      title: '原编码',
      key: 'sheetCode',
      dataIndex: 'sheetCode',
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
      key: 'reportName',
      dataIndex: 'reportName',
    },
    {
      title: '原编码',
      key: 'reportCode',
      dataIndex: 'reportCode',
    },
    {
      title: '新编码',
      key: 'newCode',
      dataIndex: 'newCode',
      scopedSlots: { customRender: 'newCode' },
    },
  ];

  getCodeList() {
    let existEmptyAppcode: boolean = false;
    let existEmptyModelcode: boolean = false;
    let existEmptySubCode: boolean = false;
    let exitstEmptyReportCode: boolean = false;
    let existValidAppcode: boolean = false;
    let existValidModelcode: boolean = false;
    let existValidSubCode: boolean = false;
    let exitstValidReportCode: boolean = false;
    if (this.list.appCodeList.length > 0) {
      // 应用
      existEmptyAppcode = this.list.appCodeList.some(
        (item: any) => !item.newCode,
      );
      existValidAppcode = this.list.appCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/.test(item.newCode),
      );
    }

    if (this.list.modelCodeList.length > 0) {
      // 模型
      existEmptyModelcode = this.list.modelCodeList.some(
        (item: any) => !item.newCode,
      );
      existValidModelcode = this.list.modelCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,23}$/.test(item.newCode),
      );
    }

    if (this.list.subCodeList.length > 0) {
      // 子表
      existEmptySubCode = this.list.subCodeList.some(
        (item: any) => !item.newCode,
      );
      existValidSubCode = this.list.subCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/.test(item.newCode),
      );
    }

    if (this.list.reportCodeList.length > 0) {
      // 报表
      exitstEmptyReportCode = this.list.reportCodeList.some(
        (item: any) => !item.newCode,
      );
      exitstValidReportCode = this.list.reportCodeList.some(
        (item: any) => !/^[a-zA-Z][a-zA-Z0-9_]{0,27}$/.test(item.newCode),
      );
    }

    if (
      existEmptyModelcode ||
      existEmptyAppcode ||
      existEmptySubCode ||
      exitstValidReportCode
    ) {
      let type = '应用';
      if (existEmptyAppcode) {
        this.tabKey = '1';
        type = '应用';
      } else if (existEmptyModelcode) {
        this.tabKey = '2';
        type = '模型';
      } else if (existEmptySubCode) {
        this.tabKey = '3';
        type = '子表';
      } else {
        this.tabKey = '6';
        type = '报表';
      }
      this.$message.error(type + '新编码不能为空');
      return null;
    }

    if (
      existValidAppcode ||
      existValidModelcode ||
      existValidSubCode ||
      exitstValidReportCode
    ) {
      let type = '应用';
      if (existValidAppcode) {
        this.tabKey = '1';
        type = '应用';
      } else if (existValidModelcode) {
        this.tabKey = '2';
        type = '模型';
      } else if (existValidSubCode) {
        this.tabKey = '3';
        type = '子表';
      } else {
        this.tabKey = '6';
        type = '报表';
      }

      this.$message.error(
        type +
          `编码格式必须以字母开头不超过${
            !existValidAppcode ? (!existValidModelcode ? 28 : 24) : 28
          }个字符，仅支持字母、数字、下划线`,
      );
      return null;
    }
    return this.list;
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/import/update-code.less';
</style>
