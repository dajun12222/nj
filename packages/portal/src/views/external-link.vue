<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div></div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
  name: 'external-link',
})
export default class ExternalLink extends Vue {
  created() {
    //
    let url: string = '';
    if (
      /Android|webOS|iPhone|iPod|BlackBerry/i.test(window.navigator.userAgent)
    ) {
      url = `${window.location.protocol}//${window.location.host}/mobile/externalLink.html?formId=${this.formId}`;
    } else {
      url = `${window.location.protocol}//${window.location.host}/externalLink.html?formId=${this.formId}`;
    }

    window.location.href = url;
  }

  get formId() {
    let formId: string = '';
    formId = this.$route.params.formid;
    return formId;
  }
}
</script>
