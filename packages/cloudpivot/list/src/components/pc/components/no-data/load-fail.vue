<template>
  <div v-if="value" class="load-fail">
    <img src="./images/load-fail.png" alt />
    <p>{{ text }}</p>
    <a-button type="primary" class="reload-btn" @click="refresh">
      <a-icon type="reload" />{{ btnText }}
    </a-button>
  </div>
</template>

<script lang="ts">
import { Button, Icon } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'page-load-fail',
  components: {
    AButton: Button,
    AIcon: Icon,
  },
})
export default class PageLoadFail extends Vue {
  @Prop({ default: false }) value!: boolean;

  @Prop({ default: this.$t('cloudpivot.list.pc.ContentLoadingFailed') })
  text!: string;

  @Prop({ default: this.$t('cloudpivot.list.pc.Refresh') }) btnText!: string;

  refresh() {
    this.$emit('refresh');
  }
}
</script>

<style lang="less" scoped>
@import '../../../styles/themes/default.less';
.load-fail {
  text-align: center;
  p {
    margin-bottom: @base4-padding-md;
  }
}
</style>
