<template>
  <div class="app-home-sub-group">
    <div
      v-if="title"
      class="app-home-sub-group__title"
      @click="
        () => {
          isExpend = !isExpend;
        }
      "
    >
      <span v-if="isExpend" class="icon aufontAll">&#xe87b;</span>
      <span v-else class="icon aufontAll">&#xe87d;</span>
      <span>{{ getLang(title, title_i18n) }}</span>
    </div>
    <div v-show="isExpend" class="app-home-sub-group__container">
      <template v-for="item in childrens">
        <app-group-item
          v-if="!item.childrens"
          :key="item.code"
          :name="item.name"
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
          :childrens="item.childrens"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import AppGroupItem from './app-group-item.vue';
@Component({
  name: 'app-home-sub-group',
  components: {
    AppGroupItem,
  },
})
export default class AppHomeSubGroup extends Vue {
  @Prop() title!: string;

  @Prop() title_i18n!: string;

  @Prop() childrens!: Array<any>;

  isExpend: boolean = true;

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
.app-home-sub-group {
  &__title {
    position: relative;
    margin-top: 4px;
    margin-bottom: 12px;
    padding-left: 16px;
    line-height: @line-height-7;
    color: rgba(0, 0, 0, 0.65);
    font-size: 14px;
    display: inline-block;
    .icon {
      color: #000;
      font-size: 12px;
      margin-right: 8px;
    }
    &:hover {
      cursor: pointer;
    }
    & + .app-home-sub-group__container {
      flex-flow: column;
      padding-left: 16px;
    }
  }
  &__container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  // & + .app-home-sub-group {
  //   margin-top: 4px;
  // }
}
.app-home-group__container {
  > .app-home-sub-group:first-child {
    > .app-home-sub-group__title {
      margin-top: unset;
    }
  }
}
</style>
