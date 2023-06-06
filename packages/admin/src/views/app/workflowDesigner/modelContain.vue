<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="acitivity-model-contain">
    <template v-for="(item, index) in acitivityModel">
      <model-item :key="index" v-h3-drag :item="item" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import '@/directives/drag';
import ModelItem from './modelItem.vue';

@Component({
  name: 'modelContain',
  components: {
    ModelItem,
  },
})
export default class ModelContain extends Vue {
  acitivityModel: any = [];

  setActivityModel() {
    this.acitivityModel = [
      {
        activityName: '用户活动',
        name_i18n: {
          en: 'UserAction',
        },
        width: 158,
        height: 40,
        icon: '&#xe935;',
        activityType: 'PARTICIPANT',
      },
      {
        activityName: '系统活动',
        name_i18n: {
          en: 'BizAction',
        },
        width: 158,
        height: 40,
        icon: '&#xe947;',
        activityType: 'SYSTEM_ACTIVITY',
      },
      {
        activityName: '子流程',
        name_i18n: {
          en: 'SubInstance',
        },
        width: 158,
        height: 40,
        icon: '&#xe9d5;',
        activityType: 'SUB_INSTANCE',
      },
      {
        activityName: '连接点',
        name_i18n: {
          en: 'Connection',
        },
        width: 158,
        height: 40,
        icon: '&#xe914;',
        activityType: 'CONNECTION',
      },
      {
        activityName: '传阅',
        name_i18n: {
          en: 'Notify',
        },
        width: 158,
        height: 40,
        icon: '&#xe910;',
        activityType: 'CIRCULATE',
      },
    ];
  }

  mounted() {
    this.setActivityModel();
  }
}
</script>
