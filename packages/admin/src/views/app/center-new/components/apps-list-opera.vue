<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="apps-list-opera">
    <div class="opera">
      <div class="left">
        <span>应用列表</span>

        <a-tooltip placement="top">
          <template slot="title">
            <span>新建应用分组</span>
          </template>
          <em
            v-if="isAdmin"
            class="icon aufontAll h-icon-all-card-view-o"
            @click="addGroup({})"
          ></em>
        </a-tooltip>

        <div v-if="searchKey">
          搜索结果<span>{{ searchResultCount }}</span>个
        </div>
      </div>
      <div class="right">
        <!-- v-show="appList && appList.length > 12" -->
        <InputSearch
          v-model="searchKey"
          class="input-search"
          :placeholder="$t('languages.Apps.SearchAppName')"
          :isAsync="true"
          :allowClear="true"
          @search="searchApp"
        />

        <a-button
          type="default"
          class="import-app"
          :disabled="!isAllowAddApp"
          @click="importApp"
        >
          {{ $t('languages.Apps.ImportApp') }}
        </a-button>

        <a-button
          v-if="isAdmin"
          type="primary"
          :disabled="!isAllowAddApp"
          @click="onAddApp"
        >
          {{ $t('languages.Apps.AddApp') }}
        </a-button>
      </div>
    </div>

    <!-- 应用导入 -->
    <ImportApp
      v-model="isShowImportApp"
      :appcode="curAppCode"
      @importSucceed="importSucceed"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import {
  Modal,
  Tooltip,
  Dropdown,
  Menu,
  Button,
  Icon,
  Input,
  Popover,
  Drawer,
} from '@h3/antd-vue';

import ImportApp from '@/components/apps/modals/importApp/index.vue';

const UserModule = namespace('System/User');
const AppCenterModule = namespace('Apps/AppCenter');

import UserGuideApi from '@/apis/system/system-manager.api';

import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

@Component({
  name: 'appsListOpera',
  components: {
    ImportApp,
    AInput: Input,
    AButton: Button,
    InputSearch,
    ATooltip: Tooltip,
  },
})
export default class appsListOpera extends Vue {
  @UserModule.State('isAdmin') isAdmin!: boolean;

  @AppCenterModule.State('appList') appList: any;

  @AppCenterModule.State('appGroupList') appGroupList: any;

  @Prop({ default: () => {} }) addGroup!: Function;

  @Prop({
    default: 0,
  })
  searchResultCount!: number;

  @Provide()
  getgroupInfo() {
    // 用于设置导入默认分组
    const groupInfo = this.appGroupList.find((el) => el.code === 'default');
    return groupInfo;
  }

  @Provide()
  switchGroup(gourpid) {
    this.importSucceed();
  }

  // 是否有权限添加应用
  isAllowAddApp: boolean = false;

  isShowImportApp: boolean = false;

  // 搜索关键字
  searchKey: string = '';

  // 搜索应用列表数组
  isSearchResult: boolean = false;

  // 当前appCode
  curAppCode: string = '';

  // 新建应用
  onAddApp() {
    if (!this.isAllowAddApp) {
      return;
    }
    this.$emit('addApp');
  }

  // 导入应用
  importApp() {
    this.isShowImportApp = true;
  }

  // 导入成功
  importSucceed() {
    this.$emit('importAppSucceed');
  }

  // 获取用户是否有添加、导入应用的权限
  async getSystemManagerAppInfo() {
    const res: any = await UserGuideApi.getSystemManagerAppInfo();
    if (res.errcode === 0) {
      this.isAllowAddApp = res.data;
    }
  }

  searchApp() {
    this.$emit('searchApp', this.searchKey);
  }

  init() {
    this.getSystemManagerAppInfo();
  }

  created() {
    this.init();
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.apps-list-opera {
  position: fixed;
  top: 60px;
  left: 0;
  right: 8px;
  height: 96px;
  padding: 32px 0 24px;
  z-index: 2;
  background: #f7f8fa;
  .opera {
    display: flex;
    justify-content: space-between;
    height: 32px;
    margin: 0 auto;
    .left {
      font-size: 18px;
      color: @nav-font-color;
      display: flex;
      align-items: center;
      span {
        margin-right: 5px;
      }
      em {
        font-size: 18px;
        color: @light-font-color;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
      }
      div {
        margin-left: 24px;
        font-size: 12px;
        padding-top: 5px;
        span {
          color: @primary-color;
          margin-left: 1px;
          margin-right: 1px;
        }
      }
    }
    .right {
      display: flex;
      align-items: center;
      .input-search {
        width: 260px;
        margin-right: 8px;
      }
      /deep/.ant-btn {
        margin-left: 8px;
      }
    }
  }

  @media screen and (max-width: 1500px) {
    .opera {
      width: 1088px;
    }
  }
  @media screen and (min-width: 1500px) {
    .opera {
      width: 1456px;
    }
  }
}
</style>
