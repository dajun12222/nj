<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <!-- 文件校验不通过 -->
    <div v-if="validateStatus === 'error'" class="validate-box">
      <div class="file-status">
        <i
          class="icon aufontAll h-icon-all-close-circle file-status-icon error"
        ></i>
        <span class="file-status-txt">{{
          $t('languages.Apps.DocumentValidateFailNoImportSupport')
        }}</span>
      </div>

      <div class="file-content error">
        <div class="file-content-error">
          <!-- 是数据项类型错误 -->
          <ul v-if="isDataModelError">
            <li>
              1. {{ $t('languages.Apps.DataItemError', { errors: errorInfo }) }}
            </li>
          </ul>
          <ul v-else-if="isSubTableRepeat">
            <li>
              1.
              {{
                $t('languages.Apps.SubTableCodeRepeat', { codes: errorInfo })
              }}
            </li>
          </ul>
          <ul v-else>
            <li>1. {{ errorInfo }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div
      v-else-if="
        warnInfoList.repeatMsg.length > 0 || warnInfoList.warnMsg.length > 0
      "
      class="validate-box"
    >
      <div class="file-status">
        <i class="icon aufontAll h-icon-all-check-circle file-status-icon"></i>
        <span class="file-status-txt">{{
          $t('languages.Apps.DocumentChecked')
        }}</span>
      </div>

      <div class="err-validate">
        <div class="validate-top">
          <i
            class="icon aufontAll h-icon-all-close-circle validate-icon-error"
          ></i>
          <span class="validate-title" style="padding-left: 8px">
            {{
              repeated && !isCoverable
                ? '存在编码重复，请修改！'
                : '系统检测到以下对象不存在，是否直接导入？'
            }}
          </span>
        </div>
        <div class="validate-msg err">
          <ul v-if="repeated && !isCoverable">
            <li v-for="(item, index) in warnInfoList.repeatMsg" :key="index">
              {{ index + 1 }}、{{ item }}
            </li>
          </ul>
          <ul v-else>
            <li v-for="(item, index) in warnInfoList.warnMsg" :key="index">
              {{ index + 1 }}、{{ item.warningMsg }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'errorMessage',
  components: {},
})
export default class errorMessage extends Vue {
  @Prop() validateStatus!: string;

  @Prop() isDataModelError!: boolean;

  @Prop() isSubTableRepeat!: boolean;

  @Prop() errorInfo!: any;

  @Prop() warnInfoList!: any;

  @Prop() repeated!: any;

  @Prop() isCoverable!: any;
}
</script>
