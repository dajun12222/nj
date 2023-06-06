<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="data-actions div-height">
    <div class="input-modal" @click="modalShow">
      <div v-if="inputValue === '已设置'" class="txt-delete">
        <div class="txt">{{ inputValue }}</div>
        <em
          class="icon aufontAll h-icon-all-delete-o1"
          @click.stop="deleteAll"
        ></em>
      </div>
      <!-- <a-icon type="ellipsis" /> -->
      <em class="icon aufontAll h-icon-all-setting-o"></em>
    </div>
    <property-modal-data-action
      v-if="visible"
      :targetOjectCode="targetObjectCode"
      :triggerObjectCode="triggerObjectCode"
      :value="theValue"
      :dataItems="dataItems"
      :actionType="actionType"
      :schemaCode="targetObjectCode"
      @ok="ok"
      @close="close"
    />
  </div>
</template>

<script lang="ts">
import { PropertyComponent } from 'cloudpivot-designer/designer-core/property-panel';
import * as forms from 'cloudpivot-forms';
import { Component, Inject, Mixins, Prop, Watch } from 'vue-property-decorator';
import propertyModalDataAction from '../modal/property-modal-data-action.vue';
import { Icon } from '@h3/antd-vue';
@Component({
  name: 'data-actions',
  components: {
    propertyModalDataAction,
    AIcon: Icon,
  },
})
export default class DataActions extends Mixins(PropertyComponent) {
  @Inject()
  getController!: () => forms.FormGroup;

  inputValue = '未设置';

  get controller() {
    return this.getController();
  }

  @Prop() dataItems!: any;

  @Prop({ default: 'createActions' }) actionType!: string;

  visible = false;

  modalShow() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  get theValue() {
    const val = this.value.value ? this.value.value : this.value;
    if (this.actionType === 'createActions') {
      return val;
    } else {
      return {
        dataActions: val,
      };
    }
  }

  ok(val: any) {
    if (this.actionType === 'createActions') {
      // Object.assign(this.controller.children.createDataAction.value.value, val)
      this.controller.children.createDataAction.value = val;
      this.emitChange(val);
    } else {
      this.controller.children.dataActions.value = val['dataActions'];
      this.emitChange(val['dataActions']);
      // Object.assign(this.controller.children.updateDataActions.value.value, val)
    }
    this.close();
  }

  get targetObjectCode() {
    return this.controller.children.targetObjectCode.value;
  }

  // 触发对象
  get triggerObjectCode() {
    return this.controller.children.triggerObjectCode.value;
  }

  @Watch('value', { immediate: true })
  onValueChange(v: any) {
    this.emitChange(v);
    if (this.actionType === 'createActions') {
      if (v.value) {
        this.inputValue = '未设置';
      } else if (v.filterCondition) {
        if (
          v.filterCondition.mainTableConditions.length === 0 &&
          v[this.actionType].length === 0
        ) {
          this.inputValue = '未设置';
        } else {
          this.inputValue = '已设置';
        }
      } else {
        this.inputValue = '未设置';
      }
    } else if (this.actionType === 'dataActions') {
      if (v && v.length > 0) {
        this.inputValue = '已设置';
      } else {
        this.inputValue = '未设置';
      }
    } else {
      //Else Empty block statement
    }
  }
}
</script>

<style lang="less" scoped></style>
