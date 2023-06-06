<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Author: Fu Zhuohang
 * @Date: 2022-04-06 16:14:11
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-13 15:55:21
 * @FilePath: \yunshu6.0\packages\portal\src\views\single-app\toread.vue
 * @Description: 
-->
<template>
  <div ref="toRead" class="to-read">
    <to-read
      :showTitle="false"
      :scrollHeight="scrollHeight"
      :appCode="appCode"
      @openForm="openForm"
    />
  </div>
</template>

<script lang="ts">
import flowCenter from 'cloudpivot/flow-center/pc';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'app-to-read',
  components: {
    ToRead: flowCenter.components.MyUnReadWorkItem,
  },
})
export default class AppToRead extends Vue {
  // @State('appCode') appCode!: string;

  scrollHeight: number = 0;

  get appCode() {
    return window.Environment.appCode;
  }

  mounted() {
    this.fixHeight();
    window.addEventListener('resize', this.fixHeight);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.fixHeight);
  }

  fixHeight() {
    this.$nextTick(() => {
      const wrapper = this.$refs.toRead as HTMLElement;
      if (wrapper) {
        this.scrollHeight = (wrapper as any).clientHeight - 146;
      }
    });
  }

  /**
   * 查看表单详情
   */
  openForm(obj: any) {
    const url = `/form/detail?workitemId=${obj.id}&workflowInstanceId=${
      obj.instanceId
    }&return=${location.pathname + location.search}`;
    if (this.isDingTalk) {
      this.$router
        .push({
          path: url,
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      window.open(url);
    }
  }
}
</script>
<style lang="less" scoped>
.to-read {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  bottom: 16px;
  /deep/ .content-top {
    justify-content: flex-end;
  }
  /deep/ .table-box {
    box-shadow: 0 0 0 0;
    // height: calc(100% - 0px);
    padding: 0;
  }
}
</style>
