<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="error-box">
    <div class="error">
      <img src="@/assets/images/error.png" alt="" />
      <p>服务器开了个小差</p>
      <a-button type="primary" @click="back"> 手动返回 </a-button>
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
export default class ErrorComponnet extends Vue {
  back() {
    this.$router.replace({ path: '/' });
  }
}
</script>

<style lang="less" scoped>
.error-box {
  // todo: header独立
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: white !important;
  z-index: 1000;
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
      color: rgba(17, 18, 24, 0.5);
      margin-bottom: 16px;
    }
  }
}
</style>
