<template>
  <div class="field relevance-form" :class="{ required: ctrl.required }">
    <div class="field__label" :style="style">
      {{ label }}
    </div>
    <div class="field__control" @click="onClick">
      <template v-if="name">
        {{ name }}
      </template>
      <span v-else-if="isEditState" class="placeholder">{{ placeholder }}</span>
    </div>

    <i v-if="isEditState" class="icon aufontAll h-icon-all-right-o"></i>
    <relevance-form-modal
      v-control-back
      v-transfer-dom
      class="relevance-form-panel"
      :value="val"
      :visible="showModal"
      :control="control"
      @change="onChange"
      @back="close"
    />
  </div>
</template>

<script lang="ts">
import { listApi } from '../../../../../../api';
import { H3Field } from 'h3-mobile-vue';
import { Component } from 'vue-property-decorator';
import { RelevanceFormControl } from '../../../controls';
import ControlBack from '../../../directives/control-back';
import TransferDom from '../../../directives/transfer-dom';
import RelevanceFormModal from './relevance-form-modal.vue';

@Component({
  name: 'relevance-form',
  components: {
    RelevanceFormModal,
    H3Field,
  },
  directives: {
    ControlBack,
    TransferDom,
  },
})
export default class MobileRelevanceForm extends RelevanceFormControl {
  showModal: boolean = false;

  show() {
    this.showModal = true;
  }

  close() {
    this.showModal = false;
  }

  get val() {
    return this.ctrl.value || {};
  }

  get name() {
    if (!this.ctrl.value) {
      return '';
    }
    return this.parseDisplayFieldValue(
      this.ctrl.value[this.getDisplayField],
      this.getDisplayField,
    );
  }

  get isEditState() {
    return (
      !this.readonly || (this.showLink && this.ctrl.value && this.ctrl.value.id)
    );
  }

  onClick() {
    if (this.readonly) {
      if (this.showLink) {
        super.open();
      }
    } else {
      this.show();
    }
  }

  async created() {
    const d: any = await this.getDataModal();
    let field = '';
    if (d) {
      field = d.relativePropertyCode || this.getDisplayField || 'name';
    } else {
      field = this.getDisplayField || 'name';
    }
    const res = await listApi.getDataItemList({
      schemaCode: d.relativeCode,
    });
    if (res.errcode === 0) {
      let r = false;
      for (const val of res.data) {
        if (val.code === field) {
          r = true;
          break;
        }
      }
      this.control.options.displayField = r ? d.relativePropertyCode : 'name';
    }
  }

  onChange(val: any) {
    if (val && Object.keys(val).length > 0) {
      this.ctrl.value = val;
    } else {
      this.ctrl.value = null;
    }
    this.close();
  }
}
</script>

<style lang="less">
.relevance-form-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 100;
}
.relevance-form.vertical {
  display: block !important;
  .field__label {
    padding: 10px 0;
  }
  .field__control {
    padding-bottom: 10px;
  }
  .h-icon-all-right-o {
    position: absolute;
    bottom: 14px;
    right: 20px;
  }
}
</style>
