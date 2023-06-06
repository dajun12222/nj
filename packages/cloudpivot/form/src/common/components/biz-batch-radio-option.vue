<template>
  <div class="batch-btn-div" :style="propStyle">
    <div class="add batch-add" @click="batchVisible = true">
      <em class="icon aufontAll h-icon-all-owner-department"></em>
    </div>

    <a-modal
      :title="$t('languages.Apps.FormDesignPage.BatchSettingTitle')"
      :visible="batchVisible"
      :maskClosable="false"
      :closable="false"
      @cancel="cancel"
    >
      <a-textarea
        v-model="batchValue"
        :autosize="{ minRows: 6, maxRows: 6 }"
        :placeholder="$t('languages.Apps.FormDesignPage.BatchSettingTextarea')"
        :maxLength="100000"
      />
      <input v-model="initValue" type="hidden" />
      <template slot="footer">
        <a-button key="cancel" @click="cancel">
          {{ $t('languages.Apps.Cancel') }}
        </a-button>
        <a-button
          key="ok"
          :disabled="$route.path.includes('apps/versionDetail/')"
          type="primary"
          @click="ok"
        >
          {{ $t('languages.Apps.Ok') }}
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Modal, Input, Button } from '@h3/antd-vue';
@Component({
  name: 'ExtBatchAddRadioModal',
  components: {
    AModal: Modal,
    ATextarea: Input.TextArea,
    AButton: Button,
  },
})
export default class ExtBatchAddRadioModal extends Vue {
  batchVisible = false;

  batchValue: string = '';

  @Prop({
    default: () => [],
  })
  options!: any[];

  @Prop({
    default: () => {},
  })
  propStyle!: any;

  created() {
    console.log(this.options);
    if (this.initValue) {
      this.batchValue = this.initValue;
    }
  }

  ok() {
    console.log(this.updateOptions);
    this.$emit('update:options', this.updateOptions);
    this.$emit('batchAddOver');
    this.cancel();
  }

  cancel() {
    this.batchVisible = false;
  }

  get updateOptions() {
    let tempArr: any[] = [];
    const _return: any[] = [];
    if (this.batchValue) {
      tempArr = this.batchValue.split('\n');
      for (const [idx, item] of tempArr.entries()) {
        _return.push({
          default:
            this.options[idx] && this.options[idx].default ? true : false,
          value: item.replace(/;+$/g, ''),
        });
      }
    }
    return _return;
  }

  get initValue(): string {
    const tempArr: string[] = [];
    if (this.options.length && this.batchVisible) {
      for (const item of this.options) {
        item.value && tempArr.push(item.value);
      }
    }
    const _return = tempArr.join('\n');
    this.batchValue = _return;
    return _return;
  }
}
</script>

<style lang="less" scoped>
@import '../../../../common/common.less';
.batch-btn-div {
  .batch-add {
    cursor: pointer;
    em {
      font-size: 16px !important;
      color: #111218;
      &:hover {
        color: #2970ff !important;
      }
    }
  }
}
</style>
