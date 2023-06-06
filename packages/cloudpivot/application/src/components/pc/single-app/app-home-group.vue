<template>
  <div class="app-home-group">
    <div v-if="title" class="app-home-group__title">
      {{ getLang(title, title_i18n) }}
    </div>
    <div class="app-home-group__container">
      <template v-for="item in childrens">
        <app-group-item
          v-if="!item.childrens"
          :key="item.code"
          :name="item.name"
          :name_i18n="item.name_i18n"
          :code="item.code"
          :icon="item.icon"
          :type="item.type"
          :openMode="item.openMode"
          :pcUrl="item.pcUrl"
          :parentId="item.parentId"
        />
        <app-home-sub-group
          v-else
          :key="item.code"
          :title="item.title"
          :title_i18n="item.title_i18n"
          :childrens="item.childrens"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AppGroupItem from './app-group-item.vue';
import AppHomeSubGroup from './app-home-sub-group.vue';
@Component({
  name: 'app-home-group',
  components: {
    AppGroupItem,
    AppHomeSubGroup,
  },
})
export default class AppHomeGroup extends Vue {
  @Prop() title!: string;

  @Prop() title_i18n!: string;

  @Prop() childrens!: Array<any>;

  getLang(name: string, nameI18n: string) {
    const lang = localStorage.getItem('locale') || 'zh';

    if (!nameI18n) {
      return name;
    }
    let backName: string = '';
    let langI18n: any = {};
    try {
      langI18n = JSON.parse(nameI18n);
    } catch (error) {
      langI18n = {};
    }
    if (langI18n && langI18n[lang]) {
      backName = langI18n[lang];
    } else {
      backName = name;
    }
    return backName;
  }
}
</script>
<style lang="less" scoped>
@import './../../../../../common/common';
.app-home-group {
  // margin-top: 4px;
  &__title {
    position: relative;
    margin-bottom: 16px;
    line-height: @line-height-7;
    color: rgba(0, 0, 0, 0.65);
    font-size: 16px;
    font-weight: 600;
    & + .app-home-group__container {
      flex-flow: column;
      margin-top: 4px;
    }
  }
  &__container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  & + .app-home-group {
    margin-top: 12px;
  }
}
</style>
