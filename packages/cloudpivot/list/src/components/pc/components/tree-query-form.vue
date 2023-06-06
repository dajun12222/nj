<template>
  <div v-if="isShow && visible" class="allTreeView">
    <div id="left" v-show="showTreeAll">
      <div class="TreeView">
        <div class="treeView-header">
          <div
            v-for="item in params"
            :key="item.controlKey"
            :class="{ setTreeView: item.setTreeView }"
            :title="item.name"
            @click="switchTreeView(item.controlKey)"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="treeSearch">
          <InputSearch
            v-model="searchValue"
            style="width: 100%; height: 32px"
            :placeholder="$t('cloudpivot.list.pc.placeInputKey')"
            :allowClear="true"
            :isAsync="true"
            @search="onSearch"
          />
        </div>
        <div class="content-wrapper">
          <div class="view-all">
            <span
              class="all"
              :class="{ allActive: allActive }"
              @click="clear"
              >{{ $t('cloudpivot.list.pc.all') }}</span>
          </div>
          <a-tree
            v-if="treeData.length !== 0"
            v-model="checkedKeys"
            :treeData="treeData"
            class="tree"
            :expandedKeys="expandedKeys"
            @expand="onExpand"
            @select="onSelect"
          >
            <template slot="tree" slot-scope="item">
              <div class="treeNode">
                <span
                  v-if="
                    searchValue !== '' && item.title.indexOf(searchValue) > -1
                  "
                  :title="item.title"
                >
                  {{ item.title.substr(0, item.title.indexOf(searchValue)) }}
                  <span style="color: #2970ff">{{ searchValue }}</span>
                  {{
                    item.title.substr(
                      item.title.indexOf(searchValue) + searchValue.length,
                    )
                  }}
                </span>
                <span v-else class="title" :title="item.title">{{
                  item.title
                }}</span>
              </div>
            </template>
          </a-tree>
          <!-- 没有数据时候的展示 -->
          <div v-else class="noTreeData">
            <!-- <div class="noTreeDataPtr">
              <img src="./no-data/images/no-data.png" alt="图片加载失败">
            </div>
            <div class="noTreeDataTips"><span>{{$t('cloudpivot.list.pc.noDataTree')}}</span></div> -->
          </div>
        </div>
      </div>
    </div>
    <div id="resize" v-show="showTreeAll"></div>
    <div class="hide-menu">
      <div v-if="!showTreeAll" class="to-right" @click="showAll">
        <i class="aufontAll h-icon-all-indent"></i>
      </div>
      <div v-if="showTreeAll" class="to-left" @click="closeAll">
        <div class="up"></div>
        <div class="left-icon">
          <i class="aufontAll h-icon-all-outdent"></i>
        </div>
        <div class="down"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Input, Tree } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import * as Bus from '../../../../../form/schema';
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

@Component({
  name: 'tree-query-form',
  components: {
    ATree: Tree,
    InputSearch,
  },
})
export default class TreeQueryForm extends Vue {
  list: any = [];

  treeData: any = [];

  key: string = '';

  isShow: boolean = false;

  checkedKeys: any = {};

  showTreeAll: boolean = true;

  visible: boolean = true;

  //全部字段是否选中样式
  allActive: boolean = true;

  treeKey: number = 1; //点击全部时key改变重新加载树

  expandedKeys: any = [];

  getDisplayField: string = '';

  closeAll() {
    this.showTreeAll = false;
  }

  showAll() {
    this.showTreeAll = true;
  }

  onSelect(selectedKeys) {
    this.allActive = false;
    const arr = this.treeToList(this.list);
    const item = arr.find((x) => x.id === selectedKeys[0]);
    item.$format = false;
    const data: any = {};
    data[this.key] = item;
    console.log(data, 'data?????????????????????');

    try {
      const queryData: any = [
        [
          {
            propertyCode: this.key,
            propertyType: 9,
            propertyValue: data[this.key].id,
            queryFilterType: 'Eq',
          },
        ],
      ];
      this.$emit('setFilterData', queryData);
    } catch (error) {
      console.log(error);
      this.$emit('setFilterData', data);
    }
  }

  clear() {
    if (this.allActive) {
      return;
    }
    this.allActive = true;
    this.$emit('setFilterData', { parentId: null });
    this.treeKey = this.treeKey + 1;
  }

  /* 切换不同的树形视图 */
  switchTreeView(controlKey) {
    console.log(controlKey, 'controlKey----------');
    this.params.map((item) => {
      if (item.controlKey === controlKey) {
        this.list = item.list;
        this.treeData = item.treeList;
        this.key = item.controlKey;
        this.checkedKeys = item.value;
        this.visible = item.visible;
        this.getDisplayField = item.getDisplayField;
        item.setTreeView = true;
      } else {
        item.setTreeView = false;
      }
    });
  }

  //树形列表打平查找id
  treeToList(list) {
    if (!list) {
      return [];
    }
    let arr: any = list;
    for (let i = 0; i < list.length; i++) {
      if (list[i].t__children_) {
        arr = [...arr, ...this.treechildToList(list[i].t__children_)];
      }
    }
    return arr;
  }

  //树形子列表打平
  treechildToList(children) {
    if (!children) {
      return [];
    }
    let arrList: any = [];
    for (let i = 0; i < children.length; i++) {
      arrList.push(children[i].data || {});
      arrList = [
        ...arrList,
        ...this.treechildToList(children[i].data.t__children_),
      ];
    }
    return arrList;
  }

  searchValue: string = ''; //搜索字段

  timerSearch: any; //防抖时间搓

  //树形视图的搜索功能
  onSearch() {
    this.expandedKeys = [];
    this.getExpandedKeys(this.searchValue, this.treeData, undefined);
  }

  //树形视图搜索后默认展开被搜索结点,搜索匹配的把父节点展开
  getExpandedKeys(searchValue, treeData, parentkey) {
    if (!treeData || searchValue === '') {
      return;
    }
    treeData.map((item) => {
      if (item.title.indexOf(searchValue) > -1) {
        this.expandedKeys.push(parentkey);
      }
      if (item.children && item.children.length > 0) {
        this.getExpandedKeys(searchValue, item.children, item.key);
      }
    });
  }

  params: any = [];

  created() {
    Bus.EventBus.$on('treedata', (param) => {
      if (this.params.length === 0) {
        this.params.push(param);
      }
      for (let i = 0; i < this.params.length; i++) {
        if (this.params[i].controlKey === param.controlKey) {
          this.params[i] = param;
          break;
        }
        if (i === this.params.length - 1) {
          this.params.push(param);
        }
      }
      if (this.params.length > 1) {
        this.params.sort((a, b) => {
          console.log(a < b, 'sortResult------------');
          return a.name < b.name ? -1 : 1;
        });
      }

      //默认选中第一个树形视图
      if (this.params.length !== 0) {
        this.isShow = true;
        this.list = this.params[0].list;
        this.treeData =
          this.params[0].treeList.length > 0
            ? this.params[0].treeList
            : this.treeData;
        this.key = this.params[0].controlKey;
        this.checkedKeys = this.params[0].value;
        this.visible = this.params[0].visible;
        this.getDisplayField = this.params[0].getDisplayField;
        this.params.map((item, index) => {
          //默认选中第一个，其他的不选中;
          if (index === 0) {
            item.setTreeView = true;
          } else {
            item.setTreeView = false;
          }
        });
      } else {
        this.isShow = false;
      }
    });
  }

  @Watch('isShow')
  onIsShowChange(value) {
    if (value) {
      this.$nextTick(() => {
        this.resize();
      });
    }
  }

  @Watch('showTreeAll')
  showTreeAllChange(value) {
    if (value) {
      this.$nextTick(() => {
        this.resize();
      });
    }
  }

  //手动调节树形视图宽度
  resize() {
    const resize: any = document.getElementById('resize');
    const left: any = document.getElementById('left');
    /* let allTreeView = document.getElementsByClassName("allTreeView")[0]; */
    resize.onmousedown = function (e) {
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
      };
      document.onmouseup = function (evt) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    };
  }

  destroyed() {
    Bus.EventBus.$off('treedata');
  }

  onExpand(keys) {
    this.expandedKeys = keys;
  }
}
</script>

<style scoped lang="less">
@import './../../../../../application/src/components/pc/style/custom-themes';
.allTreeView {
  height: 100%;
  display: flex;
  position: relative;
  top: -46px;
  /deep/li span.ant-tree-switcher {
    margin-top: 3px;
  }
  #left {
    display: flex;
    max-width: 700px;
    width: 220px;
    /* border-right: 1px solid #dddddd; */
    padding-right: 16px;
    height: calc(100% + 46px);
    background: #ffffff;
    z-index: 9;
    min-width: 235px;
  }
  #resize {
    width: 5px;
    height: calc(100% + 46px);
    position: relative;
    background: #ffffff;
    z-index: 9;
    &:hover {
      cursor: w-resize;
      border-right: solid 2px rgba(41, 112, 255, 0.8);
    }
  }
}
.TreeView {
  position: relative;
  width: 100%;
  min-width: 218px;
  height: calc(100%);
  .treeSearch {
    margin-top: 15px;
    margin-left: 16px;
  }
  .content-wrapper {
    height: calc(100% - 93px);
    overflow-y: auto;
    margin-right: -16px;
    overflow-x: hidden;
  }
  .noTreeData {
    .noTreeDataPtr {
      position: relative;
      height: 200px;
      margin-top: 20px;
      text-align: center;
      img {
        width: 200px;
      }
    }
    .noTreeDataTips {
      position: relative;
      text-align: center;
      color: rgba(119, 119, 119, 0.5);
    }
  }
}

.treeView-header {
  padding-top: 8px;
  height: 46px;
  border-bottom: #dddddd 1px solid;
  white-space: nowrap; //超出部分不换行
  margin-left: 16px;
  div {
    padding-left: 1px;
    padding-right: 1px;
    /* margin-left: 12px; */
    margin-right: 20px;
    overflow: hidden;
    white-space: nowrap; //超出部分不换行
    max-width: 150px;
    cursor: pointer;
    text-overflow: ellipsis;
    text-align: center;
    display: inline-block;
    height: 100%;
  }
  .setTreeView {
    color: @highlightColor;
    border-bottom: 3px solid @highlightColor;
    font-weight: bolder;
  }
}

.view-all {
  /* padding-left: 30px; */
  span.all {
    font-weight: 600;
  }
  padding-top: 8px;
  & > span {
    margin-left: 16px;
    padding-left: 16px;
    padding-top: 5px;
    display: inline-block;
    width: calc(100% - 26px);
    height: 32px;
  }
  span:hover {
    cursor: pointer;
    background: rgb(238, 244, 253, 0.4);
  }
}

.tree {
  width: 100%;
  padding-left: 6px;
  /deep/ .ant-tree-node-content-wrapper {
    width: calc(100% - 34px);
    height: 32px;
  }
  // /deep/ .ant-tree-node-selected{
  //   background-color: #eef4fd !important;
  //   color: #2970ff;
  // }
  .treeNode {
    & > span {
      display: inline-block;
      padding-top: 4px;
      width: 100%;
    }
  }
}

.allActive {
  background-color: @activeBGColor !important;
  color: @highlightColor;
}

.hide-menu {
  position: relative;
  left: 6px;
  :hover {
    cursor: pointer;
    color: #2970ff;
  }
  .to-right {
    position: absolute;
    top: 11px;
    left: -5px;
    width: 16px;
    height: 30px;
    line-height: 28px;
    border-radius: 0px 2px 2px 0px;
    background-color: #ffffff;
    border-right: 1px solid #dddddd;
    border-top: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
    z-index: 19;
    > i {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
    }
    &:hover {
      cursor: pointer;
      > i {
        color: @highlightColor;
      }
    }
  }
  .to-left {
    position: absolute;
    top: 0px;
    left: -6px;
    width: 16px;
    height: 45px;
    background-color: #ffffff;
    .up {
      height: 8px;
      border-left: 1px solid #dddddd;
    }
    .down {
      height: 8px;
      border-left: 1px solid #dddddd;
    }
    .left-icon {
      height: 30px;
      width: 16px;
      line-height: 28px;
      border-radius: 0px 2px 2px 0px;
      border-top: 1px solid #dddddd;
      border-bottom: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
      > i {
        font-size: 12px;
        color: rgba(17, 18, 24, 0.5);
      }
      &:hover {
        cursor: pointer;
        > i {
          color: @highlightColor;
        }
      }
    }
    z-index: 9;
  }
}
</style>
