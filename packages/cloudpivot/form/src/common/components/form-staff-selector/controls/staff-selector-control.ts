/*
 * @Author: your name
 * @Date: 2020-04-22 14:11:20
 * @LastEditTime: 2022-03-01 09:35:07
 * @LastEditors: Fu Zhuohang
 * @Description: In User Settings Edit
 * @FilePath: \yunshu6.0-3\modules\cloudpivot\form\src\common\components\form-staff-selector\controls\staff-selector-control.ts
 */

import { userApi } from '../../../../../../api';
import { RadioControl } from 'cloudpivot-forms';
// @ts-ignore
import isEqual from 'lodash/isEqual';
import { Subscription } from 'rxjs';
import { BaseControl } from '../../../../common/controls/base-control';
import * as schema from '../../../../schema';
import * as typings from '../../../../typings';
import OptionsMap from '../../../../typings/form-modals-map';
import userSelectionOptionsMap from '../../../../typings/user-selection-map';

const MAPPING_FIELD_OPERATE = 'MAPPING_FIELD_OPERATE';
export abstract class StaffSelectorControl extends BaseControl<typings.StaffSelectorOptions> {
  static service: UserService;

  val: any[] = [];

  staffSelectorOpts: any = {};

  refSubscription?: Subscription;

  get text() {
    return this.val.map((x) => x.name).join(';');
  }

  get isMobile() {
    const flag = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
    );
    return flag;
  }

  get displayType() {
    if (this.controlOpts.displayType) {
      return this.controlOpts.displayType;
    }
    return schema.DisplayType.Tag;
  }

  get userAttributes() {
    const userAttributes: any = [
      ...userSelectionOptionsMap.zh_CN.orgAttributes,
      ...OptionsMap.userAttributes,
    ];
    return userAttributes;
  }

  setControl() {
    this.staffSelectorOpts = this.createOptions();

    this.unsubscribe();

    let key = this.controlOpts.orgRoot;

    if (
      this.controlOpts.orgRootValueType === schema.StaffSelectorValueType.Ref &&
      key &&
      typeof key === 'string'
    ) {
      key = key.substr(1, key.length - 2);
      let ctrl: any = '';
      if (this.ctrl.options && this.ctrl.options.inSheet) {
        const rowIndex = this.ctrl.options.rowIndex || 0;
        ctrl = this.findController(key, rowIndex) as RadioControl;
      } else {
        ctrl = this.findController(key) as RadioControl;
      }
      if (ctrl) {
        if (ctrl.value) {
          this.$set(this.staffSelectorOpts, 'rootNode', ctrl.value);
        }

        this.refSubscription = ctrl.valueChange.subscribe((change: any) => {
          this.$set(this.staffSelectorOpts, 'rootNode', change.value);
        });
      }
    }
    const value = this.ctrl.value;
    const isNew = (window as any).h3form
      ? !!(window as any).h3form.isNew
      : true;
    // 除了新增之外
    const isWorkflow = (window as any).h3form
      ? !!(window as any).h3form.workflowInfo
      : false;
    if (
      isNew ||
      (isWorkflow && this.controlOpts && this.controlOpts.mappings)
    ) {
      this.handleValueChange(this.ctrl.value);
    } else {
      this.val = value ? value : [];
    }
  }

  async handleValueChange(value: any): Promise<void> {
    if (value === null || value === undefined) {
      this.val = [];
      return;
    }
    // // @ts-ignore
    // if (!value && !this.ctrl.isChangeFromEmptyRow) {
    //   return;
    // }
    // // @ts-ignore
    // this.ctrl.isChangeFromEmptyRow = false

    if (
      this.control.options.orgRoot &&
      Array.isArray(this.control.options.orgRoot) &&
      this.control.options.orgRoot.length
    ) {
      const params = {
        unitId: Array.isArray(value) && value[0] ? value[0].id : value.id,
        unitType:
          Array.isArray(value) && value[0]
            ? value[0].unitType
              ? value[0].unitType
              : value[0].type
            : value.unitType,
        departmentIds: this.control.options.orgRoot.map((i) => i.id),
      };
      const res: any = await userApi.getverifyPersonIsMapping(params);
      if (res.errcode === 0) {
        if (!res.data) {
          if (this.isMobile) {
            (this as any).$h3.toast.hide();
            (this as any).$h3.toast.show({
              text: `[${this.control.options.name}] 值不在根节点之内！`,
            });
          } else {
            this.$message.destroy();
            this.$message.error(
              `[${this.control.options.name}] 值不在根节点之内！`,
            );
          }
          this.setValue([]);
          this.val = [];
          return;
        }
      } else {
        this.$message.error(res.errmsg as string);
        return;
      }
    }

    if (!this.controlOpts.mappings) {
      if (value) {
        if (!isEqual(this.val, value)) {
          this.val = value;
        }
      } else {
        // 如果当前value为null 并且当前选人控件有值，才将this.value置为空，触发onValueChange事件
        // 避免进入死循环
        if (Array.isArray(this.val) && this.val.length > 0) {
          this.val = [];
        }
      }
    } else {
      if (value) {
        //判断选人控件是否导入初始化的，导入初始化的选人控件不执行人员映射
        if (this.ctrl.isImportControl) {
          this.val = value ? value : [];
        } else {
          this.mappingOperate(value);
        }
        this.ctrl.isImportControl = false;
      } else {
        this.val = [];
      }
    }
  }

  async mappingOperate(val: any) {
    const _tempMappingItem: Array<string> = [
      'departments',
      'partTimerDepartment',
      'manager',
      'entryDate',
    ];
    const self: any = this;
    let dirty = false; // val 是否被修改标记
    const userinfo = [
      'partTimerDepartment',
      // 'mobile',
      'email',
      'officePhone',
      'employeeNo',
    ];

    const mappingList = this.controlOpts.mappings
      .slice(0, -1)
      .split(';')
      .map((val: any) => val.split(':'));
    console.log('mapping', mappingList);

    for (const _mapping of mappingList) {
      const [mappingItem, mappingKey] = _mapping;
      // console.log(mappingItem, mappingKey)
      if (
        self[MAPPING_FIELD_OPERATE + mappingItem] ||
        userinfo.includes(mappingItem)
      ) {
        if (
          mappingItem === 'departments' &&
          (!val[0]['departments'] || val[0]['departments'].length > 1)
        ) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
        } else if (
          userinfo.includes(mappingItem) &&
          val[0][mappingItem] === undefined
        ) {
          dirty = true;
          //外链不能访问此组织接口，不支持
          if (!self.isExternal) {
            await self[`${MAPPING_FIELD_OPERATE}${'partTimerDepartment'}`](
              val[0],
              mappingItem,
            );
          }
        } else if (
          !val[0][mappingItem] &&
          self[`${MAPPING_FIELD_OPERATE}${mappingItem}`]
        ) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}${mappingItem}`](val[0]);
        } else {
          //Else Empty block statement
        }
      } else if (~mappingItem.indexOf('LEVEL')) {
        if (!val[0][mappingItem]) {
          dirty = true;
          await self[`${MAPPING_FIELD_OPERATE}OrganizationLevel`](
            val[0],
            mappingItem,
          );
        }
      } else if (!_tempMappingItem.includes(mappingItem)) {
        if (typeof this.val !== typeof val || this.val.length !== val.length) {
          dirty = true;
        } else {
          if (this.val[0][mappingItem] !== val[0][mappingItem]) {
            dirty = true;
          }
        }
      } else if (mappingItem.indexOf('entryDate') > -1) {
        if (val[0][mappingItem] && typeof val[0][mappingItem] === 'string') {
          val[0][mappingItem] = val[0][mappingItem].replace(/-/g, '/');
          val[0][mappingItem] = new Date(val[0][mappingItem]);
          dirty = true;
        }
      } else {
        //Else Empty block statement
      }
    }
    //默认值映射时查询用户信息拓展字段并合并
    if (dirty) {
      if (val[0] && val[0].id) {
        const userExtAttrObj: any = {};
        if (val[0].unitType === 1 || val.length > 1) {
          this.$message.warning('混合选人控件仅支持单人属性映射！');
          return;
        }
        const { errcode, data, errmsg } = await userApi.getUserInfo(val[0].id);
        if (errcode === 0) {
          if (data) {
            const { userExtAttrModels } = data as any;
            if (userExtAttrModels) {
              userExtAttrModels.map((item: any) => {
                userExtAttrObj[item.code] = item.mapVal;
              });
            }
          }
        } else {
          this.$message.error(errmsg as string);
        }
        val = [{ ...userExtAttrObj, ...val[0] }];
        console.log(val);
        const newVal = [...val];
        this.setValue(newVal);
        if (!isEqual(this.val, val)) {
          this.val = val;
        }
      }
    } else {
      if (!isEqual(this.val, val)) {
        this.val = val;
      }
    }
  }

  // 用户 主部门和兼职部门信息. 两种情况,1. 部门信息都在一个 departments里面,需要区分. 2. 部门信息没有需要额外请求接口
  async [MAPPING_FIELD_OPERATE + 'departments'](item: any) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (item.departments && item.departments.length > 1) {
        const _department: any[] = [];
        const _partTimerDepartments: any[] = [];
        for (const dp of item.departments) {
          if (dp.id !== item.departmentId) {
            _partTimerDepartments.push(dp);
          } else {
            _department.push(dp);
          }
        }
        item['partTimerDepartment'] = _partTimerDepartments;
        item['departments'] = _department;
        resolve(item);
      } else if (!item.departments) {
        const { errcode, data, errmsg } = await userApi.getUserInfo(item.id);
        if (errcode === 0) {
          if (data) {
            const { mainDepartmentName, departmentNames } = data as any;
            item['departments'] = mainDepartmentName
              ? [mainDepartmentName]
              : [];
            item['partTimerDepartment'] =
              departmentNames && departmentNames.length ? departmentNames : [];
          }
        } else {
          this.$message.error(errmsg as string);
        }
        resolve(item);
      } else {
        //Else Empty block statement
      }
    });
  }

  // 用户 主部门和兼职部门信息. 两种情况,1. 部门信息都在一个 departments里面,需要区分. 2. 部门信息没有需要额外请求接口
  async [MAPPING_FIELD_OPERATE + 'departments'](item: any) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (item.departments && item.departments.length > 1) {
        const _department: any[] = [];
        const _partTimerDepartments: any[] = [];
        for (const dp of item.departments) {
          if (dp.id !== item.departmentId) {
            _partTimerDepartments.push(dp);
          } else {
            _department.push(dp);
          }
        }
        item['partTimerDepartment'] = _partTimerDepartments;
        item['departments'] = _department;
        resolve(item);
      } else if (!item.departments) {
        const { errcode, data, errmsg } = await userApi.getUserInfo(item.id);
        if (errcode === 0) {
          if (data) {
            const { mainDepartmentName, departmentNames } = data as any;
            item['departments'] = mainDepartmentName
              ? [mainDepartmentName]
              : [];
            item['partTimerDepartment'] =
              departmentNames && departmentNames.length ? departmentNames : [];
          }
        } else {
          this.$message.error(errmsg as string);
        }
        resolve(item);
      } else {
        //Else Empty block statement
      }
    });
  }

  async [MAPPING_FIELD_OPERATE + 'partTimerDepartment'](
    item: any,
    key?: string,
  ) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const res = await userApi.getUserInfo(item.id);

      const { errcode, errmsg } = res;
      const data: any = res.data;

      if (errcode === 0) {
        if (data) {
          const { mainDepartmentName, departmentNames } = data as any;

          if (key) {
            item[key] = data[key] ? data[key] : '';
          }

          item['departments'] = mainDepartmentName ? [mainDepartmentName] : [];
          item['partTimerDepartment'] =
            departmentNames && departmentNames.length ? departmentNames : [];
        }
      } else {
        this.$message.error(errmsg as string);
      }
      resolve(item);
    });
  }

  // 映射字段-manager-主管信息 获取
  async [MAPPING_FIELD_OPERATE + 'manager'](item: any) {
    return new Promise((resolve, reject) => {
      StaffSelectorControl.service.getDeptLeader(item.id).then((data: any) => {
        if (Array.isArray(data)) {
          if (data.length) {
            item['manager'] = data;
          } else {
            item['manager'] = [];
          }
        } else {
          item['manager'] = [];
        }
        resolve(item);
      });
    });
  }

  // 映射字段-xxx-LEVEL,x -部门信息 获取
  async [MAPPING_FIELD_OPERATE + 'OrganizationLevel'](
    item: any,
    levelString: any,
  ) {
    return new Promise((resolve, reject) => {
      StaffSelectorControl.service
        .getOrganizationLevel(item.id)
        .then((data) => {
          if (this.controlOpts) {
            const mappings = this.controlOpts.mappings.match(/\{.+?\}/g);
            let mappingsObject = '';
            if (mappings.length) {
              mappings.forEach((el: any) => {
                // @ts-ignore
                const h3formCopy = (window as any).h3form || {};
                mappingsObject += h3formCopy[
                  el.replace('{', '').replace('}', '')
                ]
                  ? h3formCopy[el.replace('{', '').replace('}', '')].options
                      .name
                  : el.replace('{', '').replace('}', '') + ';';
              });
              mappingsObject = mappingsObject.slice(
                0,
                mappingsObject.length - 1,
              );
            }
            if (data) {
              if (data.length > 0) {
                data.forEach((el: any) => {
                  if (el.type === undefined) {
                    el.type = el.unitType;
                  }
                });
                const level = levelString.split(',')[1];
                //判断当前返回的组织层级是否与映射的组织层级对应
                if (level < data.length) {
                  item[levelString] = [];
                  item[levelString].push(data[level]);
                } else {
                  item[levelString] = [];
                  item[levelString].push(data[data.length - 1]);
                }
              } else {
                this.$message.error(
                  this.controlOpts.name + '映射到' + mappingsObject + '失败',
                );
                item[levelString] = [];
              }
            } else {
              this.$message.error(
                this.controlOpts.name + '映射到' + mappingsObject + '失败',
              );
              item[levelString] = [];
            }
          }
          resolve(true);
        });
    });
  }

  unsubscribe() {
    if (this.refSubscription) {
      this.refSubscription.unsubscribe();
    }
  }

  createOptions() {
    const opts = this.controlOpts;
    const dept = opts.deptVisible;

    const selectOrg = dept === 'all' || dept === 'org';
    const selectUser = dept === 'all' || dept === 'user';

    let root: any;

    if (
      this.controlOpts.orgRootValueType === schema.StaffSelectorValueType.None
    ) {
      if (opts.orgRoot && typeof opts.orgRoot === 'string') {
        try {
          root = JSON.parse(opts.orgRoot);
        } catch (error) {}
      } else if (Array.isArray(opts.orgRoot)) {
        root = opts.orgRoot;
      } else {
        //Else Empty block statement
      }
    } else if (
      this.controlOpts.orgRootValueType ===
      schema.StaffSelectorValueType.OriginatorDept
    ) {
      // root = StaffSelectorControl.service.getCurrentUserDept();
      root =
        ((window as any).h3form &&
          (window as any).h3form.formObj &&
          (window as any).h3form.formObj.bizObject &&
          (window as any).h3form.formObj.bizObject.createdDeptId) ||
        StaffSelectorControl.service.getCurrentUserDept();
    } else {
      //Else Empty block statement
    }

    if (root && !Array.isArray(root)) {
      root = [root];
    }

    let role: any;
    //是json则转换一下，是数组则直接相等
    if (opts.roles && typeof opts.roles === 'string') {
      role = JSON.parse(opts.roles);
    } else if (opts.roles instanceof Array) {
      role = opts.roles;
    } else {
      //Else Empty block statement
    }
    let mulpitle: boolean = false;
    if (
      typeof this.controlOpts.multi === 'string' &&
      this.controlOpts.multi === 'false'
    ) {
      mulpitle = false;
    } else {
      mulpitle = Boolean(this.controlOpts.multi);
    }
    return {
      key: this.control.key,
      selectOrg: selectOrg,
      selectUser: selectUser,
      mulpitle,
      rootNode: root,
      role: role,
      showModel: true,
      showSelect: true,
      recursive: this.controlOpts.recursive,
      // placeholder: this.placeholder
    };
  }

  destroyed() {
    super.destroyed();

    this.unsubscribe();
  }

  // setCurrentUser() {
  //     const user = StaffSelectorControl.service.getCurrentUser();
  //     if (user) {
  //         this.ctrl.value = [user];
  //     }
  // }

  // setCurrentUserDept() {
  //     const dept = StaffSelectorControl.service.getCurrentUserDept();
  //     if (dept) {
  //         this.ctrl.value = [dept];
  //     }
  // }

  // initValue() {
  //     if (!this.control.value || !this.control.value.length) {
  //         const type = this.controlOpts.defaultValueType;
  //         if (type === typings.StaffSelectorValueType.Originator) {
  //             this.setCurrentUser();
  //         } else if (type === typings.StaffSelectorValueType.OriginatorDept) {
  //             this.setCurrentUserDept();
  //         }
  //     }
  // }
}

/**
 * 机构类型
 */
export enum OrganizationType {
  /**
   * 部门
   */
  Department = 1,

  /**
   * 角色
   */
  Role = 2,

  /**
   * 用户
   */
  User = 3,
}

export interface OrganizationBase {
  id: string;

  name: string;
}

export interface DepartmentInfo extends OrganizationBase {
  /**
   * 员工数
   */
  employees: number;

  /**
   * 叶子节点
   */
  leaf: boolean;

  /**
   * 父级部门ID
   */
  parentId?: string;

  type: OrganizationType;
}

/**
 * 用户状态
 */
export enum UserStatus {
  /**
   * 启用
   */
  Enable = 'ENABLE',

  /**
   * 禁用
   */
  Disable = 'DISABLE',
}

export interface UserInfo extends OrganizationBase {
  /**
   * 头像
   */
  imgUrl?: string;

  status: UserStatus;

  [key: string]: any;

  type: OrganizationType;
}

export interface UserService {
  /**
   * 当前登录用户
   */
  getCurrentUser(): UserInfo | null;

  /**
   * 当前登录用户部门
   */
  getCurrentUserDept(): DepartmentInfo | null;

  /**
   * 获取部门集合
   * @param deptId 所属部门ID，无值时获取根部门，多个时以“,”分割
   */
  getDepartmentsBy(
    deptIds?: string,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    selectUserIds?: any,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?: string,
    identificationID?: string,
    queryCode?: string,
    hasAccount?: boolean,
    schemaCode?: string,
    defineTypeFlow?: string,
    flowAccount?: string,
    roleCode?: string,
    hasLeaf?: boolean,
  ): Promise<{
    departments: DepartmentInfo[];
    myDepartment?: DepartmentInfo[];
  }>;

  /**
   * 获取用户集合
   * @param deptId 所属部门ID
   * @param roleId 所属角色ID
   */
  getUsersBy(
    deptId: string,
    roleId?: string,
    filterType?: string,
    sourceType?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
    queryType?: string,
    adminUser?: string,
  ): Promise<UserInfo[]>;

  /**
   * 搜索部门和用户
   * @param name 名称
   * @param deptIds 部门编码 “,”分割
   * @param roleIds 角色编码 “,”分割
   */
  search(
    name: string,
    queryType: string,
    deptIds?: string,
    roleIds?: string,
    filterType?: string,
    sourceType?: string,
    corpId?: string,
    excludeCorpId?: string,
    workflowInstanceId?: string,
    activityCode?: string,
    formRootDeptIds?: string,
  ): Promise<{
    departments?: DepartmentInfo[];
    users?: UserInfo[];
    departmentsTotal?: number;
    usersTotal?: number;
  }>;

  /**
   * 根据用户ID获取部门列表
   * @param userId
   */
  getUserDepartments(userId: string): Promise<OrganizationBase[] | null>;

  /**
   * 根据用户ID获取流程的部门列表
   * @param userId
   */
  getUserWorkflowFormDepartments(
    userId: string,
    workflowCode: string,
    isMobile: boolean,
  ): Promise<OrganizationBase[] | null>;

  /**
   * 根据用户ID获取组织层级
   * @param userId
   */
  getOrganizationLevel(userId: string): Promise<OrganizationBase[] | null>;
  /**
   * 根据用户id获取部门主管信息
   * @param userId/用户id
   */
  getDeptLeader(userId: string): Promise<OrganizationBase[] | null>;
}
