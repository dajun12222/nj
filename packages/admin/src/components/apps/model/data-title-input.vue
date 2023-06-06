<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div
    class="data-title-input input-modal"
    :class="!isFormDesign ? 'data-model' : 'design'"
  >
    <span class="data-title-input-label" :title="dataTitleStr" @click="open">{{
      dataTitleStr
    }}</span>
    <span v-if="!isFormDesign" class="icon aufontAll" @click="open">&#xe8cc;</span>
    <span
      v-else
      class="icon aufontAll h-icon-all-ellipsis-o"
      @click="open"
    ></span>
    <data-title-modal
      v-if="visible"
      :value="targetSummary"
      :list="summaryList"
      @ok="ok"
      @close="close"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DataTitleModal from './data-title-modal.vue';

const DataModelModule = namespace('Apps/DataModel');
@Component({
  name: 'data-title-input',
  components: {
    DataTitleModal,
  },
})
export default class DataTitleInput extends Vue {
  @Prop() isReadonly!: boolean;

  @DataModelModule.State('summaryList') summaryList: any;

  @DataModelModule.State('defaultSummary') defaultSummary: any;

  @DataModelModule.State('targetSummary') targetSummary: any;

  @DataModelModule.Mutation('setSummary') setSummaryX: any;

  @DataModelModule.Action('getSummary') getSummaryX: any;

  @DataModelModule.Action('submitSummary') submitSummaryX: any;

  visible = false;

  open() {
    if (!this.isReadonly) {
      this.visible = true;
    }
  }

  close() {
    this.visible = false;
  }

  ok(val: any) {
    if (val && val.length > 0) {
      const submitdata = val.map((res) => {
        return res.code;
      });
      this.setSummaryX(submitdata);
      this.submitSummaryX();
      this.close();
    } else {
      this.$message.error('数据标题不能为空！');
    }
  }

  get dataTitleStr() {
    // this.defaultSummary
    // console.log('this.defaultSummary', this.defaultSummary);
    if (this.targetSummary.length > 0) {
      let str = '';
      this.targetSummary.forEach((res) => {
        if (res.isDataItem === 1) {
          const theDataItem = this.summaryList.find(
            (item) => item.code === res.code,
          );
          if (theDataItem) {
            str += `[${theDataItem.name}]`;
          }
        } else {
          str += res.code;
        }
      });

      return str;
    } else {
      return '';
    }
    // console.log('targetSummary', this.targetSummary)
    // return '3333'
  }

  mounted() {
    this.getSummaryX(); // 获取摘要
  }

  get isFormDesign() {
    return this.$route.path.includes('/form-design/');
  }
}
</script>
<style lang="less" scoped>
.data-title-input {
  padding: 0 8px;
  line-height: 32px;
  text-align: left;
  .data-title-input-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &.design {
    display: flex;
    background: #fff !important;
    .data-title-input-label {
      display: block;
      width: calc(100% - 15px);
    }
  }

  &.data-model {
    width: 320px;
    .icon {
      float: left;
      margin-left: 17px;
    }
    .data-title-input-label {
      float: left;
      max-width: calc(100% - 33px);
    }
  }

  .icon {
    // float: right;
    cursor: pointer;
  }
}
</style>
