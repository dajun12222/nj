<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="btn-group">
    <a-button
      type="primary"
      class="btn-group__btn"
      :disabled="disabled[0]"
      @click="$emit('save')"
    >
      {{ btnText[0] }}
    </a-button>
    <a-button :disabled="disabled[1]" @click="$emit('connect')">
      {{ btnText[1] }}
    </a-button>
  </div>
</template>
<script lang="ts">
import { Button } from '@h3/antd-vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component({
  name: 'btn-group',
  components: {
    AButton: Button,
  },
})
export default class BtnGroup extends Vue {
  @Prop({
    default: ['保存', '连接测试'],
  })
  btnText?: Array<String>;

  @Prop({
    default: [false, false],
  })
  disabled?: Array<Boolean>;
}
</script>
<style lang="less">
.btn-group {
  &__btn {
    margin-right: 8px;
  }
}
</style>
