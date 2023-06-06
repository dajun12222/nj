<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <span>{{
      isChinese
        ? '删除后，分组下的应用将被移动至'
        : 'After deletion, the apps under the group will be moved under '
    }}</span>
    <a-select v-model="value1" style="width: 120px">
      <template v-for="(item, key) of list">
        <a-select-option
          v-if="item.code !== code"
          :key="key"
          :value="item.code"
        >
          <span :title="item.name">{{ item.name }}</span>
        </a-select-option>
      </template>
    </a-select>
    <span>{{ isChinese ? '下！' : ' !' }}</span>
  </div>
</template>
<script lang="ts">
import { Select } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'AAA',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
  },
})
export default class AAA extends Vue {
  @Prop() list!: Array<any>;

  @Prop() code!: any;

  @AppCenterModule.State('appList') appList: any;

  value1: string = '';

  get isChinese() {
    const locale = localStorage.getItem('locale');
    return !(locale && locale === 'en');
  }

  created() {
    this.value1 = this.list[0].code;
  }

  @Watch('value1', { immediate: true })
  onValueChange(v: boolean) {
    this.$emit('nativeClickHandler', v);
  }
}
</script>
