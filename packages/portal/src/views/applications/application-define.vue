<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <application-custom :url="url" />
</template>
<script lang="ts">
import list from 'cloudpivot/list/pc';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'application-define',
  components: {
    applicationCustom: list.components.ApplicationCustomIframe,
  },
})
export default class ApplicationDefine extends Vue {
  get url() {
    return this.$route.params.url + '?from=define';
  }
}
</script>
<style lang="less" scoped></style>
