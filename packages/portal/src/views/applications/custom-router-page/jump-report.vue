<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :class="prefixCls">
    <h3-report
      v-if="loaded"
      :class="[`${prefixCls}`]"
      :reportId="objectId"
      :corpId="corpId"
      :config="config"
      :limit="{ list: { dimension: 50 } }"
      :isAdmin="false"
    />
  </div>
</template>
<script lang="ts">
import { listApi } from 'cloudpivot/api';
import { DashboardPro } from '@h3/report';
import { Component, Vue, Watch } from 'vue-property-decorator';
import ReportOptions from '@h3/report/dist/options';

@Component({
  name: 'jumpReport',
  components: {
    H3Report: DashboardPro,
  },
})
export default class AppJumpReport extends Vue {
  prefixCls = 'report';

  title = '';

  corpId = 'a';

  objectId = '';

  loaded = false;

  mounted() {
    ReportOptions.jumpDashboard.getJumpUrl = customFunction;
    function customFunction(dashboardItem) {
      console.log('dashboardItem', dashboardItem);
      const jumpUrl = `${ReportOptions.baseUrl}/jump-report/${dashboardItem.options.appCode}/${dashboardItem.options.code}`;
      console.log('jumpUrl', jumpUrl);
      // 生成链接的逻辑是集成方定义
      return jumpUrl;
    }
    console.log(ReportOptions, 'ReportOptions');
  }

  get reportCode() {
    return this.$route.params.reportCode;
  }

  get appCode() {
    return this.$route.params.appCode;
  }

  get token() {
    return localStorage.getItem('token');
  }

  get config() {
    return {
      token: this.token,
      reportCode: this.reportCode,
      appCode: this.appCode,
    };
  }

  load() {
    this.loaded = false;
    const closeLoad = (this.$message as any).loading();
    console.log(listApi);

    listApi
      .getReport({
        code: this.reportCode,
      })
      .then(
        (res: any) => {
          closeLoad();
          if (res.errcode === 0) {
            this.objectId = res.data.reportObjectId || '';
          } else {
            this.$message.error(res.errmsg, 3);
          }
        },
        () => closeLoad(),
      )
      .finally(() => (this.loaded = true));
  }

  @Watch('reportCode', {
    immediate: true,
  })
  onReportCodeChange() {
    if (this.reportCode) {
      this.load();
    }
  }
}
</script>

<style lang="less" scoped>
.report {
  height: 100%;
}
</style>
