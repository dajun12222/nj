<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-select
    mode="tags"
    :placeholder="$t('languages.PlaceHolder.Select')"
    :notFoundContent="$t('languages.NoRelevantData')"
    :value="defaultSummary"
    @change="summaryChange"
  >
    <a-select-opt-group>
      <span slot="label" class="select-title">业务数据项</span>
      <a-select-option v-for="i in bizSummaryList" :key="i.code">
        {{ i.name }}
      </a-select-option>
    </a-select-opt-group>
    <a-select-opt-group>
      <span slot="label" class="select-title">系统数据项</span>
      <a-select-option v-for="i in defaultSummaryList" :key="i.code">
        {{ i.name }}
      </a-select-option>
    </a-select-opt-group>
  </a-select>
</template>

<script lang="ts">
import { Select } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const DataModelModule = namespace('Apps/DataModel');

@Component({
  name: 'data-model-summary',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    ASelectOptGroup: Select.OptGroup,
  },
})
export default class DataModelSummary extends Vue {
  @DataModelModule.State('summaryList') summaryList: any;

  @DataModelModule.State('defaultSummary') defaultSummary: any;

  @DataModelModule.Mutation('setSummary') setSummaryX: any;

  @DataModelModule.Action('getSummary') getSummaryX: any;

  @DataModelModule.Action('submitSummary') submitSummaryX: any;

  //   @DataModelModule.Mutation('setBizSchemaCode') setBizSchemaCodeX: any;

  get defaultSummaryList() {
    return this.summaryList.filter((data: any) => data.defaultProperty);
  }

  get bizSummaryList() {
    return this.summaryList.filter(
      (data: any) =>
        !data.defaultProperty && data.propertyType !== 10 && data.published,
    );
  }

  // 摘要选择
  summaryChange(val: Array<string>) {
    //
    this.setSummaryX(val);
    this.submitSummaryX();
  }

  mounted() {
    this.getSummaryX(); // 获取摘要
  }
}
</script>
