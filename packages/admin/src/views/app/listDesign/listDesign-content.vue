<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <section class="content" :class="{ pc: clientType === clientPc }">
    <TableBar v-if="clientType === clientPc" />
    <section
      v-if="clientType === clientPc && presentationType === 'LIST'"
      class="content-setion"
    >
      <OperationBar />
      <TableList :listConfig="listConfig" />
    </section>
    <section
      v-else-if="clientType === clientPc && presentationType === 'GANTT'"
      class="content-setion"
    >
      <OperationBar />
      <GanttList v-if="!showPreview" :listConfig="listConfig" />
    </section>
    <section v-else class="content-mobile">
      <MobileList />
    </section>
    <!-- <empty-page v-if="false"></empty-page> -->
  </section>
</template>
<script lang="ts">
import MobileList from '@/components/apps/list-design/mobile-list.vue';
import TableBar from '@/components/apps/list-design/table-bar.vue';
import OperationBar from '@/components/apps/list-design/operation-bar.vue';
import TableList from '@/components/apps/list-design/table-list.vue';
import { viewRegister } from 'cloudpivot/list/utils/register';
import EmptyPage from '@/components/global/empty-page/index.vue';
import * as H3List from 'cloudpivot/h3-list';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ListdesignModule = namespace('Apps/Listdesign');

const GanttList = (viewRegister.getAssets() as any).GanttList;

@Component({
  name: 'ListDesignContent',
  components: {
    TableBar,
    OperationBar,
    TableList,
    EmptyPage,
    MobileList,
    GanttList,
  },
})
export default class ListDesignContent extends Vue {
  @ListdesignModule.State('showFieldArray') showFieldArray: any;

  @ListdesignModule.State('payloadOptions') payloadOptions: any;

  @ListdesignModule.State('presentationType') presentationType: any;

  @ListdesignModule.State('clientType') clientType: any;

  clientPc: H3List.schema.ClientTypes = H3List.schema.ClientTypes.PC;

  @Prop() listConfig: any; //视图配置信息

  @Prop() showPreview: any; //是否展示预览弹窗
}
</script>

<style lang="less">
.content {
  position: relative;
  .content-setion {
    padding: 0 0 16px 0;
    margin: 20px 20px 20px 20px;
    background: #fff;
    overflow: auto;
    height: calc(100% - 95px);
  }
}
.content-mobile,
.mobile-list {
  background: #f7f8fa;
  overflow: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  & > .mobile {
    margin: 8px auto;
    box-shadow: 0 12px 29px 0 rgba(0, 0, 0, 8%);
    background: rgba(0, 0, 0, 0.44);
    //background: #E8FCF4;

    .mobile-view {
      height: 100%;
      background-color: #fff;
      overflow: hidden;
      &-header {
        width: 50%;
        margin: auto;
        background: #818386;
      }
      &-content {
        height: 96%;
      }
    }
  }
  @media screen and (min-device-height: 400px) {
    & > .mobile {
      width: 384px;
      height: 100%;
      border-radius: 34px;
      padding: 8px;

      .mobile-view {
        border-radius: 30px;
        font-size: 12px;
        &-header {
          height: 22px;
          border-radius: 0 0 11px 11px;
        }
      }
    }
  }
  @media screen and (min-device-height: 768px) {
    & > .mobile {
      width: 384px;
      height: 100%;
      border-radius: 34px;
      padding: 8px;

      .mobile-view {
        border-radius: 30px;
        font-size: 12px;
        &-header {
          height: 22px;
          border-radius: 0 0 11px 11px;
        }
      }
    }
  }
  @media screen and (min-device-height: 900px) {
    & > .mobile {
      width: 384px;
      height: 100%;
      border-radius: 40px;
      padding: 10px;

      .mobile-view {
        border-radius: 36px;
        font-size: 12px;
        &-header {
          height: 28px;
          border-radius: 0 0 14px 14px;
        }
      }
    }
  }
  @media screen and (min-device-height: 1080px) {
    & > .mobile {
      width: 384px;
      height: 100%;
      border-radius: 52px;
      padding: 14px;

      .mobile-view {
        border-radius: 48px;
        font-size: 14px;
        &-header {
          height: 28px;
          border-radius: 0 0 19px 19px;
        }
      }
    }
  }
}
</style>
