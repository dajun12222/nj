<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-tree
    :expandedKeys="expandedKeys"
    :loadData="loadChildrenNodes"
    :loadedKeys="loadedKeys"
    :treeData="treeDatas"
    class="formula-tree"
    showIcon
    style="display: inline-block"
    @expand="getExpandedNodes"
    @select="selectItem"
  >
    <span slot="title" slot-scope="node" class="role-title">
      <span
        v-if="node.userId"
        class="icon aufontAll h-icon-all-user-o"
        style="margin-right: 5px; font-size: 14px"
      ></span>
      <span :title="node.name" class="title">{{ node.name }}</span>
    </span>
  </a-tree>
</template>
<script lang="ts">
import { Tree } from '@h3/antd-vue';
import {
  StaffSelectorControl,
  UserStatus,
} from 'cloudpivot/form/src/common/components/form-staff-selector/controls/staff-selector-control';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  name: 'OrganizationTree',
  components: {
    ATree: Tree,
  },
})
export default class OrganizationTree extends Vue {
  expandedKeys: any = [];

  treeData: any = [
    {
      id: 'defalutOrganizationTree123',
      name: '组织机构',
      children: [],
    },
  ];

  get treeDatas() {
    return this.dataRecursion(this.treeData);
  }

  dataRecursion(list: []) {
    const arr: any = [];
    list.map((i: any) => {
      i.scopedSlots = { title: 'title' };
      i.isLeaf = i.userId;
      if (i.children && i.children.length) {
        i.children = this.dataRecursion(i.children);
      }
      arr.push(i);
    });
    return arr;
  }

  // 已加载的节点key值
  get loadedKeys(): string[] {
    return this.expandedKeys;
  }

  selectItem(keys: string[], e: any) {
    if (e.node.dataRef.id !== 'defalutOrganizationTree123') {
      this.$emit('select', e.node.dataRef);
    }
  }

  /**
   * 加载子节点
   */
  async loadChildrenNodes(e) {
    // 已展开的节点不再请求
    const { expanded, dataRef, pos } = e;

    if (expanded) {
      return;
    }

    if (dataRef.children && dataRef.children.length) {
      return;
    }
    const dept: any = await this.getDeptData(
      dataRef.id !== 'defalutOrganizationTree123' ? dataRef.id : '',
    );
    let user: any = [];
    if (dataRef.id !== 'defalutOrganizationTree123') {
      user = await this.getUserData(dataRef.id);
    }
    dataRef.children = [...dept, ...user];
  }

  async getDeptData(deptId) {
    const params: any = {
      filterType: 'admin',
      deptIds: deptId,
    };
    const res = await StaffSelectorControl.service.getDepartmentsBy(
      params.deptIds || '',
      params.filterType || '',
      params.sourceType || '',
      params.corpId || '',
      params.excludeCorpId || '',
      params.selectUserIds || '',
      params.workflowInstanceId || '',
      params.activityCode || '',
      params.formRootDeptIds || '',
    );
    return res.departments;
  }

  async getUserData(deptId) {
    const params: any = {
      filterType: 'admin',
      deptId: deptId,
    };
    const users: any = await StaffSelectorControl.service.getUsersBy(
      params.deptId || '',
      params.roleId || '',
      params.filterType || '',
      params.sourceType || '',
      params.workflowInstanceId || '',
      params.activityCode || '',
      params.formRootDeptIds || '',
    );
    const enableUsers = users.filter(
      (u: any) => u.status === UserStatus.Enable,
    );

    return enableUsers;
  }

  // 获取角色组下的角色
  getExpandedNodes(expandedKeys: any, e: any) {
    this.expandedKeys = expandedKeys;
  }
}
</script>
<style lang="less" scoped>
.formula-tree {
  min-width: 284px;
  text-align: left;
  margin-left: 12px;
  /*padding-bottom: 10px;*/

  /deep/ li {
    padding: 7px 0;

    span,
    span:hover,
    span:before {
      color: rgba(17, 18, 24, 0.5);
      background-color: transparent !important;
      user-select: none;
    }

    span.ant-tree-switcher {
      color: rgba(17, 18, 24, 0.5) !important;
    }

    span.ant-tree-iconEle {
      display: none;
    }

    span.ant-tree-title {
      padding-right: 8px;
    }

    ul.ant-tree-child-tree {
      span:hover,
      span.ant-tree-node-content-wrapper:hover,
      span.ant-tree-node-selected .ant-tree-title {
        color: @primary-color !important;
      }
    }
  }
}
</style>
