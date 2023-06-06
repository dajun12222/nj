<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    :class="{
      'form-preview': true,
      'mobile-preview': isMobile,
    }"
  >
    <div class="client-type">
      <div
        class="type-select"
        :class="{ selected: !isMobile }"
        @click="switchView('pc')"
      >
        Web端
      </div>
      <div
        class="type-select"
        :class="{ selected: isMobile }"
        @click="switchView('mobile')"
      >
        移动端
      </div>
    </div>

    <div class="form-content">
      <div class="form">
        <smart-form
          :preview="preview"
          actionsAlign="right"
          :mobile="isMobile"
        />

        <div v-if="!isMobile" class="form-actions">
          <a-checkbox :checked="false" disabled>
            继续创建时，保留本次提交内容
          </a-checkbox>
          <a-button class="unable">暂存</a-button>
          <a-button class="unable">提交并继续创建</a-button>
          <a-button disabled>提交</a-button>
          <a-button v-for="(action, key) in actions" :key="key" disabled>{{
            action.text
          }}</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Checkbox } from '@h3/antd-vue';
import { schema } from 'cloudpivot/form';
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import SmartForm from '../shared/smart-form.vue';
@Component({
  name: 'form-preview',
  components: {
    SmartForm,
    AButton: Button,
    ACheckbox: Checkbox,
  },
})
export default class FormPreview extends Vue {
  @Prop() curview!: any;

  view = 'pc';

  actions: schema.FormAction[] = [];

  preview: any = {};

  mounted() {
    this.preview = this.curview;
  }

  get isMobile() {
    return this.view === 'mobile';
  }

  switchView(type: string) {
    this.view = type;
  }

  hidePreview() {
    this.$emit('hidePreview');
  }

  @Provide()
  getScrollEl() {
    return document.body;
  }
}
</script>

<style lang="less" scoped>
.form-preview {
  height: 100%;
  background: #fff;
  position: relative;
  &.mobile-preview {
    .client-type {
      top: -54px;
    }
    .form-content {
      overflow-y: auto;
      height: calc(100% - 20px);
      margin: 10px 0;
      .form {
        padding-bottom: 0;
        margin-bottom: 0;
        display: flex;
        align-items: center;
        height: ~'max(800px, 100%)';
      }
    }
  }
}
.container {
  top: 0 !important;
}

.form {
  width: 1024px;
  margin: auto;
  padding-bottom: 2em;
  margin-bottom: 5em;
}

.form-actions {
  padding: 12px;
  text-align: right;
  box-shadow: 0px -1px 0px 0px #dddddd;
  position: relative;
  /deep/.ant-checkbox-wrapper {
    position: absolute;
    left: 22px;
    top: 17px;
    .ant-checkbox-disabled + span {
      color: #111218;
    }
  }

  & > button {
    margin-right: 8px;
    &.unable {
      background: #ffffff;
      color: #c3c4c5;
      border: 1px solid #d4d5d6;
    }
  }
}

.header {
  display: flex;
  justify-content: center;
  background: #2e323b;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  position: relative;

  & > div {
    &:not(.left) {
      cursor: pointer;
    }
    min-width: 50px;
    height: 60px;
    margin: 0 12px;
    padding: 0 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    &.selected {
      color: @primary-color;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0;
        border-bottom: 3px solid @primary-color;
      }
    }
  }

  & > div.left {
    position: absolute;
    left: 12px;
  }
  & > div.right {
    position: absolute;
    right: 12px;
  }

  .hide-preview {
    cursor: pointer;
    width: 82px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    color: #fff;
    font-size: 14px;
    i {
      font-size: 14px;
      margin-right: 8px;
    }
  }
}
.form-content {
  height: 100%;
  /deep/.form {
    width: 100%;
    height: 100%;
    padding-bottom: 0;
    .smart-form {
      height: calc(100% - 56px);
      overflow-y: auto;
      margin-bottom: 1px;
      & > div {
        width: 1024px;
        margin: auto;
      }
    }
  }
}

.client-type {
  width: 162px;
  position: absolute;
  top: -44px;
  left: calc(50% - 81px);
  z-index: 2;
  text-align: center;
  border-radius: 2px;
  background: #f1f2f6;
  height: 32px;
  padding: 3px;
  display: flex;
  .type-select {
    width: 76px;
    height: 26px;
    border-radius: 1px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #111218;
    &.selected {
      background: #ffffff;
      font-weight: bold;
    }
    &:last-child {
      margin-left: 4px;
    }
  }
}
</style>
<style lang="less">
.form-preview .h3-report-container .vue-grid-layout {
  height: auto !important;
}
</style>
