<template>
  <reverse-relevance-list v-if="isTabs" :control="control" />
  <h3-panel
    v-else
    :title="label"
    :collapsible="true"
    :labelStyle="style"
    :iconRight="true"
    :tips="tips"
    :class="{ titleHidden: control.options.labelVisible === false }"
  >
    <reverse-relevance-list v-if="isList" :control="control" />

    <reverse-relevance-link v-else :control="control" />
  </h3-panel>
</template>

<script lang="ts" src="./reverse-relevance.ts"></script>

<style lang="less" scoped>
.h3-panel {
  width: 100%;
  text-align: left;
}

.ant-divider-horizontal {
  margin: 1px 0;
}

/deep/.titleHidden {
  .span-title {
    display: none !important;
  }
}
</style>

<style lang="less">
.titleHidden {
  .span-title {
    display: none !important;
  }
}
</style>
