<!--
 * @Author: your name
 * @Date: 2020-04-22 14:02:14
 * @LastEditTime: 2021-12-30 20:02:17
 * @LastEditors: baidongsheng
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\common\components\form-staff-selector\pc\staff-selector.vue
 -->

<template>
  <SmartOrg
    ref="SmartOrgFn"
    :org="org"
    :isExport="options.isExport"
    :isDisplayRoot="options.isDisplayRoot"
    :selectOrg="options.selectOrg"
    :selectUser="options.selectUser"
    :showModel="options.showModel"
    :showSelect="options.showSelect"
    :showError="options.showError"
    :isMulpitle="options.mulpitle"
    :isShowGroupsStatus="(controlOpts && controlOpts.isShowGroups) || false"
    :title="options.title"
    :keepDeptIds="keepDeptIds"
    :selectedData="selected"
    :searchData="searchList"
    :departmentsTotal="departmentsTotal"
    :usersTotal="usersTotal"
    :orgName="options.key"
    :hasAccount="hasAccount"
    :schemaCode="schemaCode"
    :defineTypeFlow="defineTypeFlow"
    :flowAccount="flowAccount"
    :roleCode="roleCode"
    :selectPlaceholder="options.placeholder || placeholder"
    :placeholder="SearchPlaceholder"
    :showPart="options.showPart"
    :maxTagCount="options.maxTagCount"
    :allowRecursion="false"
    :locale="locale"
    :disabled="disabled"
    :showLoading="showLoading"
    :isDisableClick="isDisableClick"
    :showNotData="showNotData"
    :displayType="
      (queryDisplayType === 'tag' ? '' : queryDisplayType) || displayType
    "
    :roleLabel="roleLabel"
    :propVisiblePart="visiblePart"
    :showDetail="showDetail"
    @focus="treeFocus"
    @onClickBreadcrumb="onClickBreadcrumb"
    @change="onChange"
    @onSearch="onSearch"
    @onClickTrunBack="onClickTrunBack"
    @onClickNextHierarchy="onClickNextHierarchy"
    @ok="onOk"
    @cancle="onCancle"
  />
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { StaffSelectorBase } from '../staff-selector-base';
import SmartOrg from './smart-org/smartOrg.vue';
import { organizationApi } from 'cloudpivot/api';
import { utils } from 'cloudpivot/common';
@Component({
  name: 'staff-selector',
  components: {
    SmartOrg,
  },
  model: {
    event: 'change',
    prop: 'value',
  },
})
export default class StaffSelector extends StaffSelectorBase {
  @Prop() showDetail!: boolean;

  @Prop() visiblePart?: boolean;

  @Watch('options', { deep: true, immediate: true })
  onChangeOption(newVal: any) {}

  get SearchPlaceholder() {
    let output = '';
    if (this.options.selectOrg) {
      // output = "搜索组织";
      output = 'SearchOrg';
    }
    if (this.options.selectUser) {
      // output = "搜索姓名/账号";
      output = 'SearchNameAccount';
    }
    if (this.options.selectOrg && this.options.selectUser) {
      // output = "搜索组织、姓名";
      output = 'SearchOrgUserRole';
    }
    return output;
  }

  treeFocus() {
    super.treeFocus();
  }

  mounted() {
    if (this.options.key === 'account') {
      this.isShowModel();
    }
  }

  async isShowModel() {
    let query = utils.parseQuery();
    let retrunQuery = query.return.split('?')[0].split('/').pop();
    let res: any = await organizationApi.getUserAccount({
      schemaCode: query['queryCode'] || retrunQuery,
      key: this.options.key,
    });

    let data = res.data;

    if (data && !data.isAlert) return;
    // data.defaultAccount = [
    //     {
    //         "id": "8abe7a8280ec0ee80180ec2dc9a00000",
    //         "parentId": null,
    //         "name": "江苏分公司",
    //         "nodeType": null,
    //         "isRelated": null,
    //         "functionCode": null
    //     },
    //   ];
    // data.defaultAccount = [
    //     {
    //         "id": "8abe7a8280ec0ee80180ec31a5690324",
    //         "name": "综合管理部",
    //         "avatar": "",
    //         "type": "org",
    //         "hasChild": true,
    //         "hasPermission": true,
    //         "orglist": "综合管理部/云南分公司/融通地产",
    //         "title": "综合管理部 (0)",
    //         "isLeaf": false,
    //         "key": "8abe7a8280ec0ee80180ec31a5690324",
    //         "sortKey": "0",
    //         "parentId": "8abe7a8280ec0ee80180ec2dd1be0003",
    //         "children": [],
    //         "source": {
    //             "id": "8abe7a8280ec0ee80180ec31a5690324",
    //             "remarks": null,
    //             "createdTime": "2022-05-22 22:35:18",
    //             "modifiedTime": "2022-05-22 22:35:18",
    //             "deleted": false,
    //             "createdBy": null,
    //             "modifiedBy": null,
    //             "extend1": "分公司",
    //             "extend2": "13983",
    //             "extend3": null,
    //             "extend4": null,
    //             "extend5": null,
    //             "name": "综合管理部",
    //             "managerId": null,
    //             "parentId": "8abe7a8280ec0ee80180ec2dd1be0003",
    //             "calendarId": null,
    //             "sortKey": null,
    //             "leaf": false,
    //             "sourceId": "13985",
    //             "queryCode": "1_1#13983#13985",
    //             "dingDeptManagerId": null,
    //             "parent": null,
    //             "children": [],
    //             "employees": null,
    //             "unitType": 1,
    //             "isShow": true,
    //             "deptType": 0,
    //             "corpId": "main",
    //             "enabled": true,
    //             "relatedOrgType": null,
    //             "relatedSyncType": null,
    //             "isCorpRootNode": false,
    //             "displayOption": true,
    //             "hasPermission": true,
    //             "parentDepartmentName": "综合管理部/云南分公司/融通地产",
    //             "type": 1,
    //             "departments": null,
    //             "partTimerDepartment": null
    //         },
    //         "isSelected": true
    //     }
    // ];
    // data.defaultAccount = [
    //   {
    //     "id": "2c928fd08246443c018247b3b77e0061",
    //     "parentId": null,
    //     "name": "aaa",
    //     "nodeType": null,
    //     "isRelated": null,
    //     "functionCode": null,
    //     "isLeaf": false,
    //     "source": {
    //       "departments": null,
    //       "id": "2c928fd08246443c018247b3b77e0061",
    //       "name": "aaa",
    //       "parentId": "8abe7a8280ec0ee80180ec2dd1be0003",
    //     },
    //     "key": "2c928fd08246443c018247b3b77e0061",
    //     "type": "org",
    //   }
    // ];
    if (data && data.defaultAccount.length > 0) {
      this.onOk(data.defaultAccount);
      this.getOrgsAndUsers();
      return;
    }
    if (data && data.accounts) {
      if (data && data.accounts.length < 2) {
        this.onOk(data.accounts);
        this.getOrgsAndUsers();
      } else {
        (this.$refs.SmartOrgFn as any).focus();
      }
    }
  }

  // 树-返回
  onClickTrunBack() {
    super.onClickTrunBack();
  }

  // 树-下一级
  onClickNextHierarchy(val: any) {
    super.onClickNextHierarchy(val);
  }

  onClickBreadcrumb(val: any) {
    super.onClickBreadcrumb(val);
  }

  onChange(items: any[]) {
    super.onChange(items);
  }

  async onOk(items: any[]) {
    super.onOk(items);
  }

  onCancle() {
    super.onCancle();
  }

  onSearch(name: string) {
    let type = '';
    if (this.options.selectOrg) {
      //选组织
      type = 'department';
    }
    if (this.options.selectUser) {
      //选人
      type = 'user';
    }
    if (this.options.selectOrg && this.options.selectUser) {
      //选组织/人
      type = '';
    }

    super.onSearch(name, type);
  }
}
</script>

<style lang="less" scoped></style>
