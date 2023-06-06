<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="modal-wrapper">
    <div
      class="add-modal"
      :style="{ height: modalHeiht !== 0 ? modalHeiht + 'px' : '' }"
    >
      <div class="modal-title">选择要创建的模块，开始构建你的应用</div>

      <div class="typs" :class="{ 'no-checked-type': activeType === '' }">
        <div
          class="item"
          :class="{ active: activeType === 'model' }"
          @click="typeChange('model')"
        >
          <svg class="icon svg-icon" aria-hidden="true">
            <use xlink:href="#h-icon-all-model" />
          </svg>
          <span>新建业务模型</span>

          <p v-if="!activeType">
            应用下的子业务模块，创建后可根据需要搭建表单、流程、列表等，进行数据收集及流程审批
          </p>
        </div>
        <div
          class="item"
          :class="{ active: activeType === 'report' }"
          @click="typeChange('report')"
        >
          <svg class="icon svg-icon" aria-hidden="true">
            <use xlink:href="#h-icon-all-statistic" />
          </svg>
          <span>新建数据分析</span>
          <p v-if="!activeType">
            可基于已有的系统模型或外部数据源，做可视化数据展示与分析，支持多种图表类型
          </p>
        </div>
        <div
          class="item"
          :class="{ active: activeType === 'link' }"
          @click="typeChange('link')"
        >
          <svg class="icon svg-icon" aria-hidden="true">
            <use xlink:href="#h-icon-all-customlink" />
          </svg>
          <span>新建自定义链接</span>
          <p v-if="!activeType">
            可在应用中添加外部链接或编写的页面，添加后在应用内访问该链接
          </p>
        </div>
      </div>

      <template v-if="activeType">
        <div class="add-type-wrap">
          <div class="tips">
            <span>{{ tips[activeType].label }}</span>
            <small>{{ tips[activeType].text }}</small>
          </div>

          <template v-if="activeType === 'model'">
            <AddBiz
              :key="addKey"
              ref="AddBizRef"
              v-model="isShow"
              @ok="AddBizOk"
            />
          </template>

          <template v-if="activeType === 'report'">
            <AddReport
              :key="addKey"
              ref="AddReportRef"
              v-model="isShow"
              mode="add"
              @ok="AddReportOk"
            />
          </template>

          <template v-if="activeType === 'link'">
            <AddPage
              :key="addKey"
              ref="AddPageRef"
              v-model="isShow"
              :appCode="$route.params.appCode"
              @ok="AddPageOk"
            />
          </template>
        </div>
      </template>

      <div class="btns">
        <a-button @click="goToAppList">返回应用列表</a-button>
        <a-button type="primary" :disabled="activeType === ''" @click="ok">确定</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import AddBizModel from '@/components/apps/modals/addBizModel.vue';
import { Button } from '@h3/antd-vue';

import AddBiz from '@/components/apps/modals/newAddModel/add-biz.vue';
import AddReport from '@/components/apps/modals/newAddModel/add-report.vue';
import AddPage from '@/components/apps/modals/newAddModel/add-page.vue';

@Component({
  name: 'noBizModel',
  components: {
    AddBizModel,
    AButton: Button,
    AddBiz,
    AddReport,
    AddPage,
  },
})
export default class noBizModel extends Vue {
  addKey: number = 1;

  isShow: boolean = true;

  modalHeiht: number = 0;

  async ok() {
    try {
      if (this.activeType === 'model') {
        await (this.$refs.AddBizRef as any).editModel();
      } else if (this.activeType === 'report') {
        await (this.$refs.AddReportRef as any).editModel();
      } else if (this.activeType === 'link') {
        await (this.$refs.AddPageRef as any).formConfirm();
      } else {
        //Else Empty block statement
      }
    } catch (error) {
      console.log(error);
      return;
    }

    this.addKey = new Date().getTime();
  }

  AddBizOk(val) {
    const href = `/apps/model/${this.$route.params.appCode}/${val}/form-design/${val}`;
    this.Torouter(href);
  }

  AddReportOk(val) {
    const href = `/apps/${this.$route.params.appCode}/report-design/${val}/isNew/true`;
    this.Torouter(href);
  }

  AddPageOk(val) {
    const href = `/apps/model/${this.$route.params.appCode}/${val}/customPage`;
    this.Torouter(href);
  }

  Torouter(url) {
    this.$router.push(url).catch((err: any) => {
      console.log(err);
    });
  }

  typeChange(type) {
    this.activeType = type;

    if (['model', 'report'].includes(this.activeType)) {
      this.modalHeiht = 0; // 610
    } else if (this.activeType === 'link') {
      this.modalHeiht = 0;
    } else {
      this.modalHeiht = 410;
    }
  }

  goToAppList() {
    this.$router.push('/apps');
  }

  activeType: string = '';

  tips: any = {
    model: {
      label: '业务模型信息',
      text: '应用下的子业务模块，创建后可根据需要搭建表单、流程、列表等，进行数据收集及流程审批',
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

  mounted() {
    setTimeout(() => {
      this.modalHeiht = 410;
    }, 10);
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
@media screen and (max-height: 800px) {
  .add-modal {
    height: 100vh;
    .add-type-wrap {
      height: calc(100vh - 314px);
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 2px;
    }
  }
}
@media screen and (min-height: 800px) {
  .add-modal {
    height: 810px;
  }
}
.add-type-wrap {
  height: 464px;
}
.add-modal {
  left: 50%;
  top: 50%;
  overflow: hidden;
  position: absolute;
  transform: translate(-50%, -50%);
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  padding: 24px;
  transition: 0.6s all ease;
  .modal-title {
    line-height: 24px;
    font-size: 16px;
    color: @nav-font-color;
    font-weight: 600;
  }
  .typs {
    display: flex;
    margin-top: 32px;
    justify-content: space-between;
    .item {
      margin: 0 10px;
      flex: 1;
      width: 228px;
      height: 104px;
      background: #f9fbfc;
      border-radius: 2px;
      font-size: 16px;
      color: @nav-font-color;
      font-weight: 600;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      cursor: pointer;
      border: 2px solid #f9fbfc;
      transition: 0.6s all ease;
      overflow: hidden;

      svg {
        width: 56px;
        height: 56px;
        margin-right: 16px;
        // transition: 0.6s all ease;
        margin-left: 20px;
      }
      &:hover,
      &.active {
        border: 2px solid #2970ff;
      }
      p {
        width: 194px;
        font-size: 12px;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
        line-height: 18px;
        margin-top: 8px;
        text-align: justify;
      }
    }
  }
  .no-checked-type {
    .item {
      height: 234px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      svg {
        margin-right: 0;
        width: 84px;
        height: 84px;
        margin-top: 24px;
        margin-left: 0;
      }
      span {
        display: block;
        width: 100%;
        text-align: center;
        margin-top: 16px;
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
  padding: 24px 24px 0;
  button {
    &:first-child {
      margin-right: 16px;
    }
  }
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
}

#app .modal-wrapper {
  position: fixed;
  left: 0 !important;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
