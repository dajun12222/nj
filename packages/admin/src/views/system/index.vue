<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="organization">
    <a-layout-sider
      v-model="isShow"
      :trigger="null"
      theme="light"
      collapsible
      collapsedWidth="46"
      class="org-menu"
      width="200"
    >
      <div v-show="!isShow">
        <template v-for="item in menus">
          <div
            v-if="isCanShow(item.code)"
            :key="item.code"
            class="org"
            :class="{ selected: item.isSelected }"
            @click="onMouseDown(item)"
          >
            <i class="icon aufontAll" :class="item.icon"></i>
            <span
              :class="{
                active: systemUnsetCount > 0 && item.code === 'commonSetting',
              }"
              >{{ $t(item.name) }}</span>
          </div>
        </template>
      </div>
      <div v-show="isShow">
        <template v-for="item in menus">
          <a-tooltip
            v-if="isCanShow(item.code)"
            :key="item.code"
            placement="right"
          >
            <template slot="title">
              {{ $t(item.name) }}
            </template>
            <div
              class="org"
              :class="{ selected: item.isSelected }"
              @mousedown="onMouseDown(item)"
            >
              <i class="icon aufontAll" :class="item.icon"></i>
            </div>
          </a-tooltip>
        </template>
      </div>
      <div id="hide-menu" @click="menuShow">
        <div v-show="!isShow" class="to-left"></div>
        <div v-show="isShow" class="to-right"></div>
      </div>
    </a-layout-sider>
    <div class="router-wrap">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Layout, Tooltip } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace, State } from 'vuex-class';

const UserModule = namespace('System/User');

interface MenuItem {
  name: string;
  icon: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: 'system',
  components: {
    ALayoutSider: Layout.Sider,
    ATooltip: Tooltip,
  },
})
export default class SystemComponent extends Vue {
  @UserModule.State('menuShowStatus') menuShowStatus!: boolean;

  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;

  @UserModule.State('isAdmin') isAdmin!: boolean;

  @UserModule.Mutation('setMenuStatus') mutationSetMenuStatus!: any;

  @State('systemUnsetCount') systemUnsetCount!: number;

  isShow: boolean = false;

  @Watch('$route')
  onRouteChange(v) {
    this.selectMenu();
  }

  isCanShow(code) {
    if (code === 'dataDictionary') {
      let user: any = {};
      try {
        // @ts-ignore
        user = JSON.parse(sessionStorage.getItem('user'));
      } catch (error) {
        console.log(error);
      }
      if (user.dataDictionaryManage) {
        return true;
      }
      return false;
    }
    return true;
  }

  created() {
    const _this = this;

    // 如果当前登录用户仅拥有子管理员权限，只显示管理员设置菜单
    if (this.isAdmin && this.isOnlyAppAdmin) {
      this.menus = this.menus.filter(
        (item) =>
          item.code === 'managerSetting' || item.code === 'dataDictionary',
      );

      this.$router.push('manager-setting').catch((err: any) => {
        console.log(err);
      });
    }

    this.selectMenu();
  }

  menus: Array<MenuItem> = [
    {
      name: 'languages.system.commonSetting',
      code: 'commonSetting',
      icon: 'h-icon-all-setting-o',
      isSelected: true,
    },
    {
      name: 'languages.system.adminSetting',
      code: 'managerSetting',
      icon: 'h-icon-all-user-o',
      isSelected: false,
    },
    {
      name: 'languages.system.integrationSetting',
      code: 'integrationSetting',
      icon: 'h-icon-all-chakan-zj',
      isSelected: false,
    },
    {
      name: 'languages.system.dataDictionary',
      code: 'dataDictionary',
      icon: 'h-icon-all-recruitment-demand-o',
      isSelected: false,
    },
    {
      name: 'languages.system.apiConfiguration',
      code: 'apiConfiguration',
      icon: 'h-icon-all-disassembly-o',
      isSelected: false,
    },
    {
      name: 'languages.system.logInfo',
      code: 'log',
      icon: 'h-icon-all-text-file-o',
      isSelected: false,
    },
    {
      name: 'languages.system.cacheMagemt',
      code: 'cacheMagemt',
      icon: 'h-icon-all-contract-management-',
      isSelected: false,
    },
    {
      name: 'languages.system.licenseInfo',
      code: 'license',
      icon: 'h-icon-all-recruitment-demand-o',
      isSelected: false,
    },
  ];

  selectMenu() {
    this.menus.forEach((m) => {
      m.isSelected = false;
      if (this.$route.name === m.code) {
        m.isSelected = true;
      }
    });
  }

  onMouseDown(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });
    item.isSelected = true;
    this.goRouter(item);
  }

  goRouter(item: MenuItem) {
    if (item.code === 'commonSetting') {
      this.$router.push('common-setting').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'managerSetting') {
      this.$router.push('manager-setting').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'integrationSetting') {
      this.$router.push('integration-setting').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'log') {
      this.$router.push('log').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'license') {
      this.$router.push('license').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'dataDictionary') {
      this.$router.push('dataDictionary').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'apiConfiguration') {
      this.$router.push('apiConfiguration').catch((err: any) => {
        console.log(err);
      });
    } else if (item.code === 'cacheMagemt') {
      this.$router.push('cacheMagemt').catch((err: any) => {
        console.log(err);
      });
    } else {
      //Else Empty block statement
    }
  }

  menuShow() {
    this.isShow = !this.isShow;
    const payload = this.isShow;
    this.mutationSetMenuStatus(payload);
  }
}
</script>

<style lang="less" scoped>
.organization {
  background: #fff;
  margin-top: 0px;
  position: relative;
  .org-menu {
    width: 200px;
    height: calc(100vh - 64px);
    float: left;
    box-shadow: 1px 0px 0px 0px #e4e4e4;
    background: #f7f8fa;
    position: relative;
    padding-top: 8px;
    z-index: 1;
    color: #111218;
    #hide-menu {
      position: absolute;
      top: 48%;
      right: -14px;
      width: 14px;
      height: 30px;
      z-index: 9;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      .to-left {
        width: 20px;
        height: 20px;
        background-color: #ffffff;
        border: 1px solid #e4e4e4;
        box-sizing: border-box;
        border-radius: 50%;
        margin-left: -10px;
        background-image: url('../../assets/images/left.svg');
        background-size: 10px;
        background-repeat: no-repeat;
        background-position: 50%;
      }
      .to-right {
        width: 20px;
        height: 20px;
        background-color: #ffffff;
        border: 1px solid #e4e4e4;
        box-sizing: border-box;
        border-radius: 50%;
        margin-left: -10px;
        background-image: url('../../assets/images/right.svg');
        background-size: 10px;
        background-repeat: no-repeat;
        background-position: 50%;
      }
      &:hover {
        border-left-color: #c6c6c6;
      }
    }
    .org {
      position: relative;
      height: 40px;
      width: 200px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-left: 16px;
      margin-bottom: 8px;
      cursor: pointer;
      span.active {
        position: relative;
        &:before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f5222d;
          position: absolute;
          right: -2px;
        }
      }
      &.selected {
        background: #e5efff;
        color: @primary-color;
        transition: none;
        transform: none;
        &::before {
          content: '';
          position: absolute;
          height: 100%;
          width: 0;
          top: 0;
          left: 0;
          border-left: 4px solid @primary-color;
        }
      }
      i {
        margin-right: 9px;
        font-size: 14px;
        height: 14px;
        line-height: 14px;
      }
      &:hover {
        background: #e5efff;
      }
    }
  }
  .ant-layout-sider-collapsed {
    .org {
      width: 46px;
    }
  }
  .router-wrap {
    overflow: hidden;
    height: calc(100vh - 64px);
  }
}
</style>
