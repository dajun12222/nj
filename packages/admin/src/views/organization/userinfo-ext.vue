<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="userExt">
    <div class="userExt__new">
      <h3>用户信息拓展表</h3>
      <div>
        <a-button
          v-show="rowSelection.selectedRowKeys.length > 0 && isSysAdmin"
          class="userExt__button"
          @click="batchDelete"
        >
          批量删除
        </a-button>
        <a-button
          v-if="isSysAdmin"
          type="primary"
          class="userExt__button"
          @click="showAddUserExt"
        >
          新建
        </a-button>
      </div>
    </div>
    <div v-show="totalPage === 0" class="empty-box">
      <img class="user-empty" src="../../assets/images/userEmpty.png" />
      <div>暂无数据</div>
    </div>
    <!-- 列表 -->
    <div v-show="totalPage > 0" class="userExt__table">
      <a-table
        class="table-user-list"
        :loading="isLoading"
        :columns="columns"
        :dataSource="userExtList"
        :pagination="false"
        :scroll="{ y: 500 }"
        :locale="{ emptyText: $t('languages.NoRelevantData') }"
        :customRow="onRowClick"
        :customHeaderRow="onHeaderRow"
        :rowKey="(record) => record.id"
      >
        <span
          slot="indexTitle"
          class="index"
          style="font-weight: 500; white-space: nowrap"
        >
          <a-checkbox
            v-show="showSelectAllBox || !isBatchOperate"
            v-model="isSelectAll"
            :indeterminate="!indeterminate"
            @change.stop="selectAll"
          />
          <span v-show="!showSelectAllBox && isBatchOperate" class="text">{{
            $t('languages.NO')
          }}</span>
        </span>
        <!-- 表体 -->
        <span slot="index" slot-scope="text, record" class="text-ellipsis">
          <a-checkbox
            v-show="record.checks || record.hover"
            v-model="record.checks"
            @change.stop="onItemCheckboxChange(record.id, record.checks)"
          />
          <span v-show="!record.checks && !record.hover">{{
            getIndex(record.id)
          }}</span>
        </span>
        <span slot="belong" slot-scope="text, record" class="text-ellipsis">{{
          getGroupName(record.belong)
        }}</span>
        <span slot="corpId" slot-scope="text, record" class="text-ellipsis">{{
          getCorpName(record.corpId)
        }}</span>
        <span slot="enable" slot-scope="text, record">
          <a-switch :checked="!!record.enable" :disabled="true" />
        </span>
        <span
          slot="action"
          slot-scope="text, record"
          class="userExt__actions operation"
        >
          <i v-if="isSysAdmin" @click="onEditItem(record)">编辑</i>
          <i v-if="isSysAdmin" @click="onDeleteItem(record)">删除</i>
        </span>
      </a-table>
    </div>
    <div class="userExt__footer">
      <div v-show="totalPage > 0">
        <a-pagination
          :defaultPageSize="params.size"
          :total="totalPage"
          :showTotal="(total) => `共${totalPage}条`"
          :current="params.page + 1"
          :pageSizeOptions="pageSizeOptions"
          showSizeChanger
          showQuickJumper
          @change="pageChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
    </div>
    <userinfo-ext-dialog
      :isShowUserExt="isShowUserExt"
      :formData="formData"
      @cancel="cancel"
      @action="action"
    />
  </div>
</template>

<script lang="ts">
import OAuthApi from '@/apis/oauth';
import { addUserExt, deleteUserExt, getUserExtList } from '@/apis/organization';
import {
  Button,
  ConfigProvider,
  Pagination,
  Checkbox,
  Switch,
  Table,
} from '@h3/antd-vue';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import userinfoExtDialog from './userinfo-ext-dialog.vue';
const UserModule = namespace('Organization/User');
@Component({
  name: 'userinfo-ext',
  components: {
    userinfoExtDialog,
    AConfigProvider: ConfigProvider,
    AButton: Button,
    ATable: Table,
    APagination: Pagination,
    ASwitch: Switch,
    ACheckbox: Checkbox,
  },
})
export default class UserinfoExt extends Vue {
  @UserModule.Mutation('setUserExt') setUserExt: any;

  //表头信息
  columns: Array<Common.TableHead> = [
    {
      dataIndex: 'index',
      slots: { title: 'indexTitle' },
      scopedSlots: { customRender: 'index' },
      width: 80,
      align: 'center',
    },
    {
      dataIndex: 'code',
      // width: 150,
      title: '扩展字段编码',
      align: 'left',
    },
    {
      dataIndex: 'name',
      // width: 150,
      title: '扩展字段名称',
      align: 'left',
    },
    {
      dataIndex: 'corpId',
      // width: 120,
      title: '所属组织',
      scopedSlots: { customRender: 'corpId' },
      align: 'left',
    },
    {
      dataIndex: 'belong',
      width: 120,
      title: '所属分组',
      scopedSlots: { customRender: 'belong' },
      align: 'left',
    },
    {
      dataIndex: 'mapKey',
      width: 120,
      title: '匹配字段',
      align: 'left',
    },
    {
      dataIndex: 'enable',
      width: 100,
      title: '是否启用',
      scopedSlots: { customRender: 'enable' },
      align: 'left',
    },
    {
      dataIndex: 'action',
      title: '操作',
      scopedSlots: { customRender: 'action' },
      key: 'action',
      align: 'left',
      width: 140,
    },
  ];

  isShowUserExt: boolean = false;

  // 拓展字段列表
  userExtList: Array<any> = [];

  //是否正在加载列表
  isLoading: boolean = true;

  formData: any = {
    name: '',
    corpId: undefined,
    belong: undefined,
    mapKey: undefined,
    enable: true,
  };

  rowSelection = {
    selectedRowKeys: new Array<string>(),
    onChange: (selectedRowKeys, selectedRows) => {
      this.rowSelection.selectedRowKeys = selectedRows.map((x) => x.id);
    },
  };

  totalPage: number = 0;

  pageSizeOptions: Array<string> = ['10', '20', '50', '100'];

  params: any = {
    page: 0,
    size: 20,
  };

  isSysAdmin: boolean = true;

  orgList: Array<any> = [];

  groupList: Array<any> = [
    {
      key: 'base',
      name: '基本信息',
    },
    {
      key: 'contact',
      name: '联系方式',
    },
    {
      key: 'org',
      name: '员工信息',
    },
    {
      key: 'other',
      name: '其它信息',
    },
  ];

  showSelectAllBox: boolean = false;

  isSelectAll: boolean = false;

  get isBatchOperate() {
    return !this.userExtList.filter((list: any) => list.checks).length;
  }

  get indeterminate() {
    const length: number = this.userExtList.length;
    const checkedLength: number = this.userExtList.filter(
      (list: any) => list.checks,
    ).length;
    return !checkedLength || checkedLength === length;
  }

  async created() {
    const sessionUserStr = window.sessionStorage.getItem('user');
    let userInfo: any = null;
    if (sessionUserStr) {
      userInfo = JSON.parse(sessionUserStr);
    }
    this.isSysAdmin =
      userInfo.permissions.includes('SYS_MNG') ||
      userInfo.permissions.includes('ADMIN');
    if (!this.isSysAdmin) {
      this.columns = [
        {
          dataIndex: 'index',
          title: '序号',
          scopedSlots: { customRender: 'index' },
          width: 110,
          align: 'center',
        },
        {
          dataIndex: 'code',
          width: 150,
          title: '扩展字段编码',
          align: 'left',
        },
        {
          dataIndex: 'name',
          width: 150,
          title: '扩展字段名称',
          align: 'left',
        },
        {
          dataIndex: 'corpId',
          width: 150,
          title: '所属组织',
          scopedSlots: { customRender: 'corpId' },
          align: 'left',
        },
        {
          dataIndex: 'belong',
          width: 150,
          title: '所属分组',
          scopedSlots: { customRender: 'belong' },
          align: 'left',
        },
        {
          dataIndex: 'mapKey',
          width: 150,
          title: '匹配字段',
          align: 'left',
        },
        {
          dataIndex: 'enable',
          width: 100,
          title: '是否启用',
          scopedSlots: { customRender: 'enable' },
          align: 'left',
        },
      ];
    }
    const res: any = await OAuthApi.getDepts();
    if (res.errcode === 0) {
      this.orgList = res.data;
    }
  }

  mounted() {
    this.getUserExtList();
  }

  onItemCheckboxChange(rowKey: string, check: boolean) {
    if (check) {
      this.rowSelection.selectedRowKeys.push(rowKey);
    } else {
      if (this.rowSelection.selectedRowKeys.length > 0) {
        for (let i = 0; i < this.rowSelection.selectedRowKeys.length; i++) {
          if (this.rowSelection.selectedRowKeys[i] === rowKey) {
            this.rowSelection.selectedRowKeys.splice(i, 1);
          }
        }
      }
    }
    const isCheckedItems = this.userExtList.filter((d: any) => d.checks);
    if (isCheckedItems.length < this.userExtList.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
    this.userExtList = [...this.userExtList];
  }

  // table行点击事件
  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {},
        mouseenter: () => {
          record.hover = true;
          for (const con of this.userExtList) {
            if (con.id === record.id) {
              con.hover = true;
            }
          }
          this.userExtList = [...this.userExtList];
        },
        mouseleave: () => {
          record.hover = false;
          for (const con of this.userExtList) {
            if (con.id === record.id) {
              con.hover = false;
            }
          }
          this.userExtList = [...this.userExtList];
        },
      },
    };
  }

  // table行点击事件
  onHeaderRow(column: any, index: number) {
    return {
      on: {
        mouseenter: () => {
          this.showSelectAllBox = true;
        },
        mouseleave: () => {
          this.showSelectAllBox = false;
        },
      },
    };
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.userExtList.forEach((item: any) => {
        this.rowSelection.selectedRowKeys.push(item.id);
        item.checks = true;
      });
    } else {
      this.userExtList.forEach((item: any) => {
        item.checks = false;
      });
      this.rowSelection.selectedRowKeys = [];
    }
    this.userExtList = [...this.userExtList];
  }

  getGroupName(belongCode) {
    const belongItem = this.groupList.find((item) => item.key === belongCode);
    if (belongItem) {
      return belongItem.name;
    }
    return '未定义分组';
  }

  getCorpName(corpId) {
    const corpItem = this.orgList.find((item) => item.corpId === corpId);
    if (corpItem) {
      return corpItem.name;
    }
    return '未定义组织';
  }

  getIndex(id) {
    const currentIndex = this.userExtList.findIndex((item) => {
      return item.id === id;
    });
    return this.params.page * this.params.size + currentIndex + 1;
  }

  // 分页 page change 回调
  pageChange(page: number, pageSize: number) {
    this.params.page = page - 1;
    this.params.size = pageSize;
    this.getUserExtList();
  }

  /**
   * 修改分页大小
   */
  pageSizeChange(current: number, pageSize: number) {
    this.params.page = 0;
    this.params.size = pageSize;
    this.getUserExtList();
  }

  getUserExtList() {
    this.isLoading = true;
    const userExtparams: Organization.searchDemissionUserParams = {
      page: this.params.page,
      size: this.params.size,
    };
    getUserExtList(userExtparams)
      .then((res: Common.Data) => {
        console.log('getUserExtList:', res);
        if (res.errcode === 0 && res.data && Array.isArray(res.data.content)) {
          this.userExtList = res.data.content;
          this.totalPage = res.data.totalElements;
          if (Array.isArray(this.userExtList) && this.userExtList.length > 0) {
            for (const con of this.userExtList) {
              con.checks = false;
              con.hover = false;
            }
          }
        }
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  showAddUserExt() {
    this.formData = {
      name: '',
      code: '',
      corpId: undefined,
      belong: undefined,
      mapKey: undefined,
      enable: true,
    };
    const cacheInfo: any = {
      orgList: this.orgList,
      groupList: this.groupList,
      title: '新增拓展字段',
    };
    this.setUserExt(cacheInfo);
    this.isShowUserExt = true;
  }

  onEditItem(record) {
    this.formData = {
      id: record.id,
      code: record.code,
      name: record.name,
      corpId: record.corpId,
      belong: record.belong,
      mapKey: record.mapKey,
      enable: !!record.enable,
    };
    const cacheInfo: any = {
      orgList: this.orgList,
      groupList: this.groupList,
      title: '编辑拓展字段',
    };
    this.setUserExt(cacheInfo);
    this.isShowUserExt = true;
  }

  onDeleteItem(record) {
    const self = this;
    this.$confirm({
      title: '确定删除该拓展字段吗?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        deleteUserExt({ ids: record.id })
          .then((res) => {
            if (res.errcode === 0) {
              self.$message.success('删除成功');
              self.getUserExtList();
            } else {
              self.$message.error(res.errmsg as string);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
    });
  }

  batchDelete() {
    const self = this;
    const ids = this.rowSelection.selectedRowKeys.join();
    this.$confirm({
      title: '确定批量删除这些拓展字段吗?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        deleteUserExt({ ids: ids })
          .then((res) => {
            if (res.errcode === 0) {
              self.$message.success('删除成功');
              self.rowSelection.selectedRowKeys = [];
              self.getUserExtList();
            } else {
              self.$message.error(res.errmsg as string);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
    });
  }

  cancel() {
    this.isShowUserExt = false;
  }

  action(val) {
    addUserExt(val)
      .then((res) => {
        if (res.errcode === 0) {
          this.$message.success('操作成功');
          this.isShowUserExt = false;
          this.getUserExtList();
        } else {
          this.$message.error(res.errmsg as string);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  get locale() {
    switch (this.$i18n.locale) {
      case 'zh':
      default:
        return zhCN;

      case 'en':
        return enUS;
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/table.less';
.userExt {
  position: relative;
  padding: 0 24px;
  &__new {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    h3 {
      font-size: 18px;
      font-weight: 500;
      color: #111218;
      line-height: 26px;
    }
    .close-icon {
      color: rgba(17, 18, 24, 0.25);
      margin-right: 12px;
    }
  }
  & > div.empty-box {
    text-align: center;
    .user-empty {
      margin: 0px auto;
      margin-top: 150px;
    }
  }
  &__button {
    margin-left: 12px;
    padding: 0 10px;
    i {
      font-size: 12px;
    }
  }
  &__actions {
    i {
      cursor: pointer;
    }
    i:last-child {
      padding-right: 0;
    }
  }
  &__footer {
    border-top: thin solid #eee;
    position: fixed;
    bottom: 5px;
    right: 20px;
    & > div {
      float: right;
      padding: 8px 0;
      margin-right: 24px;
    }
    /deep/.ant-pagination-options-quick-jumper input {
      vertical-align: top;
    }
    /deep/.ant-pagination-options {
      height: 32px;
    }
  }
  &__form {
    &,
    /deep/ .ant-form-item-required::before {
      top: 0px !important;
    }
  }
}
</style>
<style lang="less">
.userExt-modal {
  .ant-drawer-body {
    padding: 0;
  }
}
</style>
