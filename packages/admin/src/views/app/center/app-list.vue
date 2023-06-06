<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div style="margin: 0 -5px">
    <template v-for="(item, index) in computedAppList">
      <model-items
        :key="index"
        v-h3-drag
        :item="item"
        v-bind="$attrs"
        v-on="$listeners"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import '@/directives/drag';
import ModelItems from './modelItems.vue';
const icon = require('@/assets/images/appicon.png');

@Component({
  name: 'AppListItem',
  components: {
    ModelItems,
  },
})
export default class AppListItem extends Vue {
  @Prop() computedAppList!: any;

  defaultAppIcon: any = icon;
}
</script>
