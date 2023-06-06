<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="annex-preview">
    <div class="title">I doc view 服务集成</div>
    <a-row class="annex-preview__item">
      <a-col :span="layout.left" class="annex-preview__left">
        <span v-if="params.isOpen" class="required">*</span>
        <span>服务地址：</span>
      </a-col>
      <a-col :span="layout.right" class="annex-preview__right">
        <span v-if="!isEdit" class="annex-preview__right--edit">{{
          params.idocvServiceUrl
        }}</span>
        <a-input v-else v-model="params.idocvServiceUrl" />
      </a-col>
    </a-row>

    <a-row class="annex-preview__item">
      <a-col :span="layout.left" class="annex-preview__left">
        <span>是否启用：</span>
      </a-col>
      <a-col :span="layout.right" class="annex-preview__right">
        <a-switch v-model="params.isOpen" :disabled="!isEdit" class="switch" />
      </a-col>
    </a-row>

    <a-row v-if="isJustAdmin" class="annex-preview__item">
      <a-col :span="layout.left" class="annex-preview__left" />
      <a-col :span="layout.right" class="annex-preview__right">
        <div class="btn-group">
          <a-button type="primary" class="btn-group__btn" @click="saveDate">
            {{ isEdit ? '保存' : '编辑' }}
          </a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import systemApi from '@/apis/system/system-manager.api';
import { Button, Col, Input, Row, Switch } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserModule = namespace('System/User');

@Component({
  name: 'annex-preview',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    ASwitch: Switch,
    AButton: Button,
  },
})
export default class annexPreview extends Vue {
  @UserModule.State('isJustAdmin') isJustAdmin!: boolean;

  isEdit: boolean = false;

  params: any = {
    idocvServiceUrl: '',
    isOpen: false,
  };

  layout: any = {
    left: 5,
    right: 10,
  };

  created() {
    this.getIdocvConfig();
  }

  async getIdocvConfig() {
    const res: any = await systemApi.getIdocvConfig();
    const data: any = res.data;

    if (res.errcode === 0) {
      this.params.idocvServiceUrl = data.idocvServiceUrl;

      if (typeof data.isOpen === 'string') {
        this.params.isOpen = JSON.parse(data.isOpen);
      } else {
        this.params.isOpen = data.isOpen;
      }
    } else {
      this.$message.error(res.errmsg);
    }
  }

  async saveDate() {
    if (this.isEdit) {
      if (this.params.isOpen) {
        if (!this.params.idocvServiceUrl) {
          this.$message.error('服务地址不能为空');
          return;
        }
      }

      if (
        this.params.idocvServiceUrl &&
        !/^(http|https):\/\/([\w.]+\/?)\S*/.test(this.params.idocvServiceUrl)
      ) {
        this.$message.error('请输入有效的服务地址');
        return;
      }

      const res: any = await systemApi.saveIdocvConfig(this.params);

      if (res.errcode === 0) {
        this.$message.success(res.errmsg);
      } else {
        this.$message.error(res.errmsg);
      }

      this.isEdit = false;
    } else {
      this.isEdit = true;
    }
  }
}
</script>

<style lang="less" scoped>
.annex-preview {
  width: 644px;

  .title {
    line-height: 26px;
    height: 26px;

    margin-bottom: 24px;
    color: #111218;
    font-weight: 600;
  }

  .annex-preview__item {
    margin-bottom: 20px;
    div {
      float: left;
    }
    .annex-preview__left {
      span {
        color: rgba(17, 18, 24, 0.5);
      }
      position: relative;
      .required {
        left: -6px;
        color: #f5222d;
        position: absolute;
      }
      line-height: 32px;
    }

    .annex-preview__right {
      color: #111218;
      &--edit {
        line-height: 32px;
      }

      .switch {
        margin-top: 5px;
      }

      .btn-group {
        margin-top: 15px;
      }
    }
  }
}
</style>
