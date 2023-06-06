<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="map-config">
    <div class="guide">
      <div class="map-config__header">
        <span>地址授权</span>
        <span class="header__tips">调用高德地图api的授权配置</span>
      </div>
    </div>
    <a-row class="map-config__item">
      <a-col :span="layout.left" class="map-config__left">
        <span class="required"> 授权key </span>
      </a-col>
      <a-col :span="layout.right" class="map-config__right">
        <!-- 编辑状态 -->
        <template v-if="isEdit">
          <a-input v-model="editAuthorityKey" placeholder="请输入" />
        </template>
        <template v-else>
          <span>{{ originalAuthorityKey || '--' }}</span>
        </template>
      </a-col>
    </a-row>
    <a-row class="map-config__item">
      <a-col :span="layout.left" class="map-config__left">
        <span class="required"> 安全密钥 </span>
      </a-col>
      <a-col :span="layout.right" class="map-config__right">
        <!-- 编辑状态 -->
        <template v-if="isEdit">
          <a-input-password v-model="editSecurityKey" placeholder="请输入" />
        </template>
        <template v-else>
          <password-span :value="originalSecurityKey" :fn="showSecret" />
        </template>
      </a-col>
    </a-row>
    <a-row class="map-config__item btn-row" style="margin-top: 30px">
      <a-col :span="layout.left" class="map-config__left" />
      <a-col :span="layout.right" class="map-config__right">
        <a-button
          v-if="!isEdit"
          type="primary"
          :disabled="!rootAdmin"
          class="btn"
          @click="isEdit = true"
        >
          编辑
        </a-button>
        <template v-else>
          <a-button
            type="primary"
            :disabled="!rootAdmin"
            class="btn save-btn"
            @click="save"
          >
            保存
          </a-button>
          <a-button
            :disabled="!rootAdmin"
            class="btn cancel-btn"
            @click="cancel"
          >
            取消
          </a-button>
        </template>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import systemApi from '@/apis/system/system-manager.api';
import { Row, Col, Input, Radio, Button } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import PasswordSpan from '@/components/global/password-span.vue';
import {
  SystemSettingType,
  getSettingParam,
  editSettingParam,
} from './type/index';

@Component({
  name: 'map-config',
  components: {
    ARow: Row,
    ACol: Col,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button,
    AInputPassword: Input.Password,
    PasswordSpan,
  },
})
export default class FileStorage extends Vue {
  layout = {
    left: 5,
    right: 10,
  };

  rootAdmin: boolean = false;

  isEdit: boolean = false;

  originalAuthorityKey: string = '';

  originalSecurityKey: string = '';

  editAuthorityKey: string = '';

  editSecurityKey: string = '';

  created() {
    this.getMapConfig();
  }

  @Watch('$store.state.System.User.loginedUserInfo.permissions', {
    immediate: true,
  })
  watchPermissions(val) {
    this.rootAdmin = val && val.includes('ADMIN');
  }

  getMapConfig() {
    const param: getSettingParam = {
      settingType: SystemSettingType[SystemSettingType.MAP_CONF],
    };
    systemApi.getSettingByType(param).then((res: any) => {
      if (res.errcode === 0) {
        this.originalAuthorityKey = res.data['map.key'];
        this.originalSecurityKey = res.data['map.secret'];
        this.editAuthorityKey = res.data['map.key'];
        this.editSecurityKey = res.data['map.secret'];
      }
    });
  }

  save() {
    if (!this.editAuthorityKey) {
      this.$message.error('授权key不能为空');
      return;
    }
    if (!this.editSecurityKey) {
      this.$message.error('安全密钥不能为空');
      return;
    }
    const param: editSettingParam = {
      settingType: SystemSettingType[SystemSettingType.MAP_CONF],
      bodyParams: {
        'map.key': this.editAuthorityKey,
        'map.secret': this.editSecurityKey,
      },
    };
    systemApi.editSettingByType(param).then((res: any) => {
      if (res.errcode === 0) {
        this.$message.success('保存成功');
        (window as any)._AMapSecurityConfig = this.editSecurityKey;
        this.originalAuthorityKey = this.editAuthorityKey;
        this.originalSecurityKey = this.editSecurityKey;
        this.isEdit = false;
      } else {
        this.$message.error(res.errmsg);
      }
    });
  }

  // 查看appSecret
  showSecret(success: Function) {
    success();
  }

  cancel() {
    this.isEdit = false;
    this.editAuthorityKey = this.originalAuthorityKey;
    this.editSecurityKey = this.originalSecurityKey;
  }
}
</script>

<style lang="less" scoped>
.map-config {
  width: 640px;
  text-align: left;
  &__header {
    padding-bottom: 20px;
    position: relative;
    // font-size:18px;
    color: #111218;
    font-weight: 600;
    span {
      line-height: 26px;
      height: 26px;
    }

    .header__tips {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.5);
      padding-left: 8px;
    }
  }
  .map-config__item {
    margin-bottom: 20px;
    .map-config__left {
      span {
        color: rgba(17, 18, 24, 0.5);
      }
      position: relative;
      .required::before {
        content: '*';
        color: #f5222d;
      }
      line-height: 32px;
    }
    .map-config__right {
      line-height: 32px;
      color: #111218;
      &--edit {
        line-height: 32px;
      }
      .btn {
        &.cancel-btn {
          margin-left: 8px;
        }
      }
    }
  }

  .btn-group__btn {
    margin-right: 16px;
  }
}
</style>
