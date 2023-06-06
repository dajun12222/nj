/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { Component, Vue } from 'vue-property-decorator';
import { namespace, State } from 'vuex-class';

const UserModule = namespace('Organization/User');

@Component
export default class OrgMixin extends Vue {
  @State('config') config: any; // 提取 config

  @UserModule.State('loading') loading: any;

  @UserModule.State('noUser') noUser: any;

  @UserModule.State('searchTitle') searchTitle: any;

  @UserModule.State('orgUserList') orgUserList: any;

  @UserModule.State('loadCompleted') loadCompleted: any;

  @UserModule.Mutation('clearUserList') clearUserList: any;

  @UserModule.Mutation('assignUserInfoParams') assignUserInfoParams: any;

  @UserModule.Mutation('setEduUserInfoParams') setEduUserInfoParams: any;

  @UserModule.Mutation('clearUserInfo') clearUserInfo: any;

  @UserModule.Action('getOrgUserList') getOrgUserList: any;

  @UserModule.Action('getOrgUserInfo') getOrgUserInfo: any;

  tableColums = [
    {
      dataIndex: 'index',
      width: 80,
      slots: { title: 'indexTitle' },
      align: 'center',
      scopedSlots: { customRender: 'index' },
    },
    {
      width: 100,
      dataIndex: 'name',
      slots: { title: 'nameTitle' },
      scopedSlots: { customRender: 'name' },
      onFilter: (value: string, record: any) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      dataIndex: 'userId',
      slots: { title: 'userIdTitle' },
      scopedSlots: { customRender: 'userId' },
    },
    {
      dataIndex: 'roleName',
      slots: { title: 'roleNameTitle' },
      scopedSlots: { customRender: 'role' },
    },
    {
      width: 120,
      dataIndex: 'mobile',
      slots: { title: 'mobileTitle' },
      scopedSlots: { customRender: 'mobile' },
    },
    {
      dataIndex: 'email',
      slots: { title: 'emailTitle' },
      scopedSlots: { customRender: 'email' },
    },
    {
      dataIndex: 'operation',
      slots: { title: 'operationTitle' },
      scopedSlots: { customRender: 'operation' },
      width: 180,
    },
  ];

  rowSelection = {
    type: 'checkbox',
    selectedRowKeys: new Array<string>(),
    onChange: this.onSelectChange,
  };

  // 当前节点信息
  curNodeState: any = {};

  isSearchTitle: boolean = false;

  infoVisible: boolean = false;

  // 工作交接
  visible: boolean = false;

  userid: string = '';

  corpid: string = '';

  userName: string = '';

  isSelectAll: boolean = false;

  showSelectAllBox: boolean = false;

  /* 用户信息相关 */
  showInfoModal(val: string) {
    if (val) {
      const infoParams: Organization.Users.RequestParams = {
        id: val,
      };
      this.assignUserInfoParams(infoParams);
      let isHomeSchool = false;
      const { deptType, id } = this.curNodeState;
      if (deptType) {
        isHomeSchool = deptType === 1 && !this.isSearchTitle; // 1 家校  2 组织
        const params: Organization.Users.EduRequestParams = {
          userId: val,
          deptId: id,
        };
        this.setEduUserInfoParams(params);
      }

      this.getOrgUserInfo(isHomeSchool).then(() => {
        this.infoVisible = true;
      });
    }
  }

  // 工作交接弹框
  showModel(val: any) {
    this.visible = true;
    this.userid = val.id;
    this.corpid = val.corpId;
    if (val.name) {
      this.userName = val.name;
    }
  }

  onCloseInfoModal() {
    this.infoVisible = false;
    this.clearUserInfo();
  }

  onRowClick(record: any, index: number) {
    return {
      on: {
        click: () => {
          this.showInfoModal(record.id);
        },
        mouseenter: () => {
          this.$set(record, 'hover', true);
        },
        mouseleave: () => {
          this.$set(record, 'hover', false);
        },
      },
    };
  }

  // table标题行点击事件
  onHeaderRow(column: any, index: number) {
    return {
      on: {
        mouseenter: () => {
          this.showSelectAllBox = true;
        },
        mouseleave: () => {
          this.showSelectAllBox = false;
        },
      },
    };
  }

  onClose() {
    this.visible = false;
  }

  // 勾选
  onSelectChange(selectedRowKeys) {
    this.rowSelection.selectedRowKeys = selectedRowKeys;
  }

  //序号列checkbox值改变事件
  onItemCheckboxChange() {
    const isCheckedItems = this.orgUserList.filter((d: any) => d.checked);
    if (isCheckedItems.length < this.orgUserList.length) {
      this.isSelectAll = false;
    } else {
      this.isSelectAll = true;
    }
    this.$set(
      this.rowSelection,
      'selectedRowKeys',
      isCheckedItems.map((el) => el.id),
    );
  }

  get indeterminate() {
    const length: number = this.orgUserList.length;
    const checkedLength: number = this.rowSelection.selectedRowKeys.length;
    return !checkedLength || checkedLength === length;
  }

  /**
   * 全选
   */
  selectAll(e: Event) {
    const isChecked = (e.target as any).checked;

    if (isChecked) {
      this.orgUserList.forEach((item: any) => {
        item.checked = true;
      });
    } else {
      this.orgUserList.forEach((item: any) => {
        item.checked = false;
      });
    }
    this.onItemCheckboxChange();
  }
}
