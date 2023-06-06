<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-tooltip placement="top">
    <template slot="title">
      <span>当前为{{ LangText }}编辑模式，名称将保存为{{ LangText }}名称</span>
    </template>
    <a-icon class="global-icon" type="global" />
  </a-tooltip>
</template>
<script lang="ts">
import { Icon, Tooltip } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'i18n-icon',
  components: {
    ATooltip: Tooltip,
    AIcon: Icon,
  },
})
export default class I18nIcon extends Vue {
  get LangText() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en') ? '中文' : '英文';
  }
}
</script>
<style lang="less" scoped>
.global-icon {
  margin-left: 9px;
  cursor: pointer;
}
</style>
