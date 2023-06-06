<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="no-data">
    <div>
      <img src="@/assets/images/userEmpty.png" />
      <p class="tips">
        {{ tip }}
      </p>
      <p class="btn">
        <a-button type="primary" @click="$emit('click')">
          {{ buttonText || $t('languages.Apps.AddNew') }}
        </a-button>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { Button } from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  name: 'no-list-data',
  components: {
    AButton: Button,
  },
})
export default class NoListData extends Vue {
  @Prop() tip!: string;

  @Prop() buttonText?: string;
}
</script>
<style lang="less" scoped>
.no-data {
  & > div {
    margin-top: 143px;
    text-align: center;
  }
  .tips {
    color: rgba(17, 18, 24, 0.5);
    font-weight: 400;
    margin: 24px 0;
  }
  .btn {
    i {
      padding-right: 3px;
    }
  }
}
</style>
