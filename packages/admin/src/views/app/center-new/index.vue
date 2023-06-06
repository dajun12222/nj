<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div ref="apps" class="apps apps-wrap">
    <appsListOpera
      :searchResultCount="searchResultCount"
      :addGroup="addGroup"
      @searchApp="searchApp"
      @importAppSucceed="importAppSucceed"
      @addApp="addApp"
    />

    <appsList
      ref="appsListRef"
      :searchKey="searchKey"
      :isAllowAddApp="isAllowAddApp"
      :addGroup="addGroup"
      @editApp="addApp"
      @addAppInGroup="addAppInGroup"
      @onClickApp="onClickApp"
      @searchResultCount="(val) => (searchResultCount = val)"
    />

    <!-- 添加应用 -->
    <AddAppModal
      v-model="showAddModal"
      :catalogues.sync="appGroupList"
      :groupInfo="groupInfo"
      :data="currentApp"
      @updateList="updateList"
      @submitEvent="onClickApp"
    />

    <!-- 添加分组 -->
    <AppGroup
      v-model="showAddGroupModal"
      :groupItem="groupItem"
      @submitGroupEvent="updateList"
    />

    <customLoading v-model="isShowLoading" />
  </div>
</template>

<script lang="ts">
import { Component, Provide, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const icon = require('@/assets/images/appicon.png');

const AppCenterModule = namespace('Apps/AppCenter');

const UserModule = namespace('System/User');

import appsListOpera from './components/apps-list-opera.vue';
import appsList from './components/app-list.vue';

import UserGuideApi from '@/apis/system/system-manager.api';

import AppGroup from '@/components/apps/modals/addGroup.vue';
import AddAppModal from '@/components/apps/modals/addApp.vue';

import * as formApi from '@/apis/form';

import AppItem from '@/apis/apps';

import customLoading from './components/loading.vue';

@Component({
  name: 'AppList',
  components: {
    appsListOpera,
    appsList,
    AddAppModal,
    AppGroup,
    customLoading,
  },
})
export default class AppList extends Vue {
  @AppCenterModule.State('appGroupList') appGroupList: any;

  searchKey: string = '';

  searchResultCount: number = 0;

  isAllowAddApp: boolean = false;

  async getSystemManagerAppInfo() {
    // 获取用户新建应用的权限
    const res: any = await UserGuideApi.getSystemManagerAppInfo();
    if (res.errcode === 0) {
      this.isAllowAddApp = res.data;
    }
  }

  created() {
    this.getSystemManagerAppInfo();
  }

  searchApp(searchKey) {
    this.searchKey = searchKey;
  }

  initAppsListRef() {
    const appsListRef: any = this.$refs.appsListRef;
    appsListRef && appsListRef.init();
  }

  // 导入应用完成
  importAppSucceed() {
    this.initAppsListRef();
  }

  // 添加、编辑应用
  showAddModal: boolean = false;

  groupInfo: any = {};

  currentApp: object = {};

  addApp(item: object = {}) {
    this.currentApp = item;
    this.showAddModal = true;
  }

  addAppInGroup(group) {
    this.groupInfo = group;
    this.addApp();
  }

  /**
   * 重新获取分组列表
   */
  updateList() {
    this.currentApp = {};
    this.initAppsListRef();
  }

  /**
   * @desc 获取最新表单列表
   * @params bizSchemaCode 业务模型编码
   */
  async getFormList(schemaCode: string) {
    const res = await formApi.list(schemaCode);
    if (res.errcode === 0) {
      return res.data;
    }
    return null;
  }

  async getModelHref(data: any[]) {
    if (!data) {
      return '';
    }
    let resHref: string = '';

    let isBizModel: boolean = false;
    let bizInfo: any = null;
    const loop = (data: any[]) => {
      if (!resHref && !isBizModel) {
        data.forEach((el: any) => {
          if (el.type === 'Folder' && el.children) {
            loop(el.children);
          } else if (el.type === 'Page') {
            resHref = `/apps/model/${el.appCode}/${el.code}/customPage`;
          } else if (el.type === 'BizModel') {
            // 模型
            isBizModel = true;
            if (!bizInfo) {
              bizInfo = el;
            }
          } else if (el.type === 'Report') {
            // 报表
            resHref = `/apps/${el.appCode}/report-design/${el.code}/isNew/false`;
          } else {
            //Else Empty block statement
          }
        });
      }
    };

    loop(data);

    if (isBizModel) {
      const res = await this.getFormList(bizInfo.code);
      resHref = `/apps/model/${bizInfo.appCode}/${bizInfo.code}/form-design/${res[0].code}`;
    }

    return resHref;
  }

  isShowLoading: boolean = false;

  /**
   * 点击应用-跳转到
   */
  async onClickApp(code: string) {
    this.isShowLoading = true;

    const res: any = await AppItem.getAppItem({
      appCode: code,
    });

    let href: string = '';
    if (res.errcode === 0) {
      if (res.data.length) {
        href = await this.getModelHref(res.data);
      }
    }
    if (href === '') {
      href = `/apps/noBizModel/${code}/noBizModelpage`;
    }
    this.$router.push(href).then(() => {
      this.isShowLoading = false;
    });
  }

  // 添加、编辑分组
  groupItem: object = {};

  showAddGroupModal: boolean = false;

  addGroup(item: any) {
    this.showAddGroupModal = true;
    this.groupItem = item;
  }
}
</script>
<style lang="less" scoped>
.apps-wrap {
  padding-top: 96px;
  overflow: hidden;
  background: #f7f8fa !important;
  display: flex;
  flex-direction: column;
}
</style>

<style lang="less">
@import '~@/styles/color/colors.less';
.new-modal-style {
  .add-app__wrap {
    padding-bottom: 16px;
    .ant-form-item-label {
      line-height: 22px;
      height: 22px;
      margin-bottom: 6px;
      label {
        span {
          font-size: 14px;
          color: @nav-font-color;
          position: relative;
          em {
            color: red;
            font-style: normal;
            margin-left: 2px;
            position: absolute;
            top: 50%;
            line-height: 4px;
          }
          i {
            margin-left: 16px;
            color: @s-light-font-color;
            font-size: 12px;
          }
        }
      }
    }
    .ant-form-item-control-wrapper {
      display: flex;
      align-items: center;
      & > * {
        flex: 1;
      }
    }
    input {
      color: #111218;
    }
  }
}
</style>
