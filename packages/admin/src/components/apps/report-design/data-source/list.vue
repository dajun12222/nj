<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :class="[prefixCls, comPrefixCls, 'report-design']">
    <div class="report-design__header">
      <div class="header-left">
        <em
          class="icon aufontAll h-icon-all-arrow-left-o"
          @click="gotoAppModelList"
        ></em>
        <span>高级数据源</span>
      </div>
    </div>

    <div class="report-design__body">
      <higher-data-source :corpId="corpId" :config="config" />
    </div>
  </div>
</template>

<script lang="ts">
import { DataSource } from '@h3/report';
import { Component, Mixins } from 'vue-property-decorator';
import ReportBase from '../report-base';
import higherDataSource from './higher-data-source.vue';

@Component({
  name: 'data-source-list',
  components: {
    DataSource,
    higherDataSource,
  },
  beforeRouteUpdate(to, from, next) {
    const vm = this as DataSourceList;
    vm.$destroy();
    next();
  },

  beforeRouteLeave(to, from, next) {
    const vm = this as DataSourceList;
    vm.$destroy();
    next();
  },
})
export default class DataSourceList extends Mixins(ReportBase) {
  comPrefixCls = 'h3-report-app';

  prefixCls: string = 'h3-data-source-app';

  gotoAppModelList() {
    const params = this.$route.params;
    const href = `/apps/${params.appCode}/report-design/${params.reportCode}/isNew/false`;
    this.$router.push(href).catch((err: any) => {
      console.log(err);
    });
  }

  addDataSource() {
    console.log('addDataSource');
    this.$destroy();
    this.$router
      .push({ name: 'ReportDataSourceDesigner' })
      .catch((err: any) => {
        console.log(err);
      });
  }

  editDataSource({ objectId, groupId }) {
    console.log('editDataSource', objectId, groupId);
    this.$destroy();
    this.$router
      .push({ name: 'ReportDataSourceDesigner', query: { objectId, groupId } })
      .catch((err: any) => {
        console.log(err);
      });
  }

  /**
   * changed by linxh@authine.com
   * description 监听返回按钮
   */

  back() {
    this.$destroy();
  }
}
</script>
<style lang="less" scoped>
@import '../report.less';
</style>
