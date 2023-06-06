<template>
  <div>
    <template v-if="!readonly">
      <relevance-form-modal
        v-if="isModal"
        :control="control"
        :parseDisplayFieldValue="parseDisplayFieldValue"
      />

      <relevance-form-dropdown
        v-else
        :control="control"
        :parseDisplayFieldValue="parseDisplayFieldValue"
      />
    </template>

    <template v-else-if="ctrl.value">
      <a v-if="showLink" class="link" @click.stop.prevent="onClick">
        {{ lookUpModalValue }}
      </a>
      <div v-else>
        {{ lookUpModalValue }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { listApi } from '../../../../../../api';
import { RelevanceFormControl } from '../../../controls';
import RelevanceFormDropdown from './relevance-form-dropdown.vue';
import RelevanceFormModal from './relevance-form-modal.vue';

@Component({
  name: 'relevance-form',
  components: {
    RelevanceFormDropdown,
    RelevanceFormModal,
  },
})
export default class RelevanceForm extends RelevanceFormControl {
  onClick() {
    this.open();
  }

  async created() {
    const d: any = await this.getDataModal();
    let field = '';
    if (d) {
      field = d.relativePropertyCode || this.getDisplayField || 'name';
    } else {
      field = this.getDisplayField || 'name';
    }
    if (field === 'name') {
      return;
    }
    if (!d) {
      return;
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
}
</script>

<style scoped>
a.link {
  word-break: break-all;
}
</style>
