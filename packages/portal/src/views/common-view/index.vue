<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-09-17 17:24:00
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-01-19 18:58:39
-->
<template>
  <div class="content-box">
    <Header v-if="isShowHeader" />
    <div class="main">
      <div class="main-left">
        <Aside />
        <div id="jDragLine" class="line"></div>
      </div>
      <!-- <div class="main-placeholder" v-show="isAppList"></div> -->
      <div
        class="main-right"
        :class="[isAppList ? 'app-list' : '', { isShowHeader: !isShowHeader }]"
      >
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Aside from '@/components/apps/aside/aside.vue';
import Header from '@/components/shared/header/new-header.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'common-view',
  components: {
    Aside,
    Header,
  },
})
export default class CommonView extends Vue {
  get isAppList() {
    return this.$store.state.WorkflowCenter.WorkflowCenter.isAppList;
  }

  get isShowHeader() {
    let path = this.$route.path;
    return path === '/application-role/role' ? false : true;
  }

  created() {}
}
</script>

<style lang="less" scoped>
@import '../../styles/themes/default.less';
.main {
  display: flex;
  justify-content: space-between;
  position: relative;
  min-width: 1024px;
  .main-right {
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    padding: 16px 0 24px 24px;
    background-color: #f1f2f6;
    // min-width: 1064px;
    &.app-list {
      padding: 0;
      position: relative;
      // left: -16px;
    }
    &.isShowHeader {
      height: 100%;
    }
  }

  .main-left {
    position: relative;
    z-index: 2;
    & .line {
      width: 8px;
      height: 100%;
      background: transparent;
      cursor: ew-resize;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 3;
    }
  }
  .main-placeholder {
    width: 16px;
    height: 48px;
    background-color: #fff;
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
