<template functional>
  <a-sub-menu :key="props.menu.id">
    <span slot="title">
      <i
        class="icon aufontAll"
        :class="props.menu.icon ? props.menu.icon : 'h-icon-all-folder-open-o'"
      ></i>
      <span
        :class="props.specStyle ? 'specStyles' : ''"
        :title="props.menu.name"
        >{{ props.menu.name }}</span>
    </span>
    <template v-for="childMenu in props.menu.children">
      <sub-menu
        v-if="childMenu.children"
        :key="childMenu.id"
        :menu="childMenu"
        :specStyle="props.specStyle"
        :fn="props.fn"
      />
      <a-menu-item v-else :key="childMenu.id" @click="props.fn(childMenu)">
        <router-link
          v-if="childMenu.type === 'BizModel'"
          :title="childMenu.name"
          :to="''"
        >
          <i class="icon aufontAll" :class="childMenu.icon"></i>
          <span :class="props.specStyle ? 'specStyles' : ''">{{
            childMenu.name
          }}</span>
        </router-link>
        <a v-else :title="childMenu.name">
          <i class="icon aufontAll" :class="childMenu.icon"></i>
          <span :class="props.specStyle ? 'specStyles' : ''">{{
            childMenu.name
          }}</span>
        </a>
      </a-menu-item>
    </template>
  </a-sub-menu>
</template>
<script>
export default {
  name: 'SubMenu',
  components: {},
  props: {
    // eslint-disable-next-line vue/require-prop-types
    menu: {},
    // eslint-disable-next-line no-void
    fn: void 0,
    specStyle: Boolean,
  },
  computed: {
    isChinese() {
      return !(this.$i18n.locale && this.$i18n.locale === 'en');
    },
  },
};
</script>

<style scoped></style>
