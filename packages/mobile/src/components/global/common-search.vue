<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="common-search">
    <div class="common-search-group">
      <div class="common-search-group-box">
        <h3-input
          v-model="searchCondition.workflowName"
          :title="$t('languages.common.workflowName')"
          :placeholder="$t('languages.common.inputWorkflowName')"
          :clear="true"
          type="text"
          :autoHeight="true"
        />
        <h3-input
          v-model="searchCondition.startTime"
          :title="$t('languages.common.startTime')"
          :placeholder="$t('languages.common.inputStartTime')"
          @click.native="setDate(1)"
        >
          <div class="datetime-right-icon">
            <i class="icon aufont icon-base-right datetime-icon"></i>
          </div>
        </h3-input>
        <h3-input
          v-model="searchCondition.endTime"
          :title="$t('languages.common.endTime')"
          :placeholder="$t('languages.common.inputEndTime')"
          @click.native="setDate(2)"
        >
          <div class="datetime-right-icon">
            <i class="icon aufont icon-base-right datetime-icon"></i>
          </div>
        </h3-input>
      </div>
    </div>
    <bottom-button @reset="reset" @submit="search" />
  </div>
</template>
<script lang="ts">
import common from 'cloudpivot/common/mobile';
import { datetime, H3Button, H3Input } from 'h3-mobile-vue';
import { Component, Vue } from 'vue-property-decorator';

Vue.use(datetime);
Vue.prototype.$datetime = datetime;

@Component({
  name: 'common-search',
  components: {
    H3Input,
    H3Button,
    BottomButton: common.components.BottomButton,
  },
})
export default class CommonSearch extends Vue {
  searchCondition = {
    startTime: '',
    endTime: '',
    workflowName: '',
  };

  destroyed() {
    this.$h3.datetime.hide();
  }

  setDate(type: number) {
    // 阻止自带键盘弹出
    (document as any).activeElement.blur();

    let val;
    const format1: string = 'YYYY-MM-DD HH:mm';
    const vm: any = this;
    vm.$h3.datetime.show({
      cancelText: `${this.$t('languages.common.cancel')}`,
      confirmText: `${this.$t('languages.common.ok')}`,
      clearText: `${this.$t('languages.common.clear')}`,
      format: format1,
      value: val,
      locale: this.$i18n.locale,
      onConfirm(value: any) {
        if (type === 1) {
          vm.searchCondition.startTime = value;
        } else {
          vm.searchCondition.endTime = value;
        }
      },
      onShow() {},
      onHide() {},
      onClear(v: any) {
        if (type === 1) {
          vm.searchCondition.startTime = '';
        } else {
          vm.searchCondition.endTime = '';
        }
      },
    });
  }

  search() {
    this.$emit('commit', this.searchCondition);
  }

  reset() {
    this.searchCondition.startTime = '';
    this.searchCondition.endTime = '';
    this.searchCondition.workflowName = '';
  }
}
</script>
<style lang="less" scoped>
@import '~@/styles/mixins.less';
.common-search {
  /deep/.button {
    z-index: 100;
  }
  height: 100%;
  /*overflow: scroll;*/
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  &-group {
    flex: 1 0 auto;
    position: relative;
    overflow-y: auto;
    &-box {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
  /deep/.mock-text-area {
    width: 100% !important;
  }
}
</style>
