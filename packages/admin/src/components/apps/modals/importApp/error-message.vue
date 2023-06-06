<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <!-- 文件校验通过 -->
  <div class="validate-box">
    <div class="file-status">
      <template v-if="isFileOk">
        <i
          v-if="!builtInApp"
          class="icon aufontAll h-icon-all-check-circle file-status-icon"
        ></i>
        <a-icon
          v-else
          type="question-circle"
          theme="filled"
          style="color: #faad14; font-size: 18px"
        />
        <span class="file-status-txt">{{
          builtInApp
            ? '您上传的是示例应用，文件校验通过'
            : $t('languages.Apps.DocumentChecked')
        }}</span>
      </template>

      <!-- 文件错误，如非法文件等 -->
      <template v-else>
        <i
          class="icon aufontAll h-icon-all-close-circle file-status-icon error"
        ></i>
        <span class="file-status-txt">{{ fileErrMsg }}</span>
      </template>
    </div>

    <template v-if="isFileOk && fileInvalid">
      <template v-if="isCodeRepeat && !overrideForImport">
        <template v-if="!isModelCodeList">
          <div class="file-check-status">
            <span>{{ coreRepeatErrMsg }}</span>

            <span
              v-if="
                codeRepeatObj.modelCodeRepeat &&
                !codeRepeatObj.bothRepeat &&
                !!modelPos
              "
              class="model-position"
              >模型位置: {{ modelPos }}</span>

            <span
              v-if="
                codeRepeatObj.modelCodeRepeat &&
                !codeRepeatObj.bothRepeat &&
                !!subTableErr
              "
              class="model-position"
              >{{ subTableErr }}</span>
          </div>
        </template>
        <template v-else>
          <div class="file-check-status">
            <p class="isModelCodeList">
              1. 模型编码已存在<br />
              <span
                v-if="
                  codeRepeatObj.modelCodeRepeat &&
                  !codeRepeatObj.bothRepeat &&
                  !!modelPos
                "
                class="model-position"
                >模型位置: {{ modelPos }},请修改编码</span>
              <span
                v-if="
                  codeRepeatObj.modelCodeRepeat &&
                  !codeRepeatObj.bothRepeat &&
                  !!subTableErr2
                "
                class="model-position"
                >{{ subTableErr2 }}</span>
            </p>
            <br />
            <p>2. 修改编码再导入，将会生成新的业务模型。</p>
          </div>
        </template>

        <div v-if="!isModelCodeList && !builtInApp" class="status-tip">
          <p>
            1.
            覆盖后，当前导入业务模型里的数据模型会替换掉现在系统中对应业务模型的数据模型、编码重复的表单和流程；
          </p>
          <p>2. 修改编码再导入，将会生成新的业务模型。</p>
        </div>

        <div v-if="builtInApp" class="status-tip">
          <p>1. 示例应用修改编码再导入，将会生成新的业务模型;</p>
          <p>2. 示例应用不可被覆盖。</p>
        </div>
      </template>

      <!-- 异常明细 -->
      <template v-else-if="hasError">
        <div class="file-check-status">
          <span>
            检测到应用有多条对象不存在，应用导入后请重新配置。
            <a href="javascript:;" class="link" @click="showErrorDetail">查看明细</a>
          </span>
        </div>
      </template>
    </template>

    <div v-if="isShowErrorDetail" class="update-code-box">
      <errorDetail :errDetails="errDetails" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import errorDetail from './error-detail.vue';
import { Icon } from '@h3/antd-vue';

@Component({
  name: 'ErrorMessage',
  components: {
    errorDetail,
    AIcon: Icon,
  },
})
export default class ErrorMessage extends Vue {
  @Prop() isFileOk!: boolean;

  @Prop() fileInvalid!: boolean;

  @Prop() isCodeRepeat!: boolean;

  @Prop() isShowErrorDetail!: boolean;

  @Prop() isModelCodeList!: boolean;

  @Prop() coreRepeatErrMsg!: string;

  @Prop() codeRepeatObj!: any;

  @Prop() modelPos!: any;

  @Prop() subTableErr!: any;

  @Prop() subTableErr2!: any;

  @Prop() errDetails!: any;

  @Prop() fileErrMsg!: any;

  @Prop() overrideForImport!: any;

  @Prop() builtInApp!: any;

  // 展示错误明细
  showErrorDetail() {
    this.$emit('showErrorDetail');
  }

  // 关闭错误明细
  closeErrorDetail() {
    this.$emit('closeErrorDetail');
  }

  get hasError() {
    return Object.keys(this.errDetails).some((key) => {
      if (Array.isArray(this.errDetails[key])) {
        return this.errDetails[key].length > 0;
      } else {
        return Object.keys(this.errDetails[key]).some((attr) => {
          return this.errDetails[key][attr].length > 0;
        });
      }
    });
  }
}
</script>
