<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div v-if="fields && fields.length" class="query-form-admin 1">
      <div class="query-form-left">
        <!-- <pc-form-renderer ref="formRenderer" :controls="controls" /> -->
        <QueryFormRenderer
          class="filter-box"
          :fields="queryFormRendererFields"
          :dataItemList="dataItemList"
          :vm="_self"
        />
      </div>
    </div>
    <div v-else class="content-box__empty">
      <p>{{ $t('languages.Apps.QueryIsNullTips2') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Select } from '@h3/antd-vue';
import PcFormRenderer from 'cloudpivot/form/src/renderer/components/pc-form-renderer.vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { conditions2fields } from 'cloudpivot/list/src/components/pc/components/queryForm/query-form-util';
import QueryFormRenderer from 'cloudpivot/list/src/components/pc/components/queryForm/query-form-renderer2.vue';
import { namespace } from 'vuex-class';

const ListdesignModule = namespace('Apps/Listdesign');
@Component({
  name: 'query-form',
  components: {
    PcFormRenderer,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    QueryFormRenderer,
  },
})
export default class QueryForm extends Vue {
  @Prop()
  fields!: any[];

  isFromAdmin: boolean = true;

  @ListdesignModule.State('dataItemList') dataItemList: any;

  get queryFormRendererFields() {
    let queryFormRendererFields = JSON.parse(JSON.stringify(this.fields));

    queryFormRendererFields = conditions2fields(
      queryFormRendererFields || [],
      this,
    );
    return queryFormRendererFields;
  }
}
</script>

<style lang="less" scoped>
.query-form-admin {
  position: relative;
  line-height: 24px;
  /deep/.query-form-left {
    max-height: ~'min(calc(100vh - 256px), 530px)';
    display: flex;
  }
  .btn-disabled {
    font-size: 14px;
    color: rgba(17, 18, 24, 0.25);
    display: inline-block;
    height: 22px;
    font-weight: 400;
    line-height: 22px;
    margin-bottom: 10px;
    padding: 16px 24px 0 24px;
    &:hover {
      box-shadow: none;
    }
  }
  &-left {
    max-height: 320px;
    overflow-y: scroll;
    padding-bottom: 12px;
  }
  .filter-box {
    /deep/.query-type {
      .ant-select-selection-selected-value {
        color: #2970ff;
      }
      .ant-select-arrow {
        color: #2970ff !important;
      }
    }
    /deep/.query-field-group {
      .btn {
        color: #2970ff;
        &.btn-disabled {
          color: rgba(17, 18, 24, 0.25);
        }
      }
      .query-item {
        .ant-select-arrow:hover {
          color: #2970ff !important;
        }
      }
      .delete-item-icon:hover {
        color: #2970ff !important;
      }
    }
  }
}

.content-box__empty {
  text-align: center;
  font-weight: 400;
  color: rgba(17, 18, 24, 0.5);
  line-height: 60px;
}
</style>
