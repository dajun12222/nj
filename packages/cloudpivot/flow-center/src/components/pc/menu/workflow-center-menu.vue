<template>
  <div class="menu-content workflow-menu">
    <a-menu v-model="selectedKeys" mode="inline">
      <a-menu-item key="1" :class="specStyle ? 'textOverflow' : ''">
        <router-link to="/workflow-center/my-unfinished-workitem">
          <i class="icon aufontAll h-icon-all-edit-square"></i>
          <!-- 以下的span内容与徽标之间不要出现空格，会造成排版错误 -->
          <span :class="specStyle ? 'specStyles' : 'hideStyles'">
            {{ $t('cloudpivot.flowCenter.pc.todoList') }}
            <a-badge
              class="spec-badeg"
              :class="specStyle ? '' : 'hide-badeg'"
              :count="unFinishedListCount"
              :overflowCount="99"
            />
          </span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="2" :class="specStyle ? 'textOverflow' : ''">
        <router-link to="/workflow-center/my-unread-workitem">
          <i class="icon aufontAll h-icon-all-file"></i>
          <!-- 以下的span内容与徽标之间不要出现空格，会造成排版错误 -->
          <span :class="specStyle ? 'specStyles' : 'hideStyles'">
            {{ $t('cloudpivot.flowCenter.pc.toreadList') }}
            <a-badge
              class="spec-badeg"
              :class="specStyle ? '' : 'hide-badeg'"
              :count="unReadListCount"
              :overflowCount="99"
            />
          </span>
          <!-- <a-badge class="spec-badeg" :class="specStyle ? '' : 'hide-badeg'" :count="unReadListCount" :overflowCount="99" /> -->
        </router-link>
      </a-menu-item>

      <a-menu-item key="3" :class="specStyle ? 'textOverflow' : ''">
        <router-link to="/workflow-center/my-finished-workitem">
          <i class="icon aufontAll h-icon-all-carryout"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{
            $t('cloudpivot.flowCenter.pc.doneList')
          }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="4" :class="specStyle ? 'textOverflow' : ''">
        <router-link to="/workflow-center/my-read-workitem">
          <i class="icon aufontAll h-icon-all-calendar-check"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{
            $t('cloudpivot.flowCenter.pc.readList')
          }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item key="5" :class="specStyle ? 'textOverflow' : ''">
        <router-link to="/workflow-center/my-workflow">
          <i class="icon aufontAll h-icon-all-apartment"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{
            $t('cloudpivot.flowCenter.pc.myFlow')
          }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item
        v-if="!rootAdmin"
        key="9"
        :class="specStyle ? 'textOverflow' : ''"
      >
        <router-link to="/workflow-center/delegation-workflow">
          <i class="icon aufontAll h-icon-all-send"></i>
          <span :class="specStyle ? 'specStyles' : ''">{{
            $t('cloudpivot.flowCenter.pc.delegationFlow')
          }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item
        v-if="admin || isPrivilegedPerson"
        key="6"
        class="curso-search"
        :class="{
          textOverflow: specStyle,
          dark: outwardType === 'dark',
          light: outwardType === 'light',
        }"
      >
        <router-link to="/workflow-center/query-instance">
          <a-icon type="file-text" class="icon file-texts" />
          <span
            :class="specStyle ? 'specStyles' : ''"
            style="line-height: 40px"
            >{{ $t('cloudpivot.flowCenter.pc.instanceSearch') }}</span>
        </router-link>
      </a-menu-item>

      <a-menu-item
        v-if="admin || isPrivilegedPerson"
        key="7"
        :class="specStyle ? 'textOverflow' : ''"
      >
        <router-link to="/workflow-center/query-participant-workItem">
          <a-icon type="flag" class="icon file-texts" />
          <span :class="specStyle ? 'specStyles' : ''">{{
            $t('cloudpivot.flowCenter.pc.taskSearch')
          }}</span>
        </router-link>
      </a-menu-item>

      <!-- 常用审批意见已经移至流程详情界面
      <a-menu-item key="8">
        <router-link to="/workflow-center/my-comments">
          <i class="icon aufontAll h-icon-all-setting-o"></i>
          <span>审批意见配置</span>
        </router-link>
      </a-menu-item> -->
    </a-menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';

import { Menu, Badge, Icon } from '@h3/antd-vue';

import * as WorkflowCenterNS from '../typings/workflow-center';

// 引入流程中心store
import WorkflowCenterStore from '../store/workflow-center';

@Component({
  name: 'WorkflowCenterMenu',
  components: {
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ASubMenu: Menu.SubMenu,
    ABadge: Badge,
    AIcon: Icon,
  },
})
export default class WorkflowCenterMenu extends Vue {
  get outwardType() {
    return this.$store.state.outwardType || 'light';
  }

  selectedKeys: string[] = [];

  specStyle: boolean = true;

  @Prop(Number) dragWidth!: number;

  @Watch('dragWidth')
  ondragWidthChange(v: any) {
    if (v > 190) {
      this.specStyle = true;
    } else {
      this.specStyle = false;
    }
  }

  get unFinishedListCount() {
    return (
      (this.$store &&
        this.$store.state.WorkflowCenterStore.unFinishedListCount) ||
      0
    );
  }

  get unReadListCount() {
    return (
      (this.$store && this.$store.state.WorkflowCenterStore.unReadListCount) ||
      0
    );
  }

  get isPrivilegedPerson() {
    // 是否特权人
    return this.$store && this.$store.state.System.System.isPrivilegedPerson; // 引入系统store的字段
  }

  get admin() {
    return this.$store && this.$store.state.System.System.admin; // 引入系统store的字段
  }

  get rootAdmin() {
    return this.$store && this.$store.state.System.System.isRootAdmin;
  }

  @Watch('admin')
  onAdminChange(val: any) {
    // console.log('admin change: ', val);
    this.setSelectedKeys();
  }

  @Watch('$route')
  routeChange() {
    this.setSelectedKeys();
  }

  created() {
    // 动态注册模块
    this.$store &&
      this.$store.registerModule('WorkflowCenterStore', WorkflowCenterStore);
  }

  beforeMount() {
    this.setSelectedKeys();

    this.handleGetWorkCount();
  }

  // 根据当前路由判断当前选中
  setSelectedKeys() {
    let { name } = this.$route;
    if (!name) {
      return;
    }
    if (
      !this.admin &&
      ['queryInstance', 'queryParticipantWorkItem'].includes(name)
    ) {
      name = 'myUnfinishedWorkItem';
    }
    name = name.substring(0, 1).toUpperCase() + (name as any).substring(1);
    let skey: number = 0;
    switch (name) {
      case 'MyUnfinishedWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyUnfinishedWorkItem;
        break;

      case 'MyUnReadWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyUnReadWorkItem;
        break;
      case 'MyFinishedWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyFinishedWorkItem;
        break;
      case 'MyReadWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.MyReadWorkItem;
        break;
      case 'MyWorkflow':
        skey = WorkflowCenterNS.SelectKeysMapping.MyWorkflow;
        break;
      case 'QueryInstance':
        skey = WorkflowCenterNS.SelectKeysMapping.QueryInstance;
        break;
      case 'QueryParticipantWorkItem':
        skey = WorkflowCenterNS.SelectKeysMapping.QueryParticipantWorkItem;
        break;
      // case 'MyComments':
      //   skey = WorkflowCenterNS.SelectKeysMapping.MyComments;
      //   break;
      case 'DelegationWorkflow':
        skey = WorkflowCenterNS.SelectKeysMapping.DelegationWorkflow;
        break;
      default:
        skey = -1;
        break;
    }

    const _k = skey.toString();
    this.selectedKeys = [_k];
  }

  // 获取任务数
  handleGetWorkCount() {
    this.$store.dispatch('WorkflowCenterStore/getWorkCount');
  }

  destroyed() {
    this.$store.unregisterModule('WorkflowCenterStore');
  }
}
</script>

<style lang="less">
@import './style/index.less';
.workflow-menu {
  .ant-badge {
    // margin-left: @base4-padding-xs;
    margin-top: -5px;
    transform: scale(0.9);
  }
  .ant-badge-count {
    box-shadow: none;
  }

  .ant-menu {
    border: 0 solid transparent;
  }

  .ant-menu-dark .ant-menu-inline.ant-menu-sub .ant-menu-item {
    padding-left: 70px !important;
    & > a {
      font-size: 14px;
      color: #111218;
      font-weight: 400;
      // white-space: nowrap;
      // text-overflow: ellipsis;
      // overflow: hidden;
    }
  }
  /deep/.ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
    background-color: #eef4fd;
    a {
      color: #2970ff !important;
      font-weight: 500;
      .icon {
        margin-right: @base4-padding-xs;
      }
    }
  }

  .ant-menu-item {
    margin-top: 0;
    width: 100%;
    > a {
      display: flex;
      white-space: nowrap;
      text-overflow: ellipsis;
      align-items: center;
      // overflow: hidden;
      & > .icon,
      & > span {
        height: 40px;
        vertical-align: top !important;
        max-width: calc(100% - 34px) !important;
        color: #111218;
        font-weight: 400;
        font-size: 14px;
        display: inline-block;
        width: 100%;
        & > .spec-badeg {
          position: absolute;
          top: 16px;
          right: 17px;
          > .ant-badge-count {
            background: #f15b51 !important;
          }
        }
        & > .hide-badeg {
          display: none;
        }
      }
      & > .icon {
        font-size: 16px;
        width: auto;
        height: auto;
        overflow: inherit;
        margin-right: 10px;
        min-width: 16px;
      }
    }
    &:hover {
      background-color: #eef4fd;
    }
    .file-texts {
      font-size: 14px;
      line-height: 0;
    }
  }
  .ant-menu-item.ant-menu-item-selected {
    background-color: #eef4fd;
    > a {
      > span,
      .icon {
        color: #2970ff;
        font-weight: 500;
      }
    }
  }

  /**
    导航虚线
  */
  .ant-menu-item.curso-search {
    position: relative;
    margin-top: 16px;
    line-height: 25px;
    overflow: inherit;
    &.dark::before {
      background-color: rgba(255, 255, 255, 0.2);
    }
    &::before {
      position: absolute;
      content: '';
      width: 100%;
      height: 1px;
      background-color: #eee;
      top: -8px;
      left: 0;
    }
  }

  .ant-menu-item::after {
    content: '';
    height: 24px;
    width: 3px;
    background: #2970ff;
    border-radius: 0px 100px 100px 0px;
    border: none;
    left: 0;
    top: 8px;
  }

  .ant-menu-inline-collapsed-tooltip a {
    color: white !important;
    .icon {
      margin-right: @base4-padding-xs;
    }
    .ant-badge {
      margin-bottom: 3px;
    }
  }
}

.specStyles {
  overflow: inherit !important;
}

.spec-badeg {
  position: relative;
  right: -30px;
}

.hideStyles {
  overflow: hidden !important;
}

.hide-badeg {
  right: 0;
}
.textOverflow {
  > a {
    overflow: hidden;
  }
}
</style>
