<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    class="app-item app-item-animation"
    :class="showModelMenu ? 'show-menu' : 'hidd-menu'"
    @mouseleave="hiddMenu"
    @mouseenter="showMenu"
    @click.stop="() => {}"
  >
    <div id="left" class="app-item-body">
      <div
        class="appitem-head"
        :style="{ width: showModelMenu ? '100%' : '56px' }"
      >
        <div class="side-icon">
          <div v-show="showModelMenu" class="cancel-icon">
            <i
              class="icon left aufontAll h-icon-all-arrow-left-o"
              @click="cancleToApp"
            ></i>
            <div class="app-name">
              <div class="app-icon">
                <template v-if="appDetails.content">
                  <img
                    :src="'data:image/png;base64,' + appDetails.content"
                    class="content-item-icon"
                  />
                </template>
                <template v-else-if="appDetails.logoUrl">
                  <img
                    v-if="appDetails.logoUrl.indexOf('http') > -1"
                    :src="appDetails.logoUrl"
                    class="content-item-icon"
                  />
                  <img
                    v-else
                    :src="getDownloadUrlNew(appDetails.logoUrl, 'application')"
                    class="content-item-icon"
                  />
                </template>

                <template v-else>
                  <svg class="tabs-app-li-icon icon svgIcon" aria-hidden="true">
                    <use xlink:href="#h-icon-all-application1" />
                  </svg>
                </template>
              </div>

              <span class="appdetail-name" :title="appDetails.name">{{
                appDetails.name
              }}</span>
            </div>
          </div>

          <div v-if="!showModelMenu" class="closeIcon" @click="cancleToApp">
            <i class="icon left aufontAll h-icon-all-arrow-left-o"></i>
          </div>
        </div>
      </div>

      <div class="appitem-body">
        <div v-if="!showModelMenu" class="app-item-simple-body">
          <SimpleSider
            :siderList="appTreeMenu"
            :selectCode="menuTreeSelectID"
          />
        </div>
        <div v-show="showModelMenu" class="app-modal-Navigation">
          <div class="search-input" :class="{ 'not-empty': searchTitle }">
            <InputSearch
              v-model="searchTitle"
              class="treeSearch"
              :placeholder="$t('cloudpivot.list.pc.placeInputKey')"
              :isAsync="true"
              :allowClear="true"
              @search="onSearchChange"
            />
          </div>
          <div v-if="searchTitle && !appTreeMenu.length" class="search-nodata">
            <img src="~@/assets/images/searchNone.png" alt="" />
            <span>暂无搜索结果</span>
          </div>

          <template v-if="searchTitle && appTreeMenu.length">
            <div class="search-result">
              共
              <span>{{ resultArr.length }}</span>
              个结果
            </div>
          </template>
          <a-tree
            :key="TreeKey"
            :defaultSelectedKeys="defaultValue"
            :selectedKeys="defaultValue"
            :multiple="false"
            :showLine="false"
            :defaultExpandAll="defaultExpandAll"
            :expandedKeys="expandedKeys"
            :treeData="appTreeMenu"
            class="menu-new-tree"
            draggable
            @drop="onDrop"
            @select="menuTreeSelect"
            @expand="expand"
          >
            <!-- :draggable="draggable" -->
            <template slot="tree" slot-scope="item">
              <div
                class="menuTreeNode"
                @mouseenter="draggable = false"
                @click="changeModalRouter(item)"
              >
                <div class="menu-item-tree">
                  <template v-if="item.type === 'Folder'">
                    <svg class="icon svg-icon" aria-hidden="true">
                      <use xlink:href="#h-icon-all-department1" />
                    </svg>
                  </template>

                  <template v-else>
                    <i
                      class="icon aufontAll"
                      :class="item.icon"
                      :style="{ color: getIconColor(item) }"
                    ></i>
                  </template>

                  <span
                    v-if="searchTitle === ''"
                    class="move-icon"
                    @mouseenter="draggable = true"
                    @mouseleave="draggable = false"
                  >
                    <i class="icon aufontAll h-icon-all-drag"></i>
                  </span>

                  <span
                    v-if="item.type !== 'Folder'"
                    class="menu-right-icon"
                    @click.stop="() => {}"
                  >
                    <a-popover
                      placement="bottom"
                      trigger="click"
                      overlayClassName="popover-style"
                      :getPopupContainer="getPopupContainer"
                    >
                      <template slot="content">
                        <p @click="openEditModel(item)">
                          {{ $t('languages.Apps.Edit') }}
                        </p>
                        <p
                          v-if="
                            item.type === 'BizModel' || item.type === 'Report'
                          "
                          @click="handleExport(item)"
                        >
                          {{ $t('languages.Apps.Export') }}
                        </p>
                        <p @click.stop="popModel(item)">
                          {{ $t('languages.Apps.Delete') }}
                        </p>
                      </template>
                      <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
                    </a-popover>
                  </span>

                  <span v-else class="menu-right-icon" @click.stop="() => {}">
                    <a-popover
                      placement="bottom"
                      trigger="click"
                      overlayClassName="popover-style width100"
                      :getPopupContainer="getPopupContainer"
                    >
                      <template slot="content">
                        <p @click="openFolderModel(item)">修改分组</p>
                        <p @click.stop="popMenu(item)">
                          {{ $t('languages.Apps.Delete') }}
                        </p>
                      </template>
                      <i class="icon aufontAll h-icon-all-ellipsis-o"></i>
                    </a-popover>
                  </span>

                  <!-- 是否发布标志 -->
                  <div
                    v-if="!item.published && item.type === 'BizModel'"
                    class="is-no-publish"
                  >
                    未发布
                  </div>

                  <span class="text-wrap">
                    <span
                      v-if="
                        searchTitle !== '' &&
                        item.name.indexOf(searchTitle) !== -1
                      "
                      class="menu-right-text"
                      :title="item.name"
                    >
                      {{ item.name.substr(0, item.name.indexOf(searchTitle))
                      }}<span class="highlightColor">{{ searchTitle }}</span>{{
                        item.name.substr(
                          item.name.indexOf(searchTitle) + searchTitle.length,
                        )
                      }}
                    </span>
                    <span
                      v-else
                      class="menu-right-text"
                      :title="getLangName(item, item.i18n)"
                    >
                      {{ getLangName(item, item.i18n) }}
                    </span>
                    <img
                      v-show="item.remarks === '1'"
                      style="width: 20px;height:20px;"
                      src="@/assets/images/start.png"
                      alt="暂无图片"
                    />
                  </span>
                </div>
              </div>
            </template>
          </a-tree>

          <div v-if="searchTitle === ''" class="model-buttons">
            <div class="import model-btn">
              <a-popover placement="top" overlayClassName="add-pop-popover">
                <template slot="content">
                  <div class="add-wrap">
                    <div class="import-item" @click="importModel">业务模型</div>
                    <div class="import-item" @click="importReport">
                      数据分析
                    </div>
                  </div>
                </template>
                <span>导入</span>
              </a-popover>
            </div>

            <div class="import model-btn">
              <a-popover
                placement="top"
                overlayClassName="add-pop-popover"
                :getPopupContainer="getPopupContainer"
              >
                <template slot="content">
                  <div class="add-wrap">
                    <div class="add-item" @click="showNewModel">业务模型</div>
                    <div class="add-item" @click="addReport">数据分析</div>
                    <div class="add-item" @click="addDefinPage">自定义链接</div>
                    <div class="add-item" @click="addGroups">分组</div>
                  </div>
                </template>
                <span>新建</span>
              </a-popover>
            </div>
          </div>
        </div>
      </div>

      <template v-if="!isNoBizModelApp">
        <!-- 导入 -->
        <data-import
          v-if="isShowDataImport"
          ref="dataImport"
          :importType="importType"
          :accept="'.xml'"
          :action="uploadUrl"
          @importEnd="onImportSuccess"
        />

        <!-- 新建模型弹窗 -->
        <AddBizModel v-model="newModel" @getBizModel="getBizModel" />

        <!-- 新建分组弹窗 -->
        <AddFolder
          v-model="showAddFolder"
          :folderModel="folderModel"
          :treeData="appMenu"
          @resetFolderModel="resetFolderModel"
        />

        <!-- 新建自定义页面 -->
        <AddDefinePage
          :key="timeKey"
          :isShowDefinePage="isShowDefinPage"
          :appCode="appCode"
          :code="DefinePage.code"
          :parentId="DefinePage.parentId"
          @cancel="closeDefinePage"
        />

        <!-- 新建报表弹窗 -->
        <AddReport v-model="showAddReport" :mode="mode" :model="model" />

        <!-- 编辑业务模型弹窗 -->
        <UpdateBizModel
          v-model="showUpdateModel"
          :updateModelData="updateModelData"
          @resetBizModel="resetBizModel"
        />
      </template>
    </div>

    <div id="resize" v-show="showModelMenu"></div>

    <!-- 新建 -->
    <!-- <addModal /> -->
  </div>
</template>

<script lang="ts">
import AppItemContent from '@/components/apps/appItemContent.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';
import { namespace } from 'vuex-class';
import MultiTree from './multi-tree.vue';
import BizModel from '@/components/apps/bizModel.vue';
import AddBizModel from '@/components/apps/modals/addBizModel.vue';
import AddFolder from '@/components/apps/modals/addFolders.vue';
import AddDefinePage from '@/components/apps/modals/add-define-page.vue';
import * as ModelAction from '@/typings/model-action';
import AppsApi from '@/apis/apps';
import { listApi } from 'cloudpivot/api';
import AddReport from '@/components/apps/modals/addReport.vue';
import UpdateBizModel from '@/components/apps/modals/updateBizModel.vue';
import {
  Menu,
  Button,
  Dropdown,
  Popover,
  Tree,
  Input,
  Modal,
} from '@h3/antd-vue';
import DataImport from '../../../../components/apps/modals/import/index.vue';
import SimpleSider from './SimpleSider.vue';
import { Download, LanguageTransform } from '@/utils';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
const MenuModule = namespace('Apps/AppItem');

import { EventBus } from 'cloudpivot/form/src/schema/event-bus';

import * as formApi from '@/apis/form';

const AppCenterModule = namespace('Apps/AppCenter');

const DataModelModule = namespace('Apps/DataModel');

const ListdesignModule = namespace('Apps/Listdesign');

import addModal from './addModal.vue';

import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

@Component({
  name: 'AppItem',
  components: {
    AppItemContent,
    AddBizModel,
    AddDefinePage,
    AddReport,
    Draggable,
    MultiTree,
    BizModel,
    DataImport,
    AddFolder,
    SimpleSider,
    UpdateBizModel,
    AMenu: Menu,
    ATree: Tree,
    AButton: Button,
    ADropdown: Dropdown,
    APopover: Popover,
    InputSearch,
    AMenuItem: Menu.Item,
    ASubMenu: Menu.SubMenu,
    AMenuItemGroup: Menu.ItemGroup,
    AModal: Modal,
    addModal,
  },
})
export default class AppItem extends Vue {
  @Prop({ type: String }) appCode: any;

  @AppCenterModule.State('appInfo') appDetails: any;

  @AppCenterModule.Action('getAppDetail') getAppDetail: any;

  @MenuModule.State('appMenu') appMenu: Array<any>;

  @MenuModule.Mutation('setAppCode') setAppCode: any;

  @MenuModule.Mutation('setMenuId') setMenuId: any;

  @MenuModule.Mutation('setAppItem') setAppItem: any;

  @MenuModule.Action('getAppItem') getAppItem: any;

  @MenuModule.Action('appItemTreeSort') appItemTreeSort: any;

  @MenuModule.Action('sortAppItem') sortAppItem: any;

  @MenuModule.State('floders') floders: any;

  @MenuModule.Action('getFolders') getFolders: any;

  @MenuModule.Action('validBizModel') validBizModel: any;

  @MenuModule.Action('deleteBizModel') deleteBizModel: any;

  @MenuModule.Action('validFolders') validFolders: any;

  @MenuModule.Action('deleteFolders') deleteFolders: any;

  @DataModelModule.State('customButtonEdit') customButtonEdit: boolean;

  @DataModelModule.Mutation('setDatacustomButton') setDatacustomButton: any;

  @ListdesignModule.State('edit') edit: boolean;

  addModal: boolean = false;

  showIcon: boolean = false;

  expandedKeys: string[] = [];

  expand(...arg) {
    this.expandedKeys = arg[0];
  }

  code: string = '';

  all: boolean = true;

  defaultValue: string[] = [];

  mode: 'add' | 'edit' = 'add';

  draggable: boolean = true;

  onDrop(info) {
    console.log(info);
    const dropKey = info.node.eventKey;
    const dragKey = info.dragNode.eventKey;
    const dropPos = info.node.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...this.appTreeMenu];
    // Find dragObject
    let dragObj; // 被拖动的目标
    let dragArr; // 源组
    let oldIndex;
    loop(data, dragKey, (item, index, arr) => {
      dragArr = arr;
      oldIndex = index;
      arr.splice(index, 1);
      dragObj = item;
    });
    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item, i) => {
        // 如果到非分组上，不做处理
        if (item.type !== 'Folder') {
          dragArr.splice(oldIndex, 0, dragObj);
          return;
        }
        item.children = item.children || [];
        dragObj.parentId = item.id;
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
        this.sortApp({
          code: dragObj.code,
          parentId: item.id,
          sortKey: item.children.length + 1,
        });
      });
    } else if (
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });

      const parentId = ar[0].parentId;
      let index: number = 0;

      if (dropPosition === -1) {
        index = i + 1;
      } else {
        index = i + 2;
      }

      // 非模型数量
      const notFolderCount = ar.filter(
        (el: any) => el.type !== 'Folder',
      ).length;

      // 模型数量
      // const folderCount = ar.filter((el:any) => el.type === 'Folder').length;

      if (dragObj.type === 'Folder') {
        // 拖动对象是分组

        // 如果序号小于非模型数量：分组移动到非分组中间=> 不允许
        if (index <= notFolderCount) {
          dragArr.splice(oldIndex, 0, dragObj);

          return;
        }
        // 如果拖动的是分组，序号需要减去非分组数量
        index = index - notFolderCount;
      } else {
        //拖动对象是非分组
        // 如果序号大于非模型数量：非模型移动到分组中间=> 不允许
        if (index > notFolderCount + 1) {
          dragArr.splice(i, 0, dragObj);
          return;
        }
      }

      dragObj.parentId = parentId;
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
      this.sortApp({
        code: dragObj.code,
        parentId: parentId,
        sortKey: index,
      });
    }

    this.appTreeMenu = data;

    this.setAppItem(data);
  }

  async sortApp(params) {
    const res = await this.appItemTreeSort(params);
  }

  toShowAddModal() {
    this.updateModelData = {};
    this.addModal = true;
  }

  isNoBizModelApp: boolean = false;

  // 获取应用图标
  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId, 'application');
  }

  init() {
    this.getFolders({ appCode: this.$route.params.appCode });
    this.getAppDetail({ appCode: this.$route.params.appCode });
    if (['noBizModelpage'].includes(this.$route.name)) {
      this.isNoBizModelApp = true;
      // 应用新建，不存在模型
      return;
    }
    this.isNoBizModelApp = false;
    // 初始化
    if (this.$route.params.bizSchemaCode || this.$route.params.reportCode) {
      this.defaultValue = [
        this.$route.params.bizSchemaCode || this.$route.params.reportCode,
      ];
      this.menuTreeSelectID =
        this.$route.params.bizSchemaCode || this.$route.params.reportCode;
    }

    EventBus.$on('published', (param: any) => {
      this.setPublished(param.bizSchemaCode);
    });

    EventBus.$on('hiddenMenu', (param: any) => {
      this.hiddMenu();
    });
  }

  created() {
    this.init();
  }

  setPublished(code) {
    const loop = (data, code) => {
      data.forEach((item, index, arr) => {
        if (item.code === code) {
          item.published = true;
        }
        if (item.children) {
          return loop(item.children, code);
        }
      });
    };

    loop(this.appTreeMenu, code);
    loop(this.appMenu, code);
    this.appTreeMenu = [...this.appTreeMenu];
  }

  mounted() {
    if (this.$route.params.bizSchemaCode || this.$route.params.reportCode) {
      this.defaultValue = [
        this.$route.params.bizSchemaCode || this.$route.params.reportCode,
      ];
      this.menuTreeSelectID =
        this.$route.params.bizSchemaCode || this.$route.params.reportCode;
    }

    this.setMenuId('');
    document.addEventListener('click', this.hiddMenu);
  }

  beforeDestroy() {
    document.removeEventListener('click', this.hiddMenu);
  }

  cancleToApp() {
    this.$router
      .push({
        name: 'appcenter',
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  getIconColor(item) {
    if (item.bindWorkflow) {
      return '#F12D98 ';
    }
    if (item.type === 'BizModel') {
      return '#2970FF';
    } else if (item.type === 'Page') {
      return '#13C2C2';
    } else if (item.type === 'Report') {
      return '#FFC53D';
    } else {
      //Else Empty block statement
    }
  }

  showModelMenu: boolean = true;

  hiddMenu() {
    if (this.isResize || ['noBizModelpage'].includes(this.$route.name)) {
      return;
    }
    this.searchTitle = '';
    const left: any = document.getElementById('left');
    left.style.width = '56px';
    this.showModelMenu = false;
    this.setAppMenuIndex(false)
  }

  showMenu() {
    if (this.isResize) {
      return;
    }
    const left: any = document.getElementById('left');
    left.style.width = this.defaultShowWidth;
    this.showModelMenu = true;

    this.setAppMenuIndex(true)
  }

  setAppMenuIndex(type){
    const appMenuDom = document.querySelector('#app-menu') as HTMLElement;
    if(appMenuDom){
      appMenuDom.style.zIndex = type ? '1002' : '999'
    }
  }

  defaultShowWidth: string = '246px';

  searchTitle: string = '';

  TreeKey: number = 0;

  defaultExpandAll: boolean = false;

  //模型搜索
  onSearchChange() {
    this.resultArr = [];
    if (this.searchTitle === '') {
      this.defaultExpandAll = false;
    } else {
      this.defaultExpandAll = true;
    }
  }

  appTreeMenu: any[] = [];

  @Watch('searchTitle')
  toSetAppTreeMenu() {
    this.setAppTreeMenu();
  }

  @Watch('appMenu', {
    immediate: true,
  })
  toSetAppTreeMenu2() {
    this.setAppTreeMenu();
  }

  //模型列表数据
  setAppTreeMenu() {
    if (this.searchTitle) {
      this.resultArr = [];
    }

    this.nodeSearchTitle(this.innitAppTreeMenu(this.appMenu));
    this.appTreeMenu = this.searchTitle
      ? this.resultArr
      : this.innitAppTreeMenu(this.appMenu);
  }

  resultArr: any[] = [];

  nodeSearchTitle(nodeArr) {
    if (!nodeArr || nodeArr.length === 0) {
      return;
    }
    const res = nodeArr.filter((item) => {
      if (item.name.indexOf(this.searchTitle) > -1) {
        if (
          item.type !== 'Folder' &&
          !this.resultArr.includes(item.code) &&
          !this.resultArr.includes(item)
        ) {
          this.resultArr.push(item);
        }
        if (item.children) {
          item.children = this.nodeSearchTitle(item.children);
        }
        return item;
      } else if (
        this.nodeSearchTitle(item.children) &&
        this.nodeSearchTitle(item.children).length !== 0
      ) {
        if (item.children) {
          item.children = this.nodeSearchTitle(item.children);
        }
        return item;
      } else {
        //Else Empty block statement
      }
    });
    return res;
  }

  innitAppTreeMenu(TreeMenu) {
    if (!TreeMenu) {
      return;
    }
    let arr = [];
    arr = TreeMenu.map((item) => {
      const itemChildren = this.innitAppTreeMenu(item.children);

      item = {
        ...item,
        value: item.id,
        key: item.code,
        title: item.name,
        children: itemChildren,
        selectable: item.type === 'Folder' ? false : true,
        class:
          'menu-tree-node ' +
          (itemChildren && itemChildren.length !== 0
            ? 'hasChildren'
            : 'noChildren ') +
          (item.type === 'Folder' ? ' Folder' : ' BizModel'),
        scopedSlots: { title: 'tree' },
      };
      return item;
    });
    return arr;
  }

  @Watch('appTreeMenu')
  showTreeAllChange(value) {
    if (value) {
      this.$nextTick(() => {
        this.resize();
      });
    }
  }

  @Watch('$route')
  onRouteChange(...arg) {
    if (arg[1].name === 'noBizModelpage') {
      this.getAppItem({ appCode: this.$route.params.appCode });
      this.init();
    }

    if (this.$route.params.bizSchemaCode || this.$route.params.reportCode) {
      this.defaultValue = [
        this.$route.params.bizSchemaCode || this.$route.params.reportCode,
      ];
      this.menuTreeSelectID =
        this.$route.params.bizSchemaCode || this.$route.params.reportCode;
    }
  }

  menuTreeSelectID: string = '';

  menuTreeSelect(id) {
    this.defaultValue = [id[0]];
    this.menuTreeSelectID = id[0];
  }

  isResize: boolean = false;

  //手动调节树形视图宽度
  resize() {
    const resize: any = document.getElementById('resize') as HTMLElement;
    const left: any = document.getElementById('left');
    const vm = this;
    resize.onmousedown = function (e) {
      console.log('isResize', vm.isResize);
      vm.isResize = true;
      const startX = e.clientX;
      const resizeLeft = resize.offsetLeft;
      document.onmousemove = function (e) {
        const endX = e.clientX;
        let moveLen = resizeLeft + (endX - startX);
        const maxl = 700; //视图的最大宽度
        if (moveLen < 235) {
          moveLen = 235;
        }

        if (moveLen > maxl) {
          moveLen = maxl;
        }
        resize.style.left = String(moveLen);
        left.style.width = moveLen + 'px';
        vm.defaultShowWidth = moveLen + 'px';
      };
      document.onmouseup = function (evt) {
        vm.isResize = false;
        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    };
  }

  async changeModalRouter(e) {
    if (e.type === 'Folder') {
      return;
    }
    const codeBiz: any = Object.assign(
      {},
      { codeX: this.$route.params.bizSchemaCode },
    );
    if (e.type === 'Page') {
      const href = `/apps/model/${this.$route.params.appCode}/${e.code}/customPage`;
      this.$router.push(href).catch((err: any) => {
        console.log(err);

        this.setCheckedTreeNode(
          this.$route.params.bizSchemaCode || this.$route.params.reportCode,
        );
      });
    } else if (e.type === 'BizModel') {
      const res = await this.getFormList(e.code);
      const href = `/apps/model/${this.$route.params.appCode}/${e.code}/form-design/${res[0].code}`;
      this.$router.push(href).catch((err: any) => {
        console.log(err);
        this.setCheckedTreeNode(
          this.$route.params.bizSchemaCode || this.$route.params.reportCode,
        );
      });
    } else if (e.type === 'Report') {
      const href = `/apps/${this.$route.params.appCode}/report-design/${e.code}/isNew/false`;
      this.$router.push(href).catch((err: any) => {
        console.log(err);
        this.setCheckedTreeNode(
          this.$route.params.bizSchemaCode || this.$route.params.reportCode,
        );
      });
    } else {
      //Else Empty block statement
    }
    if (codeBiz.codeX !== e.code && !this.customButtonEdit && !this.edit) {
      this.setDatacustomButton([]);
    }
  }

  setCheckedTreeNode(code) {
    this.defaultValue = [code];
    this.menuTreeSelectID = code;
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode;
  }

  folderModel: any = {};

  // 重置传入分组模态窗的数据
  resetFolderModel() {
    this.folderModel = {};
  }

  newModel: boolean = false;

  getBizModel(modelData) {
    const href = `/apps/model/${this.appCode}/${modelData.code}/form-design/${modelData.code}`;

    this.defaultValue = [modelData.code];

    this.menuTreeSelectID = modelData.code;

    this.TreeKey = this.TreeKey + 1;

    this.$router.push(href).catch((err: any) => {
      console.log(err);
    });
  }

  // 打开新建模型模态窗
  showNewModel(id: string) {
    if (id && typeof id === 'string') {
      this.setMenuId(id);
    }
    this.newModel = true;
  }

  showAddFolder: boolean = false;

  // 是否展示文件上传
  isShowDataImport: boolean = false;

  //文件上传类型
  importType: string = '';

  //导入模型
  importModel() {
    this.importType = 'bizmodel';
    this.isShowDataImport = true;
  }

  //导入报表
  importReport() {
    this.importType = 'report';
    this.isShowDataImport = true;
  }

  /**
   * 导入成功的时候
   */
  onImportSuccess(v: boolean) {
    const fileName: string = (this.$refs.dataImport as any).fileName;
    if (fileName && !v) {
      listApi.deleteTemporaryFile({ fileName });
    }
    this.isShowDataImport = v;
    this.getAppItem({ appCode: this.appCode });
  }

  get uploadUrl() {
    return AppsApi.fileUploadUrl2;
  }

  /* *
   * 打开编辑分组模态窗
   */
  openFolderModel(item: any) {
    this.showIcon = false;
    this.folderModel = item;
    this.showAddFolder = true;
  }

  /* *
   * 删除分组
   */
  popMenu(item: any) {
    this.showIcon = false;
    item.showPop = false;
    const vm: any = this;
    const validParams: Apps.AppItem.ValidFolder = {
      folderId: item.id,
      appCode: this.appCode,
    };
    const deleteParams: Apps.AppItem.DeleteFolders = {
      folderId: item.id,
    };
    this.validFolders(validParams).then((res: Common.Data) => {
      if (res.errcode) {
        /* 删除分组 —— 分组下有模型 */
        let contents: any = this.$t(
          'languages.Apps.GroupHasModelCannotBeDelete',
        );
        if (res.errcode === 600036) {
          contents = res.errmsg;
        }
        this.$warning({
          title: this.$t('languages.Apps.DeletePrompt'),
          okText: this.$t('languages.Apps.Ok').toString(),
          cancelText: this.$t('languages.Apps.Cancel').toString(),
          content: contents, // '该分组下已经创建了模型，不能被删除，请先删除模型! '
          onOk() {
            vm.isClose = false;
          },
        });
      } else {
        /* 删除分组 —— 分组下无模型 */
        this.$confirm({
          title: this.$t('languages.Apps.ConfirmDelete', { name: item.name }), // `确定要删除“${item.title}”吗？`,
          okType: 'danger',
          okText: this.$t('languages.Apps.Delete').toString(),
          cancelText: this.$t('languages.Apps.Cancel').toString(),
          onOk() {
            vm.isClose = false;
            vm.setMenuId('');
            vm.deleteFolders(deleteParams).then((res) => {
              if (!res.errcode) {
                vm.$message.success(res.errmsg);
              } else {
                vm.$message.error(res.errmsg);
              }
            });
          },
          onCancel() {
            vm.isClose = false;
          },
        });
      }
    });
  }

  // 新建分组
  addGroups() {
    // 新建分组弹窗
    this.showAddFolder = true;
  }

  // 是否展示自定义页面
  isShowDefinPage: boolean = false;

  /**
   * 添加自定义页面
   */
  addDefinPage() {
    this.isShowDefinPage = true;
    this.DefinePage = {
      parentId: this.appDetails.id,
    };
    this.timeKey = new Date().getTime();
  }

  closeDefinePage(isGetItems: boolean) {
    this.isShowDefinPage = false;
    this.DefinePage = {};
    if (isGetItems) {
      this.getAppItem({ appCode: this.appCode });
    }
  }

  showAddReport: boolean = false;

  // 新增报表
  addReport() {
    this.mode = 'add';
    // 新增报表弹窗
    this.showAddReport = true;
  }

  helpCenter() {
    window.open('https://www.yuque.com/skwme4/hyk0u0/azfzyx', '_blank');
  }

  // 模型弹框
  updateModelData: any = {};

  showUpdateModel: boolean = false;

  DefinePage: any = {};

  editType: string = '';

  timeKey: number = new Date().getTime();

  openEditModel(item: any) {
    // 打开编辑业务模型模态窗
    item.showPop = false;
    this.showIcon = false;
    this.updateModelData = item;
    this.mode = 'edit';

    switch (item.type) {
      case ModelAction.ModelType.BizModal:
        this.showUpdateModel = true;
        break;
      case ModelAction.ModelType.Page:
        this.isShowDefinPage = true;
        this.DefinePage = item;
        this.timeKey = new Date().getTime();
        break;
      case ModelAction.ModelType.Report:
        this.showAppReport(item);
        break;
      default:
        break;
    }
  }

  /**
   * 导出操作
   */
  async handleExport(item: any) {
    /* this.isShowPop = false; */
    this.showIcon = false;
    if (!item) {
      return;
    }
    item.showPop = false;
    const res = await AppsApi.export_package({ schemaCode: item.code });
    if (res.errcode && res.errcode !== 0) {
      this.$message.error(
        (this as any).$t('languages.Apps.ExportError') as string,
      );
    } else {
      const fileStream: any = res;
      const fileType: string = 'application/xml';
      const fileName: string = `${item.name}.xml`;
      Download.downloadByPost(fileStream, fileType, fileName);
    }
  }

  /* *
   * 删除模型
   */
  popModel(item: any) {
    /* if (this.isClose) {
      // 避免重复点击删除弹窗
      return;
    } */
    /* this.isShowPop = false; */
    this.showIcon = false;
    item.showPop = false;

    /* this.isClose = true; */
    if (item.type === 'BizModel') {
      this.goDeleteBizmodel(item);
    } else if (item.type === 'Page') {
      this.deleteDefinePage(item);
    } else if (item.type === 'Report') {
      this.deleteReportConfirm(item);
    } else {
      //Else Empty block statement
    }
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

  async toFirstModel(item) {
    const appCode = this.$route.params.appCode;
    const res = await this.getAppItem({ appCode: appCode });
    this.$nextTick(async () => {
      // 删除的不是当前显示的模型，不做跳转
      if (
        item.code !== this.$route.params.bizSchemaCode &&
        item.code !== this.$route.params.reportCode
      ) {
        return;
      }
      const firstModel: any = this.getAppFirstcode(res.data);
      let href = '';
      if (firstModel.type === 'Page') {
        href = `/apps/model/${appCode}/${firstModel.code}/customPage`;
      } else if (firstModel.type === 'BizModel') {
        const result = await this.getFormList(firstModel.code);
        href = `/apps/model/${appCode}/${firstModel.code}/form-design/${result[0].code}`;
      } else if (firstModel.type === 'Report') {
        href = `/apps/${appCode}/report-design/${firstModel.code}/isNew/false`;
      } else {
        href = `/apps/noBizModel/${appCode}/noBizModelpage`;
      }
      this.defaultValue = [firstModel.code];
      this.menuTreeSelectID = firstModel.code;

      this.TreeKey = this.TreeKey + 1;

      // 记录是删除
      sessionStorage.setItem('isDelModel', 'true');
      this.$router.push(href).catch((err: any) => {
        console.log(err);
      });
    });
  }

  getAppFirstcode(appData) {
    let firstModal: any = '';

    const loop = (appData) => {
      try {
        appData.map((item) => {
          if (item.type !== 'Folder' && item.code) {
            if (firstModal === '') {
              firstModal = {
                code: item.code,
                type: item.type,
              };
            }
            throw Error;
          } else if (item.children && item.children.length !== 0) {
            if (firstModal === '') {
              loop(item.children);
            }
          } else {
            //Else Empty block statement
          }
        });
      } catch (error) {}
    };

    loop(appData);
    return firstModal;
  }

  /**
   * 删除业务模型
   */
  goDeleteBizmodel(item: any) {
    const vm: any = this;
    const validModelParams: Apps.AppItem.ValidBizModel = {
      bizModelId: item.id,
      appCode: this.appCode,
    };
    const deleteModelParams: Apps.AppItem.DeleteBizModel = {
      bizModelId: item.id,
    };
    this.validBizModel(validModelParams).then((res: Common.Data) => {
      if (res.errcode === 304010) {
        /* this.isClose = false; */
        vm.$message.error(res.errmsg);
      }
      if (res.errcode) {
        /* 删除模型 —— 模型下有业务数据 */
        const errorTips = {
          1: '该模型下已经创建了业务数据，不能被删除，请先删除业务数据！',
          2: '当前模型与以下模型存在关联关系，请先解除关联关系后再删除模型:',
        };
        const renderTips = function (h) {
          const tips: any = [];
          const errTypes: number[] = res.data.errTypes;
          errTypes.forEach((tip, index) => {
            if (tip === 1) {
              tips.push(h('p', `${index + 1}、${errorTips[tip]}`));
            } else {
              const schemaMessageList: any[] = [];
              res.data.schemaMessageList.forEach((s) => {
                schemaMessageList.push(
                  h('p', `${s.appPackage.name}-${s.appFunction.name}`),
                );
              });
              tips.push(
                h('p', `${index + 1}、${errorTips[tip]}`),
                schemaMessageList,
              );
            }
          });
          return h(
            'div',
            {
              class: {
                warningtips: true,
              },
            },
            tips,
          );
        };
        this.$error({
          title: '检查出以下错误，全部修正才可以删除！', //(this as any).$t("languages.Apps.DeletePrompt")
          okText: (this as any).$t('languages.Apps.Ok').toString(),
          cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
          content: renderTips,
          // content: (this as any).$t("languages.Apps.ModelHasBizDataCannotBeDelete"), // 该模型下已经创建了业务数据，不能被删除，请先删除业务数据!
          onOk() {
            vm.isClose = false;
          },
          onCancel() {
            vm.isClose = false;
          },
        });
      } else {
        let name = item.name;
        if (this.$i18n.locale === 'en' && item.name_i18n) {
          const name_i18n =
            typeof item.name_i18n === 'string'
              ? JSON.parse(item.name_i18n)
              : item.name_i18n;
          name = name_i18n[this.$i18n.locale] || name;
        }

        /* 删除模型 —— 模型下无业务数据 */
        this.$confirm({
          title: (this as any).$t('languages.Apps.ConfirmDelete', {
            name: name,
          }),
          content: (this as any).$t('languages.Apps.ConfirmDeleteConfirm'),
          okType: 'danger',
          okText: (this as any).$t('languages.Apps.Delete').toString(),
          cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
          onOk() {
            vm.isClose = false;
            vm.deleteBizModel(deleteModelParams)
              .then((e: any) => {
                vm.toFirstModel(item);
                vm.$message.success('删除成功！');
              })
              .catch((e: any) => {
                if (e.errcode === 402508) {
                  vm.$message.error(
                    vm.$t('languages.Apps.DataModelDeleteErrorTip1'),
                  );
                } else if (e.errcode === 304004) {
                  vm.$message.error(
                    vm.$t('languages.Apps.DataModelDeleteErrorTip2'),
                  );
                } else if (e.errcode > 0) {
                  vm.$message.error(
                    vm.$t('languages.Apps.DataModelDeleteError'),
                  );
                } else {
                  //Else Empty block statement
                }
              });
            vm.currentItemID = item.parentId;
          },
          onCancel() {
            vm.isClose = false;
          },
        });
      }
    });
  }

  /**
   * 删除自定义页面
   */
  deleteDefinePage(item: any) {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.ConfirmDelete', {
        name: item.name,
      }),
      content: (this as any).$t('languages.Apps.ConfirmDeleteConfirm'),
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        vm.isClose = false;
        const params = {
          code: item.code,
        };
        AppsApi.deleteDefinePage(params).then((res: any) => {
          if (res.errcode === 0) {
            vm.$message.success('删除成功!');
            // 刷新数据项
            vm.getAppItem({ appCode: item.appCode });
            vm.toFirstModel(item);
          } else {
            vm.$message.error(res.errmsg);
          }
        });
      },
      onCancel() {
        vm.isClose = false;
      },
    });
  }

  /**
   * 删除报表
   */
  deleteReportConfirm(item: any) {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.ConfirmDelete', {
        name: item.name,
      }),
      content: (this as any).$t('languages.Apps.ConfirmDeleteConfirm'),
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        const params = {
          code: item.code,
        };
        AppsApi.deleteAppReport(params).then((res: any) => {
          if (res.errcode === 0) {
            vm.$message.success('删除成功!');
            vm.isClose = false;
            // 刷新数据项
            vm.getAppItem({ appCode: item.appCode });
            vm.toFirstModel(item);
          } else {
            vm.$message.error(res.errmsg);
          }
        });
      },
      onCancel() {
        vm.isClose = false;
      },
    });
  }

  /* *
   * 重置传入业务模型模态窗的数据
   */
  resetBizModel(item: any) {
    this.updateModelData = {};
  }

  model: any = '';

  showAppReport(item: any) {
    const closeLoad = (this.$message as any).loading();

    AppsApi.getAppReport({
      code: item.code,
    }).then(
      (res: any) => {
        closeLoad();
        if (res.errcode === 0) {
          this.showAddReport = true;
          this.model = res.data;
          this.model.parentId = item.parentId;
        } else {
          this.$message.error(res.errmsg);
        }
      },
      () => closeLoad(),
    );
  }

  beforeMount() {
    if (this.$route.params.appCode) {
      const appParams: any = {
        appCode: this.appCode,
      };
      this.setAppCode(appParams);
      this.getAppItem(appParams);
    }
  }

  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }
}
</script>

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
  height: calc(100vh - 64px);
  float: left;
  box-shadow: 1px 0px 0px 0px #e8e8e8;
  position: relative;
  overflow: hidden;
  z-index: 2;
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
    height: calc(100vh - 64px - 24px);
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
            padding-right: 38px !important;
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
              padding-right: 38px !important;
            }
            .setting {
              visibility: visible;
            }
            .is-no-publish {
              display: none;
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

          .is-no-publish {
            display: none;
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

.popover-style {
  .ant-popover-inner {
    box-shadow: unset;
    background-color: transparent;
  }
  .ant-popover-inner-content {
    padding: 2px 0;
    background-color: #fff;
    border-radius: 4px;
    margin-top: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    width: 80px !important;
    margin-left: -43px;
  }
  &.width100 {
    .ant-popover-inner-content {
      width: 100px !important;
    }
  }
  .ant-popover-arrow {
    display: none !important;
  }
  p {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    color: @nav-font-color;
    border: none;
    ::before,
    ::after {
      display: none;
    }
    &:hover {
      color: @primary-color;
      background-color: transparent;
    }
    &:last-child {
      border-top: 1px solid #eee;
      padding-top: 4px;
      margin-top: 4px;
      height: 40px;
      padding-bottom: 4px;
    }
  }
}

.app-router-wrap {
  height: calc(100vh - 64px);
  overflow: hidden;
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

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
@import '~@/styles/color/colors.less';

@keyframes leftToright {
  from {
    transform: translateX(-180px);
  }
  to {
    transform: translateX(0px);
  }
}

.app-item-animation {
  animation: leftToright linear 0.4s infinite;
  animation-iteration-count: 1;
}

.app-item {
  position: fixed;
  z-index: 999;
  top: 0px;
  left: 0px;
  min-height: 60px;
  height: 100vh;
  display: flex;
  background-color: rgba(255, 255, 255, 1);
  border-right: 1px solid #dddddd;
  &.show-menu {
    border-right: none;
    // &::before {
    //   content: '';
    //   width: 246px;
    //   top: 110px;
    //   bottom: 0;
    //   left: 65px;
    //   background: #ffffff;
    //   opacity: 0.8;
    //   filter: blur(4px);
    //   position: absolute;
    // }
    box-shadow: 1px 0px 24px 0px rgba(181, 186, 188, 0.52);
    // #left {
    //   box-shadow: 1px 0px 10px 0px rgba(181, 186, 188, 0.52);
    // }
  }
  .app-item-body {
    height: 100%;
    .app-item-simple-body {
      width: 100%;
    }
    .search-result {
      padding: 0 16px;
      font-size: 12px;
      color: @nav-font-color;
      margin-top: 16px;
      margin-bottom: 8px;
      span {
        margin: 0 2px;
        color: @primary-color;
      }
    }
  }
  #left {
    height: 100%;
    overflow: hidden;
    background-color: #f7f8fa;
    z-index: 9;
    max-width: 700px;
    width: 246px;
    transition: all 0.3s ease;
  }
  #resize {
    width: 4px;
    height: 100%;
    position: relative;
    background: #f7f8fa;
    z-index: 99;
    &:hover {
      cursor: w-resize;
      border-right: solid 2px rgba(41, 112, 255, 0.8);
    }
  }
}
.appitem-head {
  height: 60px;
  background-color: #f7f8fa;
  color: @nav-font-color;
}
.show-menu {
  .side-icon {
    justify-content: flex-start;
    width: 100%;
    .cancel-icon {
      margin-left: 4px;
      width: 100%;
      .app-name {
        flex: 1;
        overflow: hidden;
      }
    }
  }
}

.side-icon {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: @nav-font-color;
  .cancel-icon {
    font-size: 16px;
    display: flex;
    align-items: center;
    i {
      padding-left: 16px;
    }
    .app-name {
      margin-left: 25px;
      margin-right: 18px;
      display: flex;
      align-items: center;
      .app-icon {
        width: 28px;
        height: 28px;
        border-radius: 2px;
        border: 1px solid #eeeeee;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 28px;
          height: 28px;
        }
        svg {
          width: 18px;
          height: 18px;
        }
      }

      img {
        width: 28px;
        height: 28px;
      }
      .appdetail-name {
        color: #111218;
        padding-left: 12px;
        font-weight: bold;
        white-space: nowrap;
        // max-width: 166px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.closeIcon {
  z-index: 9;
  /* top: 48vh; */
  .icon {
    // position: absolute;
    // top: 16px;
    height: 20px;
    width: 20px;
  }
  .left {
    right: 20px;
  }
  .right {
    left: 20px;
  }
}
.appitem-body {
  height: 100%;
  display: flex;
}
.app-modal-Navigation {
  position: relative;
  display: inline-block;
  width: 100%;
  height: calc(100% - 60px);
  background-color: #f7f8fa;
  /deep/ul li {
    margin-right: 12px;
    ul li {
      margin-right: 0;
    }
  }
  /deep/& > ul > li:last-child {
    padding-bottom: 20px !important;
    background-color: transparent !important;
  }
  .search-input {
    padding: 6px 12px 4px;
    width: 100%;
    /deep/.ant-input {
      background-color: #e5e9ef;
      border-radius: 2px;
      padding-right: 11px;
      padding-left: 36px;
      border: none;
      &:focus {
        background-color: #fff;
        border: 1px solid @primary-color;
      }
    }
    /deep/.ant-input-affix-wrapper .ant-input-suffix {
      .ant-input-search-icon {
        margin-left: 0;
        display: none;
      }
    }
    /deep/.ant-input-prefix {
      left: 10px;
      i {
        font-size: 16px;
        color: rgba(17, 18, 24, 0.25);
      }
    }
    &.not-empty {
      /deep/.ant-input {
        background-color: #fff;
        border: 1px solid @primary-color;
      }
    }
  }
  .search-nodata {
    margin-top: 32px;
    text-align: center;
    color: rgba(17, 18, 24, 0.5);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      width: 162px;
    }
    span {
      font-size: 14px;
      color: rgba(17, 18, 24, 0.5);
      line-height: 22px;
    }
  }
  .menu-new-tree {
    width: 100%;
    height: calc(100% - 96px);
    padding-bottom: 90px;
    overflow-y: auto;
    overflow-x: hidden;
    &::-webkit-scrollbar {
      width: 0px;
    }

    /deep/ .ant-tree-node-content-wrapper {
      height: 40px;
      line-height: 36px;
      width: 100%;
      padding: 0 5px 0 8px;
      .menu-item-tree {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        svg {
          width: 18px;
          height: 18px;
          display: inline-block;
        }
      }
    }

    /deep/li .ant-tree-node-content-wrapper {
      border-radius: 2px;
      &:hover {
        background-color: #dbe8fc;
      }
    }

    /deep/.menu-tree-node {
      margin-left: 12px;
      padding: 0;
      border-radius: 4px;
    }
    .highlightColor {
      color: @primary-color;
    }
  }
  /deep/ .ant-menu-inline {
    border-right: none;
  }
  /deep/ .ant-menu {
    background-color: #f7f8fa;
    color: #111218;
  }
  .model-buttons {
    position: absolute;
    display: flex;
    bottom: 0px;
    height: 48px;
    padding: 12px 0;
    left: 16px;
    right: 16px;
    border-top: 1px solid #e4e4e4;
    background-color: #f7f8fa;

    .model-btn {
      display: inline-block;
      flex: 1;
      text-align: center;
      color: @nav-font-color;
      cursor: pointer;
      &:first-child {
        border-right: 1px solid #d8d8d8;
      }
      &:last-child {
        color: @primary-color;
      }
    }

    i {
      position: relative;
      left: 15px;
      z-index: 7;
      color: #111218;
    }
    .button {
      border: none;
      background-color: #f7f8fa;
      color: #111218;
    }
    .newModal {
      border-left: 1px solid #d8d8d8;
      .new-group {
        border-top: 1px solid #eeeeee;
      }
      .help-center {
        border-top: 1px solid #eeeeee;
      }
    }
  }

  /deep/ .menu-tree-node {
    position: relative;
  }

  /deep/.noChildren {
    .ant-tree-switcher-noop {
      display: none;
    }
    &.ant-tree-node-selected,
    &.ant-tree-treenode-selected {
      background-color: #dbe8fc !important;
    }
    &:hover {
      background-color: #dbe8fc;
      .menu-right-icon {
        visibility: visible !important;
      }
      .move-icon {
        display: inline-block;
      }

      .is-no-publish {
        display: none;
      }
    }
  }

  /deep/.ant-tree-switcher {
    i {
      color: @light-font-color;
    }
  }

  /deep/.hasChildren {
    &.Folder {
      .ant-tree-node-content-wrapper:not(.ant-tree-node-content-wrapper-normal) {
        width: calc(100% - 24px);
        .menu-item-tree {
          width: 100%;
          display: flex;
          align-items: center;
          .text-wrap {
            display: inline-block;
            width: calc(100% - 56px);
            flex: unset !important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }

  /deep/.menu-item-tree {
    width: calc(100% - 56px);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  /deep/.noChildren {
    &.BizModel {
      .ant-tree-node-content-wrapper {
        display: block;
      }
    }
  }

  /deep/.ant-tree-node-selected,
  /deep/.ant-tree-treenode-selected {
    background-color: transparent !important;
    .menu-right-text {
      color: @primary-color;
      font-weight: 600;
    }
  }
  /deep/.menu-tree-node {
    .menu-right-text {
      margin-left: 10px;
      color: #111218;
    }
  }
  /deep/.ant-tree-treenode-selected {
    .menu-right-text {
      color: @primary-color;
    }
  }

  /deep/.Folder {
    .ant-tree-switcher {
      height: 40px;
      line-height: 40px;
    }

    .menu-item-tree:hover {
      .menu-right-icon {
        visibility: visible !important;
      }
      .move-icon {
        display: inline-block;
      }

      .is-no-publish {
        display: none;
      }
    }

    .menu-tree-node {
      margin-left: 5px;
    }

    & > .ant-tree-node-content-wrapper {
      & > .ant-tree-title {
        .menu-item-tree {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .text-wrap {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .menu-right-icon {
    position: absolute;
    display: inline-block;
    width: 25px;
    right: 0px;
    visibility: hidden;
    .isshow {
      visibility: visible !important;
      display: inline-block !important;
    }
    /deep/ .ant-popover-inner-content {
      width: 60px;
    }
    i {
      font-size: 14px;
      color: @primary-color;
    }
  }
  .move-icon {
    position: absolute;
    right: 32px;
    display: none;
    &:hover {
      cursor: move;
    }
    i {
      font-size: 12px;
      color: @primary-color;
    }
  }
}
.router-wrap-modal {
  overflow: hidden;
  height: calc(100vh - 64px);
  background: #e9edf2;
  padding: 12px;
  .router-wrap-modal-content {
    background: #fff;
    height: 100%;
    width: 100%;
    overflow: auto;
    border-radius: 5px;
  }
}
</style>

<style lang="less">
@import '~@/styles/color/colors.less';
.new-modal-style {
  .add-app__wrap {
    & > .ant-row {
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
      .ant-col-12 {
        padding-right: 16px !important;
        &:last-child {
          padding-right: 0 !important;
        }
      }
    }
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
          small {
            font-size: 12px;
            color: @light-font-color;
            margin-left: 16px;
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

<style lang="less">
@import '~@/styles/color/colors.less';

.menuTreeNode {
  // position: relative;
  .is-no-publish {
    position: absolute;
    right: 0px;
    margin-top: 8px;
    height: 20px;
    line-height: 18px;
    padding: 0 8px;
    background-color: rgba(17, 18, 24, 0.05);
    color: @nav-font-color;
    border: 1px solid rgba(17, 18, 24, 0.1);
    font-size: 12px;
    font-weight: 400;
    border-radius: 10px;
    display: inline-block;
  }
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 39px;
  border: 1px solid #d4d5d6;
  border-radius: 2px;
  cursor: pointer;
  em {
    font-size: 21px;
  }
  &.biz {
    em {
      color: @primary-color;
    }
  }
  &.page {
    em {
      color: #13c2c2;
    }
  }
  &.report {
    em {
      color: #ffc53d;
    }
  }
}

.set-icon {
  z-index: 9999;
  .ant-popover-inner-content {
    padding: 12px 0 12px 12px;
  }
}
.custom-icons {
  width: 286px;
  background-color: #fff;
  max-height: 300px;
  overflow: auto;
  em {
    float: left;
    cursor: pointer;
    width: 46px;
    height: 46px;
    font-size: 24px;
    line-height: 46px;
    text-align: center;
    border: 1px solid transparent;
    border-radius: 2px;
    &:hover,
    &.active {
      border: 1px solid @primary-color;
      color: @primary-color;
    }
  }
  &::after {
    content: '';
    clear: both;
  }
}

.add-pop-popover {
  width: 116px;
  .ant-popover-inner {
    background-color: transparent;
    box-shadow: unset;
  }
  .ant-popover-inner-content {
    padding: 2px 0;
    background-color: #fff;
    border-radius: 4px;
    margin-top: 23px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .ant-popover-arrow {
    display: none;
  }
  .add-item,
  .import-item {
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    font-size: 14px;
    cursor: pointer;
    color: @nav-font-color;
    &:hover {
      color: @primary-color;
    }
    &:last-child&:not(.import-item) {
      border-top: 1px solid #eee;
      padding-top: 4px;
      margin-top: 4px;
      height: 40px;
      padding-bottom: 4px;
    }
  }
}
.custom-title {
  font-size: 16px;
  font-weight: 600;
  color: #111218;
  line-height: 24px;
  small {
    font-size: 12px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    line-height: 20px;
    margin-left: 14px;
  }
}

.ant-tree li.drag-over {
  &.BizModel,
  &.Report,
  &.Page {
    & > span {
      color: @nav-font-color;
      background-color: transparent;
    }
  }
}
</style>
