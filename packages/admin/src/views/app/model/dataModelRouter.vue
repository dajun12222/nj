<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="organization">
    <a-layout-sider
      v-model="isShow"
      :trigger="null"
      class="org-menu"
      collapsedWidth="46"
      collapsible
      theme="light"
      width="200"
    >
      <div v-show="!isShow">
        <div
          v-for="item in menus"
          :key="item.code"
          :class="{ selected: item.isSelected }"
          class="org"
          @click="onMouseDown(item)"
        >
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
      <div v-show="isShow">
        <a-tooltip v-for="item in menus" :key="item.code" placement="right">
          <template slot="title">
            {{ $t(item.name) }}
          </template>
          <div
            :class="{ selected: item.isSelected }"
            class="org"
            @mousedown="onMouseDown(item)"
          ></div>
        </a-tooltip>
      </div>
      <div id="hide-menu" @click="() => (isShow = !isShow)">
        <div v-show="!isShow" class="to-left"></div>
        <div v-show="isShow" class="to-right"></div>
      </div>
    </a-layout-sider>
    <div class="router-wrap">
      <div class="router-wrap-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Layout, Tooltip } from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

import { namespace } from 'vuex-class';

const UserModule = namespace('System/User');
const OrgUserModule = namespace('Organization/User');

interface MenuItem {
  name: string;
  icon?: string;
  code: string;
  isSelected: boolean;
}

@Component({
  name: 'dataModelRouter',
  beforeRouteUpdate(to, from, next) {
    if (to.params && to.params.userLink) {
      const vm = this as dataModelRouter;
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
export default class dataModelRouter extends Vue {
  @Prop({
    type: String,
  })
  bizSchemaCode!: string;

  @UserModule.State('isOnlyAppAdmin') isOnlyAppAdmin!: boolean;

  @OrgUserModule.Mutation('setCloudPivotPerm') setCloudPivotPerm!: any;

  isCloudPivot: any = false;

  hasCloudPivotPerm: boolean = false;

  isShow: boolean = false;

  async created() {
    // 参数不合法强制跳转
    if (this.bizSchemaCode === 'data') {
      this.$router.push({ path: '/apps' }).catch((err: any) => {
        console.log(err);
      });
    }
    this.menus.forEach((m) => {
      m.isSelected = this.$route.name === m.code;
    });
  }

  menus: Array<MenuItem> = [
    {
      name: '数据模型',
      code: 'dataModel',
      isSelected: true,
    },
    {
      name: '业务规则',
      code: 'busRules',
      isSelected: false,
    },
    // {
    //   name: "数据权限",
    //   code: "dataPermission",
    //   isSelected: false,
    // },
    {
      name: '数据规则',
      code: 'dataRuleCalculation',
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
    box-shadow: 1px 0px 0px 0px #e4e4e4;
    background: #f7f8fa;
    position: relative;
    padding-top: 8px;
    z-index: 1;

    #hide-menu {
      position: absolute;
      top: 0px;
      right: -14px;
      width: 14px;
      height: 30px;
      z-index: 9;
      color: #fff;
      font-size: 14px;
      cursor: pointer;

      .to-left {
        width: 14px;
        height: 30px;

        &:after {
          content: '';
          display: block;
        }

        &:hover:after {
          width: 14px;
          height: 30px;
        }
      }

      .to-right {
        width: 14px;
        height: 30px;

        &:after {
          content: '';
          display: block;
        }

        &:hover:after {
          width: 14px;
          height: 30px;
        }
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
    padding: 0 24px;
    .router-wrap-content {
      background: #fff;
      height: 100%;
      width: 100%;
      // overflow: auto;
      border-radius: 5px;
    }
  }
}
</style>
