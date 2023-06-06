<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="page-header">
    <div class="header">
      <div>
        <img src="@/assets/images/yslogo.png" />
      </div>
    </div>

    <div class="emtpy__body">
      <img src="@/assets/images/no-data-wt.png" />
      <p>暂无内容</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Button } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'empty',
  components: {
    AButton: Button,
  },
})
export default class Empty extends Vue {
  close() {
    window.opener = null;
    window.open('', '_self');
    window.close();
  }
}
</script>

<style lang="less" scoped>
.page-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  & > .header {
    width: 100%;
    height: 64px;
    line-height: 64px;
    padding-left: 24px;
    position: absolute;
    text-align: left;
    top: 0;
    left: 0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(30, 85, 255, 0.1);
    img {
      height: 30px;
    }
  }
}

.emtpy__body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  color: @light-color-2;

  & > p {
    margin-top: 1em;
  }
}
</style>
