<!--
 * @Descripttion:portal空页面
 * @version: v6.8
 * @Author: baidongsheng
 * @Date: 2021-10-20 15:42:41
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-11-24 17:11:51
-->
<template>
  <div class="page-no-data">
    <div v-show="isShowNoData">
      <img v-if="type === 'show'" src="./images/no-data1.png" :alt="tipText" />
      <img
        v-else-if="type === 'search'"
        src="./images/search-no-data.png"
        :alt="tipText"
      />
      <p>{{ tipText }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'page-no-data',
})
export default class PageNoData extends Vue {
  @Prop({ default: false }) isShowNoData!: boolean;

  @Prop({ default: '暂无内容' }) tipText!: string;

  @Prop({ default: 'show' }) type!: string;
}
</script>

<style lang="less" scoped>
.page-no-data {
  text-align: center;
  p {
    font-size: 14px;
    color: rgba(17, 18, 24, 0.5);
    font-weight: 400;
    text-align: center;
  }
  img {
    width: 204px;
    height: 204px;
  }
}
</style>
