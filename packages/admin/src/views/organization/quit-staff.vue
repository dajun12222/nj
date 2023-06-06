<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="quit-staff">
    <div class="search__input">
      <a-input
        ref="searchInput"
        v-model="searchVal"
        class="seach-input"
        :placeholder="$t('languages.PlaceHolder.SearchByName')"
        @pressEnter="filterTable"
      >
        <a-icon
          v-if="searchVal.length > 0"
          slot="suffix"
          class="suffix-icon close-icon"
          type="close-circle"
          @click="clearSearchVal"
        />

        <a-icon
          slot="suffix"
          class="suffix-icon"
          type="search"
          @click="filterTable"
        />
      </a-input>
    </div>
    <div v-show="isEmpty" class="empty-box">
      <img class="user-empty" src="../../assets/images/userEmpty.png" />
      <div>{{ $t('languages.NoUser') }}</div>
    </div>
    <div v-show="userList.length" class="table-wrap">
      <a-table
        class="table-user-list"
        :class="{ 'scroll-bottom': true }"
        :columns="tableColums"
        :dataSource="userList"
        :pagination="false"
        :loading="isLoading"
        :scroll="{ y: 430 }"
        :customRow="onRowClick"
        :rowKey="(record) => record.id"
      >
        <span slot="indexTitle" style="font-weight: 600; white-space: nowrap">{{
          $t('languages.NO')
        }}</span>
        <span slot="nameTitle" class="resize">{{ $t('languages.Name') }}</span>
        <span slot="userIdTitle" class="resize">{{
          $t('languages.User.UserAccount')
        }}</span>
        <span slot="roleNameTitle" class="resize">{{
          $t('languages.Roles')
        }}</span>
        <span slot="mobileTitle" class="resize">{{
          $t('languages.User.MobilePhone')
        }}</span>
        <span slot="emailTitle" class="resize">{{
          $t('languages.User.Email')
        }}</span>
        <span slot="operationTitle" class="resize">{{
          $t('languages.Operation')
        }}</span>

        <p slot="name" slot-scope="text" class="cursor text-ellipsis">
          <a-tooltip placement="top">
            <span v-if="searchVal" class="name-span" :title="text">
              <template
                v-for="(fragment, i) in text.split(
                  new RegExp(`(${searchVal})|(?=${searchVal})`, 'i'),
                )"
              >
                <span
                  v-if="fragment.toLowerCase() === searchVal.toLowerCase()"
                  :key="i"
                  class="highlight"
                  >{{ fragment }}</span>
                <template v-else>{{ fragment }}</template>
              </template>
            </span>
            <span v-else class="name-span" :title="text">{{ text }}</span>
          </a-tooltip>
        </p>
        <p slot="userId" slot-scope="text" class="cursor text-ellipsis">
          <span v-if="searchVal" :title="text">
            <template
              v-for="(fragment, i) in text.split(
                new RegExp(`(${searchVal})|(?=${searchVal})`, 'i'),
              )"
            >
              <span
                v-if="fragment.toLowerCase() === searchVal.toLowerCase()"
                :key="i"
                class="highlight"
                >{{ fragment }}</span>
              <template v-else>{{ fragment }}</template>
            </template>
          </span>
          <span v-else :title="text">{{ text }}</span>
        </p>

        <p slot="role" slot-scope="text" class="text-ellipsis">
          <a-tooltip placement="top">
            <template slot="title">
              <span>{{ text }}</span>
            </template>
            <span>{{ text }}</span>
          </a-tooltip>
        </p>
        <span slot="mobile" slot-scope="text" class="text-ellipsis">{{
          text
        }}</span>
        <span slot="email" slot-scope="text" class="text-ellipsis">{{
          text
        }}</span>
        <div
          slot="operation"
          slot-scope="text, record"
          class="operation"
          @click.stop="() => {}"
        >
          <i class="cursor" @click.self.stop="showModel(record)">工作交接</i>
        </div>
      </a-table>
    </div>
    <div v-show="!isEmpty" class="load-more">
      <span v-if="isShowLoadMore" @click="loadMore">{{
        $t('languages.ClickToLoadMore')
      }}</span>
      <span v-if="isLoadAll" class="text">{{
        $t('languages.HasLoadedAllData')
      }}</span>
    </div>

    <!-- 工作交接弹框 -->
    <a-drawer
      :title="$t('languages.TaskTransfer.TaskTransfer', { name: userName })"
      width="850"
      placement="right"
      :closable="true"
      :visible="visible"
      wrapClassName="task-transfer-drawer"
      :destroyOnClose="true"
      @close="onClose"
    >
      <TaskTransfer :userid="userid" />
    </a-drawer>

    <!--用户信息弹框-->
    <a-drawer
      :title="$t('languages.User.UserInformation')"
      width="850"
      placement="right"
      :closable="true"
      :visible="infoVisible"
      wrapClassName="user-info-drawer"
      @close="onCloseInfoModal"
    >
      <UserInfo :onlyView="true" @closeDrawer="onCloseInfoModal" />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import OrgApi from '@/apis/organization';
import { Input, Icon, Table, Tooltip, Drawer } from '@h3/antd-vue';
import { mixins } from 'vue-class-component';
import { Component } from 'vue-property-decorator';
import TaskTransfer from '../../components/organization/taskTransfer/index.vue';
import UserInfo from '../../components/organization/userInfo.vue';
import OrgMixins from './mixins/org';

@Component({
  name: 'quitStaff',
  components: {
    TaskTransfer,
    UserInfo,
    AInput: Input,
    AIcon: Icon,
    ATable: Table,
    ATooltip: Tooltip,
    ADrawer: Drawer,
  },
})
export default class QuitStaff extends mixins(OrgMixins) {
  // 数据
  userList: any = [];

  curPage: number = 0;

  size: number = 40;

  isEmpty: boolean = false;

  isLoading: boolean = true;

  // 是否显示加载更多按钮
  isShowLoadMore: boolean = false;

  // 是否全部加载完
  isLoadAll: boolean = false;

  searchVal: string = '';

  mounted() {
    this.searchDemissionUsers();
  }

  async searchDemissionUsers() {
    const { curPage, size } = this;
    const params: Organization.searchResignUserParams = {
      page: curPage,
      size,
      wd: this.searchVal,
    };

    this.isLoading = true;

    const res: any = await OrgApi.searchDemissionUsers(params);

    this.isLoading = false;

    const { errcode, errmsg, data } = res;

    if (errcode === 0) {
      const { content } = data;
      this.isEmpty = data.totalElements <= 0;
      this.userList = this.userList.concat(content);
      this.userList.forEach((item: any, index: number) => {
        item.index = index + 1;
      });
      this.isShowLoadMore = this.userList.length < data.totalElements;
      this.isLoadAll = !this.isShowLoadMore;
    } else {
      this.$message.error(errmsg);
    }
  }

  // 搜索高亮
  filterTable() {
    this.searchVal = this.searchVal.trim();
    this.curPage = 0;
    this.userList = [];
    this.searchDemissionUsers();
  }

  clearSearchVal() {
    this.searchVal = '';
    this.curPage = 0;
    this.userList = [];
    this.searchDemissionUsers();
  }

  /**
   * 点击行，弹出人员信息
   * */

  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {
          this.showInfoModal(record.id);
        },
        mouseenter: () => {
          record.hover = true;
          this.$forceUpdate();
        },
        mouseleave: () => {
          record.hover = false;
          this.$forceUpdate();
        },
      },
    };
  }

  loadMore() {
    this.curPage += 1;
    this.searchDemissionUsers();
  }
}
</script>
<style lang="less">
.quit-staff {
  padding: 16px 0 8px 0;
  margin: 0 26px;
  .search__input {
    margin-bottom: 10px;
    display: flex;
    justify-content: flex-end;
    .ant-input-affix-wrapper {
      width: 300px;
      .seach-input.ant-input {
        padding-right: 52px;
      }
      .close-icon {
        color: rgba(17, 18, 24, 0.25);
        margin-right: 12px;
      }
    }
  }
  div.empty-box {
    text-align: center;
    .user-empty {
      margin: 0px auto;
      margin-top: 150px;
    }
  }
  .load-more {
    text-align: center;
    padding: 6px 0;
    span {
      padding: 11px 0;
      color: rgba(17, 18, 24, 0.5);
      font-weight: 400;
      font-size: 12px;
      cursor: pointer;
    }
    .text {
      cursor: default;
    }
  }
}
</style>
<style lang="less" scoped>
@import '../../styles/table.less';
</style>
