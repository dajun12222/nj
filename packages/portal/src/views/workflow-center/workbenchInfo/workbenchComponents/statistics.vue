<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="statistics">
    <pageHeader>
      {{ $t('languages.common.workBenchInfo.ProcessStatistics') }}
      <template slot="right">
        <div class="times">
          <span
            :class="{ active: unitType === 3 }"
            @click="unitTypeChange(3)"
            >{{ $t('languages.common.workBenchInfo.Today') }}</span>
          <span
            :class="{ active: unitType === 2 }"
            @click="unitTypeChange(2)"
            >{{ $t('languages.common.workBenchInfo.ThisWeek') }}</span>
          <span
            :class="{ active: unitType === 1 }"
            @click="unitTypeChange(1)"
            >{{ $t('languages.common.workBenchInfo.ThisMonth') }}</span>
        </div>
      </template>
    </pageHeader>

    <div class="infos">
      <div class="info-item">
        <h3>
          {{
            $t('languages.common.workBenchInfo.Items', {
              num: statisticsData.workItemFinishedCount,
            })
          }}
        </h3>
        <p>{{ $t('languages.common.workBenchInfo.FinishedTask') }}</p>
      </div>
      <div class="info-item">
        <h3>
          {{
            $t('languages.common.workBenchInfo.Items', {
              num: statisticsData.timeOutWorkItemCount,
            })
          }}
        </h3>
        <p>{{ $t('languages.common.workBenchInfo.TimeoutTask') }}</p>
      </div>
    </div>

    <div class="my-flow">
      <div class="my-flow-header">
        <span>
          <i></i>{{ $t('languages.common.workBenchInfo.MyInitiated2') }}
        </span>

        <div class="btns">
          <span
            :class="{ active: btnsType === 1 }"
            @click="btnsTypeChange(1)"
            >{{ $t('languages.common.workBenchInfo.Status') }}</span>
          <span
            :class="{ active: btnsType === 2 }"
            @click="btnsTypeChange(2)"
            >{{ $t('languages.common.workBenchInfo.Template') }}</span>
        </div>
      </div>

      <div v-show="btnsType === 1" class="chart">
        <div class="left">
          <template v-if="!IsEmptyPie">
            <pie class="chart-item" :options="pieOptions" />
          </template>

          <template v-else>
            <div class="empty-pie"></div>
          </template>
        </div>
        <div class="right">
          <ul>
            <li>
              <span><i :style="{ 'background-color': colors[0] }"></i>{{ $t('languages.common.WorkItemStatus.Processing') }}</span>
              <span>{{ getCount('PROCESSING') }}</span>
            </li>
            <li>
              <span><i :style="{ 'background-color': colors[1] }"></i>{{ $t('languages.common.WorkItemStatus.Completed') }}</span>
              <span>{{ getCount('COMPLETED') }}</span>
            </li>
            <li>
              <span><i :style="{ 'background-color': colors[2] }"></i>{{ $t('languages.common.WorkItemStatus.Draft') }}</span>
              <span>{{ getCount('DRAFT') }}</span>
            </li>
            <li>
              <span><i :style="{ 'background-color': colors[3] }"></i>{{ $t('languages.common.WorkItemStatus.Exception') }}</span>
              <span>{{ getCount('EXCEPTION') }}</span>
            </li>
            <li>
              <span><i :style="{ 'background-color': colors[4] }"></i>{{ $t('languages.common.WorkItemStatus.Invalid') }}</span>
              <span>{{ getCount('CANCELED') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        v-show="btnsType === 2"
        class="box"
        :class="{ 'empty-box': codesLen === 0 }"
        :style="{
          '--placeholder':
            '\'' + $t('languages.common.workBenchInfo.noData') + '\'',
        }"
      >
        <div v-for="(item, index) in codes" :key="index" class="instance_item">
          <div class="label" :title="item.workflowName">
            {{ item.workflowName }}
          </div>
          <span :style="{ width: getWidth(item.count) }"></span>
          <div>{{ item.count }}</div>
        </div>

        <span
          class="font-ele"
          :style="{ height: codes.length * 24 + 'px' }"
        ></span>

        <div
          v-for="index in lastLen"
          :key="index + 5"
          class="instance_item empty"
        >
          <div class="label">
            {{ $t('languages.common.workBenchInfo.noData') }}
          </div>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { workbenchApi } from 'cloudpivot/api';
import { Component, Vue } from 'vue-property-decorator';
import pageHeader from './pageHeader.vue';
import pie from './pie.vue';

@Component({
  name: 'Statistics',
  components: {
    pageHeader,
    pie,
  },
})
export default class Statistics extends Vue {
  colors: string[] = [
    '#2970ff',
    '#00c293',
    '#faad14',
    '#f0353f',
    'rgba(17, 18, 24, 0.5)',
  ];

  pieColors: any = {
    PROCESSING: this.colors[0],
    COMPLETED: this.colors[1],
    DRAFT: this.colors[2],
    EXCEPTION: this.colors[3],
    CANCELED: this.colors[4],
  };

  unitType: number = 3; // 1本月 2本周 3今日

  unitTypeChange(type) {
    this.unitType = type;
    this.getWorkflowStatistics();
  }

  btnsType: number = 1;

  btnsTypeChange(type: number) {
    this.btnsType = type;
  }

  statisticsData: any = {};

  getCount(type) {
    if (!this.statisticsData.states) {
      return 0;
    }
    const item = this.statisticsData.states.find((el) => el.state === type);
    return (item && item.count) || 0;
  }

  get IsEmptyPie() {
    if (
      !this.statisticsData.states ||
      this.statisticsData.states.length === 0 ||
      this.statisticsData.states.reduce(
        (a: any, b: any) => a.count + b.count,
      ) === 0
    ) {
      return true;
    }
    return false;
  }

  pieOptions: any = {
    chartTitle: '',
    color: this.colors,
    list: [],
    radius: ['56%', '87%'],
  };

  get codes() {
    if (this.statisticsData && this.statisticsData.codes) {
      return this.statisticsData.codes;
    }
    return [];
  }

  get codesLen() {
    return (this.codes && Array.isArray(this.codes) && this.codes.length) || 0;
  }

  get lastLen() {
    return 5 - this.codesLen > 0 ? 5 - this.codesLen : 0;
  }

  get maxCount() {
    if (this.codes.length === 0) {
      return 0;
    }
    return Math.max(...this.codes.map((el) => el.count));
  }

  getWidth(count) {
    return (count / this.maxCount) * 178 + 'px';
  }

  async getWorkflowStatistics() {
    const res = await workbenchApi.getWorkflowStatistics(this.unitType);
    if (res.errcode === 0) {
      if (res.data.states) {
        const _res: any[] = [];
        (res.data.states as any[]).forEach((item) => {
          _res.push({
            value: item.count,
            name: item.name,
            itemStyle: {
              color: this.pieColors[item.state],
            },
          });
        });
        this.pieOptions.list = _res;
      }
      this.statisticsData = res.data;
    }
  }

  created() {
    this.getWorkflowStatistics();
  }
}
</script>

<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.statistics {
  min-width: 320px;
  height: 379px;
  flex: 1;
  overflow: hidden;
  background-color: #fff;
  padding: 24px;

  .my-flow {
    margin-top: 20px;
    .my-flow-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: 14px;
      line-height: 24px;
      .btns {
        height: 24px;
        background: #efefef;
        border-radius: 4px;
        padding: 2px;
        font-size: 12px;
        line-height: 20px;
        span {
          display: inline-block;
          height: 20px;
          padding: 0 15px;
          color: rgba(17, 18, 24, 0.5);
          cursor: pointer;
          &.active {
            background-color: #fff;
            border-radius: 3px;
            color: #111218 !important;
          }
          &:hover {
            color: @highlightColor;
          }
        }
      }
      span i {
        display: inline-block;
        width: 2px;
        height: 12px;
        background-color: @primaryColor;
        margin-right: 8px;
      }
    }
    .chart {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      .left {
        min-width: 182px;
        height: 120px;
        flex: 1;
        margin-right: 20px;

        .empty-pie {
          width: 100px;
          height: 100px;
          background: #f1f2f6;
          border-radius: 50%;
          position: relative;
          margin: 10px auto 0;
          &::after {
            content: '';
            background-color: #fff;
            left: 20px;
            top: 20px;
            width: 60px;
            height: 60px;
            position: absolute;
            border-radius: 50%;
          }
        }
      }
      .right {
        width: 110px;
        height: 120px;
        ul {
          list-style: none;
          li {
            height: 20px;
            line-height: 20px;
            margin-bottom: 4px;
            display: flex;
            justify-content: space-between;
            span {
              &:first-child {
                color: rgba(17, 18, 24, 0.5);
                i {
                  display: inline-block;
                  width: 9px;
                  height: 9px;
                  border-radius: 50%;
                  margin-right: 6px;
                }
              }
            }
          }
        }
      }
    }

    .box {
      margin-top: 13px;
      position: relative;
      padding-top: 7px;
      overflow: auto;
      max-height: 127px;
      height: 127px;
      .font-ele {
        position: absolute;
        width: 0;
        min-height: 123px;
        border-left: 1px dashed rgba(17, 18, 24, 0.25);
        left: 72px;
        top: 4px;
      }
      &.empty-box {
        &::after {
          display: none;
        }
        .instance_item {
          display: none;
        }
        .font-ele {
          display: none;
        }
        &::before {
          content: var(--placeholder);
          position: absolute;
          left: 50%;
          top: 47px;
          transform: translateX(-50%);
          color: rgba(17, 18, 24, 0.5);
          font-size: 14px;
        }
      }

      .instance_item {
        display: flex;
        align-items: center;
        line-height: 20px;
        font-size: 12px;
        margin-bottom: 4px;
        .label {
          width: 62px;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 12px;
          color: rgba(17, 18, 24, 0.5);
        }
        span {
          display: inline-block;
          background-color: @primaryColor;
          height: 10px;
          max-width: 178px;
          border-radius: 0px 2px 2px 0px;
          margin-right: 8px;
        }
        &.empty {
          span {
            width: 178px;
            background-color: #f9f9f9;
          }
        }
      }
    }
  }

  .times {
    width: 168px;
    height: 24px;
    line-height: 22px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #eeeeee;
    display: flex;
    span {
      display: inline-block;
      flex: 1;
      text-align: center;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
      &.active {
        background: @highlightColor;
        color: #fff !important;
      }
      &:hover {
        color: @highlightColor;
      }
    }
  }

  .infos {
    margin-top: 19px;
    display: flex;
    justify-content: space-between;
    .info-item {
      flex: 1;
      text-align: center;
      height: 110px;
      background: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #eeeeee;
      &:first-child {
        margin-right: 16px;
      }

      h3 {
        font-size: 18px;
        line-height: 28px;
        font-weight: 600;
        padding-top: 22px;
        margin-bottom: 16px;
      }
      p {
        font-size: 14px;
        line-height: 22px;
      }
    }
  }
}
</style>
