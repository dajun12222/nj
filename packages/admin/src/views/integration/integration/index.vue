<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="integration">
    <sidebar
      v-show="currentFolder"
      ref="sidebar"
      v-resize.east
      class="integration__sidebar"
      @toggle="selectFolder"
    />
    <content-panel
      v-show="currentFolder"
      ref="content"
      class="integration__content"
    />
    <template v-if="loaded && !currentFolder">
      <no-data
        tip="新建集成服务前请新建目录"
        buttonText="新建目录"
        @click="addFolder"
      />
    </template>
  </div>
</template>
<script lang="ts">
import NoData from '@/components/global/no-data.vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ContentPanel from './content.vue';
import Sidebar from './sidebar.vue';

const MethodsModule = namespace('Integration/Methods');

@Component({
  name: 'integration',
  components: {
    Sidebar,
    ContentPanel,
    NoData,
  },
})
export default class Integration extends Vue {
  @MethodsModule.Action('getTypes') getTypes: any;

  currentFolder: any = null;

  loaded: boolean = false;

  mounted() {
    this.getTypes();
    setTimeout(() => {
      this.loaded = true;
    }, 500);
  }

  /**
   * 选中目录
   */
  selectFolder(item: any) {
    // console.log(item, 'xxxxxxxxx');
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
.integration {
  display: flex;
  overflow: hidden;
  &__sidebar {
    flex: none;
    min-width: 200px;
    width: 203px;
    height: calc(100% - 45px);
    overflow-y: auto;
    background: #f7f8fa;
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
