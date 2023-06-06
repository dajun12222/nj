<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="trigger-schema-code">
    <a-select
      v-model="theVale"
      style="width: 100%"
      placeholder="请选择"
      @change="selectChange"
    >
      <a-select-option
        v-for="item in triggerObjLists"
        :key="item.code"
        :value="item.code"
        :disabled="!item.published"
        :title="item.name + '[' + item.code + ']'"
      >
        {{
          `${typeof item.name === 'string' ? item.name : item.name.name}[${
            item.code
          }]`
        }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts">
import AppsApi from '@/apis/apps';
import { Select } from '@h3/antd-vue';
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import * as forms from 'cloudpivot-forms';
import { Component, Inject, Mixins, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'trigger-schema-code',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class TriggerSchemaCode extends Mixins(PropertyComponent) {
  @Prop() dataItems!: any;

  @Inject()
  getController!: () => forms.FormGroup;

  get controller() {
    return this.getController();
  }

  arrs: string[] = [
    'Create',
    'Update',
    'Delete',
    'Load',
    'Cancel',
    'Available',
    'GetList',
  ];

  triggerObjLists: Array<any> = [];

  theVale: any = null;

  get schemaCode() {
    return this.$route.params.bizSchemaCode;
  }

  created() {
    this.onValueChange(this.value);
    const params = {
      schemaCode: this.schemaCode,
    };
    AppsApi.getBizmodeltitle(params).then((res: any) => {
      console.log(res);
      if (res.errcode === 0) {
        const mainPublished = this.dataItems.some((item) => item.published);
        const main = {
          code: this.schemaCode,
          name: res.data,
          published: mainPublished,
        };
        const code: any = this.$route.query.code;
        // 【ID1005266】自定义的业务规则，绑定在流程系统活动或者流程事件上的时候，子表相关规则不生效
        //  触发对象这里过滤掉全部子表数据
        if (this.arrs.indexOf(code) === -1) {
          this.triggerObjLists = [main];
          return false;
        }
        const subSchemaLists = this.dataItems
          ? this.dataItems
              .filter((items) => items.propertyType === 8)
              .map((item) => {
                return {
                  code: `${this.schemaCode}.${item.code}`,
                  name: item.name,
                  published: item.published,
                };
              })
          : [];
        this.triggerObjLists = [main, ...subSchemaLists];
      }
    });
  }

  selectChange(val) {
    this.emitChange(val);
    this.cleanVal();
    this.theVale = val;
  }

  cleanVal() {
    if (this.controller.children.dataCondition) {
      this.controller.children.dataCondition.value = {};
    }

    if (this.controller.children.childTriggerConditionType) {
      this.controller.children.childTriggerConditionType.value = '';
    }

    if (this.controller.children.createDataAction) {
      this.controller.children.createDataAction.value = {};
    }

    if (this.controller.children.dataActions) {
      this.controller.children.dataActions.value = [];
    }
    if (this.controller.children.filterCondition) {
      this.controller.children.filterCondition.value = {};
    }

    if (this.controller.children.targetObjectCode) {
      this.controller.children.targetObjectCode.value = '';
    }

    if (this.controller.children.judgeCondition) {
      this.controller.children.judgeCondition.value = {};
    }

    if (this.controller.children.verifyConditions) {
      this.controller.children.verifyConditions.value = {};
    }
  }

  @Watch('value')
  onValueChange(val) {
    this.theVale = val || undefined;
    // if (val) {
    //   if (val.indexOf('.') > -1) {
    //     this.controller.children.childTriggerConditionType.display = true;
    //   } else {
    //      this.controller.children.childTriggerConditionType.display = false;
    //   }
    // }
  }
}
</script>

<style lang="less" scoped></style>
