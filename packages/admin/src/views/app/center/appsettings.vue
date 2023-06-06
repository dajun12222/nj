<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="app-item">
    <!-- 页面菜单 -->
    <div v-resize.east class="app-menu">
      <div class="menu-tree">
        <ul class="menu ant-menu ant-menu-inline ant-menu-root ant-menu-light">
          <li
            v-for="menu in menus"
            :key="menu.code"
            class="sub-menu ant-menu-submenu ant-menu-submenu-inline"
            :class="{ 'ant-menu-submenu-selected': menu.isSelected }"
            @click="clickMenu(menu)"
          >
            <div class="ant-menu-submenu-title all">
              <div class="menu-title">
                <i class="icon aufontAll" :class="menu.icon"></i>
                <span>{{ menu.name }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 内容面板 -->
    <div class="app-router-wrap">
      <div v-if="selectedMenu === 'base'">
        <basic @refresh="refresh" />
      </div>
      <div v-if="selectedMenu === 'permisson'" class="model-wrap">
        <!-- 模型及详细权限列表 -->
        <permission-group-settings
          v-if="showModel && visibleType !== 1"
          :groupName="groupName"
          :groupId="curGroupId"
          @viewModelSettings="handleModelSettings"
        />
        <!-- 批量设置 -->
        <volume-set
          v-else-if="volumeSetModel"
          :groupName="groupName"
          :groupId="curGroupId"
          @viewModelVolumeSet="handleModelVolumeSet"
        />
        <!-- 权限组列表 -->
        <permission-setting
          v-else
          :historyData="historyData"
          :showModel="showModel"
          @clearHistoryName="handleClearName"
          @viewModelSettings="handleModelSettings"
          @refresh="refresh"
          @viewModelVolumeSet="handleModelVolumeSet"
          @visibleTypeChange="visibleTypeChange"
        />
      </div>
      <div v-if="selectedMenu === 'role'">
        <orgrole :appRoute="appRoute" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue,Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import Basic from '../settings/base-setting.vue';
import PermissionGroupSettings from '../settings/components/permission-group-settings.vue';
import VolumeSet from '../settings/components/volumeSet.vue';
import PermissionSetting from '../settings/permission-setting.vue';

import orgrole from '@/views/organization/orgrole.vue';

const AppCenterModule = namespace('Apps/AppCenter');

interface MenuItem {
  name: string;
  name_i18n: string;
  icon: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: 'AppItem',
  components: {
    Basic,
    PermissionSetting,
    PermissionGroupSettings,
    VolumeSet,
    orgrole,
  },
})
export default class AppItem extends Vue {
  @AppCenterModule.Action('getAppDetail') getAppDetail: any;

  @AppCenterModule.Mutation('setAppDetail') setAppDetail: any;

  @AppCenterModule.Action('getAppList') getAppList: any;

  @Prop({}) appRoute?:string;

  menus: Array<MenuItem> = [
    {
      name: '权限设置',
      name_i18n: 'Permission setting',
      code: 'permisson',
      icon: 'h-icon-all-department-single-se',
      isSelected: true,
    },
    {
      name: '角色设置',
      name_i18n: 'Role setting',
      code: 'role',
      icon: 'h-icon-all-department-single-se',
      isSelected: false,
    },

    // {
    //       name: '基础设置',
    //       name_i18n: 'Basic setting',
    //       code: 'base',
    //       icon: 'h-icon-all-setting-o',
    //       isSelected: false,
    //     },
    // {
    //   name: "应用部署",
    //   code: "application",
    //   icon: "h-icon-all-appstore-o",
    //   isSelected: false,
    // }
  ];

  visibleType: number = 1;

  showModel: boolean = false;

  volumeSetModel: boolean = false;

  visibleTypeChange(val) {
    this.visibleType = val;
    this.showModel = false;
  }

  selectedMenu: string = 'permisson';

  curGroupId: string = '';

  historyData: any = {
    name: '',
    id: '',
  };

  groupName: string = '';

  get isChinese() {
    return !((this as any).$i18n.locale && (this as any).$i18n.locale === 'en');
  }

  handleModelSettings(view, gid, data: any) {
    this.showModel = view;
    this.curGroupId = gid ? gid : '';
    this.historyData.name = data.name;
    this.historyData.id = data.id;
    this.groupName = data;
  }

  handleModelVolumeSet(view, gid, data: any) {
    this.volumeSetModel = view;
    this.curGroupId = gid ? gid : '';
    this.historyData.name = data.name;
    this.historyData.id = data.id;
    this.groupName = data;
  }

  handleClearName() {
    this.historyData.name = '';
    this.historyData.id = '';
  }

  clickMenu(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });
    item.isSelected = true;
    this.selectedMenu = item.code;
  }

  refresh() {
    // const params: any = {
    //   groupCode: this.groupKey, 
    //   fromRecycle: this.fromRecycle,
    // }
    // this.getAppList(params)
  }

  mounted() {}

  beforeMount() {
    // 刷新页面时回填数据
    const params: Apps.AppCenter.AppInfoParams = {
      appCode: this.$route.params.appCode,
    };
    if (params.appCode) {
      const res = this.getAppDetail(params);
      if (res.data) {
        this.$store.commit('setAppDetail', res.data);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.app-item {
  height: 100%;
  overflow: auto;
}

.app-router-wrap {
  // width: 1057px;
  // margin: 32px auto 0;
  min-width: auto;
}
</style>

<style lang="less">
@import '~@/styles/color/colors.less';

.ghostClass {
  opacity: 0;
}
.icon-open {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 12px;
  font-size: 14px;
  color: rgba(17, 18, 24, 0.5);
}

.app-menu {
  width: 200px;
  padding-right: 1px;
  float: left;
  box-shadow: 1px 0px 0px 0px #e8e8e8;
  position: relative;
  z-index: 2;
  height: calc(100vh - 64px);
  .new-menu {
    height: 40px;
    background: #f2f2f2;
    font-size: 14px;
    line-height: 40px;
    width: calc(100% + 1px);
    cursor: pointer;
    & > span {
      color: rgba(17, 18, 24, 0.5);
    }
    & > i {
      font-size: 12px;
      margin-right: 7px;
    }
  }
  .menu-tree {
    overflow: auto;
    height: calc(100vh - 64px);
    .menu {
      border: none;
      color: @nav-font-color;
      i.setting {
        position: absolute;
        z-index: 9;
        top: 0px;
        right: 29px;
        width: 14px;
        height: 14px;
        margin: 0;
        font-size: 14px !important;
        visibility: hidden;
        &:hover {
          color: @primary-color;
        }
      }
      .sub-menu.ant-menu-submenu-selected {
        .ant-menu-submenu-title {
          background: @sub-bg-color;
          color: @primary-color;
          .menu-title {
            // padding-right: 38px !important;
          }
          .setting {
            visibility: visible;
            color: rgba(17, 18, 24, 0.5);
            &:hover {
              color: @primary-color;
            }
          }
          &:hover {
            color: @primary-color !important;
          }
          &:after {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            border-left: 4px solid @primary-color;
          }
        }
      }
      .sub-menu {
        cursor: pointer;
        position: relative;
        .ant-menu-submenu-title {
          padding: 0px !important;
          width: 100%;
          margin-top: 8px;
          .menu-title {
            padding: 0px 16px !important;
            margin-right: 25px;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            i {
              font-size: 14px;
              margin-right: 8px;
            }
          }
          &:hover {
            color: rgba(17, 18, 24, 0.5);
            background: @sub-bg-color;
            .menu-title {
              // padding-right: 38px !important;
            }
            .setting {
              visibility: visible;
            }
          }
          & > .ant-menu-submenu-arrow {
            margin-top: 2px;
            &:before {
              background: linear-gradient(to right, #000, #000);
            }
            &:after {
              background: linear-gradient(to right, #000, #000);
            }
          }
        }
        .ant-menu-submenu-title.all {
          margin-bottom: 0;
        }
      }
      li.ant-menu-item-selected {
        background: @sub-bg-color;
        color: @primary-color;
        padding-right: 46px;
        &:hover {
          color: @primary-color;
        }
        &:after {
          border-left: 4px solid @primary-color;
        }
        .setting {
          visibility: visible;
          color: rgba(17, 18, 24, 0.5);
          &:hover {
            color: @primary-color;
          }
        }
      }
      .ant-menu-item {
        width: 100%;
        padding-left: 38px !important;
        text-align: left;
        overflow: hidden;
        margin-top: 8px;
        text-overflow: ellipsis;
        padding-right: 16px;
        .setting {
          right: 6px;
        }
        i {
          font-size: 14px;
          margin-right: 10px;
        }
        &:hover {
          color: rgba(17, 18, 24, 0.5);
          background: @sub-bg-color;
          padding-right: 46px;
          .setting {
            visibility: visible;
          }
        }
        &:after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          border-right: none;
        }
      }
      .show.ant-menu-item {
        padding-right: 46px;
      }
      li.root-item {
        padding-left: 16px !important;
      }
    }
  }
}
.popover {
  cursor: pointer;
}
.popover p:first-child {
  border-top: none;
  border-radius: 4px 4px 0 0;
  &:hover {
    &:before {
      content: '';
      display: block;
      width: 8.5px;
      height: 8.5px;
      transform: rotate(45deg);
      background-color: @sub-bg-color;
      position: absolute;
      left: 6px;
      top: 12px;
    }
  }
}
.popover p:last-child {
  border-radius: 0 0 4px 4px;
}
.popover .ant-popover-inner-content {
  padding: 0px;
}
.popover p {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  padding: 5px 16px;
}
.popover p:hover {
  background-color: @sub-bg-color;
}
.app-router-wrap {
  height: unset !important;
  overflow: hidden;
  .model-wrap {
    height: unset !important;
    padding-left: 16px;
  }
}
.red {
  color: #f5222d;
}
.show {
  color: #000;
  background: @sub-bg-color;
}
.isshow .menu-title .setting,
.show .setting {
  visibility: visible !important;
}
.menu-tree::-webkit-scrollbar {
  width: 0;
  height: 7px;
  background: #fff;
}
.menu-tree::-webkit-scrollbar-thumb {
  background: rgba(17, 18, 24, 0.5);
  border-radius: 4px;
}
</style>
