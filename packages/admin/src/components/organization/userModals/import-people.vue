<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-modal
    v-model="syncVisable"
    title="从已有人员中导入"
    :width="422"
    :cancelText="$t('languages.Apps.Cancel')"
    :okText="$t('languages.Apps.Ok')"
    :maskClosable="false"
    :keyboard="false"
    @ok="submit"
    @cancel="cancel"
  >
    <a-row class="row-flex" type="flex">
      <a-col :span="7"> 选择人员 </a-col>
      <a-col :span="17">
        <staff-selector
          v-model="user"
          :params="{ excludeCorpId: corpId }"
          :options="deptOpts"
        />
      </a-col>
    </a-row>
  </a-modal>
</template>

<script lang="ts">
import { Col, Modal, Row } from '@h3/antd-vue';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator';
@Component({
  name: 'import-people',
  components: {
    StaffSelector,
    AModal: Modal,
    ARow: Row,
    ACol: Col,
  },
})
export default class ImportPeople extends Vue {
  @PropSync('visable') syncVisable!: boolean;

  @Prop() corpId!: string;

  user: any = null;

  showModal: boolean = false;

  deptOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择需要同步的人员',
    appManagerFilter: true,
    isInit: false,
    rootNode: [],
    selected: [],
  };

  submit() {
    this.$emit('update', this.user[0]);
  }

  cancel() {
    this.$emit('changeVisable', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
  }

  @Watch('syncVisable')
  onVisableChange(v: boolean) {
    this.user = [];
  }
}
</script>

<style lang="less" scoped>
.row-flex {
  margin-bottom: 16px;
  align-items: center;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
