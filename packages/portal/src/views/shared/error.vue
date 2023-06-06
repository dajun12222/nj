<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:58:02
 * @FilePath: \yunshu6.0\packages\portal\src\views\shared\error.vue
 * @Description: 
-->
<template>
  <div class="error-box">
    <div class="error">
      <img src="@/assets/images/error.png" alt="" />
      <p>{{ $t('languages.common.errTips') }}</p>
      <a-button type="primary" @click="back">
        {{ $t('languages.common.goBack') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Button } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'error',
  components: {
    AButton: Button,
  },
})
export default class ErrorComponent extends Vue {
  back() {
    this.$router.replace({ name: 'workflowCenter' });
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/themes/default.less';
.error-box {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  & > .error {
    text-align: center;
    & > img {
      width: 304px;
    }
    & > p {
      color: @light-color-3;
      margin-bottom: @base4-padding-md;
    }
  }
}
</style>
