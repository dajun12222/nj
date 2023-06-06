<template>
  <a-modal
    v-model="isShow"
    class="groupsIndexs"
    width="96%"
    :bodyStyle="{ padding: 0 }"
    :title="'自定义组'"
    centered
    :maskClosable="false"
    :keyboard="true"
    @cancel="onClickCancle"
    @ok="ok"
  >
    <div class="elRow">
      <div class="elCol elColCategory">
        <el-category @changes="changeCategory" />
      </div>
      <div class="elCol elColScreen">
        <el-groupTitle :title="'选择数据'" />
        <el-organization
          v-show="showType === 1"
          ref="elOrganizationFn"
          :orgName="orgName"
          class="elOrganization"
          @setSelectData="setSelectData"
        />
        <el-custom
          v-show="showType === 2"
          ref="elCustomFn"
          :orgName="orgName"
          class="elCustom"
        />
      </div>
      <div class="elCol elColTriangle">
        <el-groupTitle :title="'操作'" />
        <el-triangle
          class="elTriangle"
          @right="right"
          @left="left"
          @leftAll="leftAll"
        />
      </div>
      <div class="elCol elColSelectData">
        <el-groupTitle
          class="elGroupTitle"
          :title="'已选择的数据'"
        />
        <el-selectData
          ref="elSelectDataFn"
          class="elSelectData"
        />
      </div>
    </div>
  </a-modal>
</template>
<script lang="ts">
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  Modal,
  Radio,
  Select,
  Col,
  Row,
} from '@h3/antd-vue';
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import category from './category.vue';
import organization from './organization.vue';
import custom from './custom.vue';
import selectData from './selectData.vue';
import groupTitle from './groupTitle.vue';
import triangle from './triangle.vue';
import { organizationApi } from 'cloudpivot/api';
@Component({
  name: 'groupIndex',
  components: {
    AAvatar: Avatar,
    AIcon: Icon,
    AButton: Button,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    ARadio: Radio,
    ARow: Row,
    ACol: Col,
    elCategory: category,
    elOrganization: organization,
    elCustom: custom,
    elSelectData: selectData,
    elGroupTitle: groupTitle,
    elTriangle: triangle,
  },
})
export default class groupIndex extends Vue {
  @Prop({ default: [] }) selectedList?: any;

  @Prop({ default: '' }) orgName?: string;

  @Prop({ default: false }) value?: boolean;

  @Watch('value')
  onChangeValue(newVal: any) {
    if (newVal) {
      this.isShow = newVal;
      setTimeout(() => {
        this.addSelectData(this.selectedList);
      }, 0);
    }
  }

  // get isShow(){
  //     return this.value;
  // }
  isShow: boolean = false;

  showType: number = 1;

  @Watch('isShow')
  onChangeIsShow(newVal: any) {
    this.$emit('input', newVal);
  }

  onClickCancle() {}

  changeCategory(id: number) {
    this.showType = id;
  }

  setSelectData(data: any) {
    // let elSelectDataFn:any = this.$refs.elSelectDataFn;
    // elSelectDataFn.addData(data);
  }

  async right() {
    //getGroupUsers
    switch (this.showType) {
      case 1:
        let elOrganizationFn: any = this.$refs.elOrganizationFn;
        let selelctKeyData: any = elOrganizationFn.obtainSelelctKey();
        let elSelectDataFn: any = this.$refs.elSelectDataFn;
        elSelectDataFn.addData(selelctKeyData);
        break;
      case 2:
        let elCustomFn: any = this.$refs.elCustomFn;
        let data = elCustomFn.getGroup();
        if (data && data.isActive < 0) {
          this.$message.error('请选择数据');
          return;
        }
        let res: any = await organizationApi.getGroupUsers(data.obj);
        if (res.errcode === 0) {
          //this.getList();
          let resultData: any = JSON.parse(res.data);
          this.addSelectData(resultData);
        }
        break;
    }
  }

  addSelectData(data: any) {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    elSelectDataFn.addData(data);
  }

  left() {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    elSelectDataFn.operation('del');
  }

  leftAll() {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    elSelectDataFn.operation('clean');
  }

  ok() {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    let elSelectData: any = elSelectDataFn.operation('get') || [];
    elSelectData.map((item: any) => {
      item['type'] = 3;
      item['source']['type'] = 3;
    });
    this.$emit('ok', elSelectData);
    this.isShow = false;
  }
}
</script>
<style lang="less" scoped>
.groupsIndexs {
  /deep/ .ant-modal-content {
    display: flex;
    flex-direction: column;
  }
  /deep/ .ant-modal-body {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    height: calc(100% - 92px);
  }
  /deep/ .ant-modal-header {
    padding: 10px 12px !important;
  }
  /deep/ .ant-modal-footer {
    padding: 10px 12px !important;
  }
  /deep/ .ant-modal {
    height: 96%;
  }
  /deep/ .ant-modal-content {
    height: 100%;
  }
  .elRow {
    height: 100%;
    display: grid;
    grid-template-columns: 100px 1fr 70px 1fr;
    grid-template-rows: 100%;
  }
  .elCol {
    height: 100%;
    background-color: #f5f5f5;
  }
  .elColScreen {
    margin: 0 10px;
  }
  .elColTriangle {
    margin-right: 10px;
  }
  .elColSelectData,
  .elColScreen,
  .elColTriangle {
    display: flex;
    flex-direction: column;
    .elSelectData,
    .elOrganization,
    .elCustom,
    .elTriangle {
      flex: 1;
    }
    .elOrganization {
      height: calc(100% - 45px);
      overflow-y: auto;
    }
  }
}
</style>
