<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div v-if="isShow" class="modify-modal">
    <div class="modify-content">
      <div class="modify-top">
        <div class="modify-top-title">
          {{ $t('languages.common.changePwd') }}
        </div>
        <!-- <div class="modify-close" @click="close">
                    <i class="icon aufontAll h-icon-all-close"></i>
                </div> -->
      </div>
      <div class="modify-bottom">
        <div class="modify-password">
          <div class="modify-tips">
            <div class="tips-box">
              <span class="icon aufontAll tips-icon">&#xe844;</span>
              <span class="tips-text">{{
                $t('languages.common.passwordSafeTips')
              }}</span>
            </div>
          </div>
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
              class="newPwd"
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
            <!-- <a-button style="margin-left: 10px" @click="close">
                            {{ $t('languages.common.cancel') }}
                        </a-button> -->
            <a-button type="primary" @click="submitForm">
              {{ $t('languages.common.ok') }}
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import OAuthApi from '@/apis/oauth';
import { Button, FormModel, Input } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import common from 'cloudpivot/common';
@Component({
  name: 'modify-pwd',
  components: {
    AButton: Button,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    AInput: Input,
  },
})
export default class ModifyPwd extends Vue {
  @Prop({ default: false }) isShow!: boolean;

  ruleForm: any = {
    oldPwd: '',
    newPwd: '',
    surePwd: '',
  };

  rules: any = {};

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
.modify-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.45);
  .modify-content {
    width: 368px;
    height: auto;
    // min-height: 520px;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    background-color: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    > .modify-top {
      width: 100%;
      height: 72px;
      // box-shadow: 0px 1px 0px 0px #dddddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
      > .modify-top-title {
        font-size: 16px;
        color: #111218;
        font-weight: 600;
        height: 24px;
        line-height: 24px;
      }
      .modify-close {
        color: rgba(17, 18, 24, 0.5);
        font-size: 18px;
        cursor: pointer;
        height: 24px;
        line-height: 24px;
      }
    }

    > .modify-bottom {
      display: flex;
      height: calc(100% - 56px);
      > .modify-password {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .modify-tips {
          padding: 0 24px;
          .tips-box {
            padding: 8px 16px;
            background: #fffbe6;
            border-radius: 4px;
            border: 1px solid #ffe58f;
            display: flex;
            .tips-icon {
              color: #faad14;
              font-size: 14px;
              margin-right: 8px;
            }
            .tips-text {
              color: #111218;
              line-height: 22px;
              font-size: 14px;
              font-weight: 400;
            }
          }
        }
        .ant-form {
          width: 100%;
          padding: 16px 24px 8px;
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
          // border-top: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 24px;
          padding-bottom: 24px;
          text-align: center;
          .ant-btn {
            // margin-left: 10px;
            // min-width: 80px;
            width: 100%;
            height: 32px;
            line-height: 32px;
            padding: 0 16px;
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
.oldPwd,
.newPwd,
.surePwd {
  /deep/.has-success.has-feedback,
  /deep/.has-error.has-feedback {
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
