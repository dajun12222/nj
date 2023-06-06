<!--
 * @Date: 2020-05-19 13:53:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-06-23 14:24:34
 * @FilePath: \frontend\modules\cloudpivot\form\src\components\RelevanceFormMulti\components\pc-relevance-form\relevance-form.vue
-->

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
      <span v-if="showLink">
        <span v-for="(item, index) in ids.split(';')" :key="item">
          <a class="link" @click.stop.prevent="onClick(item)">
            {{ names.split('$$')[index] }}
          </a>
          <span v-if="index !== names.split('$$').length - 1"> </span>
        </span>
      </span>

      <div v-else>
        {{ names.replace(/\$\$/g, ' ') }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { RelevanceFormControl } from '../../../../../../form/src/common/controls/relevance-form-control';
import { Component } from 'vue-property-decorator';
import RelevanceFormDropdown from './relevance-form-dropdown.vue';
import RelevanceFormModal from './relevance-form-modal.vue';

@Component({
  name: 'relevance-form',
  components: {
    RelevanceFormDropdown,
    RelevanceFormModal,
  },
})
export default class RelevanceFormMulti extends RelevanceFormControl {
  onClick(id: any) {
    this.open(id);
  }

  async created() {
    //展示字段需取数据项列表中的relativePropertyCode;
    // let ls = await this.getRelativeDataList();
    // let dataModal: any = ls.find((c: any) => c.code === this.control.key);
    let dataModal: any = this.getDataItem(
      this.control.key,
      this.control.parentKey,
    );
    if (!dataModal) {
      // 兼容列表查询条件没有传入DataItem。且查询条件只是存在主表；
      const ls = await this.getRelativeDataList(true);
      dataModal = ls.find((c: any) => c.code === this.control.key);
    }

    //覆盖数据项options中的displayField（表单设计中的displayField，若在数据模型中重新定义一次后，会导致与后台的展示字段对应不上，所以直接拿后台的展示字段即可）
    this.control.options.displayField = dataModal
      ? dataModal.relativePropertyCode ||
        dataModal.options.displayCode ||
        dataModal.options.displayField
      : 'name';
  }

  get ids() {
    const field: any = this.ctrl.value.displayCode || this.getDisplayField;
    const value = this.ctrl.value;
    let res: string = '';
    if (value && value.items && Array.isArray(value.items)) {
      res = value.items
        .map((item: any) => {
          if (item.hasOwnProperty(field)) {
            // 显示字段存在，表单就存在
            return item.id;
          }
        })
        .filter((el) => el !== undefined)
        .join(';');
    }
    return res;
  }

  get names() {
    const field: any = this.ctrl.value.displayCode || this.getDisplayField;

    const value = this.ctrl.value;
    let res: string = '';
    if (value && value.items && Array.isArray(value.items)) {
      res = value.items
        .map((item: any) => {
          if (item.hasOwnProperty(field)) {
            return typeof item[field] === 'boolean'
              ? item[field]
              : item[field] || '空';
          }
        })
        .filter((el) => el !== undefined)
        .join('$$');
    }
    return res;
  }
}
</script>

<style scoped>
a.link {
  word-break: break-all;
}
</style>
