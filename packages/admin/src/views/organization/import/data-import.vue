<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-importing">
    <div class="data-importing__progress">
      <a-progress
        type="circle"
        :percent="percent"
        :width="128"
        :status="status"
      />
      <div class="note">
        {{ text }}
      </div>
      <!-- <div class="mask">
        <img class="recyle" src="./img/mask.svg"/>
      </div> -->
    </div>
    <div v-if="status === 'active'" class="data-importing__tip">
      {{ $t('cloudpivot.list.pc.ImportTips4') }}
    </div>
  </div>
</template>

<script lang="ts">
import { listApi } from 'cloudpivot/api';
import { Progress } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'data-importing',
  components: {
    AProgress: Progress,
  },
})
export default class DataImporting extends Vue {
  @Prop({
    type: Number,
  })
  percent!: number;

  @Prop({
    type: String,
  })
  status!: string;

  @Prop({
    type: String,
  })
  taskId!: string;

  @Prop({
    type: String,
    default: '导入中',
  })
  text!: string;

  interval: any = null;

  mounted() {
    if (this.status === 'exception') {
      return;
    }
    this.interval = setInterval(() => {
      this.getImportProgress();
    }, 5000);
  }

  async getImportProgress() {
    const res = await listApi.getImportingProgress({
      taskId: this.taskId,
    });
    if (res.errcode === 0) {
      if (res.data.operationResult) {
        clearInterval(this.interval);
        this.$emit('importEnd', res.data);
      }
    }
  }

  destroyed() {
    clearInterval(this.interval);
  }
}
</script>
<style lang="less" scoped>
.data-importing {
  height: 222px;
  padding-top: 12px;
  text-align: center;
  .data-importing__progress {
    position: relative;
    margin-bottom: 8px;
    .note {
      margin-top: 16px;
      line-height: @line-height-7;
      font-size: @font-size-16;
      color: #111218;
    }
    .mask {
      width: 128px;
      height: 128px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }
    .recyle {
      display: block;
      // margin-left: -64px;
      transform-origin: 50% 50%;
      animation: circleRoate 5s infinite linear;
    }
  }
  .data-importing__tip {
    line-height: @line-height-11;
    font-size: @font-size-14;
    color: rgba(17, 18, 24, 0.5);
  }
}
@keyframes circleRoate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
