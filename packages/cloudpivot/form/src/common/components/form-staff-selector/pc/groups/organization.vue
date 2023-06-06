<template>
  <div>
    <a-tree
      v-model="selectedKeys"
      checkable
      :expandedKeys="expandedKeys"
      :loadedKeys="loadedKeys"
      :loadData="loadData"
      :treeData="data"
      :replaceFields="{
        children: 'children',
        key: 'id',
        title: 'name',
      }"
      @expand="getExpandedNodes"
    >
      <!-- <span  :checkable="true"
      slot="title"
      slot-scope="{name, name_i18n, icon}"
      class="cus-title"
    >
      <i v-if="icon" :class="'icon aufontAll ' + icon"/>
      {{ isChinese ? name : JSON.parse(name_i18n) ? JSON.parse(name_i18n)['en'] : name }}
    </span> -->
    </a-tree>
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
  Tree,
  Col,
  Row,
} from '@h3/antd-vue';
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import getDownloadUrlNew from '../../../../../../../common/src/utils/getDownloadUrlNew';
import { StaticUtils } from '../../../../../../utils/utils';
import { StaffSelectorControl } from '../../controls/staff-selector-control';
import { DefaultUserService } from '../../user-service';
const SERVICE = StaffSelectorControl.service || DefaultUserService;
@Component({
  name: 'organization',
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
    ATree: Tree,
  },
})
export default class organization extends Vue {
  @Prop({ default: '' }) orgName?: string;

  defaultKey: any = [];

  expandedKeys: any = [];

  selectedKeys: any = [];

  @Watch('selectedKeys', { deep: true, immediate: true })
  onChangeSelectedKeys(newVal: any) {
    if (newVal && newVal.length > 0) {
      this.setSelelctKey(newVal);
    }
  }

  obtainSelelctKey() {
    setTimeout(() => {
      this.selectedKeys = [];
    }, 0);
    return this.getSelelctKey(this.selectedKeys, this.data);
  }

  setSelelctKey(att: any) {
    let data = this.getSelelctKey(att, this.data);
    this.$emit('setSelectData', data);
  }

  getSelelctKey(att: any, data: any) {
    let arr = JSON.parse(JSON.stringify(data));
    let result: any = [];
    let res = this.childrenSelelctKey(arr);

    att.map((item: any) => {
      let resultObj = res.find((c: any) => {
        return c['id'] === item;
      });
      result.push(resultObj);
    });
    return result;
  }

  childrenSelelctKey(arr: any, result: any = []) {
    let att: any = [];
    arr.map((item: any) => {
      if (item['children'] && item['children'].length > 0) {
        att = att.concat(this.childrenSelelctKey(item['children'], att));
      }
      item['children'] = [];
      att.unshift(item);
    });
    return att;
  }

  get loadedKeys(): string[] {
    return this.expandedKeys;
  }

  data: any = [];

  onSelect() {}

  async loadData(node: any) {
    // 已展开的节点不再请求
    const { expanded, dataRef, pos } = node;

    if (expanded) return;

    if (dataRef.children && dataRef.children.length) return;

    let role: any = await this.getDepartments(dataRef.id, 'admin');
    let users = await this.getUsersBy(dataRef.id);
    // if(dataRef.id === 'defalutRoleTree123'){
    //   const res = await organizationApi.getRoleLeveOneInfoNew(false, false);
    //   role = res.data;
    // }else{
    //   role = await this.getChildrenRole(dataRef.id);
    // }
    users.map((item: any) => {
      item['checkable'] = true;
      item['isLeaf'] = true;
    });
    role = role.concat(users);
    dataRef.children = [...role];
    this.data = [...this.data];
  }

  getExpandedNodes(expandedKeys: any, e: any) {
    this.expandedKeys = expandedKeys;
  }

  created() {
    this.getList();
  }

  async getList() {
    let data = await this.getDepartments();
    this.data = data;
  }

  async getUsersBy(deptId?: string) {
    let params: any = {
      deptId: deptId || '',
      filterType: 'root_display',
      sourceType: 'portal',
    };
    const users: any = await SERVICE.getUsersBy(
      params.deptId || '',
      params.roleId || '',
      params.filterType || '',
      params.sourceType || '',
      params.workflowInstanceId || '',
      params.activityCode || '',
      params.formRootDeptIds || '',
      '',
      '',
    );
    console.log(users);
    return users;
  }

  async getDepartments(deptIds?: string, filterType?: string) {
    let schemaCode = this.$route.query.schemaCode;
    let params: any = {
      deptIds: deptIds,
      filterType: filterType || 'root_display',
      sourceType: 'portal',
      identificationID: this.orgName || '',
      queryCode: schemaCode || '',
      hasLeaf: false,
    };
    const res: any = await SERVICE.getDepartmentsBy(
      params.deptIds || '',
      params.filterType || '',
      params.sourceType || '',
      params.corpId || '',
      params.excludeCorpId || '',
      params.selectUserIds || '',
      params.workflowInstanceId || '',
      params.activityCode || '',
      params.formRootDeptIds || '',
      params.queryType || '',
      params.identificationID || '',
      params.queryCode || '',
      params.hasAccount || '',
      params.schemaCode || '',
      params.defineTypeFlow || '',
      params.flowAccount || '',
      params.roleCode || '',
      params.hasLeaf || false,
    );

    let data: any = res.departments.concat(res.myDepartment);

    let option: any = [];
    data.map((item: any) => {
      if (item) {
        item['checkable'] = false;
        option.push(item);
      }
    });

    return option;
  }
}
</script>
<style lang="less" scoped></style>
