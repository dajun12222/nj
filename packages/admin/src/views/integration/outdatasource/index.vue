<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="outdatasource">
    <sidebar
      v-show="currentFolder"
      ref="sidebar"
      v-resize.east
      class="outdatasource__sidebar"
      @toggle="selectFolder"
    />
    <content-panel
      v-show="currentFolder"
      ref="content"
      class="outdatasource__content"
    />
    <template v-if="loaded && !currentFolder">
      <no-data
        tip="新建报表高级数据源前请新建目录"
        buttonText="新建目录"
        @click="addFolder"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NoData from '@/components/global/no-data.vue';
import Sidebar from './sidebar.vue';
import ContentPanel from './content.vue';

@Component({
  name: 'outdatasource',
  components: {
    Sidebar,
    ContentPanel,
    NoData,
  },
})
export default class outdatasource extends Vue {
  currentFolder: any = null;

  loaded: boolean = false;

  mounted() {
    setTimeout(() => {
      this.loaded = true;
    }, 500);
  }

  /**
   * 选中目录
   */
  selectFolder(item: any) {
    this.currentFolder = item;
    const dom: any = this.$refs.content;
    dom.setFolder(item);
  }

  /**
   * 新建目录
   */
  addFolder() {
    const dom: any = this.$refs.sidebar;
    dom.addFolder();
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.outdatasource {
  display: flex;
  overflow: hidden;

  &__sidebar {
    flex: none;
    min-width: 200px;
    height: calc(100% - 45px);
    overflow-y: auto;
    background: @nav-bg-color;
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }
  &__content {
    flex: 1;
    height: 100%;
    padding: 0 24px;
    overflow-y: auto;
  }

  /deep/.no-data {
    flex: 1;
  }
}
</style>
