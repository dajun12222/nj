import { Prop, Vue, Watch, Inject } from 'vue-property-decorator';
import { utils } from 'cloudpivot/common';
import {
  DepartmentInfo,
  OrganizationType,
  StaffSelectorControl,
  UserStatus,
} from './controls/staff-selector-control';

import { DefaultUserService } from './user-service';

const SERVICE = StaffSelectorControl.service || DefaultUserService;

import getDownloadUrlNew from '../../../../../common/src/utils/getDownloadUrlNew';
const MAPPING_FIELD_OPERATE = 'MAPPING_FIELD_OPERATE_'; // 选人控件 特殊的映射字段 额外处理方法名 前缀

export abstract class StaffSelectorBase extends Vue {
  mainDepartment: any = null; // 主部门

  partTimerDepartment: any = null; // 兼职部门

  @Inject({
    default: () => () => {},
  })
  valueChange?: (data: any) => void;

  @Prop({
    default: () => {},
  })
  options!: any;

  // 过滤条件需要的参数
  @Prop({
    default: () => {},
  })
  params!: any;

  //表单列表多选控件才具有精简功能
  @Prop({
    default: false,
  })
  onlyForm!: boolean;

  @Prop({
    default: false,
  })
  disabled!: boolean;

  @Prop()
  controlOpts: any;

  @Prop({
    default: false,
  })
  hasAccount?: boolean;

  @Prop({
    default: '',
  })
  defineTypeFlow?: string; //adminUser

  @Prop({
    default: '',
  })
  schemaCode?: string;

  @Prop({
    default: '',
  })
  adminUser?: string;

  @Prop({
    default: '',
  })
  flowAccount?: string;

  @Prop({
    default: '',
  })
  roleCode?: string;

  org: any[] = [];

  // 是否是通过单击打开的部门（是：单击下级或路径，否：单击根目录或初始化打开选人控件）
  isClickNext: boolean = false;

  searchList: any[] = [];

  showLoading: boolean = false; // 是否展示正在搜索中

  isDisableClick: boolean = false;

  @Prop()
  value!: any[];

  @Prop({ default: '' })
  placeholder!: string;

  // 搜索数据总数
  departmentsTotal: number = 0;

  usersTotal: number = 0;

  // 转换的时候数据过来数据中 id 不一定是部门id
  // 固使用参数传递进来以判断使用哪个字段做 convert
  @Prop({ default: 'id' })
  convertKey!: any;

  /**
   * 基于此bug #43245
   * 涉及子管理员组织管理范围的某些部门不可删除，但是可以查看
   * 故将不可删除的部门传进来，做删除才做时，可做判断
   * 20200507 不要John
   * */

  @Prop({ default: () => [] })
  keepDeptIds!: any[];

  selected: any = [];

  currentDept?: DepartmentInfo;

  blackList?: Array<string> = ['#/system/manager-setting'];

  isFirstLoad: boolean = true;

  @Prop({
    default: true,
  })
  appManagerFilter?: boolean;

  //显示方式：加号plus方式/输入框input方式
  @Prop({
    type: String,
    default: 'input',
  })
  displayType!: string;

  @Prop({
    type: String,
  })
  queryDisplayType?: string;

  showNotData: boolean = false;

  roleLabel: any = this.getRoleLabel;

  get locale() {
    return localStorage.getItem('locale') || 'zh';
  }

  @Watch('value', {
    immediate: true,
    deep: true,
  })
  setValue(vals: any[]) {
    if (!vals) {
      this.selected = [];
      return;
    }

    this.selected = this.getSelectData(vals);

    this.valueChange && this.valueChange(this.selected);
  }

  @Watch('options', {
    immediate: true,
  })
  handleFocus(opts: any) {
    if (!opts.showSelect && opts.showModel) {
      this.treeFocus();
    }
    if (!opts.selectUser && this.selected) {
      //如果不能选择用户，数据需要过滤掉用户数据
      this.selected = this.selected.filter((item: any) => {
        return !(item.type === 'user');
      });
    } else if (!opts.selectOrg && this.selected) {
      //如果不能选择部门，数据需要过滤掉部门数据
      this.selected = this.selected.filter((item: any) => {
        return !(item.type === 'org');
      });
    } else {
      //Else Empty block statement
    }
  }

  getSelectData(vals: any) {
    const vm = this;
    let arr: any = [];
    try {
      if (typeof vals === 'string') {
        vals = JSON.parse(vals);
      }
    } catch (error) {}

    if (Array.isArray(vals)) {
      arr = vals;
    } else {
      arr = [vals];
    }
    return arr.map((x: any) => {
      return {
        id: (x[this.convertKey] ? x[this.convertKey] : x.id) || x.key,
        key: (x[this.convertKey] ? x[this.convertKey] : x.id) || x.key,
        name: x.name || '',
        type: Number(x.type) === 3 || Number(x.unitType) === 3 ? 'user' : 'org',
        source: x,
        avatar: x.imgUrl
          ? x.imgUrl.includes('http')
            ? x.imgUrl
            : vm.getDownloadUrlNew(x.imgUrl)
          : '',
        /**
         * 基于此bug #43245 做一个拓展
         * 拓展逻辑：当前部门不在子管理员的组织管理范围内的，只可查看，不可删除
         * 故增加此字段以做删除逻辑时判断
         * 2020-05-07 by John
         * */

        operatable: x.operatable,
      };
    });
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(refId: string) {
    return getDownloadUrlNew.getImageUrl(refId);
  }

  convert(x: any) {
    return {
      id: x[this.convertKey] || x.key,
      key: x[this.convertKey] || x.key,
      name: x.name,
      type: x.type === 3 ? 'user' : 'org',
      source: x,
      avatar: x.imgUrl,
      /**
       * 基于此bug #43245 做一个拓展
       * 拓展逻辑：当前部门不在子管理员的组织管理范围内的，只可查看，不可删除
       * 故增加此字段以做删除逻辑时判断
       * 2020-05-07 by John
       * */

      operatable: x.operatable,
    };
  }

  get rootId() {
    let id = '';
    if (
      this.options &&
      this.options.rootNode &&
      this.options.rootNode.length > 0
    ) {
      id = this.options.rootNode[0].id || '';
    }
    return id;
  }

  get rootIds() {
    let resId = '';
    if (
      this.options &&
      this.options.rootNode &&
      this.options.rootNode.length > 0
    ) {
      // resId = this.options.rootNode[0].id || '';
      resId = this.options.rootNode
        .map((node: any) => node.id as string)
        .filter((id: string) => !!id)
        .join(',');
    }
    return resId;
  }

  get roleId() {
    if (
      Object.prototype.toString.call(this.options.role) === '[object Object]'
    ) {
      this.options.role = [this.options.role];
    }
    if (this.options && this.options.role) {
      const roleId = this.options.role.map((item: any) => {
        return item.value;
      });
      return roleId || '';
    }
    return [];
  }

  get getRoleLabel() {
    if (
      Object.prototype.toString.call(this.options.role) === '[object Object]'
    ) {
      this.options.role = [this.options.role];
    }
    if (this.options && this.options.role) {
      const getRoleLabel = this.options.role.map((item: any) => {
        return item.label;
      });
      return getRoleLabel || '';
    }
    return [];
  }

  get filterType() {
    if (this.options.appManagerFilter || this.appManagerFilter) {
      return 'admin';
    } else {
      return '';
    }
  }

  treeFocus() {
    this.org = []; // 每次进入，先清空树
    this.$emit('focus');
    this.onClickTrunBack();
  }

  // 树-返回
  onClickTrunBack() {
    this.isClickNext = false;
    this.currentDept = undefined;

    if (this.adminUser === 'adminUser') {
      let promises: any[] = [];
      promises.push(this.getUsers('', ''));
      Promise.all(promises)
        .then((res) => {
          let orgs: any[] = [];
          res.forEach((x) => (orgs = orgs.concat(x)));
          if (orgs.length === 0) {
            this.showNotData = true;
          }
          this.org = orgs;
          this.isDisableClick = false;
        })
        .catch(() => {
          this.showNotData = true;
          this.org = [];
          this.isDisableClick = false;
        });
    } else {
      this.getOrgsAndUsers();
    }
  }

  // 树-下一级
  onClickNextHierarchy(val: any) {
    this.isDisableClick = true;

    //如果是角色下一级，则把角色id传过去
    if (val && val.id && val.roles === 'role') {
      this.isClickNext = true;
      this.currentDept = val.source;
      this.getOrgsAndUsers(val.roleId);
    } else {
      this.isClickNext = true;
      this.currentDept = val.source;
      this.getOrgsAndUsers();
    }
  }

  onClickBreadcrumb(val: any) {
    this.isDisableClick = true;
    if (val && val.id) {
      this.isClickNext = true;
      this.currentDept = val.source;
      this.getOrgsAndUsers();
    }
  }

  onChange(items?: any[]) {
    let selecteds: any[] = [];
    if (items && items.length > 0) {
      const ids: string[] = items.map((x) => x.key);
      selecteds = this.selected.filter(
        (item: any) => ids.indexOf(item.id) > -1,
      );
    }
    let list: any[] = [];
    if (selecteds.length > 0) {
      list = selecteds.map((x) => x.source);
    }

    this.$emit('change', list);
  }

  async onOk(items: any[]) {
    //主部门、兼职部门
    items.forEach((item: any) => {
      if (item.source && item.source.departments) {
        //主部门的id
        this.mainDepartment = item.source.departments.filter(
          (x: any) => x.id === item.source.departmentId,
        );
        //兼职部门的id
        this.partTimerDepartment = item.source.departments.filter(
          (x: any) => x.id !== item.source.departmentId,
        );
      }
    });
    // 给数据设置区分主部门和兼职部门
    items.forEach((x: any) => {
      x.source.departments = this.mainDepartment;
      x.source.partTimerDepartment = this.partTimerDepartment;
    });
    //注释说明 单选模式统一在staff-selector-control映射字段-manager-主管
    // items.length && (await this.onlyFormModal(items));
    if (items.length === 1) {
      this.getOrganizationLevel(items);
    } else {
      await this.onlyFormModal(items);
      const list = items.map((x) => x.source);
      this.$emit('ok', list);
      this.$emit('change', list);
    }
  }

  // 单选模式下 ok 或 change事件需要处理的 业务
  async onlyFormModal(items: any[]) {
    await this.mappingOperate(items[0]);
  }

  // 选人控件 映射相关的业务
  async mappingOperate(item: any) {
    const self: any = this;
    if (this.controlOpts && this.controlOpts.mappings) {
      const mappings = this.controlOpts.mappings;
      if (mappings) {
        // 获取所有映射的 字段
        const arr_mapping = mappings
          .slice(0, -1)
          .split(';')
          .map((val: any) => val.split(':')[0]);
        for (const mapping_item of arr_mapping) {
          if (self[MAPPING_FIELD_OPERATE + mapping_item]) {
            await self[`${MAPPING_FIELD_OPERATE}${mapping_item}`](item);
          }
        }
      }
    }
  }

  // 映射字段-manager-主管 获取信息
  async [MAPPING_FIELD_OPERATE + 'manager'](item: any) {
    let params = { userId: item.id, ...this.params };
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      const opts = JSON.parse(this.controlOpts.params);
      params = { ...params, ...opts };
    }

    return new Promise((resolve, reject) => {
      SERVICE.getDeptLeader({ userId: item.id, ...params }).then(
        (data: any) => {
          if (data.length) {
            item.source['manager'] = data;
          }
          // else {
          //   item.source["manager"] = [{ name: "陈总", id: 12323 }];
          // }
          resolve(item);
        },
      );
    });

    // const list = items.map(x => x.source);
    // this.$emit("ok", list);
    // this.$emit("change", list);
  }

  onCancle() {
    this.showLoading = false;
    this.$emit('cancel');
  }

  // 获取组织层级（部门）
  getOrganizationLevel(items: any[]) {
    const list = items.map((x) => x.source);
    this.$emit('ok', list);
    this.$emit('change', list);
    return false;
    // 单选模式统一在staff-selector-control里面映射的组织层级对应
    // StaffSelectorControl.service
    //   .getOrganizationLevel(items[0].id)
    //   .then((data) => {
    //     if (this.controlOpts && this.controlOpts.mappings) {
    //       const mappings = this.controlOpts.mappings;
    //       let item: any = items[0];
    //       if (data) {
    //         if (data.length > 0) {
    //           if (mappings) {
    //             if (mappings.indexOf("LEVEL") > -1) {
    //               mappings.split(";").forEach((m: any) => {
    //                 if (m.indexOf("LEVEL") > -1) {
    //                   let level = m.split(":")[0];
    //                   //判断当前返回的组织层级是否与映射的组织层级对应
    //                   if (level.split(",")[1] < data.length) {
    //                     item.source[level] = [];
    //                     item.source[level].push(data[level.split(",")[1]]);
    //                   } else {
    //                     item.source[level] = [];
    //                     item.source[level].push(data[data.length - 1]);
    //                   }
    //                 }
    //               });
    //             }
    //           }
    //         }
    //       }
    //     }
    //     const list = items.map((x) => x.source);
    //     this.$emit("ok", list);
    //     this.$emit("change", list);
    //   });
  }

  // 获取该级的树和用户
  getOrgsAndUsers(roleId?: string) {
    const promises: any[] = [];
    const rootId = this.rootId;
    //如果有角色组id则根据角色id获取所有用户
    if (roleId) {
      promises.push(this.getUsers(this.rootIds, rootId, undefined, roleId));
    } else {
      if (this.currentDept) {
        const dept = this.currentDept;
        if (this.options.appManagerFilter || this.appManagerFilter) {
          promises.push(this.getDepts(this.rootIds, dept.id, 'admin'));
          promises.push(this.getUsers(this.rootIds, dept.id, 'admin'));
        } else {
          promises.push(this.getDepts(this.rootIds, dept.id));
          promises.push(this.getUsers(this.rootIds, dept.id));
        }
      } else {
        const roots = this.options.rootNode;
        if (!roots || roots.length < 2) {
          if (this.options.appManagerFilter || this.appManagerFilter) {
            promises.push(this.getDepts(this.rootIds, rootId, 'admin'));
          } else if (this.roleId.length) {
            /* //表单设计时设置了角色范围或者有组织根节点时查询该角色下所有用户
            promises.push(this.getUsers(this.rootIds, rootId,)); */
          } else {
            promises.push(this.getDepts(this.rootIds, rootId));
          }
        } else if (roots && roots.length > 1) {
          promises.push(this.getDepts(this.rootIds, this.rootIds));
        } else {
          //Else Empty block statement
        }
      }
    }
    this.showNotData = false;
    //如果是按照角色展示并且没有角色id存在，即展示所有的角色组当成部门展示
    if (this.roleId.length && !roleId) {
      this.setRoles();
    } else {
      Promise.all(promises)
        .then((res) => {
          let orgs: any[] = [];
          res.forEach((x) => (orgs = orgs.concat(x)));
          if (orgs.length === 0) {
            this.showNotData = true;
          }
          this.org = orgs;
          this.isDisableClick = false;
        })
        .catch((error) => {
          console.log('失败error', error);
          this.showNotData = true;
          this.org = [];
          this.isDisableClick = false;
        });
    }
  }

  //把角色组伪装成一个部门作为展示
  async setRoles() {
    const arr: any = [];
    this.roleId.map((item: any, index: number) => {
      arr.push({
        avatar: '',
        hasChild: true,
        hasPermission: true,
        isleaf: false,
        orglist: '',
        parentId: null,
        sortKey: '0',
        title: this.roleLabel[index],
        type: 'org',
        id: item,
        key: item,
        name: this.roleLabel[index],
        roles: 'role',
        roleId: item,
      });
    });
    this.org = arr;
  }

  async getDepts(
    rootId?: string,
    deptIds?: string,
    filterType?: string,
    deptIdTwo?: any,
  ) {
    // 额外需要的过滤参数
    const copyParams = this.params
      ? JSON.parse(JSON.stringify(this.params))
      : {};

    // 需要从根节点开始显示部门
    if (
      this.isClickNext &&
      (this.options.isDisplayRoot || copyParams.filterType === 'root_display')
    ) {
      delete copyParams.filterType;
    }
    let query = utils.parseQuery();

    let params = {
      formRootDeptIds: rootId,
      deptIds,
      filterType,
      identificationID: this.options.key || '',
      queryCode: query['schemaCode'] || '',
      hasLeaf: (this.controlOpts && this.controlOpts['hasLeaf']) || false,
      hasAccount: this.hasAccount || '',
      defineTypeFlow: this.defineTypeFlow || '',
      schemaCode: this.schemaCode,
      flowAccount: this.flowAccount || '',
      roleCode: this.roleCode || '',
      ...copyParams,
    };

    let bizSchema =
      (window as any).h3form &&
      (window as any).h3form.formObj &&
      (window as any).h3form.formObj.bizSchema &&
      (window as any).h3form.formObj.bizSchema;

    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      const opts = JSON.parse(this.controlOpts.params);
      params = { ...params, ...opts };
    }
    params = this.processParams(params);
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
      params.queryCode || (bizSchema && bizSchema['code']) || '',
      params.hasAccount || '',
      params.schemaCode || '',
      params.defineTypeFlow || '',
      params.flowAccount || '',
      params.roleCode || '',
      params.hasLeaf || false,
    );

    const nodes = res.departments;
    const orgTree = this.resetTree(nodes, []);

    let myDepartentTree: any[] = [];
    let exitSameDepartent = true;

    if (res && res.myDepartment.length > 0) {
      const myDepartent: any = res.myDepartment;
      // myDepartent. = '';
      myDepartentTree = this.resetTree(myDepartent, []);
      // 增加我的部门显示
      myDepartentTree.forEach((res2) => {
        res2.copyName = '我的部门';
      });

      // 判断我的部门是不是和当前部门一致 一致的话就不现实
      const myDepartentID = myDepartentTree[0].id;
      exitSameDepartent = orgTree.some((i) => i.id === myDepartentID);
    }
    return exitSameDepartent ? orgTree : [...orgTree, ...myDepartentTree];
  }

  async getUsers(
    rootId: string,
    deptId: string,
    filterType?: string,
    roleId?: string,
  ) {
    let param = {};
    if (this.params) {
      // @ts-ignore
      param = JSON.parse(JSON.stringify(this.params));
    }
    // if (param.hasOwnProperty('sourceType')) {
    //   // @ts-ignore
    //   delete param.sourceType

    // }
    const params: any = {
      formRootDeptIds: rootId,
      deptId,
      roleId: roleId || '',
      filterType,
      ...param,
    };
    // params = this.processParams(params);
    // @ts-ignore
    const users: any = await SERVICE.getUsersBy(
      params.deptId || '',
      params.roleId || '',
      params.filterType || '',
      params.sourceType || '',
      params.workflowInstanceId || '',
      params.activityCode || '',
      params.formRootDeptIds || '',
      '',
      this.adminUser || '',
    );

    // 过滤没激活状态的用户
    const enableUsers = users.filter(
      (u: any) => u.status === UserStatus.Enable,
    );
    if (
      this.options &&
      this.options.filterUser &&
      this.options.filterUser.length > 0
    ) {
      //加签状态选择加签人员过滤当前处理人
      this.options.filterUser.forEach((f: any) => {
        enableUsers.forEach((e: any, i: number) => {
          if (e.id === f.id) {
            enableUsers.splice(i, 1);
          }
        });
      });
    }
    const userTree = this.resetTree(enableUsers, []);
    return userTree;
  }

  // 组装接口异步数据
  resetTree(nodes: any, orgTree: Array<any>) {
    const vm = this;
    const corpid = (this.params && this.params.corpid) || '';
    nodes.forEach((node: any) => {
      // 是否递归为false，不让进入下级部门
      //因为后端返回的叶子节点，只要下级有部门，就有节点，没有部门就没有节点，，但是还有情况是下级有用户
      let hasChild = true; //修改为部门下级都显示
      if (this.options.recursive === false) {
        hasChild = false;
        node.leaf = true;
      }
      // else {
      //   hasChild = !node.leaf || (node.employees && node.employees > 0);
      // }
      if (corpid) {
        if (corpid === node.corpId) {
          orgTree.push({
            id: node.id,
            name: node.name,
            // avatar: node.imgUrl,
            avatar: node.imgUrl
              ? node.imgUrl.includes('http')
                ? node.imgUrl
                : vm.getDownloadUrlNew(node.imgUrl)
              : '',
            type: node.type === OrganizationType.User ? 'user' : 'org',
            hasChild,
            hasPermission: node.hasPermission,
            orglist: node.parentDepartmentName || '',
            title: `${node.name} (${node.employees || 0})`,
            isLeaf: node.leaf,
            key: node.id,
            sortKey: '0', // ERROR
            parentId: node.parentId,
            children: [],
            source: node,
          });
        }
      } else {
        orgTree.push({
          id: node.id,
          name: node.name,
          // avatar: node.imgUrl,
          avatar: node.imgUrl
            ? node.imgUrl.includes('http')
              ? node.imgUrl
              : vm.getDownloadUrlNew(node.imgUrl)
            : '',
          type: node.type === OrganizationType.User ? 'user' : 'org',
          hasChild,
          hasPermission: node.hasPermission,
          orglist: node.parentDepartmentName || '',
          title: `${node.name} (${node.employees || 0})`,
          isLeaf: node.leaf,
          key: node.id,
          sortKey: '0', // ERROR
          parentId: node.parentId,
          children: [],
          source: node,
        });
      }
    });
    return orgTree;
  }

  onSearch(name: string, type: string) {
    if (!name) {
      return;
    }
    let query = utils.parseQuery();
    let params = {
      name,
      queryType: type || '',
      formRootDeptIds: this.rootIds,
      deptIds: this.rootIds,
      roleIds: this.roleId && this.roleId.join(),
      filterType: this.filterType,
      identificationID: this.options.key,
      queryCode: query['queryCode'],
      ...this.params,
    };
    // portal端参数处理
    if (this.controlOpts && this.controlOpts.params) {
      const opts = JSON.parse(this.controlOpts.params);
      params = { ...params, ...opts };
    }
    params = this.processParams(params);

    // 正在搜索的时候不执行
    if (this.showLoading) {
      return;
    }
    this.showLoading = true;

    // @ts-ignore
    SERVICE.search(
      params.name || '',
      params.queryType || '',
      params.deptIds || '',
      params.roleIds || '',
      params.filterType || '',
      params.sourceType || '',
      params.corpId || '',
      params.excludeCorpId || '',
      params.workflowInstanceId || '',
      params.activityCode || '',
      params.formRootDeptIds || '',
      params.identificationID || '',
      params.queryCode || '',
    ).then((data: any) => {
      const list: any[] = [];
      if (data.departments && this.options.selectOrg) {
        this.resetTree(data.departments, list);
      }
      if (data.users && this.options.selectUser) {
        this.resetTree(data.users, list);
      }
      this.departmentsTotal = data.departmentsTotal;
      this.usersTotal = data.usersTotal;
      this.searchList = list;

      this.showLoading = false;
    });
  }

  /**
   * @desc 选人控件前台筛选
   * @param params 请求参数
   */
  processParams(params: any) {
    return params;
    /*
    let path = this.$route.path;
    // admin端不需要做处理
    if (path.includes('admin')) {
      return params;
    }
    let userInfo: any = sessionStorage.getItem('user');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
    }
    // 主组织可以看到关联组织的信息管理不能看到主组织的信息
    // MAIN 主
    // Re   关联组织
    if (userInfo.relatedOrgType === 'MAIN') {
      // params.sourceType = 'admin'
    } else {
      delete params.sourceType;
    }
    // 表单有根节点的时候需要特殊处理
    if (this.isFirstLoad && path === '/form/detail') {
      let { deptIds } = params;
      this.isFirstLoad = false;

      // 如果说有根节点 需要删除sourceType参数
      if (deptIds) {
        delete params.sourceType;
      }
    }
    // 有根节点需要删除sourceType
    return params;
    */
  }
}
