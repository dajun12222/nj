<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="top-header">
    <div class="header-left flex-center">
      <i class="icon aufontAll h-icon-all-arrow-left-o" @click="back2WD"></i>
      <span>
        历史版本
        <b v-if="workflowData.workflowVersion" class="version">{{
          `版本${workflowData.workflowVersion}`
        }}</b>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const AppItemModule = namespace('Apps/AppItem');

@Component({
  name: 'defaultheader',
})
export default class defaultheader extends Vue {
  @AppItemModule.Action('getWorkflowDetail') getWorkflowDetail: any;

  modules: Array<Common.AppModule> = [];

  workflowCode: string = '';

  workflowData: any = {};

  beforeMount() {
    if (this.$route.params && this.$route.params.workflowCode) {
      this.workflowCode = this.$route.params.workflowCode;
      const params = { workflowCode: this.workflowCode };
      this.getWorkflowDetail(params).then((res: any) => {
        if (res.errcode === 0) {
          this.workflowData = res.data;
        }
      });
    }
    this.modules = [
      {
        name: this.$t('languages.AppManager'),
        code: 'AppManager',
        active: false,
        url: '/apps',
      },
      {
        name: this.$t('languages.Organization'),
        code: 'Organization',
        active: true,
        url: '/organization',
      },
      {
        name: this.$t('languages.BizBus'),
        code: 'BizBus',
        active: false,
        url: '/bizbus',
      },
      {
        name: this.$t('languages.SystemManager'),
        code: 'SystemManager',
        active: false,
        url: '/console',
      },
    ];
  }

  back2WD() {
    const { href } = this.$router.resolve({
      name: 'workflowDesign',
      params: {
        appCode: this.$route.params.appCode,
        bizSchemaCode: this.$route.params.bizSchemaCode,
        workflowCode: this.$route.params.workflowCode,
      },
    });
    window.location.href = href;
  }
}
</script>

<style lang="less" scoped>
@import '~styles/themes/index.less';
.header-content {
  width: 100%;
  height: 100%;
  // background: #052535;
}
.header-left {
  position: absolute;
  top: 0;
  left: 24px;
  height: 100%;

  justify-content: flex-start;
  .icon {
    color: #111218;
    cursor: pointer;
  }
  span {
    margin-left: 20px;
    font-size: 18px;
    color: #111218;
    .version {
      font-size: 14px;
      font-weight: normal;
    }
  }
}
</style>
