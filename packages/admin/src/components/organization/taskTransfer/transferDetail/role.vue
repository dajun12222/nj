<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="workflow-detail-data">
    <div class="role-title">角色详情</div>
    <div class="role-data-list">
      <div v-if="systemManagerList.length" class="role-data-item">
        <div class="item-detail">
          <span>管理员</span><span>【{{ getAdimn(systemManagerList) }}】</span>
        </div>
      </div>
      <div v-if="deptManagerList.length" class="role-data-item">
        <div class="item-title">部门主管</div>
        <div class="item-detail">
          {{ getManager(deptManagerList) }}
        </div>
      </div>
      <div v-if="roleList.length" class="role-data-item">
        <div class="item-title">角色</div>
        <template v-for="(item, index) in roleList">
          <div :key="index" class="item-detail">
            {{ item }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Pagination, Table } from '@h3/antd-vue';
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'RoleData',
  components: {
    ATable: Table,
    APagination: Pagination,
  },
})
export default class RoleData extends Vue {
  @Prop({ default: '' })
  recordId!: string;

  systemManagerList: any = [];

  deptManagerList: any = [];

  roleList: any = [];

  mounted() {
    this.query();
    // this.initData();
  }

  async query() {
    const params: any = {
      recordId: this.recordId || '',
      pageNumber: '',
      pageSize: '',
    };

    const res: any = await axios.get(
      '/api/organization/user/transfer/record/detail',
      { params },
    );

    if (!res.errcode && res.data) {
      console.log(res.data);
      this.initData(res.data);
    } else {
      this.$message.error(res.errmsg || res.message);
    }
  }

  initData(resData: any) {
    // const resData = JSON.parse(this.testdata)
    this.systemManagerList =
      resData.roleRecord && resData.roleRecord.systemManagerList;
    this.deptManagerList =
      resData.roleRecord && resData.roleRecord.deptManagerList;
    this.roleList = resData.roleRecord && resData.roleRecord.roleList;
    console.log(this.systemManagerList, this.deptManagerList, this.roleList);
  }

  getAdimn(list) {
    const adminList: any[] = [];
    list.forEach((item: any) => {
      adminList.push(item);
    });
    return adminList.join('、');
  }

  getManager(list) {
    const managerList: any[] = [];
    list.forEach((item: any) => {
      managerList.push(item);
    });
    return managerList.join('、');
  }
}
</script>
<style lang="less" scoped>
.workflow-detail-data {
  display: flex;
  flex-flow: column;
  height: 100%;
  .role-title {
    height: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #111218;
    line-height: 20px;
  }
  .role-data-list {
    height: 100%;
    margin-top: 12px;
    margin-right: -24px;
    padding-right: 18px;
    overflow-y: scroll;
    .role-data-item {
      background: #fafafa;
      padding: 13px 16px;
      & + .role-data-item {
        margin-top: 12px;
      }
      .item-title {
        height: 22px;
        font-size: 14px;
        font-weight: 600;
        color: #111218;
        line-height: 22px;
      }
      .item-detail {
        height: 22px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(17, 18, 24, 0.5);
        line-height: 22px;
        &:not(:first-child) {
          margin-top: 8px;
        }
      }
    }
  }
}
</style>
