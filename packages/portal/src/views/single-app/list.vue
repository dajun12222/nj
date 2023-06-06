<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:56:16
 * @FilePath: \yunshu6.0\packages\portal\src\views\single-app\list.vue
 * @Description: 
-->
<template>
  <div class="app-list">
    <app-home-header />
    <application-list
      class="app-list__main"
      :showTitle="false"
      :offset="235"
      :isSPA="true"
    >
      <div slot="left" class="back">
        <a @click="goBack">
          <i class="icon aufontAll h-icon-all-left-o"></i>
          {{ $t('languages.common.back') }}
        </a>
        <!-- <a-divider type="vertical"></a-divider>
        <span class="menu-title"> {{ displayName }} </span> -->
      </div>
    </application-list>
  </div>
</template>

<script lang="ts">
import Application from 'cloudpivot/application/pc';
import list from 'cloudpivot/list/pc';
import { Divider } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'app-list',
  components: {
    ADivider: Divider,
    ApplicationList: list.components.ApplicationList,
    AppHomeHeader: Application.AppHomeHeader,
  },
})
export default class AppList extends Vue {
  // @State('appCode') appCode!: string;

  get displayName() {
    const { displayName } = this.$route.params;
    return displayName;
  }

  /**
   * 返回
   */
  goBack() {
    this.$router.go(-1);
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/themes/default.less';
.app-list {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  bottom: 16px;
  /deep/ .app-home-header {
    .menu-title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: @font-weight-md;
    }
  }
  &__main {
    // margin-left: -16px;
    // margin-right: -16px;
    // /deep/ .table-box {
    //   box-shadow: 0 0 0 0;
    //   height: calc(100% - 0px);
    // }
    .back {
      margin-right: 16px;
    }
  }
}
</style>
