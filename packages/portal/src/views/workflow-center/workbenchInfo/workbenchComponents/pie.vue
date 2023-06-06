<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div ref="echartPie" class="echart-pie"></div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/title';

const echarts = require('echarts/lib/echarts');

@Component({
  name: 'echart-pie',
})
export default class EchartPie extends Vue {
  @Prop() options!: any;

  chart: any = null;

  chartOptions: any = {
    chartTitle: '柱状图',
    list: [],
  };

  initCharts() {
    const vm: any = this;
    const container: any = this.$refs.echartPie;
    const chart: any = echarts.init(container);
    chart.clear();
    const opts: any = {
      series: [
        {
          name: vm.chartOptions.chartTitle,
          type: 'pie',
          radius: vm.chartOptions.radius || '55%',
          avoidLabelOverlap: false,
          center: 'center',
          label: {
            normal: {
              show: false,
              position: 'center',
              formatter: '{b}\n{d}%',
            },
            emphasis: {
              show: true,
              textStyle: {
                lineHeight: 18,
              },
            },
          },
          data: vm.chartOptions.list,
        },
      ],
    };
    if (this.options.color) {
      opts.color = this.options.color;
    }
    chart.setOption(opts);
  }

  @Watch('options', {
    deep: true,
    immediate: true,
  })
  onOptionsChange() {
    if (this.options.list.length === 0) {
      return;
    }
    this.chartOptions = Object.assign(this.chartOptions, this.options);
    this.initCharts();
  }

  mounted() {
    this.onOptionsChange();
  }
}
</script>
<style lang="less" scoped>
.echart-pie {
  height: 116px;
}
</style>
