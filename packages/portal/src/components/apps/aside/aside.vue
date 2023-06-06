<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <aside
    class="aside-container"
    :class="{ isAppList: isAppList && !isShow, dark: outwardType === 'dark' }"
    :style="{ width: `${dragWidth}px` }"
  >
    <div class="aside" :style="{ width: `${dragWidth}px` }">
      <a-layout-sider
        ref="slider"
        v-model="isShow"
        :trigger="null"
        collapsible
        collapsedWidth="64"
        class="aside-menu"
        :class="outwardType"
        width="100%"
      >
        <!-- 发起流程 -->
        <div
          v-if="curMenu === 'WorkflowCenterMenu'"
          :class="isShow ? 'aside-top hide-text' : 'aside-top'"
        >
          <span>{{ $t('languages.common.workflowCenter') }}</span>

          <a-tooltip placement="right">
            <template slot="title">
              {{ $t('languages.common.initiationProcess') }}
            </template>
            <i
              class="icon aufontAll h-icon-all-add-file-o"
              :class="[
                isShow ? 'hide-text-active' : '',
                isActive ? 'active' : '',
              ]"
              @click="startWorkflow"
            ></i>
          </a-tooltip>
        </div>

        <!-- <component :is="curMenu" :dragWidth="dragWidth"/> -->
        <WorkflowCenterMenu v-if="!isAppList" :dragWidth="dragWidth" />

        <!-- 应用树形控件搜索 -->
        <div v-if="isAppList" class="app-list-search" :class="outwardType">
          <h2>{{ isChinese ? appName.name : appName.name_i18n }}</h2>

          <a-popover
            v-model="treeShow"
            trigger="click"
            :overlayClassName="`app-list-search-popover-${hasSearch}`"
            :destroyTooltipOnHide="true"
            placement="bottom"
            @visibleChange="treeShowChange"
          >
            <template slot="content">
              <div
                class="app-list-search-box"                
		:style="{ width: `${dragWidth - 32}px` }"
              >
                <SearchTree
                  ref="mychild"
                  :treeData="treeData"
                  :focus="searchFocus"
                  @selectedKeys="selectedKeys"
                  @searchChange="searchChange"
                />
              </div>
            </template>
            <i class="icon aufontAll h-icon-all-search-zj"></i>
          </a-popover>
        </div>

        <!-- 应用列表树形控件 -->
        <div v-if="isAppList" class="app-list-tree" :class="outwardType">
          <a-tree
            :multiple="false"
            :showLine="false"
            defaultExpandAll
            :selectedKeys="defaultKey"
            :expandedKeys="routeKey"
            :treeData="AppList"
            :replaceFields="{
              children: 'children',
              key: 'code',
            }"
            @select="onSelect"
            @expand="onSelect"
          >
            <span
              slot="title"
              slot-scope="{ name, name_i18n, icon }"
              class="cus-title"
            >
              <i v-if="icon" :class="'icon aufontAll ' + icon"></i>
              {{
                isChinese
                  ? name
                  : JSON.parse(name_i18n)
                  ? JSON.parse(name_i18n)['en']
                  : name
              }}
            </span>
          </a-tree>
        </div>
      </a-layout-sider>
    </div>
    <div
      class="hide-menu"
      :class="isShow ? '' : 'open'"
      :style="{ top: isAppList ? '10px' : '23px' }"
      @click="hideMenu"
    >
      <img
        v-show="!isShow"
        src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAANgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgANgAgAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCf/bAEMBAQEBAgICBAICBAkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCf/dAAQAAv/aAAwDAQACEQMRAD8A/pgooor7A+fCtjQde1Xw1qsOsaNM0E8DBgVJGcHofUHoQeCKoS2V5BbxXc0TpFPu8t2UhX2nDbSeDg9cdKrUmk1Yauj/0P6YK9Y8C+BtOuNOfxz45drXQrVsADiS7kHSKIe5+83bn3K+T19G6yB8ZvClrc+HT5OqaHbiOTS14jeJestuvr03L16DsN31VaTVl07niUkmeU+OvHF/431JJ5Y1trO1XyrS1j4jgiHRQPU4GT39gAK4ilIKkqwwRSVrGKSsjOUm3dn/0f6YK0dJ1bUtC1KHV9Ima3uYGDJIvUH+oPQg8EcGs6ivsGj59M7/AMe+KND8YXNtrllZGy1GVT9vCY8mSTIxJGOoLclge/qck8BRRUxikrIcpXd2f//S/pgooor7A+fCu3+Hvgy48eeJ7fw/BKsIkbLs2eEHLYwOTgHA457iuIr3n9nL/kpVt/uv/wCgtWdVtRbRdNXkkz//2Q=="
      />
      <img
        v-show="isShow"
        src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAANgAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgANgAgAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCf/bAEMBAQEBAgICBAICBAkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCf/dAAQAAv/aAAwDAQACEQMRAD8A/pgooor7A+fCtjQde1Xw1qsOsaNM0E8DBgVJGcHofUHoQeCKx6KTV9GNOx//0P6YK77wDqnhG0vJ9K8a2gmsb9BGbhR++tmByJIz7H7wxyPXoeBor66Ubqx4EZWdztvHHgfUvBGpLb3DLcWlwvmWt1HzHPGejKfX1GePoQTxNfRvgDf/AMK01H/hYuP+Eawfse//AF/2vt9l/Xd/DnPbfXzlUUpt3T6F1IpWaP/R/pgrvvAOl+Ebu8n1XxrdiGxsEEht1P765YnAjjHufvHPA9Oo4GivrpK6seBF2dztvHHjjUvG+pLcXCrb2luvl2trHxHBGOiqPX1OOfoABxNFFOMUlZBKTbuz/9L+mCiiivsD58K7f4e+DLjx54nt/D8EqwiRsuzZ4QctjA5OAcDjnuK4ivef2cv+SlW3+6//AKC1Z1W1FtF01eSTP//Z"
      />
    </div>
    <!-- <div class="main-placeholder" v-show="isAppList"></div> -->
  </aside>
</template>

<script lang="ts">
import { listApi, listParams } from 'cloudpivot/api';
import AppsMenu from 'cloudpivot/application/src/components/pc/apps-menu.vue';
import common from 'cloudpivot/common';
import WorkflowCenterMenu from 'cloudpivot/flow-center/src/components/pc/menu/workflow-center-menu.vue';
import {
  Icon,
  Input,
  Layout,
  Popover,
  Tooltip,
  Tree,
  TreeSelect,
} from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import SearchTree from './components/search-tree.vue';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

import { applicationConfig } from './../../../../extends/custom-config';

interface TreeData {
  key: string;
  scopedSlots: any;
  children: any[];
  title: string;
}

@Component({
  name: 'Aside',
  components: {
    ALayoutSider: Layout.Sider,
    WorkflowCenterMenu,
    AppsMenu,
    ATooltip: Tooltip,
    ATree: Tree,
    ATreeNode: Tree.TreeNode,
    AInputSearch: Input.Search,
    APopover: Popover,
    ADirectoryTree: Tree.DirectoryTree,
    SearchTree,
    AIcon: Icon,
    ATreeSelect: TreeSelect,
    ATreeSelectNode: TreeSelect.TreeNode,
  },
})
export default class Aside extends Vue {
  [x: string]: any;

  @WorkflowCenterModule.State('asideTitle') asideTitle: any;

  @WorkflowCenterModule.State('asideTitleI18n') asideTitleI18n: any;

  @WorkflowCenterModule.Mutation('setIsAppList') setIsAppList: any;

  @WorkflowCenterModule.Mutation('setAppNameList') setAppNameList: any;

  @WorkflowCenterModule.Mutation('setAppChange') setAppChange: any;

  @WorkflowCenterModule.State('appCode') appCode: any;

  @WorkflowCenterModule.State('modalCode') modalCode: any;

  @WorkflowCenterModule.State('appChange') appChange: any;

  @WorkflowCenterModule.State('appPath') appPath: any;

  @WorkflowCenterModule.Mutation('setHideMenu') setHideMenu: any;

  @WorkflowCenterModule.Mutation('setApplicationPageTitle')
  setApplicationPageTitle: any;

  get appName() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.appName;
  }

  get outwardType() {
    // 获取主题外观
    return this.$store.state.outwardType;
  }

  //判断是流程还是应用
  get isAppList() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.isAppList;
  }

  @Watch('isAppList', {
    immediate: true,
  })
  getWidth(val) {
    this.dragWidth = val ? 250 : 200;
    this.isShow = false;
  }

  @Watch('appValueChange', {
    immediate: true,
  })
  initAppData(val) {
    if (this.appValueChange) {
      this.getAppGroups();
      this.setAppChange(false);
    }
  }

  get appValueChange() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.appChange;
  }

  // 判断当前是否是中文版本
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  // 侧边栏可拖拽初始宽度
  dragWidth: number = 200;

  startX: number = this.isAppList ? 250 : 200;

  // false 展开 true收起
  isShow: boolean = false;

  curMenu: string = 'WorkflowCenterMenu';

  menuTitle: string = '流程中心';

  menuTitleI18n: any = {};

  isActive: boolean = false;

  treeShow: boolean = false;

  expandedKeys: any[] = [];

  searchValue: string = '';

  dataList: any[] = []; //搜索数据源

  autoExpandParent: boolean = true;

  AppList: any[] = [];

  defaultKey: any[] = []; //默认选中key

  routeKey: any[] = [];

  treeData: any[] = [];

  routeName: any[] = [];

  get rootAdmin() {
    return this.$store && this.$store.state.System.System.isRootAdmin;
  }

  hasSearch: boolean = false;

  searchChange(bool: boolean) {
    this.hasSearch = bool;
  }

  @Watch('$route')
  handler(val) {
    if (val.fullPath.includes('/workflow-center/start-workflow')) {
      this.isActive = true;
    } else {
      this.isActive = false;
    }
  }

  /**
   * 获取子节点数据
   */
  getChildrenTreeData(data) {
    const office = data.map((item) => {
      if (item.children) {
        item = {
          icon: item.icon,
          title: this.isChinese ? item.name : JSON.parse(item.name_i18n)['en'],
          name: item.name,
          name_i18n: item.name_i18n,
          key: item.code,
          children: this.getChildrenTreeData(item.children),
          scopedSlots: { title: 'title' },
          appCode: item.appCode,
          code: item.code,
          parentId: item.parentId,
          openMode: item.openMode,
          pcUrl: item.pcUrl,
          queryCode: item.queryCode,
          type: item.type,
          deleted: item.deleted,
          id: item.id,
          mobileAble: item.mobileAble,
          mobileUrl: item.mobileUrl,
          modelType: item.modelType,
          pcAble: item.pcAble,
          published: item.published,
          sortKey: item.sortKey,
        };
        return item;
      } else {
        // if (item.scopedSlots) {
        //   delete item.scopedSlots;
        // }
        item = {
          icon: item.icon,
          title: this.isChinese
            ? item.name
            : JSON.parse(item.name_i18n)
            ? JSON.parse(item.name_i18n)['en']
            : item.name,
          name: item.name,
          name_i18n: item.name_i18n,
          key: item.code,
          children: null,
          scopedSlots: { title: 'title' },
          appCode: item.appCode,
          code: item.code,
          parentId: item.parentId,
          openMode: item.openMode,
          pcUrl: item.pcUrl,
          queryCode: item.queryCode,
          type: item.type,
          deleted: item.deleted,
          id: item.id,
          mobileAble: item.mobileAble,
          mobileUrl: item.mobileUrl,
          modelType: item.modelType,
          pcAble: item.pcAble,
          published: item.published,
          sortKey: item.sortKey,
        };
        return item;
      }
    });
    return office;
  }

  /**
   * 搜索应用
   */
  selectedKeys(data) {
    this.routeKey = [];
    this.findItem(this.AppList, data.key[0]);
    this.onSelect(data.key, data.e);
  }

  /**
   * 循环嵌套查找指定属性
   */
  isData: any = null;

  findItem(data, code) {
    let isData: any = null;
    const office = data.map((item) => {
      isData = null;
      if (item.children) {
        // item = {
        //   children: this.findItem(item.children,code),
        //   ...item
        // }
        // return item;
        isData = this.findItem(item.children, code);
        if (isData) {
          // this.routeKey.push(item.code)
          this.routeKey.unshift(item.code);
          this.routeName.unshift(this.mergeName_i18n(item));
        }
        return isData;
      } else {
        if (item.code === code) {
          this.isData = item;
          isData = item;
        } else if(item.type === 'Page' && item.pcUrl && item.pcUrl.indexOf(code) > -1){
          this.isData = item;
          isData = item;
        }
        // item = {
        //   children:null,
        //   ...item,
        // }
        // return item;
        if (isData) {
          // this.routeKey.push(item.code)
          this.routeKey.unshift(item.code);
          this.routeName.unshift(this.mergeName_i18n(item));
        }
        return isData;
      }
    });
    for (const i of office) {
      if (i) {
        isData = office;
        return isData;
      }
    }
    return null;
  }

  /**
   * 获取侧边栏树
   */
  async getAppGroups() {
    const params: listParams.FolderSchema = {
      appCode: this.appCode,
      isMobile: false, // 需要处理
    };
    const res = await listApi.getFolder(params);
    if (res.errcode === 0) {
      if (!Array.isArray(res.data)) {
        return;
      }
      // this.AppList = res.data;

      this.AppList = res.data.map((i) => {
        i = this.initData(i);
        return i;
      });

      //当分组下没有可见模型时不显示分组
      this.AppList = this.AppList.filter((x) => {
        if (x.type === 'Folder') {
          if (Array.isArray(x.children) && x.children.length > 0) {
            x.children = x.children.filter((y) => {
              if (y.type === 'Folder') {
                return Array.isArray(y.children) && y.children.length > 0;
              } else {
                return y;
              }
            });
          }
          return Array.isArray(x.children) && x.children.length > 0;
        } else {
          return x;
        }
      });

      //处理是初始化页面
      if (this.appPath) {
        const url = this.appPath;
        let code: any = '';
        try {
          if (url.indexOf('&code=') !== -1) {
            code = url.split('&code=').pop().split('&')[0];
          } else {
            code = url.split('/').pop().split('?')[0];
          }
        } catch (error) {}
        this.findItem(this.AppList, code);
        if (this.isData) {
          this.defaultKey = [this.isData.code];
          this.onSelect(this.defaultKey, this.isData, true);
        } else if (this.AppList && this.AppList[0]) {
          this.defaultKey = Array.isArray(this.AppList[0].children)
            ? [this.AppList[0].children[0].code]
            : [this.AppList[0].code];
          this.onSelect(this.defaultKey, this.AppList[0], true);
        } else {
          //Else Empty block statement
        }
      } else if (this.AppList && this.AppList[0]) {
        this.defaultKey = this.modalCode
          ? [this.modalCode]
          : Array.isArray(this.AppList[0].children)
          ? [this.AppList[0].children[0].code]
          : [this.AppList[0].code];
        this.findItem(this.AppList, this.defaultKey[0]);
        this.onSelect(this.defaultKey, this.isData, true);
      } else {
        //Else Empty block statement
      }

      const data: TreeData = {
        children: [],
        title: '',
        key: '',
        scopedSlots: {},
      };

      //处理搜索树形数据
      this.treeData = this.getChildrenTreeData(this.AppList);
      // (this.$refs.mychild as any).onReset();ant
    }
  }

  initData(item) {
    item.scopedSlots = {
      title: 'title',
    };
    if (item.children && item.children.length) {
      item.children = item.children.map((i) => {
        i = this.initData(i);
        return i;
      });
    }
    return item;
  }

  searchFocus: boolean = false;

  treeShowChange(val) {
    this.searchFocus = val;
    if (val) {
      // (this.$refs.mychild as any).init();
    }
  }

  queryCode:any = '';

  /**
   * 树形控件
   */
  onSelect(keys, e, init = false) {
    this.treeShow = false;
    // console.log(keys,e,this.defaultKey)
    let item;
    if (!init) {
      // if(e.selected){
      //   item = e.node.dataRef
      // } else {
      item = e.node.dataRef;
      if (
        this.routeKey.includes(item.code) &&
        item.children &&
        item.children.length
      ) {
        //length可能不存在导致报错，
        this.routeKey = this.routeKey.filter((i) => {
          return i !== item.code;
        });
      } else if (item.code === this.defaultKey[0]) {
        return;
      } else {
        this.routeKey = this.routeKey.filter((i) => {
          return i !== this.defaultKey[0];
        });
        this.routeKey.push(item.code);
      }
      // }
    } else {
     if(e) {
        if (e.children) {
          this.onSelect(keys, e.children[0], true);
          return;
        }
        item = e;
      } else {
        if(this.AppList.length>0 && this.AppList[0]) {
          let nodeList = this.AppList[0].children;
          if(nodeList && nodeList.length >0 ) {
            this.onSelect(keys, nodeList[0], true);
              return;
          }
          item = this.AppList[0];
        }
      }
    }
    
    if (!item || item.children) return;

    // if (!Array.isArray(keys) || keys.length < 1) { return ; }
    // let item;
    // this.AppList.some((node: any) => {
    //   const res =
    //     node.children &&
    //     node.children.find((child: any) => keys.includes(child.code));
    //   if (res) {
    //     item = res;
    //     return true;
    //   }
    //   const res2 = keys.includes(node.code);
    //   if (res2) {
    //     item = node;
    //     return true;
    //   }
    //   return false;
    // });

    // if (item.children) { return ; } //点击了目录
    this.routeName = [];
    this.findItem(this.AppList, item.code);
    this.setAppNameList([this.appName, ...this.routeName]);

    if (item) {
      this.setApplicationPageTitle(item);

      const customRouterItem: any = applicationConfig.find(
        (el: any) => el.appCode === item.appCode && el.schemaCode === item.code,
      );
      if (customRouterItem) {
        // 跳转模型存在二开的自定义样式
        this.$router
          .push({
            name: customRouterItem.routerName,
            params: {
              appCode: item.appCode,
              schemaCode: item.code,
            },
            query: {
              parentId: item.parentId,
              code: item.code,
              openMode: item.openMode,
              pcUrl: item.pcUrl,
              queryCode: this.queryCode,
            },
          })
          .catch((err: any) => {
            console.log(err);
          });
      } else if (item.type === 'BizModel') {
        this.$router
          .push(
            `/application/${item.appCode}/application-list/${
              item.code
            }?parentId=${item.parentId}&code=${item.code}&openMode=${
              item.openMode || ''
            }&pcUrl=${item.pcUrl || ''}&queryCode=${item.queryCode || ''}`,
          )
          .catch(() => {});
      } else if (item.type === 'Report') {
        this.$router
          .push({
            name: 'applicationReport',
            params: {
              appCode: item.appCode,
              reportCode: item.code,
            },
            query: {
              parentId: item.parentId,
              code: item.code,
              openMode: item.openMode,
              pcUrl: item.pcUrl,
              queryCode: item.queryCode,
            },
          })
          .catch((err: any) => {
            console.log(err);
          });
      } else if (item.pcUrl && item.pcUrl.includes('workflow-design')) {
        // 流程设计,则新开
        const { href } = this.$router.resolve({
          name: 'design',
          query: {
            parentId: item.parentId,
            code: item.code,
            openMode: item.openMode,
          },
        });
        window.open(href, '_blank');
      } else if (item.pcUrl) {
        if (item.openMode === 'RECENT_PAGE_MODE') {
          console.log(item, 'menu');
          this.$router
            .push({
              name: 'applicationDefine',
              params: {
                url: item.pcUrl,
              },
              query: {
                parentId: item.parentId,
                code: item.code,
                openMode: item.openMode,
                pcUrl: item.pcUrl,
                queryCode: item.queryCode,
              },
            })
            .catch((err: any) => {
              console.log(err);
            });
        } else if (item.openMode === 'NEW_PAGE_MODE') {
          window.open(item.pcUrl);
        } else {
          this.$router
            .push({
              path: item.pcUrl,
              query: {
                parentId: item.parentId,
                code: item.code,
                openMode: item.openMode,
                pcUrl: item.pcUrl,
                queryCode: item.queryCode,
              },
            })
            .catch((err: any) => {
              console.log(err);
            });
        }
      }
    }
    this.defaultKey = keys;
    // console.log(this.defaultKey)
  }

  /**
   * 搜索树
   */

  /**
   * 发起流程
   */
  startWorkflow() {
    const isAdmin = localStorage.getItem('_isAdmin') === 'true';
    if (this.rootAdmin || isAdmin) {
      // 暂时规定admin不能发起流程
      this.$message.warn('admin 不能发起流程');
      return;
    }
    this.$router.push({ name: 'startWorkflow' }).catch((err: any) => {
      console.log(err);
    });
  }

  mounted() {
    this.switchMenu();
    // 拖拽功能
    this.$nextTick(() => {
      const dragLine: any = document.querySelector('#jDragLine');
      const that = this;
      let maxClientWidth;
      let minWidth;
      let maxWidth;
      dragLine.addEventListener(
        'mousedown',
        (e: any) => {
          maxClientWidth = document.body.clientWidth / 3;
          minWidth = that.dragWidth - 8;
          maxWidth = that.dragWidth + 8;
          document.body.setAttribute('unselectable', 'on');
          document.body.setAttribute('onselectstart', 'return false;');
          if (e.clientX >= minWidth && e.clientX <= maxWidth) {
            document.onmousemove = function (ev: any) {
              // 收缩的时候不允许拖拽
              if (that.isShow) {
                return;
              }
              that.dragWidth = ev.clientX;
              if (ev.clientX > maxClientWidth) {
                that.dragWidth = maxClientWidth;
              } else if (ev.clientX < that.startX) {
                that.dragWidth = that.startX;
              } else {
                //Else Empty block statement
              }
              common.utils.Bus.$emit('resize');
            };
            document.onmouseup = function () {
              document.body.removeAttribute('unselectable');
              document.body.removeAttribute('onselectstart');
              document.onmousemove = null;
              document.onmouseup = null;
            };
          }
        },
        false,
      );
    });

    const curDom: any = this.$refs.slider;
    curDom.$el.addEventListener(
      'transitionend',
      this.transitionendEvent,
      false,
    );

    if (this.$route.fullPath.includes('/workflow-center/start-workflow')) {
      this.isActive = true;
    } else {
      this.isActive = false;
    }
  }

  transitionendEvent(e: any) {
    if (e.propertyName === 'width') {
      common.utils.Bus.$emit('resize');
    }
  }

  beforeDestroy() {
    const curDom: any = this.$refs.slider;
    curDom.$el.removeEventListener(
      'transitionend',
      this.transitionendEvent,
      false,
    );
  }

  // 切换菜单
  switchMenu() {
    if (!this.$route) {
      return;
    }
    const { fullPath } = this.$route;
    const isWorkflowCenterRoute = fullPath.includes('workflow-center');
    const isApplicationRoute = fullPath.includes('application');
    if (isWorkflowCenterRoute) {
      this.curMenu = 'WorkflowCenterMenu';
    } else if (isApplicationRoute) {
      this.curMenu = 'AppsMenu';
      this.menuTitle = this.asideTitle;
      this.menuTitleI18n = this.asideTitleI18n;
      setTimeout(() => {
        this.routeName = [];
        this.findItem(this.AppList, this.$route.query.code);
        this.setAppNameList([this.appName, ...this.routeName]);
        this.defaultKey = [this.$route.query.code];
      }, 200);
    } else {
      //Else Empty block statement
    }
  }

  hideMenu() {
    this.isShow = !this.isShow;
    if (this.isShow) {
      this.dragWidth = this.isAppList ? 0 : 64;
      this.startX = this.isAppList ? 0 : 64;
    } else {
      this.dragWidth = this.isAppList ? 250 : 200;
      this.startX = this.isAppList ? 250 : 200;
    }
    this.setHideMenu(this.isShow);
    common.utils.Bus.$emit('customButton', this.isShow);
  }

  @Watch('$route')
  onRouterChange() {
    this.switchMenu();
  }

  @Watch('asideTitle')
  onAsideTitleChange(v: any) {
    if (v) {
      this.menuTitle = v;
    }
  }

  @Watch('asideTitleI18n')
  onAsideTitleI18nChange(v: any) {
    if (v) {
      this.menuTitleI18n = v;
    }
  }

  mergeName_i18n(item) {
    return {
      name: item.name || item.title,
      name_i18n:
        (JSON.parse(item.name_i18n) && JSON.parse(item.name_i18n)['en']) ||
        item.name ||
        item.title,
    };
  }
}
</script>

<style lang="less">
@import '../../../styles/themes/default.less';
@import '~cloudpivot/application/src/components/pc/style/custom-themes';

/**
 侧边栏容器
*/
.aside-container {
  width: 216px;
  height: 100%;
  position: relative;
  background-color: #f1f2f6;
  &.isApplist {
    min-width: 250px;
    .aside {
      min-width: 250px;
    }
  }
  .hide-menu {
    width: 16px;
    height: 27px;
    position: absolute;
    top: 24px;
    right: -16px;
    z-index: 97;
    cursor: pointer;
    > img {
      width: 16px;
      height: 27px;
    }
  }
  .main-placeholder {
    width: 16px;
    height: 48px;
    background-color: #fff;
    position: absolute;
    right: 0;
    top: 0;
    box-shadow: 0px 1px 0px 0px #e4e4e4;
  }
}

.aside {
  height: 100%;
  z-index: 2;
  position: relative;
  overflow-y: scroll;
  background-color: @subColor;
  overflow-x: hidden;
  box-shadow: 2px 0px 11px 0px rgba(199, 205, 215, 0.5), 1px 0px 0px 0px #eeeeee;
  &::-webkit-scrollbar {
    width: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.45);
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  .aside-menu {
    height: calc(100vh - 64px);
    overflow: hidden;
    .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
      background-color: @activeBGColor;
      a {
        .icon,
        span {
          color: @highlightColor !important;
          sup span {
            color: #fff !important;
            // background-color: #ff5219 !important;
          }
          sup {
            // background-color: #ff5219 !important
          }
        }
      }
    }
    .ant-layout-sider-children {
      background-color: transparent;
      .ant-menu {
        background-color: @subColor;
      }
    }
    &.dark {
      .ant-layout-sider-children {
        background-color: transparent;
        .ant-menu {
          background-color: @subColor;
          a > span,
          a > .icon {
            color: #fff;
          }
        }
      }

      .workflow-menu .ant-menu-item:hover {
        background-color: @hoverColor;
        a {
          .icon,
          span {
            color: #fff !important;
          }
        }
      }
      .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
        &:hover {
          background-color: #fff;
          a {
            .icon,
            span {
              color: @highlightColor !important;
              sup span {
                color: #fff !important;
                background-color: #ff5219 !important;
              }
            }
          }
        }
        a {
          .icon,
          span {
            color: @primaryColor;
            sup {
              // background-color: #ff5219 !important
            }
            sup span {
              color: #fff;
            }
          }
        }
      }
    }
    &.light {
      .workflow-menu .ant-menu-item:hover {
        background-color: @hoveBGColor;
        a {
          .icon,
          span {
            // color: @primaryColor !important;
            sup span {
              color: #fff !important;
            }
          }
        }
      }
    }
  }
  .aside-top {
    width: 100%;
    height: 70px;
    padding: 0 16px;
    color: rgba(17, 18, 24, 0.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 400;
    > i {
      vertical-align: baseline;
      overflow: inherit;
      color: rgba(17, 18, 24, 0.5);
      font-size: 18px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      display: block;
      text-align: center;
      line-height: 28px;
      border-radius: 2px;
      &:hover {
        color: @highlightColor;
      }
      &:active,
      &.active {
        // background-color: #eef4fd;
        color: @highlightColor;
      }
      &.hide-text-active {
        text-indent: 0;
        // margin-left: 3px;
      }
    }
  }
  .dark {
    .aside-top {
      span {
        color: #fff;
      }
      > i {
        color: #fff;
        opacity: 0.8;
        &:hover {
          opacity: 1;
        }
        &.active {
          opacity: 1;
          background-color: transparent;
        }
      }
    }
  }
  .hide-text {
    text-indent: -999px;
    padding: 0 18px;
  }

  .hide-menu {
    width: 14px;
    height: 28px;
    line-height: 28px;
    border-radius: 2px 0px 0px 2px;
    position: absolute;
    top: 10px;
    right: 0;
    z-index: 10;
    background: url('../../../assets/icons/arrow-right.png') no-repeat center;
    background-color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
  }
  .open {
    background: url('../../../assets/icons/arrow-left.png') no-repeat center;
    background-color: rgba(255, 255, 255, 0.3);
  }
}
.ant-menu-submenu-popup.ant-menu-dark .ant-menu-item-selected {
  background-color: unset;
  a {
    color: white !important;
    .icon {
      margin-right: @base4-padding-xs;
    }
  }
}
.aside-container {
  .ant-menu-item {
    margin-bottom: 0 !important;
  }
}
.ant-menu-item > a {
  & > .icon,
  & > span {
    height: 40px;
    vertical-align: top !important;
  }
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

.ant-layout-sider {
  transition: unset !important;
  background-color: @subColor !important;
}

// .ant-layout-sider-children {
//   margin-left: 4px;
// }
.app-list-search {
  width: 100%;
  height: 70px;
  display: flex;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  > h2 {
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    font-size: 16px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 20px;
  }
  > i {
    color: rgba(17, 18, 24, 0.5);
    font-size: 14px;
    cursor: pointer;
    &:hover {
      color: @highlightColor;
    }
  }
  &.dark {
    > h2 {
      color: #fff;
    }
    > i {
      color: #fff;
      &:hover {
        color: @textColor;
      }
    }
  }
}

// 树形控件样式
.app-list-search-box {
  width: 218px;
  // height: calc(100vh - 64px);
}

.aside-container,
.app-list-search-box {
  .ant-tree {
    // overflow-y: hidden;
  }
  .ant-tree li {
    padding: 0 16px;
  }
  .app-list-tree {
    overflow-y: scroll;
    overflow-x: hidden;
    height: calc(100% - 70px);
    &::-webkit-scrollbar {
      width: 0;
    }
    > ul {
      .ant-tree-node-content-wrapper-normal.ant-tree-node-selected,
      .ant-tree-node-content-wrapper-normal:hover {
        // color: @highlightColor;
        &::before {
          content: '';
          position: absolute;
          left: -250px;
          top: 0;
          height: 40px;
          width: 850px;
          background-color: #eef4fd;
        }
      }
    }
    .ant-tree-node-content-wrapper {
      height: 40px;
      line-height: 40px;
      position: relative;
      padding: 0;
    }
    .ant-tree-switcher.ant-tree-switcher-noop {
      display: none;
    }
    .ant-tree li .ant-tree-node-content-wrapper:hover {
      background-color: transparent;
      .ant-tree-title {
        // color: @highlightColor;
      }
    }
    span.ant-tree-node-selected {
      background-color: transparent !important;
      .ant-tree-title {
        // color: @highlightColor;
      }
    }
    .ant-tree-node-content-wrapper-normal {
      .ant-tree-title {
        position: relative;
        .cus-title > i {
          margin-right: 4px;
        }
        // padding-left: 10px;
        // &::before {
        //   content: "\e7bb";
        //   font-family: "aufontAll" !important;
        //   position: relative;
        //   left: -10px;
        // }
      }
    }
    .ant-tree li span.ant-tree-switcher {
      top: 7px;
    }

    &.dark {
      > ul {
        .ant-tree-node-content-wrapper-normal {
          color: #fff;
          &::before {
            background-color: @hoverColor;
          }
        }
        .cus-title,
        .ant-tree-switcher {
          color: #fff;
        }
        .ant-tree-node-content-wrapper-normal.ant-tree-node-selected {
          color: @highlightColor;
          &::before {
            background-color: #fff;
          }
          // &::after{
          //   content: '';
          //   width: 3px;
          //   height: 24px;
          //   position: absolute;
          //   left:  -10px;
          //   top: 50%;
          //   transform: translateY(-50%);
          //   background-color: @primaryColor;
          //   border-radius: 0 2px 2px 0;
          // }
          .cus-title,
          .ant-tree-switcher {
            color: @highlightColor;
          }
        }
      }
    }
    &.light {
      > ul {
        .ant-tree-node-content-wrapper-normal {
          &::before {
            background-color: @activeBGColor;
          }
        }
        .ant-tree-node-content-wrapper-normal.ant-tree-node-selected {
          color: @highlightColor;
          &::before {
            background-color: @activeBGColor;
          }
          // &:hover{
          //   color: @highlightColor;
          // }
        }

        .ant-tree-node-content-wrapper-normal:hover {
          // color:@highlightColor;
        }
      }
    }
  }
}

//树形弹层
.app-list-search-popover-false,
.app-list-search-popover-true {
  left: 0 !important;
  top: 60px !important;
  padding-top: 0;
  z-index: 97;
  .ant-popover-inner {
    box-shadow: none;
    border-radius: unset;
  }
  .ant-popover-arrow {
    display: none;
  }
  .ant-tree li span.ant-tree-switcher {
    top: 8px;
  }

  .ant-tree li .ant-tree-node-content-wrapper:hover {
    background-color: transparent !important;
    color: @highlightColor;
    .ant-tree-title {
      span {
        color: @highlightColor;
      }
    }
  }
}
.app-list-search-popover-false {
  .ant-popover-inner {
    background-color: @subColor;
  }
}
</style>
