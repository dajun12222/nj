<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    width="544px"
    :visible="true"
    :maskClosable="false"
    class="data-title-modal"
    :keyboard="false"
    @cancel="closeModal"
  >
    <div class="data-title">
      <div slot="title" class="title-wrap">
        <span class="title-wrap-title"> {{ title }} </span>
        <span class="title-wrap-tips"> {{ tips }} </span>
      </div>
      <data-title
        class="data-title-textarea"
        :list="list"
        :value="value"
        @change="change"
      />
    </div>
    <template slot="footer">
      <a-button key="cancel" @click="closeModal">
        {{ $t('languages.Apps.Cancel') }}
      </a-button>
      <a-button
        key="ok"
        :disabled="$route.path.includes('apps/versionDetail/')"
        type="primary"
        @click="handleOk"
      >
        {{ $t('languages.Apps.Ok') }}
      </a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import DataTitle from '@/components/global/data-title.vue';
import { Button, Modal } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'data-title-modal',
  components: {
    DataTitle,
    AModal: Modal,
    AButton: Button,
  },
})
export default class DataTitleModal extends Vue {
  @Prop() value!: any;

  @Prop() list!: any;

  @Prop({
    default: '数据标题',
  })
  title!: string;

  @Prop({
    default: '请选择或填写数据标题内容',
  })
  tips!: string;

  closeModal() {
    this.$emit('close');
  }

  created() {
    if (this.value && this.value.length > 0) {
      this.backData = this.value;
    }
  }

  backData = [];

  handleOk() {
    setTimeout(() => {
      this.$emit('ok', this.backData);
    }, 250);
  }

  change(val: any) {
    this.backData = val;
  }
}
</script>

<style lang="less" scoped>
.data-title-modal {
  .data-title {
    .title-wrap {
      padding-top: 24px;
      padding-bottom: 24px;
      overflow: hidden;
      .title-wrap-title {
        font-size: 16px;
        color: #000;
        font-weight: 600;
      }
      .title-wrap-tips {
        margin-left: 8px;
        font-size: 12px;
        color: rgba(17, 18, 24, 0.5);
      }
    }
    // .data-title-textarea {
    //   height: 172px;
    //   overflow: hidden;
    // }
  }
}
</style>
