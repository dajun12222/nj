<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="instances">
    <div class="instances-head">
      <search @filter="search" />
    </div>
    <div class="instances-content">
      <h3-scroll
        v-show="isEmpty"
        ref="scroll"
        :loadMore="loadMore"
        :pageSize="20"
        :noMoreMessage="$t('languages.common.loadAllWorkflow')"
      >
        <div>
          <instances-item
            v-for="(circulate, index) in myInstances"
            :key="index"
            :workitem="circulate"
            @openForm="openForm(circulate)"
          />
        </div>
      </h3-scroll>
      <Empty v-show="!isEmpty" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import mobile from 'cloudpivot/form/src/renderer/components/mobile';

import { workflowCenterApi } from 'cloudpivot/api';

import common from 'cloudpivot/common/mobile';

import flowCenter from 'cloudpivot/flow-center/mobile';

import Search from '@/components/global/search.vue';

@Component({
  name: 'apps',
  components: {
    Failed: common.components.LoadingFailed,
    NoSearchData: common.components.NoSearchData,
    InstancesItem: flowCenter.components.MyInstanceItem,
    Empty: common.components.Empty,
    Search,
    // H3Scroll:H3Form.renderer.components.mobile.H3Scroll,
    H3Scroll: mobile.H3Scroll,
  },
})
export default class Apps extends Vue {
  isEmpty: boolean = true;

  myInstances: Array<any> = [];

  params = {
    size: 20,
    page: 1,
    workflowName: '',
    startTime: '',
    endTime: '',
    /* 流程实例状态 */
    instanceState: 'PROCESSING',
  };

  search(val: any) {
    // const scroll = this.$refs.scroll as any;
    // this.params = Object.assign(this.params, val);
    // scroll.mescroll.resetUpScroll();
    if (val === this.params.workflowName) {
      return;
    }
    Object.assign(this.params, val);
    this.isEmpty = true;
    this.loadMore({ num: 1 }, null);
  }

  loadMore(page: any, done: any) {
    const vm: any = this;
    vm.params.page = page.num;
    if (page.num === 1) {
      vm.myInstances = [];
    }
    workflowCenterApi
      .getMyInstanceList({
        ...vm.params,
        page: vm.params.page - 1,
        isMobile: true,
      })
      .then((res: any) => {
        if (done) {
          done(vm.params.size, res.data.totalElements);
        }

        // 做报错处理
        if (res.errcode !== 0) {
          return this.$h3.toast.show({
            iconType: 'warning',
            text: res.errmsg,
          });
        }

        vm.myInstances = vm.myInstances.concat(res.data.content);
        if (!vm.myInstances.length) {
          vm.isEmpty = false;
        } else {
          vm.isEmpty = true;
        }
      });
  }

  openForm(workitem: any) {
    this.$router
      .push({
        name: 'form-detail',
        query: {
          // workitemId: this.workitem.id,
          workflowInstanceId: workitem.id,
          return: this.$route.fullPath,
          workitemType: 'myWorkflow',
        },
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
</script>
<style lang="less" scoped>
/*@import "~@/styles/themes/default.less";*/
.instances {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f7f8fc;
  .instances-head {
    flex: 1;
  }
  .instances-content {
    height: 100%;
    /deep/.mescroll {
      top: 50px;
      //  height: 100%;
      bottom: 52px;
      height: auto;
    }
  }
}
</style>
