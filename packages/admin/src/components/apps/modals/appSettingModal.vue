<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <a-modal
      v-model="show"
      class="edit-app-container"
      title="权限设置"
      width="100%"
      destroyOnClose
      :footer="null"
      @cancel="close"
      @ok="ok"
    >
      <div>
        <Appsettings />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Modal, Steps, Button } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Appsettings from '../../../views/app/center/appsettings.vue';

@Component({
  name: 'AppSettingModal',
  components: {
    Appsettings,
    AModal: Modal,
    ASteps: Steps,
    AStep: Steps.Step,
    AButton: Button,
  },
})
export default class AppSettingModal extends Vue {
  @Prop() show!: boolean;

  ok() {
    this.$emit('cancel');
  }

  close() {
    this.$emit('cancel');
  }
}
</script>

<style lang="less" scoped>
.edit-app-container {
  /deep/.ant-modal-wrap {
    overflow: hidden;
    .ant-modal {
      max-width: 100%;
      top: 47px;
      padding-bottom: 0;
      margin: 0;
      .ant-modal-content {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 47px);
        .ant-modal-body {
          padding: 0px;
        }
        .ant-modal-header {
          box-shadow: 0px 4px 11px 0px rgba(35, 110, 235, 0.05),
            0px 1px 0px 0px #eeeeee;
          border: unset;
          .ant-modal-title {
            font-weight: 600;
            color: #111218;
            line-height: 24px;
          }
        }
      }
    }
  }
}
</style>
