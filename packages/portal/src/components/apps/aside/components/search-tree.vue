<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="search-tree-container">
    <input-search
      ref="treeSearchInput"
      v-model="searchValue"
      :placeholder="$t('languages.common.placeInputSearch')"
      class="search-tree-container-input"
      :allowClear="true"
      :isAsync="true"
      @search="onChange(searchValue)"
    />
    <!-- allowClear -->
    <a-tree
      v-show="!isNoData && searchValue"
      :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent"
      :treeData="gData"
      class="search-tree-ul app-list-tree"
      :selectedKeys="selectedKeys"
      @expand="onExpand"
      @select="onSelect"
    >
      <template slot="title" slot-scope="{ title, icon }">
        <i v-if="icon" :class="'icon aufontAll ' + icon"></i>
        <span v-if="title.includes(searchValue)" :title="title">
          {{ title.substr(0, title.indexOf(searchValue))
          }}<span class="blue">{{ searchValue }}</span>{{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else :title="title">{{ title }}</span>
      </template>
    </a-tree>
    <div v-show="isNoData" class="no-data">
      <img src="@/assets/images/search-no-data2.png" alt="" />
      <p>{{ $t('languages.common.NoSearchResult') }}</p>
    </div>
  </div>
</template>

<script>
import InputSearch from 'cloudpivot/common/src/components/shared/inputSearch.vue';

const dataList = [];
let gData = [];
const generateList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    if (key) {
      dataList.push({ key, title: node.title });
    }
    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

const setStyleDisplay = (key, nodes) => {
  let nums = 0;
  for (const data of nodes) {
    let bl = false;
    if (data.title.includes(key)) {
      bl = true;
      nums += 1;
    }
    if (Array.isArray(data.children)) {
      if (data.children.length > 0) {
        const count = setStyleDisplay(key, data.children);
        nums += count;
        if (!bl && count === 0) {
          bl = false;
        } else {
          bl = true;
        }
      }
    }
    if (bl) {
      delete data['style'];
    } else {
      data['style'] = 'display: none';
    }
  }
  return nums;
};

export default {
  components: {
    'input-search': InputSearch,
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['treeData', 'focus'],
  data() {
    return {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      gData: [],
      isNoData: false,
      selectedKeys: [],
      theFocus: false,
    };
  },
  watch: {
    theFocus: function (val) {
      console.log(val);
      if (val) {
        this.$refs.treeSearchInput.focus();
      }
    },
  },

  created() {
    this.word = '';
    gData = this.treeData;
    generateList(gData);
    this.gData = gData;
    this.theFocus = this.focus;
  },

  updated() {
    this.theFocus = this.focus;
  },

  destroyed() {
    this.searchValue = '';
    this.theFocus = false;
    this.onChange(this.searchValue);
  },

  methods: {
    init() {
      //  this.searchValue = '';
      //  this.autoExpandParent = false;
      //  this.expandedKeys = [];
      //  this.selectedKeys = [];
    },
    onReset() {
      console.log('重置了导航搜索...');
      this.word = '';
      gData = this.treeData;
      generateList(gData);
      this.gData = gData;
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onChange(value) {
      if (!!value) {
        this.$emit('searchChange', true);
      } else {
        this.$emit('searchChange', false);
      }
      const expandedKeys = dataList
        .map((item) => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.key, gData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      // 隐藏 不需要的选项
      setStyleDisplay(value, gData);
      this.isNoData = gData.every((el) => el.style);
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      });
    },
    onSelect(selectedKeys, info) {
      if (info.node.dataRef.children) {
        return;
      }
      this.$emit('selectedKeys', { key: selectedKeys, e: info });
    },
  },
};
</script>

<style scoped lang="less">
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
// .search-tree-container-input{
//   /deep/.ant-input:not(:last-child){
//     padding-right: 11px !important;
//     padding-left: 30px !important;
//   }
//   /deep/.ant-input-suffix{
//     left: 12px !important;
//     right: unset !important;
//   }
// }
.search-tree-ul {
  height: calc(100vh - 120px) !important;
  overflow-y: auto;
  margin-top: 8px;
  span {
    font-size: 14px;
    font-weight: 400;
    color: #111218;
  }
  .blue {
    color: @highlightColor;
  }
  &.app-list-tree .ant-tree-node-content-wrapper-normal .ant-tree-title {
    > i {
      margin-right: 4px;
    }
  }
}
.no-data {
  width: 100%;
  display: flex;
  height: calc(100vh - 120px);
  margin-top: 8px;
  padding-top: 150px;
  flex-direction: column;
  align-items: center;
  > img {
    width: 162px;
    height: 162px;
  }
  > p {
    font-size: 14px;
    font-weight: 400;
    color: rgba(17, 18, 24, 0.5);
    line-height: 22px;
  }
}
.file-icon {
  font-size: 16px;
  color: rgba(17, 18, 24, 0.5);
  margin-right: 5px;
}
</style>
