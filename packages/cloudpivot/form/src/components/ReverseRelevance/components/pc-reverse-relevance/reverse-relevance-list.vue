<template>
  <div class="reverse-relevance-list">
    <list-selector
      :listCode="controlOpts.listCode"
      :schemaCode="controlOpts.schemaCode"
      :cols="3"
      :newCol="newCol"
      :showActions="true"
      :showSearch="true"
      :isReverse="true"
      :selectable="false"
      :query="queryCondition"
      :defaultQuery="defaultQuery"
      :reverseControlCode="id"
      :sequenceStatus="sequenceStatus"
      :reverseSchemaCode="selfSchemaCode"
      :reverseFormCode="selfFormCode"
      :currentFormId="currentFormId"
      :currentSheetId="currentSheetId"
      :reverseFormFieldCode="controlOpts.fieldCode"
      :control="control"
      :relevanceFormCode="control"
      :reverseViewFlag="!!control.options.showField"
    />
  </div>
</template>

<script lang="ts">
import { RelevanceFormControl } from '../../../../../../form/src/common/controls/relevance-form-control';
import { ReverseRelevanceControl } from '../../../../../../form/src/common/controls/reverse-relevance-control';
import { ReverseQueryService } from '../../../../../../form/src/common/services';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'reverse-relevance-list',
  components: {},
})
export default class ReverseRelevanceList extends ReverseRelevanceControl {
  newCol: any = [];

  created() {
    const comp = RelevanceFormControl.loadListSelector();
    (this.$options as any).components.ListSelector = comp;
    const conditions = this.controlOpts.conditions;
    const formControls = this.getFormControls();
    const c = this.control;
    this.queryCondition = ReverseQueryService.getParams(
      conditions,
      formControls,
      c,
      this.findController,
    );
    this.queryCondition.push(this.field);
  }

  queryCondition: any = {};

  // get query() {
  //   const conditions = this.controlOpts.conditions;
  //   const formControls = this.getFormControls();
  //   const c =  this.control;
  //   const param = ReverseQueryService.getParams(conditions,formControls,c, this.findController);
  //   return {}
  // }
  get defaultQuery() {
    const val: any[] = [];
    if (this.field) {
      const { code, type, value } = this.field;
      val.push({
        propertyCode: code,
        propertyType: type,
        propertyValue: value,
      });
    }
    return val;
  }
}
</script>

<style scoped lang="less">
.reverse-relevance-list {
  position: relative;
  /deep/.noAction {
    .sheet__row {
      cursor: pointer;
    }
  }
}
</style>
