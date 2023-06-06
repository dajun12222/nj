<template>
  <div class="form-urge">
    <div v-if="urgeList.length > 0" class="header">
      <span :class="urgeList.length === 0 ? 'disabled' : ''" @click="toggle">{{
        text
      }}</span>
    </div>

    <component :is="curComp" ref="component" />

    <Record v-if="visible" :urgeList="urgeList" @cancel="visible = false" />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formApi } from '../../../../../../api';
import Common from '../../../../../../common';
import {
  FormActionComponent,
  FormActionModalOptions,
} from '../../../form-action-modal';
import Content from './content.vue';
import Record from './record.vue';

@Component({
  name: 'form-urge',
  components: {
    Content,
    Record,
  },
})
export default class FormUrge extends Vue implements FormActionComponent {
  @Prop()
  options!: FormActionModalOptions;

  curComp: string = 'Content';

  urgeList: Array<any> = [];

  visible: boolean = false;

  get text() {
    if (this.$t) {
      return this.$t('cloudpivot.form.runtime.urge.urgeRecord');
    }
    return '';
  }

  toggle() {
    this.visible = true;
  }

  submit() {
    const content = (this.$refs.component as any).urgeContent;
    const instanceId = Common.utils.parseUrlParam(
      window.location.href,
      'workflowInstanceId',
    );
    const data = {
      content,
      instanceId,
      type: 'pc',
    };
    return data;
  }

  /**
   * 获取催办记录
   */
  async getUrgeList() {
    const instanceId = Common.utils.parseUrlParam(
      window.location.href,
      'workflowInstanceId',
    );
    if (!instanceId) {
      return;
    }
    const res: any = await formApi.getUrgeList(instanceId);
    if (res.errcode === 0) {
      this.urgeList = res.data;
    }
  }

  mounted() {
    this.getUrgeList();
  }
}
</script>
<style lang="less">
@import './../../../../../../application/src/components/pc/style/custom-themes';
.form-urge {
  .header {
    position: absolute;
    left: 24px;
    bottom: 29px;
    font-size: 14px;
    color: @highlightColor;
    font-weight: 400;
    & > span {
      color: @highlightColor;
      cursor: pointer;
      &.disabled {
        color: rgba(0, 0, 0, 0.25);
        pointer-events: none;
      }
    }
  }
}
</style>
