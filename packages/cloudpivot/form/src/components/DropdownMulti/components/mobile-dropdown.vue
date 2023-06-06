<template>
  <h3-checkbox-list
    v-if="multiple"
    v-control-back
    showMode="0"
    showHeaderSearch
    :show="showModal"
    :value="val"
    :options="options"
    :class="{ dropDownVertical: layoutType }"
    :required="ctrl.required"
    :editable="!(readonlyFormula || readonly)"
    :title="label"
    :labelStyle="styleObj"
    :cancelText="$t('cloudpivot.form.renderer.cancel')"
    :okText="$t('cloudpivot.form.renderer.ok')"
    :clearText="$t('cloudpivot.form.renderer.clear')"
    :placeHolder="placeholder"
    :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
    :checkAllText="$t('cloudpivot.form.renderer.checkAll')"
    @onShow="show"
    @onHide="close"
    @onChange="onChange"
    @input="onChange"
    @onFocus="getOPt"
    @onClear="onChange"
  />

  <h3-radio-list
    v-else
    v-control-back
    showHeaderSearch
    showMode="0"
    :show="showModal"
    :value="val"
    :options="options"
    :required="ctrl.required"
    :class="{ dropDownVertical: layoutType }"
    :editable="!(readonlyFormula || readonly)"
    :title="label"
    :labelStyle="styleObj"
    :cancelText="$t('cloudpivot.form.renderer.cancel')"
    :confirmText="$t('cloudpivot.form.renderer.ok')"
    :clearText="$t('cloudpivot.form.renderer.clear')"
    :placeholder="placeholder"
    :notFoundText="$t('cloudpivot.form.renderer.noOptions')"
    @onShow="show"
    @onHide="close"
    @onChange="onChange"
    @onFocus="getOPt"
    @onClear="onChange"
  />
</template>

<script lang="ts">
import ControlBack from '../../../../../form/src/common/directives/control-back';
import { H3CheckboxList, H3RadioList } from 'h3-mobile-vue';
import { Component, Inject } from 'vue-property-decorator';
import { DropdownControl } from '../control/dropdown-control';

@Component({
  name: 'dropdown',
  components: {
    H3RadioList,
    H3CheckboxList,
  },
  directives: {
    ControlBack,
  },
  mixins: [],
})
export default class Dropdown extends DropdownControl {
  showModal: boolean = false;

  show() {
    this.showModal = true;
    this.getOPt();
  }

  close() {
    this.showModal = false;
  }

  @Inject()
  layoutTypeFn!: Function;

  @Inject({
    default: () => () => {},
  })
  getScrollEl!: () => HTMLDivElement;

  @Inject({
    default: () => () => {},
  })
  getRelativeDataList!: (isList?: boolean) => [];

  //上下布局模式
  get layoutType() {
    if (this.layoutTypeFn) {
      return this.layoutTypeFn();
    }
  }

  onChange(val: any) {
    if (val) {
      this.ctrl.value = this.multiple ? val.slice() : val.value;
    } else {
      this.ctrl.value = null;
    }
    this.val = this.ctrl.value;
  }

  handleValueChange(value: any[]): void {
    if (Array.isArray(value)) {
      value = value.filter((x) => !!x);
    }
    super.handleValueChange(value);
  }

  getOPt() {
    super.getOptions();
  }

  clearOption(change: any) {
    this.options = [];
    this.ctrl.value = null;
  }
}
</script>

<style lang="less">
.dropDownVertical .h3-field-icon-wrapper {
  width: 22px;
  height: 22px;
  position: absolute;
  bottom: 11px;
  right: 15px;
  text-align: center;
  line-height: 22px;
}

.h3-field-layout-v-label .h3-field-label-title {
  color: inherit;
}
</style>
