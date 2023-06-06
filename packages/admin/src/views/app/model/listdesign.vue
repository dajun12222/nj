<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <template>
      <a-popover trigger="click" :visible="visible" placement="bottomRight">
        <a slot="content">
          <BtnSetting
            v-if="visible"
            :modalData="modalData"
            @confirm="hide"
            @cancel="hide"
          />
        </a>
        <a-button type="primary" @click="() => (visible = !visible)">
          Click me
        </a-button>
      </a-popover>
    </template>
  </div>
</template>
<script lang="ts">
import BtnSetting from '@/components/apps/list-design/modals/popover/list-btn-setting.vue/btn-index.vue';
import SettingPopover from '@/components/apps/list-design/modals/popover/table-setting/table-index.vue';
import { Button, Popover } from '@h3/antd-vue';
import { Component, Vue } from 'vue-property-decorator';
@Component({
  name: 'ListDesign',
  components: {
    SettingPopover,
    BtnSetting,
    APopover: Popover,
    AButton: Button,
  },
})
export default class ListDesign extends Vue {
  modalData = '';

  visible: boolean = false;

  hide(val: any) {
    this.visible = false;
  }

  created() {}
}
</script>
<style lang="less">
.ant-popover-inner-content {
  a:hover {
    color: #111218;
  }
}
</style>
