<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:33
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-02 15:18:21
 * @FilePath: \yunshu6.0\modules\cloudpivot\flow-center\src\components\mobile\initial-instance\app-content.vue
 * @Description:
-->
<template>
  <div class="app-content">
    <!-- 应用内容 -->
    <div class="app-content-list">
      <h3 class="app-content-list__title">
        <span>{{ app.displayName }}</span>
        <span v-if="app.size" class="count">{{
          app.size + ' ' + $t('cloudpivot.flowCenter.pc.flowItems')
        }}</span>
      </h3>
      <template v-for="(child, index) in app.children">
        <folder-instances
          v-if="child.type && child.type === 'Folder'"
          :key="index"
          :folder="child"
          :appName="app.displayName"
          @onItem="goForm"
        />
        <instances
          v-else
          :key="index"
          :list="child.children"
          @onItem="goForm"
        />
      </template>
    </div>
  </div>
</template>
<script lang="ts">
//  该组件已作废
import { Component, Vue, Prop } from 'vue-property-decorator';
import Instances from './instances.vue';
import FolderInstances from './folder-instances.vue';

@Component({
  name: 'AppContent',
  components: {
    Instances,
    FolderInstances,
  },
})
export default class AppContent extends Vue {
  @Prop() app!: any;

  goForm(workitem: any) {
    sessionStorage.setItem('initialSourceApp', this.app.appCode);
    this.$router
      .push({
        name: 'form-detail',
        query: {
          startWorkflowCode: workitem.code,
          return: this.$route.fullPath,
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
</script>
<style lang="less" scoped>
@import '../../../../../common/styles/mixins.less';

.app-content {
  .px2rem(padding-left, 20px);
  .px2rem(padding-right, 20px);
  &-list {
    .px2rem(margin-top, @horizontal-padding-md);
    .px2rem(margin-bottom, 30px);
    &__title {
      text-align: left;
      .px2rem(line-height, 45px);
      span {
        display: inline-block;
        vertical-align: middle;
        .px2rem(font-size, 32px);
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
      }
      &:before {
        content: '';
        display: inline-block;
        vertical-align: middle;
        .px2rem(width, 6px);
        .px2rem(height, 30px);
        .px2rem(margin-right, 16px);
        background-color: @primary-color;
      }
    }
  }
  .count {
    .px2rem(margin-left, 30px);
    .px2rem(font-size, 26px);
    color: #666;
  }
}
</style>
