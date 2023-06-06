<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="recycle-item">
    <div class="header-recycle">
      <div class="header-left">
        <div class="header-tips-content"></div>
        <i class="icon aufontAll h-icon-all-arrow-left-o" @click="toBack"></i>
        <div class="app-icon">
          <svg aria-hidden="true">
            <use xlink:href="#h-icon-all-application1" />
          </svg>
        </div>
        <span class="appInfo-name">{{ appInfo.name }}</span>
        <span class="selected-num">已选择<span style="color: #2970ff; margin-left: 4px">{{
            checkedKeys.length
          }}</span>
          个</span>
      </div>
      <div class="header-right flex-justify-between">
        <!-- <a-button class="ant-btn-large" type="primary" @click="delectAll">
          {{ $t('languages.Apps.EmptyRecycle') }}
        </a-button> -->
        <!-- <a-button type="default" @click="restoreAll">
          {{ $t('languages.Apps.RevertAll') }}
        </a-button> -->
        <a-button
          v-if="isChecked"
          type="default"
          @click.stop="recycleReductionC(ids)"
        >
          {{ $t('languages.Apps.recycleReduction') }}
        </a-button>
        <a-button
          v-if="isChecked"
          type="default"
          @click.stop="recycleDeleteC(deleteParams, false)"
        >
          {{ $t('languages.Apps.recycleDelete') }}
        </a-button>
      </div>
    </div>
    <a-spin class="spinning" :spinning="spinning" />
    <template v-if="appMenu.length || appList.length || bizModel.length">
      <div class="app-router-wrap">
        <div class="item-content">
          <div
            id="item-content"
            ref="itemContent"
            class="item-content-list"
            @scroll="contenScroll"
          >
            <div class="menu-modal-tree">
              <a-table
                :rowSelection="{
                  checkStrictly: false,
                  selectedRowKeys: checkedKeys,
                  onSelect: onSelect,
                  onSelectAll: onSelectAll,
                }"
                :columns="columns"
                :dataSource="recycleTreeList"
                :pagination="false"
                :scroll="{
                  y: 'calc(100vh - 254px)',
                }"
              >
                <template slot="displayName" slot-scope="text, record">
                  <i
                    v-if="record.icon"
                    class="icon aufontAll"
                    :class="record.icon"
                    :style="{
                      color: getIconColor(record),
                    }"
                  ></i>
                  <div v-else class="folder">
                    <svg aria-hidden="true">
                      <use xlink:href="#h-icon-all-department1" />
                    </svg>
                  </div>
                  {{ text || '--' }}
                </template>
                <template slot="modifierName" slot-scope="text">
                  {{ text || '--' }}
                </template>
                <template slot="modifiedTime" slot-scope="text">
                  {{ text || '--' }}
                </template>
                <template slot="operater" slot-scope="text, record">
                  <div class="modal-operater">
                    <span
                      @click="
                        recycleDeleteC(
                          [
                            {
                              code: record.code,
                              id: record.id,
                              type: record.type,
                            },
                          ],
                          true,
                        )
                      "
                      >删除</span>
                    <span @click="recycleReductionC([record.id])">还原</span>
                  </div>
                </template>
              </a-table>
            </div>
          </div>
          <div v-show="backTop" class="back-top" @click="goBackTop">
            <i class="icon aufontAll h-icon-all-circle-up"></i>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- 暂无应用 -->
      <div class="app-router-wrap empty-table">
        <div class="item-content">
          <div
            id="item-content"
            ref="itemContent"
            class="item-content-list"
            @scroll="contenScroll"
          >
            <div class="menu-modal-tree">
              <a-table
                :columns="columns"
                :dataSource="recycleTreeList"
                :pagination="false"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { getRealLength } from '@/common/utils';
import { LanguageTransform } from '@/utils';
import {
  Icon,
  Tooltip,
  Spin,
  Checkbox,
  Dropdown,
  Menu,
  Button,
  Tree,
  Table,
} from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Draggable from 'vuedraggable';

@Component({
  name: 'RecycleItem',
  components: {
    Draggable,
    ATree: Tree,
    ATable: Table,
    AButton: Button,
    AIcon: Icon,
    ATooltip: Tooltip,
    ASpin: Spin,
    ACheckbox: Checkbox,
    ADropdown: Dropdown,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class RecycleItem extends Vue {
  [x: string]: any;

  isChecked: boolean = false;

  spinning: boolean = false;

  appList: any = [];

  appMenu: Array<any> = [];

  bizModel: any = [];

  @Prop() appInfo: any;

  pagination: any = {};

  columns: any = [
    {
      title: '业务设计',
      dataIndex: 'displayName',
      key: 'displayName',
      class: 'displayName',
      scopedSlots: {
        customRender: 'displayName',
      },
    },
    {
      title: '删除人',
      dataIndex: 'modifierName',
      key: 'modifierName',
      width: '12%',
      scopedSlots: {
        customRender: 'modifierName',
      },
    },
    {
      title: '删除时间',
      dataIndex: 'modifiedTime',
      width: '20%',
      key: 'modifiedTime',
      scopedSlots: {
        customRender: 'modifiedTime',
      },
    },
    {
      title: '操作',
      dataIndex: 'operater',
      width: '12%',
      key: 'operater',
      scopedSlots: {
        customRender: 'operater',
      },
    },
  ];

  onSelect(target) {
    this.setChecked(target, !target.checked);
    this.bizModelValueChange(this.bizModel);
  }

  onSelectAll(isSelectAll) {
    this.bizModel.forEach((item) => {
      this.setChecked(item, isSelectAll);
    });
    this.bizModelValueChange(this.bizModel);
  }

  checkedKeys: any[] = [];

  setChecked(target, checked) {
    target.checked = checked;
    if (target.checked) {
      if (!this.checkedKeys.some((item) => item === target.key)) {
        this.checkedKeys.push(target.key);
      }
    } else {
      if (this.checkedKeys.some((item) => item === target.key)) {
        this.checkedKeys.splice(
          this.checkedKeys.findIndex((item) => item === target.key),
          1,
        );
      }
    }
    if (target.children && target.children.length) {
      target.children.forEach((child) => {
        this.setChecked(child, checked);
      });
    }
  }

  get recycleTreeList() {
    return this.initalTreeList(this.bizModel);
  }

  initalTreeList(TreeList) {
    if (!TreeList || TreeList.length === 0) {
      return;
    }
    let arr = [];
    arr = TreeList.map((item) => {
      item.key = item.id;
      item.value = item.id;
      item.displayName = item.name;
      item.scopedSlots = { title: 'tree' };
      item.children = this.initalTreeList(item.children);
      return item;
    });
    return arr;
  }

  toBack() {
    /*     this.$router
      .push({
        name: 'recycle',
      })
      .catch((err: any) => {
        console.log(err);
      }); */
    this.$emit('cancle');
  }

  checkedAll: boolean = false;

  isLoading: boolean = false;

  // 是否展示回到顶部
  backTop: boolean = false;

  // 内容区域滚动事件
  contenScroll() {
    const itemDom = this.$refs.itemContent as HTMLElement;
    if (!itemDom) {
      return;
    }
    if (itemDom.scrollTop > 50) {
      this.backTop = true;
    } else {
      this.backTop = false;
    }
  }

  // 请求流程数据参数
  dragMenuOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    group: {
      name: 'menu',
      put: ['menu', 'item'],
    },
  };

  currentItemID: string = '';

  all: boolean = true;

  curFolderId: string = '';

  onClickFolder(item: any) {
    if (item === 'all') {
      this.currentItemID = '';
      this.all = true;
      this.curFolderId = '';
      const scrollDom = document.getElementById('item-content');
      if (!scrollDom) {
        return;
      }
      scrollDom.scrollTop = 0;
    } else {
      this.all = false;
      this.currentItemID = item.id;
      this.curFolderId = `anchor${item.id}`;
      const dom = this.$el.querySelector(`#anchor${item.id}`);
      if (!dom) {
        return;
      }
      dom.scrollIntoView();
      this.$forceUpdate();
    }
  }

  getLangName(item: any) {
    return LanguageTransform.getLang(item.name, item.name_i18n);
  }

  /**
   * 应用名称超过20个字节时显示tooltip
   */
  showTootip(name: string) {
    return getRealLength(name) > 20;
  }

  // 回到顶部
  goBackTop() {
    const itemDom = this.$refs.itemContent as HTMLElement;
    if (!itemDom) {
      return;
    }
    itemDom.scrollTop = 0;
  }

  created() {
    this.getFolders();
  }

  // 获取模型列表
  getFolders() {
    this.spinning = true;
    this.checkedAll = false;
    this.isLoading = true;
    const params: any = { appCode: this.appInfo.code };
    AppsApi.getRecycleList(params)
      .then((res: any) => {
        this.spinning = false;
        if (res.errcode !== 0) {
          return this.$message.error(res.errmsg);
        }
        this.mapAppList(res.data);
        this.isLoading = false;
      })
      .catch(() => {
        this.spinning = false;
        this.isLoading = false;
      });
  }

  // 处理模型列表数据
  mapAppList(obj: any) {
    if (obj && Array.isArray(obj) && obj.length === 0) {
      this.appMenu = [];
      this.bizModel = [];
      return false;
    }

    this.appMenu = obj;
    this.bizModel = obj;

    // let bizModels: any = obj.filter((c: any) => {
    //   if (c.type === 'BizModel' || c.type === 'Page' || c.type === 'Report') {
    //     c.checked = false;
    //     c.displayName = c.name_i18n
    //       ? LanguageTransform.getLang(c.name, c.name_i18n)
    //       : c.name;
    //     return c;
    //   }
    // });

    // let Folder: any = obj.filter((c: any) => c.type === 'Folder');
    // let allGroup: any = Folder;
    // this.appMenu = allGroup;
    // this.bizModel = [
    //   ...[
    //     {
    //       id: '0',
    //       code: this.appInfo.code,
    //       displayName: this.appInfo.name,
    //       checked: false,
    //       children: bizModels,
    //     },
    //   ],
    //   ...allGroup.filter((c: any) => {
    //     if (Array.isArray(c.children)) {
    //       c.children = c.children.filter((s: any) => {
    //         return s.type !== 'Folder';
    //       });
    //     }
    //     return c;
    //   }),
    // ];
    console.log(this.bizModel);
  }

  //所有分组,把树状结构拉成一维数组
  allGroup(res: any) {
    const retData = [] as any;
    const _helper = (data: any) => {
      if (!data) {
        return;
      }
      data.forEach((item: any) => {
        item.checked = false;
        item.displayName = item.name_i18n
          ? LanguageTransform.getLang(item.name, item.name_i18n)
          : item.name;
        if (item.type === 'Folder') {
          retData.push(item);
        }
        if (Array.isArray(item.children)) {
          _helper(item.children);
        }
      });
    };
    _helper(res);
    return retData;
  }

  checkAll: any = false;

  // 全选
  CheckAll() {
    const vm = this;
    let flag: boolean = false;
    flag = vm.bizModel.every((res: any) => {
      const checked1: boolean = res.checked;
      let checked2: boolean = true;
      if (Array.isArray(res.children) && res.children.length) {
        checked2 = res.children.every((e: any) => {
          return e.checked;
        });
      }
      return checked1 && checked2;
    });

    this.checkAll = !flag;

    this.$nextTick(() => {
      vm.bizModel.forEach((res: any) => {
        res.checked = vm.checkAll;
        if (Array.isArray(res.children) && res.children.length) {
          res.children.forEach((e: any) => {
            e.checked = vm.checkAll;
          });
        }
      });
    });
  }

  /**
   * 清空回收站
   */
  delectAll() {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.EmptyRecycle').toString(),
      content: (this as any).$t('languages.Apps.EmptyTips5').toString(),
      okType: 'danger',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        const { deleteParams } = vm.allId();
        vm.recycleDeleteC(deleteParams);
      },
    });
  }

  /**
   * 全部还原
   */
  restoreAll() {
    const vm: any = this;
    this.$confirm({
      title: (this as any).$t('languages.Apps.RevertAll').toString(),
      content: (this as any).$t('languages.Apps.RevertTips5').toString(),
      okType: 'primary',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        const { ids } = vm.allId();
        vm.recycleReductionC(ids);
      },
    });
  }

  /**
   * 还原
   */
  recycleReductionC(params: any) {
    console.log(params);

    const vm: any = this;
    // 未勾选模型会禁用还原，所有无需检查是否勾选
    // if (!this.isChecked) {
    //   return vm.$message.error("请勾选模型！");
    // }

    this.$confirm({
      title: (this as any).$t('languages.Apps.Reduction'),
      content: (this as any).$t('languages.Apps.RevertTips6'),
      okType: 'primary',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        // 还原回收站资源
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.RevertTips3'),
          0,
        );
        AppsApi.RecycleRestore(params)
          .then((res: any) => {
            loading();
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.getFolders();
            vm.checkedKeys = [];
          })
          .catch(() => {
            loading();
          });
      },
    });
  }

  delIng: boolean = false;

  /**
   * 彻底删除
   */
  recycleDeleteC(params: any, fromForm?: boolean) {
    console.log(params);
    const vm: any = this;
    // 未勾选模型会禁用彻底删除按钮，所有无需检查是否勾选
    // if (!this.isChecked) {
    //   return vm.$message.error("请勾选模型！");
    // }
    this.$confirm({
      title: (this as any).$t('languages.Apps.recycleDelete'),
      content: fromForm
        ? (this as any).$t('languages.Apps.EmptyTips7').toString()
        : (this as any).$t('languages.Apps.EmptyTips6').toString(),
      okType: 'danger',
      okText: (this as any).$t('languages.Apps.Ok').toString(),
      cancelText: (this as any).$t('languages.Apps.Cancel').toString(),
      onOk() {
        if (vm.delIng) {
          return;
        }

        vm.delIng = true;

        // 彻底删除
        const loading: any = vm.$message.loading(
          (vm as any).$t('languages.Apps.EmptyTips3').toString(),
          0,
        );
        AppsApi.RecycleDelete(params)
          .then((res: any) => {
            loading();
            vm.delIng = false;
            if (res.errcode !== 0) {
              return vm.$message.error(res.errmsg);
            }
            vm.getFolders();
            vm.checkedKeys = [];
          })
          .catch(() => {
            loading();
            vm.delIng = false;
          });
      },
    });
  }

  // 是否有选择数据勾选
  ids: any = [];

  deleteParams: any = [];

  bizModelToChange(val, ids, deleteParams) {
    val.map((item) => {
      if (item.checked) {
        this.isChecked = true;
        ids.push(item.id);
        const { id, code, type } = item;
        deleteParams.push({ id, code, type });
      } else {
        this.checkedAll = false;
      }
      if (item.children && item.children.length !== 0) {
        this.bizModelToChange(item.children, ids, deleteParams);
      }
    });
  }

  @Watch('bizModel', {
    deep: true,
  })
  bizModelValueChange(v: any) {
    if (v && v.length) {
      this.isChecked = false;
      this.checkedAll = true;
      this.ids = [];
      this.deleteParams = [];
      this.bizModelToChange(v, this.ids, this.deleteParams);
    } else {
      this.ids = [];
      this.deleteParams = [];
      this.checkedAll = false;
      this.isChecked = false;
    }
    console.log(this.ids, this.deleteParams, this.isChecked);
  }

  allId(): any {
    // 获取选中的模型数据
    const pushArray: any = [];
    this.bizModel.forEach((c: any) => {
      if (Array.isArray(c.children) && c.children.length) {
        c.children.forEach((d: any) => {
          pushArray.push(d);
        });
      }
    });
    return {
      ids: pushArray.map((e: any) => e.id),
      deleteParams: pushArray.map((e: any) => {
        const { id, code, type } = e;
        return {
          id,
          code,
          type,
        };
      }),
    };
  }

  // 应用全选
  checkApp(e: any, id: any) {
    // console.log(e, id)
    const checked: boolean = e.target.checked;
    this.bizModel.forEach((res: any) => {
      if (res.id === id) {
        if (Array.isArray(res.children) && res.children.length) {
          res.children.forEach((e: any) => {
            e.checked = checked;
          });
        }
      }
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
}
</script>
<style lang="less" scoped>
.header-recycle {
  min-width: 1024px;
  width: 100%;
  height: 60px;
  padding: 0 20px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* position: fixed;
  top: 0;
  left: 0; */
  z-index: 1000;
  .header-right {
    // width: 400px;
    /deep/.ant-btn + .ant-btn {
      margin-left: 8px;
    }
  }
  .header-left {
    display: flex;
    align-items: center;
    font-size: 18px;
    color: #111218;

    .h-icon-all-arrow-left-o {
      cursor: pointer;
      padding-right: 24px;
      position: relative;
      &::after {
        content: '';
        width: 1px;
        height: 18px;
        background: #ccc;
        position: absolute;
        right: 0px;
        top: 2.5px;
      }
    }
    .app-icon {
      margin-left: 25px;
      width: 34px;
      height: 34px;
      border: 1px solid #eeeeee;
      border-radius: 2px;
      display: flex;
      align-items: center;
      background: #fff;
      justify-content: center;
      svg {
        width: 22px;
        height: 22px;
      }
    }
    > span {
      display: inline-block;
      margin-left: 13px;
    }
    .selected-num {
      font-size: 12px;
    }
  }
}
.content-item {
  position: relative;
  display: inline-block;
  vertical-align: top;
  text-align: center;
  width: 172px;
  height: 122px;
  margin: 12px;
  padding-top: 28px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 1);
  // border:1px solid @primary-color;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Chrome/Safari/Opera */
  -khtml-user-select: none; /* Konqueror */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
  not supported by any browser */
  cursor: pointer;
  &:hover {
    //box-shadow: inset 0 0 0 1px @primary-color, 0px 4px 12px 0px rgba(7, 98, 23, 0.15);
    box-shadow: inset 0 0 0 1px @primary-color;
    .setting {
      visibility: visible;
    }
  }
  &-icon {
    display: inline-block;
    width: 42px;
    height: 42px;
    margin-bottom: 16px;
    border-radius: 8px;
  }
  &-enabled {
    position: absolute;
    width: 54px;
    height: 54px;
    top: -4px;
    left: -4px;
  }
  &-name {
    width: 90%;
    margin: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 20px;
  }
  .setting {
    position: absolute;
    z-index: 9;
    top: 8px;
    right: 8px;
    font-size: 16px;
    color: rgba(17, 18, 24, 0.5);
    visibility: hidden;
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
    /deep/ .ant-checkbox-inner {
      border-radius: 100%;
    }
  }
  .isshow {
    visibility: visible !important;
  }
}
/deep/.ant-table .ant-table-content {
  border-left: thin solid #e8e8e8;
  border-right: thin solid #e8e8e8;
  border-top: thin solid #e8e8e8;
  // .ant-table-tbody > tr.ant-table-row-selected td {
  //   background: #fff;
  // }
  .ant-table-thead > tr > th {
    background: #fff;
  }
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
  height: calc(100vh - 64px);
  float: left;
  box-shadow: 1px 0px 0px 0px #e8e8e8;
  position: relative;
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
  min-width: 1024px;
  height: calc(100vh - 163px);
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
<style lang="less">
.recycle-item {
  .item-content {
    height: 100%;
    padding-top: 24px;
    .back-top {
      position: fixed;
      right: 24px;
      bottom: 24px;
      cursor: pointer;
      i {
        font-size: 44px;
        color: rgba(17, 18, 24, 0.25);
      }
    }
    .checkAll {
      width: calc(100% - 48px);
      height: 62px;
      line-height: 62px;
      margin-bottom: 12px;
      margin-top: 24px;
      background: #ffffff;
      border-radius: 4px;
    }
    .item-content-list {
      text-align: left;
      overflow-y: scroll;
      height: calc(100% - 8px);
      margin-left: -14px;
      margin-right: -14px;
      padding: 0px 170px;
      .cur-folder {
        .biz-model-group-head-title {
          color: @primary-color;
        }
      }
      .biz-model-group-head,
      .biz-model-group-content {
        margin-left: 4px !important;
      }
    }
  }
  .item-content .item-content-list > .biz-model-wrap {
    margin-left: 4px !important;
  }

  .item-content .item-content-list > .biz-model-wrap .biz-model-icon {
    color: #f5222d;
  }

  .item-content
    .item-content-list
    > .biz-model-group:nth-child(4n + 1)
    .biz-model-icon {
    color: #fa8c16;
  }

  .item-content
    .item-content-list
    > .biz-model-group:nth-child(4n + 2)
    .biz-model-icon {
    color: #1890ff;
  }

  .item-content
    .item-content-list
    > .biz-model-group:nth-child(4n + 3)
    .biz-model-icon {
    color: #13c2c2;
  }

  .item-content
    .item-content-list
    > .biz-model-group:nth-child(4n)
    .biz-model-icon {
    color: #f5222d;
  }

  .item-content .item-content-list .biz-model-group-content,
  .item-content .item-content-list .biz-model-group-head {
    margin-left: 4px !important;
  }
  .biz-model-icon {
    display: inline-block;
    font-size: 28px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  .spinning {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    line-height: 100vh;
    z-index: 10001;
  }
  .apps-empty {
    height: calc(100vh - 300px);
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    img {
      width: 402px;
      height: 195px;
      object-fit: contain;
    }
    p {
      margin: 8px 0 16px;
      color: rgba(17, 18, 24, 0.5);
    }
    i {
      margin-right: 9px;
    }
  }
  .menu-modal-tree {
    .modal-operater {
      span {
        margin: 0px 5px;
        color: #2970ff;
        cursor: pointer;
      }
    }
    .folder {
      vertical-align: middle;
      margin-right: 10px;
      display: inline-block;
      position: relative;
      width: 18px;
      height: 18px;
      svg {
        width: 18px;
        height: 18px;
        position: absolute;
        top: -1px;
      }
    }
    .ant-table-row-expanded {
      border: unset;
      background: rgba(0, 0, 0, 0);
      &::after {
        transform: rotate(90deg) scale(0.8);
        font-family: 'aufontAll' !important;
        color: rgba(17, 18, 24, 0.5);
        font-size: 10px;
        content: '\E87D';
        display: inline-block;
      }
    }
    .ant-table-row-collapsed {
      border: unset;
      background: rgba(0, 0, 0, 0);
      &::after {
        transform: rotate(0deg) scale(0.8);
        font-family: 'aufontAll' !important;
        font-size: 10px;
        color: rgba(17, 18, 24, 0.5);
        content: '\E87D';
        display: inline-block;
      }
    }
    .ant-table-header-column .ant-table-column-title {
      color: #111218;
    }
    .ant-table {
      color: #111218;
      .displayName .icon {
        padding-right: 8px;
      }
    }
  }
  .empty-table {
    .ant-empty {
      height: 500px;
      padding-top: 285px;
      &::before {
        content: '';
        background: url(/admin/img/noContent.01d1f459.png);
        width: 204px;
        height: 204px;
        position: absolute;
        top: 140px;
        left: calc(50% - 102px);
        z-index: 234;
        background-size: contain;
      }
      &::after {
        content: '\6682\65e0\5185\5bb9';
      }
    }
    .ant-empty-image {
      display: none;
    }
    .ant-empty-description {
      display: none;
    }
  }
}
</style>
