<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="smart-search clearfix">
    <div :class="{ collapsed: collapsed }">
      <div ref="queryFormLeft" class="query-form-left">
        <slot name="search"></slot>
      </div>
      <div class="query-form-right">
        <span v-show="queryWidth" @click="toggle">
          <span class="query-form__controller">{{
            collapsed ? '更多' : '收起'
          }}</span>
          <a-icon type="down" :class="{ collapsed: collapsed }" />
        </span>
        <a-button style="margin-top: 14px" @click="$emit('reset')">
          重置
        </a-button>
        <a-button type="primary" @click="okBtn"> 查询 </a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Icon, Button } from '@h3/antd-vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const UserModule = namespace('System/User');

@Component({
  name: 'smart-search',
  components: {
    AIcon: Icon,
    AButton: Button,
  },
})
export default class SmartSearch extends Vue {
  @UserModule.State('menuShowStatus') menuShowStatus!: boolean;

  screenWidth: number = document.body.clientWidth;

  menuLeftWidth: number = 224;

  queryWidth: boolean = false;

  timer: boolean = false;

  collapsed: boolean = true;

  toggle() {
    this.collapsed = !this.collapsed;
  }

  okBtn() {
    this.$emit('search');
    this.collapsed = true;
  }

  onresize() {
    window.screenWidth = document.body.clientWidth;
    this.screenWidth = window.screenWidth;
    const val = this.screenWidth;
    if (!this.timer) {
      this.screenWidth = val;
      this.timer = true;
      const that = this;
      setTimeout(() => {
        const boxWidth = that.screenWidth - that.menuLeftWidth - 243;
        that.isWidth(boxWidth);
        that.timer = false;
      }, 300);
    }
  }

  // 获取body宽度
  mounted() {
    const that = this;
    that.setLeftWidth(that.menuShowStatus);
    window.addEventListener('resize', that.onresize);
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onresize);
  }

  // 监听左侧是否展开
  @Watch('menuShowStatus')
  menuWidth(val: boolean, oldVal: boolean) {
    this.setLeftWidth(val);
  }

  // 设置左侧宽度
  setLeftWidth(val: boolean) {
    if (val) {
      this.menuLeftWidth = 46;
      const boxWidth = this.screenWidth - this.menuLeftWidth - 243;
      this.isWidth(boxWidth);
    } else {
      this.menuLeftWidth = 224;
      const boxWidth = this.screenWidth - this.menuLeftWidth - 243;
      this.isWidth(boxWidth);
    }
  }

  // 判断宽度
  isWidth(val: number) {
    const block: any = this.$refs.queryFormLeft;
    if (!block) {
      return;
    }
    this.queryWidth = block.offsetHeight > 60;
  }
}
</script>
<style lang="less" scoped>
.smart-search {
  height: 32px;
  position: relative;
  & > div {
    padding: 0 24px;
    z-index: 10;
    position: absolute;
    background: #fcfcfc;
    box-shadow: 0px 1px 0px 0px #eeeeee;
    width: 100%;
    // border: solid 1px #eee;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    &.collapsed {
      overflow: hidden;
      height: 55px;
    }
    .query-form-left {
      float: left;
      width: calc(100% - 300px);
    }
    .query-form-right {
      float: left;
      width: 300px;
      position: relative;
      top: -13px;
      text-align: right;
      button {
        margin-left: 8px;
        &:first-of-type {
          margin-left: 16px;
        }
      }
      /deep/.ant-btn {
        width: 60px;
        height: 32px;
        padding: 0 10px;
        &:focus {
          border-color: #d9d9d9;
          // color: rgba(17, 18, 24, 0.5);
        }
        &:hover {
          border-color: @primary-color;
          // color: @primary-color;
        }
      }

      i {
        transform: rotate(180deg);
        &.collapsed {
          transform: rotate(0);
        }
      }
    }
    .query-form__controller {
      cursor: pointer;
      margin-right: 8px;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(17, 18, 24, 0.5);
      line-height: 20px;
    }
  }
}
</style>
