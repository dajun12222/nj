<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="modal-wrapper">
    <div class="shadow"></div>
    <div class="add-modal">
      <div class="modal-title">选择业务设计类型</div>

      <!-- <div class="typs">
        <div class="item" :class="{active: activeType === 'model'}" @click="typeChange('model')">
          <img src="./images/model.svg" alt="" />
          <span>业务模型</span>
        </div>
        <div class="item" :class="{active: activeType === 'report'}" @click="typeChange('report')">
          <img src="./images/report.svg" alt="" />
          <span>数据分析</span>
        </div>
        <div class="item" :class="{active: activeType === 'link'}" @click="typeChange('link')">
          <img src="./images/link.svg" alt="" />
          <span>自定义链接</span>
        </div>
      </div> -->

      <template v-if="activeType">
        <div class="tips">
          <span>{{ tips[activeType].label }}</span>
          <small>{{ tips[activeType].text }}</small>
        </div>

        <template v-if="activeType === 'model'">
          <AddBizModel :updateModelData="updateModelData" />
        </template>
      </template>

      <div class="btns">
        <a-button @click="goToAppList">返回应用列表</a-button>
        <a-button type="primary">确定</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import AddBizModel from '@/components/apps/modals/addBizModel.vue';
import { Button } from '@h3/antd-vue';

@Component({
  name: 'addModal',
  components: {
    AddBizModel,
    AButton: Button,
  },
})
export default class addModal extends Vue {
  @Prop() updateModelData!: any;

  @Prop({
    default: '',
  })
  editType?: string;

  created() {
    this.activeType = this.editType;
  }

  typeChange(type) {
    if (this.editType) {
      return;
    }
    this.activeType = type;
  }

  goToAppList() {
    this.$router.push('/apps');
  }

  activeType: string = '';

  tips: any = {
    model: {
      label: '业务模型信息',
      text: '应用下的子业务模块，如进销存应用中的采购',
    },
    report: {
      label: '数据分析信息',
      text: '可基于已有的系统模型或外部数据源，做可视化数据展示与分析，支持多种图表类型',
    },
    link: {
      label: '数据分析信息',
      text: '可在应用中添加外部链接或编写的页面，添加后在应用内访问该链接',
    },
  };
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';

.add-modal {
  .modal-title {
    line-height: 24px;
    font-size: 16px;
    color: @nav-font-color;
    font-weight: 600;
    padding-top: 24px;
  }
  .typs {
    display: flex;
    margin-top: 32px;
    justify-content: space-between;
    .item {
      margin: 0 10px;
      flex: 1;
      width: 228px;
      height: 138px;
      background: #f9fbfc;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: @nav-font-color;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid #f9fbfc;
      img {
        width: 74px;
        height: 74px;
        margin-right: 16px;
      }
      &:hover,
      &.active {
        border: 1px solid #2970ff;
      }
    }
  }
  .tips {
    position: relative;
    line-height: 22px;
    margin-top: 32px;
    margin-bottom: 16px;
    &::before {
      content: '';
      position: absolute;
      width: 3px;
      height: 10px;
      background: @primary-color;
      left: 0;
      top: 50%;
      margin-top: -6px;
    }
    span {
      font-size: 14px;
      font-weight: 600;
      color: @nav-font-color;
      margin-left: 10px;
    }
    small {
      color: @light-font-color;
      font-size: 12px;
      font-weight: 400;
      margin-left: 16px;
    }
  }
}

.btns {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding: 24px;
  button {
    &:first-child {
      margin-right: 16px;
    }
  }
}

.modal-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
