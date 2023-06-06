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
        <div
          v-for="item in menus"
          :key="item.code"
          class="org"
          :class="{ selected: item.isSelected }"
          @click="onMouseDown(item)"
        >
          <i class="icon aufontAll" :class="item.icon"></i>
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
      <div v-show="isShow">
        <a-tooltip v-for="item in menus" :key="item.code" placement="right">
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
      </div>
      <div id="hide-menu" @click="() => (isShow = !isShow)">
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
import OrgApi from '@/apis/organization';
import { Layout, Tooltip } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserModule = namespace('System/User');
const OrgUserModule = namespace('Organization/User');

interface MenuItem {
  name: string;
  icon: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: 'organization',
  beforeRouteUpdate(to, from, next) {
    if (to.params && to.params.userLink) {
      const vm = this as organization;
      vm.menus.forEach((m) => {
        m.isSelected = false;
        if (to.name === m.code) {
          m.isSelected = true;
        }
      });
    }
    next();
  },
  components: {
    ALayoutSider: Layout.Sider,
    ATooltip: Tooltip,
  },
})
export default class organization extends Vue {
  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;

  @OrgUserModule.Mutation('setCloudPivotPerm') setCloudPivotPerm!: any;

  isCloudPivot: any = false;

  hasCloudPivotPerm: boolean = false;

  isShow: boolean = false;

  async created() {
    const user: any = JSON.parse(window.sessionStorage.getItem('user') || '{}');

    // @ts-ignore
    const res: any = await OrgApi.needSync(); // 是否展示组织同步，
    const errcode: number = res.errcode;
    const data: any = res.data;
    // this.hasCloudPivotPerm = data.hasCloudPivotPerm;

    this.setCloudPivotPerm(data.hasCloudPivotPerm);

    if (errcode === 0 && data.needSync) {
      this.menus.push({
        name: 'languages.OrganizationSync',
        code: 'orgsync',
        icon: 'h-icon-all-sync-o',
        isSelected: false,
      });
    }
    this.menus.push({
      name: 'languages.UserInfoExt',
      code: 'userInfoExt',
      icon: 'h-icon-all-user-list-o',
      isSelected: false,
    });
    this.menus.push({
      name: 'languages.WorkHandover',
      code: 'workHandover',
      icon: 'h-icon-all-work-handover-o',
      isSelected: false,
    });

    this.menus.forEach((m) => {
      m.isSelected = false;
      if (this.$route.name === m.code) {
        m.isSelected = true;
      }
    });
  }

  menus: Array<MenuItem> = [
    {
      name: 'languages.Organization',
      code: 'orguser',
      icon: 'h-icon-all-department-o',
      isSelected: true,
    },
    {
      name: 'languages.OrganizationRole',
      code: 'orgrole',
      icon: 'h-icon-all-team-singlechoice-o',
      isSelected: false,
    },
  ];

  onMouseDown(item: MenuItem) {
    this.menus.forEach((m) => {
      m.isSelected = false;
    });

    item.isSelected = true;

    this.$router.push(item.code).catch((err: any) => {
      console.log(err);
    });
  }
}
</script>

<style lang="less" scoped>
.organization {
  margin-top: 0px;
  min-width: 1024px;
  position: relative;
  .org-menu {
    width: 200px;
    height: calc(100vh - 64px);
    float: left;
    position: relative;
    padding-top: 8px;
    z-index: 1;
    color: #111218;
    background: #f7f8fa;
    box-shadow: 1px 0px 0px 0px #e4e4e4;
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
