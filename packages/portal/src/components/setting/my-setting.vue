<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<!--
 * @Descripttion: 个人设置
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-10-21 15:37:46
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-11 16:57:21
-->
<template>
  <div v-if="isShow" class="motail-setting">
    <div class="motail-content">
      <div class="motail-top">
        <div class="motail-top-title">
          {{ $t('languages.common.personalSetting') }}
        </div>
        <div class="motail-close" @click="close">
          <i class="icon aufontAll h-icon-all-close"></i>
        </div>
      </div>

      <div class="motail-bottom">
        <div class="motail-content-left">
          <div
            v-for="item in list"
            :key="item.lable"
            class="motail-left-li"
            :class="item.label === current ? 'active' : ''"
            @click="current = item.label"
          >
            {{
              item.label === 'info'
                ? $t('languages.common.personalInfo')
                : $t('languages.common.passwordSetting')
            }}
          </div>
        </div>

        <div class="motail-content-right">
          <div v-show="current === 'info'" class="motail-right-info">
            <div
              v-for="val in userInfoList"
              :key="val.title"
              class="info-li"
              :class="val.type ? 'info-li-active' : ''"
            >
              <div v-if="val.title" class="sub-title">
                {{ val.title }}
              </div>
              <div v-if="val.type === 'image'" class="image-author">
                <img
                  v-if="val.value && val.value.includes('http')"
                  :src="val.value"
                />
                <img
                  v-else-if="val.value"
                  :src="getDownloadUrlNew(val.value)"
                />
                <i
                  v-else
                  class="icon aufontAll h-icon-all-normal_smile default-avatar"
                ></i>
              </div>
              <span v-else class="sub-value">
                <a-tooltip>
                  <div v-if="val.fullvalue" slot="title">
                    {{ val.fullvalue }}
                  </div>
                  {{ val.value || '-' }}
                </a-tooltip>
              </span>
            </div>
          </div>

          <div v-show="current === 'password'" class="motail-right-password">
            <a-form-model
              ref="ruleForm"
              :model="ruleForm"
              layout="vertical"
              labelAlign="left"
              :rules="rules"
            >
              <a-form-model-item
                class="oldPwd"
                hasFeedback
                :label="$t('languages.common.oldPwd')"
                prop="oldPwd"
              >
                <a-input
                  v-model="ruleForm.oldPwd"
                  type="password"
                  autocomplete="off"
                  :placeholder="$t('languages.common.placeholder')"
                />
              </a-form-model-item>
              <a-form-model-item
                hasFeedback
                :label="$t('languages.common.newPwd')"
                prop="newPwd"
              >
                <a-input
                  v-model="ruleForm.newPwd"
                  type="password"
                  autocomplete="off"
                  :placeholder="$t('languages.common.placeholder')"
                  @change="newPwdChange"
                />
              </a-form-model-item>
              <a-form-model-item
                class="surePwd"
                :class="hasDiff ? 'has-error' : ''"
                hasFeedback
                :label="$t('languages.common.surePwd')"
                prop="surePwd"
              >
                <a-input
                  v-model="ruleForm.surePwd"
                  type="password"
                  autocomplete="off"
                  :placeholder="$t('languages.common.placeholder')"
                  @change="surePwdChange"
                />
                <span v-if="hasDiff" class="error-icon">
                  <a-icon type="close-circle" theme="filled" />
                </span>
                <div v-if="hasDiff" class="ant-form-explain mock">
                  {{ $t('languages.common.passwordErrorTips6') }}
                </div>
              </a-form-model-item>
            </a-form-model>

            <div class="foot-btn">
              <a-button style="margin-left: 10px" @click="resetForm">
                {{ $t('languages.common.reset') }}
              </a-button>
              <a-button type="primary" @click="submitForm">
                {{ $t('languages.common.ok') }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Button, FormModel, Input, Icon, Tooltip } from '@h3/antd-vue';
import OAuthApi from '@/apis/oauth';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import common from 'cloudpivot/common';
@Component({
  name: 'my-setting',
  components: {
    AButton: Button,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    AInput: Input,
    AIcon: Icon,
    ATooltip: Tooltip,
  },
})
export default class MySetting extends Vue {
  @Prop({ default: false }) isShow!: boolean;

  @Prop({ default: {} }) userInfo!: any;

  current: string = 'info';

  list: any[] = [
    {
      title: '个人信息',
      label: 'info',
    },
    {
      title: '密码设置',
      label: 'password',
    },
  ];

  userInfoList: any[] = [];

  ruleForm: any = {
    oldPwd: '',
    newPwd: '',
    surePwd: '',
  };

  rules: any = {};

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  @Watch('isShow')
  getUserInfo(val) {
    if (!val) {
      return;
    }
    this.current = 'info';
    if (!this.userInfo.isShowUpdatePwdBtn) {
      this.list = this.list.filter((item) => item.label !== 'password');
    }

    this.userInfoList = [
      {
        title: '',
        value: this.userInfo.imgUrl || this.userInfo.imgUrlId,
        type: 'image',
      },
      {
        title: this.$t('languages.common.userInfo.name'),
        value: this.userInfo.name,
      },
      {
        title: this.$t('languages.common.userInfo.id'),
        value: this.userInfo.userId,
      },
      {
        title: this.$t('languages.common.userInfo.departmentName'),
        value: this.userInfo.departmentName,
        fullvalue: this.userInfo.parentDepartmentName,
      },
      {
        title: this.$t('languages.common.userInfo.position'),
        value: this.userInfo.position,
      },
      {
        title: this.$t('languages.common.userInfo.employeeNo'),
        value: this.userInfo.employeeNo,
      },
      {
        title: this.$t('languages.common.userInfo.roleName'),
        value: this.userInfo.roleName,
      },
      {
        title: this.$t('languages.common.userInfo.email'),
        value: this.userInfo.email,
      },
      {
        title: this.$t('languages.common.userInfo.remark'),
        value: this.userInfo.remark,
      },
    ];
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  beforeMount() {
    this.setRules();
  }

  oldPwd(rule, value, callback) {
    if (value === '') {
      callback(new Error(`${this.$t('languages.common.passwordErrorTips1')}`));
    } else if (/[\u4e00-\u9fa5\s]/.test(value)) {
      // eslint-disable-next-line standard/no-callback-literal
      callback('密码中不能包含汉字和空格');
    } else {
      callback();
    }
  }

  newPwd(rule, value, callback) {
    if (value === '') {
      callback(new Error(`${this.$t('languages.common.passwordErrorTips2')}`));
    } else if (/[\u4e00-\u9fa5\s]/.test(value)) {
      // eslint-disable-next-line standard/no-callback-literal
      callback('密码中不能包含汉字和空格');
    } else if (
      value.length < 6 ||
      value.length > 14 ||
      !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[^\u4e00-\u9fa5\s]{6,14}$/.test(value)
    ) {
      callback(new Error(`${this.$t('languages.common.passwordErrorTips3')}`));
    } else if (value === this.ruleForm.oldPwd) {
      callback(new Error(`${this.$t('languages.common.passwordErrorTips4')}`));
    } else {
      callback();
    }
  }

  hasDiff: boolean = false;

  newPwdChange() {
    if (
      this.ruleForm.surePwd &&
      this.ruleForm.newPwd !== this.ruleForm.surePwd
    ) {
      this.hasDiff = true;
    } else {
      this.hasDiff = false;
    }
  }

  surePwd(rule, value, callback) {
    if (value === '') {
      callback(new Error(`${this.$t('languages.common.passwordErrorTips5')}`));
    } else {
      callback();
    }
  }

  surePwdChange() {
    if (
      this.ruleForm.surePwd &&
      this.ruleForm.newPwd !== this.ruleForm.surePwd
    ) {
      this.hasDiff = true;
    } else {
      this.hasDiff = false;
    }
  }

  /**
   * 自定义验证规则
   */
  setRules() {
    this.rules = {
      oldPwd: [{ validator: this.oldPwd, trigger: 'change' }],
      newPwd: [{ validator: this.newPwd, trigger: 'change' }],
      surePwd: [{ validator: this.surePwd, trigger: 'change' }],
    };
  }

  /**
   * 修改密码
   */
  submitForm() {
    const ruleForm: any = this.$refs['ruleForm'];
    ruleForm.validate(async (valid) => {
      if (valid) {
        // rsa加密
        const result = await OAuthApi.getRsaKey();
        const flag: boolean =
          typeof result === 'object' &&
          result.hasOwnProperty('index') &&
          result.hasOwnProperty('key');
        if (!flag) {
          return;
        }
        const { index, key } = result;
        const oldPassword: any = common.utils.RsaEncrypt(
          this.ruleForm.oldPwd,
          key,
        );
        const newPassword: any = common.utils.RsaEncrypt(
          this.ruleForm.newPwd,
          key,
        );
        // rsa加密结束
        const params = {
          index,
          oldPassword,
          newPassword,
        };
        const res = await OAuthApi.changePassword(params);
        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }
        this.$message.success(
          `${this.$t('languages.common.changePwdSuccess')}`,
        );
        this.$emit('success');
      }
    });
  }

  /**
   * 重置表单
   */

  resetForm() {
    const ruleForm: any = this.$refs['ruleForm'];
    ruleForm.resetFields();
  }

  close() {
    this.resetForm();
    this.$emit('closepop');
  }
}
</script>
<style lang="less" scoped>
@import '~cloudpivot/application/src/components/pc/style/custom-themes';
.motail-setting {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.45);
  .motail-content {
    width: 800px;
    height: auto;
    min-height: 520px;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    > .motail-top {
      width: 100%;
      height: 72px;
      box-shadow: 0px 1px 0px 0px #dddddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
      > .motail-top-title {
        font-size: 16px;
        color: #111218;
        font-weight: 600;
        height: 24px;
        line-height: 24px;
      }
      .motail-close {
        color: rgba(17, 18, 24, 0.5);
        font-size: 18px;
        cursor: pointer;
        height: 24px;
        line-height: 24px;
        &:hover {
          color: @highlightColor;
        }
      }
    }

    > .motail-bottom {
      display: flex;
      height: calc(100% - 56px);
      > .motail-content-left {
        width: 160px;
        height: 100%;
        min-height: 450px;
        border-right: 1px solid #ddd;
        padding-top: 10px;
        > .motail-left-li {
          width: 100%;
          padding-left: 24px;
          font-size: 14px;
          font-weight: 400;
          color: #111218;
          height: 40px;
          line-height: 40px;
          cursor: pointer;
          &:hover {
            color: @highlightColor;
          }
          &.active {
            background-color: @activeBGColor;
            font-weight: 700;
            color: @highlightColor;
          }
          &:hover {
            background-color: @activeBGColor;
          }
        }
      }
      > .motail-content-right {
        flex: 1;
        > .motail-right-info {
          width: 100%;
          padding: 24px;
          display: flex;
          flex-wrap: wrap;
          .info-li {
            width: 48%;
            margin-bottom: 16px;
            &:nth-child(2n) {
              margin-right: 16px;
            }
            &.info-li-active {
              width: 200%;
            }
            > .sub-title {
              width: 100%;
              font-size: 14px;
              font-weight: 400;
              color: #111218;
              margin-bottom: 6px;
            }
            > .sub-value {
              display: block;
              width: 288px;
              background-color: #f1f2f6;
              border-radius: 2px;
              padding: 0 12px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              height: 32px;
              line-height: 32px;
              font-size: 14px;
              color: #111218;
              font-weight: 400;
              text-align: justify;
            }
            img {
              width: 68px;
              height: 68px;
              border-radius: 50% !important;
              border: 1px solid #dddddd;
              object-fit: cover;
            }
            .default-avatar {
              font-size: 68px;
              line-height: 68px;
              color: #ffb131;
            }
          }
        }
        > .motail-right-password {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          .ant-form {
            width: 100%;
            padding-left: 25px;
            padding-top: 25px;
            flex: 1;
            .ant-form-item {
              width: 320px;
              margin-bottom: 8px;
              /deep/.ant-form-item-label > label {
                height: 22px;
                font-size: 14px;
                font-weight: 400;
                color: #111218;
                line-height: 22px;
              }
              /deep/.ant-form-item-control .ant-input {
                border-radius: 2px;
              }
            }
          }
          .foot-btn {
            width: 100%;
            height: 56px;
            border-top: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 25px;
            .ant-btn {
              margin-left: 10px;
              height: 32px;
              line-height: 32px;
              padding: 0 16px;
            }
          }
        }
      }
    }
  }

  /deep/.has-error.has-feedback .ant-form-item-children-icon {
    top: calc(50% + 2px);
  }

  /deep/.has-success.has-feedback .ant-form-item-children-icon {
    top: calc(50% + 2px);
  }
}
.oldPwd {
  /deep/.has-success.has-feedback {
    span.ant-form-item-children-icon {
      display: none;
    }
  }
}
.surePwd.has-error {
  /deep/.has-feedback {
    span.ant-form-item-children-icon {
      display: none;
    }
  }
  .ant-form-explain.mock {
    position: absolute;
  }
  /deep/.ant-form-item-control .error-icon {
    position: absolute;
    top: calc(50% + 2px);
    right: 0;
    z-index: 1;
    width: 32px;
    height: 20px;
    margin-top: -10px;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    visibility: visible;
    pointer-events: none;
    color: #f4454e;
    animation-name: diffZoomIn2;
  }
}
</style>
