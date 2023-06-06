<template>
  <div class="custom">
    <div class="group publicGroup">
      <scree-title :title="'公共组'" />
      <div class="groupCon">
        <public-group
          ref="publicGroupFn"
          :publicGroup="publicGroup"
          @setSelect="setSelectPublic"
        />
      </div>
    </div>
    <div class="xian"></div>
    <div class="group customGroups">
      <scree-title :title="'自定义组'" />
      <div class="groupCon">
        <custom-group
          ref="customGroupFn"
          :userGroup="userGroup"
          @setSelect="setSelecCustom"
          @add="add"
          @edit="edit"
          @del="del"
          @manage="manage"
        />
      </div>
    </div>
    <addGroup
      ref="addGroupFn"
      v-model="isShowAdd"
      :groupType="groupType"
      @ok="ok"
    />
    <manageGroup
      v-model="isShowManage"
      :orgName="orgName"
      :orgData="orgData"
    />
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
} from '@h3/antd-vue';

import publicGroup from './publicGroup.vue';
import customGroup from './customGroup.vue';
import addGroup from './addGroup.vue';
import manageGroup from './manageGroup.vue';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import screeTitle from './screeTitle.vue';
import { organizationApi } from 'cloudpivot/api';
import qs from 'qs';
@Component({
  name: 'custom',
  components: {
    screeTitle,
    publicGroup,
    customGroup,
    addGroup,
    manageGroup,
  },
})
export default class custom extends Vue {
  @Prop({ default: '' }) orgName?: string;

  isShowManage: boolean = false;

  orgData: any = {};

  manage() {
    let obj: any = this.getGroup();
    if (obj && obj.isActive < 0) {
      this.$message.error('请选择数据');
      return;
    }
    this.orgData = obj;
    this.isShowManage = true;
  }

  publicGroup: any = [];

  userGroup: any = [];

  isShowAdd: boolean = false;

  setSelectPublic() {
    let customGroupFn: any = this.$refs.customGroupFn;
    customGroupFn.clean();
  }

  setSelecCustom() {
    let publicGroupFn: any = this.$refs.publicGroupFn;
    publicGroupFn.clean();
  }

  getGroup() {
    let publicGroupFn: any = this.$refs.publicGroupFn;
    let customGroupFn: any = this.$refs.customGroupFn;
    let obj = {};
    if (publicGroupFn.getData().isActive > -1) {
      obj = publicGroupFn.getData();
    } else {
      obj = customGroupFn.getData();
    }
    return obj;
  }

  created() {
    this.getList();
  }

  async getList() {
    let res: any = await organizationApi.getUserGroups();
    this.publicGroup = res.data.publicGroup || [];
    this.userGroup = res.data.userGroup || [];
  }

  groupType: number = 1;

  add() {
    this.groupType = 1;
    this.isShowAdd = true;
  }

  oldGroupName = '';

  edit() {
    this.groupType = 2;
    let obj: any = this.getGroup();
    if (obj && obj.isActive < 0) {
      this.$message.error('请选择数据');
      return;
    }
    this.oldGroupName = obj.obj['groupName'];
    let addGroupFn: any = this.$refs.addGroupFn;
    addGroupFn.edit(obj);
    this.isShowAdd = true;
  }

  async del() {
    let obj: any = this.getGroup();
    if (obj && obj.isActive < 0) {
      this.$message.error('请选择数据');
      return;
    }
    let res: any = await organizationApi.deleteGroup({
      groupName: obj.obj['groupName'],
      publicGroup: obj.obj['publicGroup'],
    });
    if (res.errcode === 0) {
      this.getList();
    }
  }

  async ok(option) {
    //addNewGroup
    let res: any = {};
    if (option.groupType === 1) {
      res = await organizationApi.addNewGroup(qs.stringify(option));
    } else {
      res = await organizationApi.updateGroup(
        qs.stringify({
          oldGroupName: this.oldGroupName,
          newGroupName: option.groupName,
          publicGroup: option.publicGroup,
        }),
      );
    }

    if (res.errcode === 0) {
      this.getList();
    }
  }
}
</script>
<style lang="less" scoped>
.custom {
  height: calc(100% - 45px);

  display: flex;
  flex-direction: column;
  overflow: hidden;

  .group {
    height: calc((100% - 5px) / 2);
  }
  .xian {
    height: 5px;
  }
  .publicGroup {
  }
  .groupCon {
    overflow: auto;
    height: calc(100% - 27px);
  }
}
</style>
