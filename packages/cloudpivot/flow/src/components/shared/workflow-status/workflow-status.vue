<template>
  <div v-if="lang === 'zh'" class="workflow-status">
    <img v-if="draft" src="./images/draft.png" />
    <img v-else-if="processing" src="./images/pending.png" />
    <img v-else-if="completed" src="./images/completed.png" />
    <img v-else-if="canceled" src="./images/canceled.png" />
    <img v-else-if="exception" src="./images/exception.png" />
  </div>

  <div v-else class="workflow-status">
    <img v-if="draft" src="./images/draft-en.png" />
    <img v-else-if="processing" src="./images/pending-en.png" />
    <img v-else-if="completed" src="./images/completed-en.png" />
    <img v-else-if="canceled" src="./images/canceled-en.png" />
    <img v-else-if="exception" src="./images/exception-en.png" />
  </div>
  <!--
  <template v-else>

  </template> -->

  <!-- <img src="./images/timeout.png" v-else-if="timeout"> -->
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'workflow-status',
})
export default class WorkflowStatus extends Vue {
  @Prop()
  status!: string;

  lang: string = localStorage.getItem('locale') || 'zh';

  get draft() {
    return this.status === 'DRAFT';
  }

  get processing() {
    return this.status === 'PROCESSING';
  }

  get completed() {
    return this.status === 'COMPLETED';
  }

  get canceled() {
    return this.status === 'CANCELED';
  }

  get exception() {
    return this.status === 'EXCEPTION';
  }

  @Watch('$i18n.locale')
  onLanguageChange() {
    this.lang = localStorage.getItem('locale') || 'zh';
  }
}
</script>

<style lang="less" scoped>
.workflow-status {
  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
}
</style>
