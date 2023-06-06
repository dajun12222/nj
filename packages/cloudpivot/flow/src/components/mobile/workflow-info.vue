<template>
  <div class="workflow-info">
    <div class="workflow-info__item">
      <form-originator :user="user">
        {{ $t('cloudpivot.flow.mobile.UsedTime', { time: usedTime }) }}
      </form-originator>
      <div>
        <workflow-status class="workflow-info__status" :status="info.status" />
        <span @click="flowTrack">
          {{ $t('cloudpivot.flow.mobile.FlowTrack') }}
          <i class="icon aufontAll h-icon-all-right-o"></i>
        </span>
      </div>
    </div>

    <div v-if="info.participants && info.participants.length" class="field">
      <div class="field__label">
        {{ $t('cloudpivot.flow.mobile.Participant') }}
      </div>

      <div class="field__control">
        <div
          ref="multText"
          class="multi-text"
          :class="{ collapsed: collapsed }"
        >
          <div v-for="(node, index) in info.participants" :key="index">
            <b>[{{
                locale === 'en'
                  ? JSON.parse(node.name_i18n).en
                  : node.activityName
              }}]</b>
            <template v-for="(item, idx) in node.participantRelations">
              <div v-if="showCur(item)" :key="idx" class="cur-trust"></div>
              <span :key="idx">
                {{
                  item.isTrust && item.trustorVO && item.trustorVO.id
                    ? `${item.participantVO.name}${$t(
                        'cloudpivot.flow.mobile.trust',
                        { name: item.trustorVO.name },
                      )}`
                    : item.participantVO.name
                }}
                <template v-if="index !== node.participantRelations.length - 1">,</template>
              </span>
            </template>
          </div>
          <span v-show="showAll" class="collapsed-btn" @click="toggle">
            <span v-if="collapsed">{{
              $t('cloudpivot.form.renderer.expand')
            }}</span>
            <span v-else>{{ $t('cloudpivot.form.renderer.collapse') }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { workflowApi, workflow } from '../../../../api';

import WorkflowStatus from '../shared/workflow-status/workflow-status.vue';
import FormOriginator from './form-originator.vue';

import common from '../../../../common';

const timeTranslate = common.utils.DateHandle.timeTranslate;

@Component({
  name: 'workflow-info',
  components: {
    WorkflowStatus,
    FormOriginator,
  },
})
export default class WorkflowInfo extends Vue {
  @Prop()
  id!: string;

  @Prop({
    default: '',
  })
  itemId!: string;

  @Prop({
    default: {},
  })
  user!: any;

  info: workflow.InstanceBaseInfo = {} as any;

  showAll = true;

  collapsed = true;

  taskRef: any;

  locale: any;

  get usedTime() {
    let usedTime = 0;
    if (!this.info || !this.info.usedTime) {
      return '';
    }
    if (
      this.info.status === 'COMPLETED' &&
      this.info.startTime &&
      this.info.finishTime
    ) {
      const startTime = new Date(
        this.info.startTime.replace(/-/g, '/'),
      ).getTime();
      const finishTime = new Date(
        this.info.finishTime.replace(/-/g, '/'),
      ).getTime();
      usedTime = finishTime - startTime;
    } else if (
      this.info.status === 'CANCELED' &&
      this.info.startTime &&
      this.info.cancelTime
    ) {
      const startTime = new Date(
        this.info.startTime.replace(/-/g, '/'),
      ).getTime();
      const cancelTime = new Date(
        this.info.cancelTime.replace(/-/g, '/'),
      ).getTime();
      usedTime = cancelTime - startTime;
    } else {
      usedTime = this.info.usedTime;
    }
    return timeTranslate(usedTime);
  }

  @Watch('id', {
    immediate: true,
  })
  setId() {
    if (this.id) {
      workflowApi
        .getWorkflowBaseInfo({
          workflowInstanceId: this.id,
        })
        .then((res) => {
          if (res.errcode === 0) {
            this.info = res.data || {};
            this.scroll();
          } else {
            // this.$message.error(res.errmsg);
            this.$h3.toast.show({
              text: res.errmsg,
              iconType: 'close',
            });
          }
        });
    }
  }

  showCur(item: any) {
    if (item.trustorVO && item.trustorVO.id) {
      return item.isTrust && this.itemId === item.workitemId;
    }
    return false;
  }

  flowTrack() {
    // if (!this.itemId) {
    //   // this.$message.warn("workItemId为空！")
    //   this.$h3.toast.show({
    //     text: "workItemId为空！",
    //     iconType: "close"
    //   });
    //   return;
    // }
    this.$emit('flowTrack');
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  /**
   * 判断是否已展示长文本的所有内容
   */
  scroll() {
    this.$nextTick(() => {
      const el = this.$refs.multText as HTMLDivElement;
      if (el) {
        this.showAll = el.scrollHeight > el.offsetHeight + 3;
        if (el.offsetHeight === 0) {
          clearTimeout(this.taskRef);
          this.taskRef = setTimeout(() => {
            this.scroll();
          }, 500);
        }
      }
    });
  }

  mounted() {
    this.scroll();
    this.locale = localStorage.getItem('locale') || 'zh';
  }

  destroyed() {
    clearTimeout(this.taskRef);
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/styles/mixins.less';

.workflow-info {
  background-color: #fff;
  text-align: left;

  &__item {
    display: flex;
    .px2rem(padding, @font-size-base);
    justify-content: space-between;

    & > div:last-child {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      .px2rem(font-size, @font-size-base);
      color: @text-color-main;

      i.icon {
        color: @text-color-describe;
        .px2rem(margin-left, @font-size-xxs);
        //.px2rem(font-size, @font-size-xxs);
        .px2rem(font-size, @font-size-base);
      }
    }
  }

  &__status {
    .px2rem(width, 140px);
  }

  & > .field {
    .hairline('top', #eee);
    align-items: flex-start;

    b {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 400;
      margin-right: 0.2em;
    }

    & > .field__label {
      flex-shrink: 0;
      padding: @horizontal-padding-sm 0;
    }

    & > .field__control {
      padding: @horizontal-padding-sm 0;
      align-items: flex-start;
      flex-direction: column;
    }
  }
}

.multi-text {
  position: relative;
  width: 100%;
  .px2rem(line-height, 40px);
  &.collapsed {
    max-height: 3.9em;
    overflow: hidden;
    .px2rem(line-height, 40px);
    // .px2rem(max-height, 120px);
  }

  .collapsed-btn {
    position: absolute;
    z-index: 9;
    right: 1px;
    bottom: -1px;
    cursor: pointer;
    background-color: #fff;

    & > span {
      color: @primary-color;
    }
  }
}

.cur-trust {
  width: 0;
  height: 0;
  display: inline-block;
  vertical-align: middle;
  .px2rem(margin-left, 12px);
  border-top: 5px solid transparent;
  .px2rem(border-top-width, 10px);
  border-left: 10px solid #32b683;
  .px2rem(border-left-width, 20px);
  border-bottom: 5px solid transparent;
  .px2rem(border-bottom-width, 10px);
}
</style>
