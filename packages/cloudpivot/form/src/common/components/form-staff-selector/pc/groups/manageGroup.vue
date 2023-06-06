<template>
  <div class="addGroup">
    <a-modal
      v-model="isShow"
      class="groupsIndexs"
      width="96%"
      :bodyStyle="{ padding: 0 }"
      :title="'管理组成员'"
      centered
      :maskClosable="false"
      :keyboard="true"
      @cancel="onClickCancle"
      @ok="ok"
    >
      <div class="elRow">
        <div class="elCol">
          <el-groupTitle :title="'选择组成员'" />
          <div class="elColCon">
            <el-organization
              ref="elOrganizationFn"
              :orgName="orgName"
              class="elOrganization"
              @setSelectData="setSelectData"
            />
          </div>
        </div>
        <div class="elCol">
          <el-groupTitle :title="'操作'" />
          <div class="elColCon">
            <el-triangle
              class="elTriangle"
              @right="right"
              @left="left"
              @leftAll="leftAll"
            />
          </div>
        </div>
        <div class="elCol">
          <el-groupTitle :title="'已选择组成员'" />
          <div class="elColCon">
            <el-selectData
              ref="elSelectDataFn"
              class="elSelectData"
            />
          </div>
        </div>
      </div>
    </a-modal>
  </div>
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
  Input,
  Form,
} from '@h3/antd-vue';

import cloneDeep from 'lodash/cloneDeep';
import organization from './organization.vue';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import groupTitle from './groupTitle.vue';
import triangle from './triangle.vue';
import selectData from './selectData.vue';
import { organizationApi } from 'cloudpivot/api';
@Component({
  name: 'addGroup',
  components: {
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    elOrganization: organization,
    elGroupTitle: groupTitle,
    elTriangle: triangle,
    elSelectData: selectData,
  },
})
export default class addGroup extends Vue {
  @Prop({ default: '' }) orgName?: string;

  @Prop({ default: {} }) orgData?: any;

  @Prop({ default: false }) value?: boolean;

  @Watch('value')
  onChangeValue(newVal: any) {
    if (newVal) {
      this.isShow = newVal;
      this.getList(this.orgData);
    }
  }

  isShow: boolean = false;

  @Watch('isShow')
  onChangeIsShow(newVal: any) {
    this.$emit('input', newVal);
  }

  groupName: string = '';

  publicGroup: number = 0;

  form: any = {};

  async getList(option: any) {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    let res: any = await organizationApi.getGroupUsers(option.obj);
    if (res.errcode === 0 && res.data && res.data.length > 0) {
      let data: any = JSON.parse(res.data);
      elSelectDataFn.portAddData(data);
    }else{
      elSelectDataFn.portAddData([]);
    }
  }

  onClickCancle() {}

  setSelectData(data: any) {
    //   let elSelectDataFn:any = this.$refs.elSelectDataFn;
    //   elSelectDataFn.addData(data);
  }

  async ok() {
    // this.isShow = false;
    //
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    let options: any = elSelectDataFn.operation('get') || [];
    let result: any = [];
    options.map((item: any) => {
      let obj = {
        id: item['id'],
        name: item['name'],
        parentDepartmentName: item['parentDepartmentName'],
      };
      result.push(obj);
    });
    let maps = {
      groupName: this.orgData.obj.groupName,
      publicGroup: this.orgData.obj.publicGroup,
      users: JSON.stringify(result),
    };
    let res: any = await organizationApi.addGroupUser(maps);
    if (res.errcode === 0) {
      this.isShow = false;
    }
  }

  right() {
    let elOrganizationFn: any = this.$refs.elOrganizationFn;
    let selelctKeyData: any = elOrganizationFn.obtainSelelctKey();
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    elSelectDataFn.addData(selelctKeyData);
  }

  left() {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    elSelectDataFn.operation('del');
  }

  leftAll() {
    let elSelectDataFn: any = this.$refs.elSelectDataFn;
    elSelectDataFn.operation('clean');
  }
}
</script>
<style lang="less" scoped>
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
  display: grid;
  grid-template-columns: 1fr 70px 1fr;
  grid-template-rows: 100%;
  height: 100%;
}
.elCol {
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  background-color: #f5f5f5;
  .elColCon {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    .elTriangle {
      height: 100%;
    }
  }
}
</style>
