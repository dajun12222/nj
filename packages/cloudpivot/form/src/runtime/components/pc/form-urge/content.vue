<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-02 10:59:03
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-04-14 09:30:15
-->
<template>
  <div class="urge-content">
    <div class="desc-box">
      <textarea
        v-model="urgeContent"
        :placeholder="$t('cloudpivot.form.runtime.urge.plzInput')"
        maxlength="100"
      ></textarea>
      <div class="desc-num">{{ urgeContent.length }}/100</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'urge-content',
})
export default class UrgeContent extends Vue {
  urgeContent: string = '';
}
</script>

<style lang="less">
.urge-content {
  .desc-box {
    // height: 170px;
    height: 96px;
    position: relative;
    border-radius: 4px;
    .desc-num {
      font-size: 12px;
      color: rgba(17, 18, 24, 0.25);
      text-align: right;
      position: absolute;
      bottom: 5px;
      right: 12px;
    }
    textarea {
      width: 100%;
      height: 96px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.85);
      resize: none;
      outline: none;
      border-radius: 2px;
      padding: 5px 12px;
      border: 1px solid #d4d5d6;
      &::-webkit-input-placeholder {
        color: rgba(0, 0, 0, 0.25);
      }
      &:-moz-placeholder {
        color: rgba(0, 0, 0, 0.25);
      }

      &:hover {
        border: 1px solid #2970ff;
      }
      &:focus {
        border: 1px solid #2970ff;
        box-shadow: 0px 0px 0px 2px rgba(41, 112, 255, 0.2);
      }
    }
  }
}
</style>
