<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="list-preview">
    <div v-show="presentationType !== 'GANTT'" class="client-type">
      <div
        class="type-select"
        :class="{ selected: clientType === 'PC' }"
        @click="setClientType('PC')"
      >
        Web端
      </div>
      <div
        class="type-select"
        :class="{ selected: clientType === 'APP' }"
        @click="setClientType('APP')"
      >
        移动端
      </div>
    </div>

    <ListDesignContent
      class="preview-content"
      :listConfig="listConfig"
      :clientType="curview"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import ListDesignContent from '@/views/app/listDesign/listDesign-content.vue';
import { namespace } from 'vuex-class';

const ListdesignModule = namespace('Apps/Listdesign');

@Component({
  name: 'list-preview',
  components: {
    ListDesignContent,
  },

  // beforeRouteEnter(to, from, next) {
  //   next((vm) => {
  //     (vm as ListPreview).load();
  //   });
  // },

  // beforeRouteUpdate(to, from, next) {
  //   const vm = this as ListPreview;
  //   // vm.clean();
  //   next();
  //   vm.load();
  // }
})
export default class ListPreview extends Vue {
  @Prop() curview!: any;

  @Prop() presentationType!: any;

  @Prop() listConfig!: any;

  @ListdesignModule.Mutation('setClientType') setClientType: any;

  @ListdesignModule.State('clientType') clientType: any;

  listCode = '';

  schemaCode = '';

  quertColumns: any = [];

  @Provide() getScrollEl() {
    // return this.$el
  }

  mounted() {
    this.listCode = this.$route.params.code;
    this.schemaCode = this.$route.params.bizSchemaCode;
  }

  hidePreview() {
    this.setClientType('PC');
    this.$emit('hidePreview');
  }
}
</script>

<style lang="less" scoped>
.list-preview {
  height: 100%;
  position: relative;
  /deep/ .gantt-preview {
    height: unset;
  }
  .preview-content {
    width: unset;
    background: #fff;
    /deep/.content-setion {
      margin-top: 0;
    }
    /deep/.section-bar {
      line-height: 75px;
    }
    /deep/.ant-table-content {
      border-left: thin solid #e8e8e8;
      border-right: thin solid #e8e8e8;
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
