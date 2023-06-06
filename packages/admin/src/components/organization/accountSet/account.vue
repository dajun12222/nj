<template>
  <a-drawer
    :title="modalTitle"
    width="850"
    placement="right"
    :visible="showModal"
    :destroyOnClose="true"
    @close="cancel"
  >
    <a-form
      class="add-department"
      labelAlign="left"
      :autoFormCreate="
        (form) => {
          this.form = form;
         
        }
      "
    >
      <template v-if="isLoading">
        <div class="loading-icon">
          <a-spin :tip="$t('languages.Apps.Loading')" />
        </div>
      </template>
      <div v-show="!isLoading" class="drawer-dept">
        <div class="drawer-dept-title">账套信息</div>
        <div class="drawer-dept-content">
          <a-form-item v-if="isHasParent"
          style="display:none;"
            label="上级账套"
            fieldDecoratorId="department"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :fieldDecoratorOptions="rules.department" 
            >
            <staff-selector
              :disabled="isSuperiorDeptEditable || !deptEdit"
              :options="deptOpts"
              :params="{ corpId: corpidAll, filterType: 'admin_corp' }"
            />
          </a-form-item>

          <a-form-item
            label="账套名称"
            fieldDecoratorId="deptName"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :fieldDecoratorOptions="rules.deptName"
          >
            <a-input
              :disabled="isSuperiorDeptEditable || !deptEdit"
              class="dept__name"
              :maxLength="50"
              placeholder="请输入名称"
            />
          </a-form-item>

          <a-form-item v-if="deptType === 1"
          style="display:none;"
            label="账套主管"
            fieldDecoratorId="deptLeader"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <a-select
              allowClear
              showSearch
              :disabled="!deptEdit"
              placeholder="请选择"
              optionFilterProp="children"
              @search="onSearch"
              @popupScroll="popupScroll"
            >
              <a-select-option
                v-for="(user, index) in orgUserList"
                :key="index"
                :value="user.userId" 
                >{{ user.name }}</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <div class="line"></div>
      </div>
      <div v-show="!isLoading" class="drawer-dept">
        <div class="drawer-dept-title">
          账套设置
          <a-tooltip title="设置后，本账套只会可被指定的账套/人员可见">
            <a-icon type="question-circle-o" />
          </a-tooltip>
        </div>
        <div class="drawer-dept-content">
          <a-form-item
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <span slot="label">
              账套可见性
              <a-tooltip
                title="设置后，本账套(包含子账套)只会被指定的账套/人员可见"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-radio-group v-model="deptParam.open">
              <a-radio class="radioStyle" value="ALL_VISIBLE">所有人/账套可见</a-radio>
              <a-radio
                class="radioStyle"
                value="PART_VISIBLE"
                :style="deptParam.open === 'PART_VISIBLE' ? radioStyles : {}"
                >指定人/账套可见
                <div
                  v-if="deptParam.open === 'PART_VISIBLE'"
                  style="margin: 5px 0 0 24px" 
                  >
                  <staff-selector
                  v-model="selectDeptData"
                    :onlyForm="true"
                    :options="deptSelectorOpts"
                    :params="{ sourceType: 'admin' }"
                    @ok="handleSelectDept"
                  />
                </div>
              </a-radio>
              <a-radio class="radioStyle" value="NOT_VISIBLE">均不可见</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
          >
            <span slot="label">
              账套成员可见范围
              <a-tooltip
                title="设置后，本账套成员 (包含子账套)只能看到指定的账套/人员"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-radio-group v-model="deptParam.openUser">
              <a-radio class="radioStyle" value="ALL_VISIBLE">全部</a-radio>
              <a-radio class="radioStyle" value="ONLY_DEPT">所在账套及下级账套</a-radio>
              <a-radio
                class="radioStyle"
                value="PRAT_VISIBLE"
                :style="
                  deptParam.openUser === 'PRAT_VISIBLE' ? radioStyles : {}
                "
                >指定人/账套
                <div
                  v-if="deptParam.openUser === 'PRAT_VISIBLE'"
                  style="margin: 5px 0 0 24px"
                >
                  <staff-selector
                    v-model="selectUserData"
                    :onlyForm="true"
                    :options="userSelectorOpts"
                    :params="{ sourceType: 'admin' }"
                    @ok="handleSelectUser"
                  />
                </div>
              </a-radio>
              <a-radio class="radioStyle" value="ONESELF">仅自己</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
      </div>
    </a-form>
    <div class="drawer-dept-bottom">
      <template>
        <a-button style="margin-right: 8px" @click="cancel">取消</a-button>
        <a-button type="primary" @click="submit">确定</a-button>
      </template>
      <!-- <template v-else>
        <a-button style="margin-right: 8px" @click="cancel">关闭</a-button>
      </template> -->
    </div>
  </a-drawer>
</template>

<script lang="ts">
import OrgApi from "@/apis/organization";
import { nameValidator } from "@/common/utils";
import { 
Form, 
Input, 
Modal, 
TreeSelect,
Radio,
Button,
Select,
Tooltip,
Icon,
Drawer,
Spin
 } from '@h3/antd-vue';
import StaffSelector from "cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";





@Component({
  name: "Account",
  components: {
    StaffSelector,
    AForm: Form,
    AFormItem: Form.Item,
    ATreeSelect: TreeSelect,
    AInput: Input,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATooltip: Tooltip,
    AIcon: Icon,
    ADrawer: Drawer,
    ASpin: Spin,
  },
})
export default class Account extends Vue {
  // @UserModule.State('unitTitleObj') unitTitleObj: any;

  @Prop() value!: boolean;

  @Prop() unitTitleObj!: any;

  @Prop() deptType!: number; // 0：新增，1：编辑

  @Prop() corpId!: string; // corpid  新增账套只能展示当前组织下的账套

  @Prop() deptData!: any;

  get staffParams() {
    let { relatedOrgType, corpId } = this.unitTitleObj;

    return relatedOrgType === "MAIN"
      ? {}
      : { sourceType: "admin", corpId: corpId };
  }

  radioStyles = {
    height: "70px",
    marginBottom: "8px",
    marginRight: "0px",
  };

  isLoading: boolean = true;

  get corpidAll() {
    // return this.corpId;
    // 以下先保留
    if (this.deptType === 0) {
      return this.corpId;
    } else {
      return `${this.corpId}@@excludedeptid-${this.deptData.id}`;
    }
  }

  // 上级账套是否展示
  // 账套名称是否修改
  get isSuperiorDeptEditable() {
    if (this.deptType === 0) return false; // 新增的时候 可以编辑
    return this.deptData.isSelfMaintainRootNode;
  }

  // 是否有上级账套
  get isHasParent() {
    if (this.deptType === 0) return true;
    return !!this.deptData.parentId;
  }

  selectDeptData: any = [];

  selectUserData: any = [];

  showModal: boolean = false;

  modalTitle: string = "新建账套";

  orgUserList: any = [];

  params: any = {
    department: "",
    deptName: "",
    deptLeader: "",
  };

  form: any = {};

  formItemLayout: any = {
    labelCol: {
      span: 5,
    },
    wrapperCol: {
      span: 15,
    },
  };

  rules: any = {};

  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: "请选择",
    appManagerFilter: true,
    rootNode: [],
  };

  deptSelectorOpts = {
    showError: false,
  };

  userSelectorOpts = {
    showError: false,
  };

  selectorOpts = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    showError: false,
    placeholder: "请选择人/账套",
  };

  cacheDeptId: string = ""; // 缓存上级账套id，用以判断是否修改了上级账套

  isSubmiting: boolean = false; // 请求是否加载中

  deptParam: any = {
    open: "ALL_VISIBLE",
    openUser: "ALL_VISIBLE",
  };

  deptEdit = false;

  beforeMount() {
    this.userSelectorOpts = Object.assign(
      this.userSelectorOpts,
      this.selectorOpts
    );
    this.deptSelectorOpts = Object.assign(
      this.deptSelectorOpts,
      this.selectorOpts
    );
    this.setRules();
  }

  setRules() {
    this.rules = {
      department: {
        rules: [
          {
            required: true,
            message: "上级账套不能为空",
          },
        ],
      },
      deptName: {
        rules: [
          {
            required: true,
            message: "账套名称不能为空",
          },
          {
            validator: nameValidator,
            maxLength: 50,
            message: this.$t("languages.Apps.AppNameRule"),
            // 仅限50个字符以内，并不能以空格开头
          },
        ],
      },
    };
  }

  pageParam: any = {
    page: 0,
    size: 100,
  }

  async getOrgUserList(id: any) {
    const params = {
      deptId: id,
      filterType: 'admin',
      ...this.pageParam,
    };
    this.fetching = true;
    await OrgApi.getOrgList(params).then((res: any) => {
      if (!res.errcode && res.data && res.data.content) {
        if(this.pageParam.page === 0) {
          this.orgUserList = res.data.content;
        } else {
          this.orgUserList = this.orgUserList.concat(res.data.content);
        }
        if(!this.totalElements) {
          this.totalElements = res.data.totalElements;
        }
      }
    });
    this.fetching = false;
  }

  async getOrgUserListByName(id: any) {
    const params = {
      deptId: id,
      keyword: this.searchText,
    };
    this.fetching = true;
    await OrgApi.getOrgListByName(params).then((res: any) => {
      if (!res.errcode) {
        this.orgUserList = res.data
      }
    });
    this.fetching = false;
  }

  fetching: boolean = false;

  totalElements: number = 0;

  scrolling: boolean = false;

  //滚动加载

  async popupScroll($ev){
    if(this.scrolling || this.orgUserList.length === this.totalElements) {
      return;
    }
    if($ev.target.scrollHeight <  $ev.target.offsetHeight + $ev.target.scrollTop + 64){
      this.scrolling = true;
      // 滚动到底||加载全部数据
      if(this.fetching || this.orgUserList.length === this.totalElements){
        this.scrolling = false;
        return
      }
      
      if(!this.searchText) {
        this.pageParam.page ++
        await this.getOrgUserList(this.deptData.id)
      }
    }
    this.scrolling = false;
  }

  handleSelectDept(val: any) {
    this.deptSelectorOpts.showError = val && val.length > 0 ? false : true;
  }

  handleSelectUser(val: any) {
    this.userSelectorOpts.showError = val && val.length > 0 ? false : true;
  }

  selectDeptDataChangeString(list: any[]) {
    const str = list.map((i: any) => {
      return {
        id: i.id,
        name: i.name,
        unitType: i.unitType,
      };
    });
    return JSON.stringify(str);
  }

  submit() {
    const { isSubmiting } = this;
    if (isSubmiting) return;
    this.form.validateFields((err: any) => {
      if (!err) {
        const deptName = this.form.getFieldValue("deptName");
        const department = this.form.getFieldValue("department");
        const managerId = this.form.getFieldValue("deptLeader");
        if (
          this.deptParam.open === "PART_VISIBLE" ||
          this.deptParam.openUser === "PRAT_VISIBLE"
        ) {
          if (
            this.deptParam.open === "PART_VISIBLE" &&
            (!this.selectDeptData || this.selectDeptData.length <= 0)
          ) {
            this.deptSelectorOpts.showError = true;
            return;
          }
          if (
            this.deptParam.openUser === "PRAT_VISIBLE" &&
            (!this.selectUserData || this.selectUserData.length <= 0)
          ) {
            this.userSelectorOpts.showError = true;
            return;
          }
        } 
        if(this.deptParam.open !== "PART_VISIBLE"){
          this.selectDeptData = [];
        }
        if(this.deptParam.openUser !== "PRAT_VISIBLE"){
          this.selectUserData = [];
        }
        this.isSubmiting = true;
        const parentId =
          department && department.length ? department[0].id : "";

        console.log(this.deptData, "this.deptData");

        // 判断是否修改了上级账套
        const { cacheDeptId } = this;

       const isUpdateParentDept = cacheDeptId !== parentId;
        const scopeModel = {
          departmentId: this.deptData ? this.deptData.id : "",
          deptVisibleType: this.deptParam.open,
          deptVisibleScope: this.selectDeptDataChangeString(
            this.selectDeptData
          ),
          staffVisibleType: this.deptParam.openUser,
          staffVisibleScope: this.selectDeptDataChangeString(
            this.selectUserData
          ),
        };
        if (this.deptType === 1) {
          // 编辑账套接口
          const params: any = {
           parentId,
            name: deptName,
            managerId: managerId ? managerId : "",
            id: this.deptData ? this.deptData.id : "",
            corpId: this.deptData ? this.deptData.corpId : "",
            scopeModel: scopeModel,
            isAccount: true
          };
          OrgApi.updateDepartment(params).then((res: any) => {
            if (res.errcode) {
              this.$message.error(res.errmsg);
              return;
            }

           res.data.parentId = parentId; // 取页面上的id,防止后端缓存策略导致数据不正确

            res.data.id = params.id; // 取页面上的id,防止后端缓存策略导致数据不正确

            this.$message.success("编辑账套成功！");
            this.$emit("reloadTree", {
              data: res.data,
              type: "edit",
              isUpdateParentDept,
            });
            this.cancel();
          });
        } else {
          // 新增账套接口
          const params: any = {
           parentId,
            name: deptName,
            scopeModel: scopeModel,
            isAccount: true
          };
          OrgApi.addDepartment(params).then((res: any) => {
            this.isSubmiting = false;
            if (res.errcode) {
              this.$message.error(res.errmsg);
              return;
            }

            this.$message.success("创建账套成功！");

          res.data.parentId = parentId; // 取页面上的id,防止后端缓存策略导致数据不正确
          res.data.isAccount = true;
            this.$emit("reloadTree", {
              data: res.data,
              type: "add",
              isUpdateParentDept,
            });
            this.cancel();
          });
        }
      }
    });
  }

  cancel() {
    this.isLoading = true;
    this.form.resetFields();
    this.deptParam = {
      open: "ALL_VISIBLE",
      openUser: "ALL_VISIBLE",
    };
    this.selectDeptData = [];
    this.selectUserData = [];
    this.$emit("input", false);
  }

  @Watch("value")
  async onValueChange(v: boolean) {
    this.deptOpts.deptEdit = this.deptType === 1 ? "edit" : "add";
    this.deptOpts.selectedDepId = this.deptData.id ? this.deptData.id : "";
    // console.log('add-department', this)
    this.showModal = v;
    if (!v) {
      this.isSubmiting = false;
      this.totalElements = 0;
      return;
    }
    if (this.deptType === 1) {
      this.pageParam = {
        page: 0,
        size: 100,
      }
      this.modalTitle = "编辑账套";
      await this.getOrgUserList(this.deptData.id);
      this.deptEdit = this.deptData.relatedSyncType === "PUSH";
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          const deptId = this.deptData.id ? this.deptData.id : "";

          const params = {
            deptId,
          };
          // 获取当前账套的账套主管
          OrgApi.searchDeptDetail(params).then((res: any) => {
            if (!res.errcode && res.data) {
              const detail = res.data;

              this.cacheDeptId = detail.parentId;
              this.deptParam = {
                open: detail.scopeModel
                  ? detail.scopeModel.deptVisibleType
                  : "ALL_VISIBLE",
                openUser: detail.scopeModel
                  ? detail.scopeModel.staffVisibleType
                  : "ALL_VISIBLE",
              };
              this.selectDeptData = detail.scopeModel
                ? JSON.parse(detail.scopeModel.deptVisibleScope)
                : [];
              this.selectUserData = detail.scopeModel
                ? JSON.parse(detail.scopeModel.staffVisibleScope)
                : [];
              this.form.setFieldsValue({
                deptName: detail.deptName,
                department: [
                  {
                    name: detail.parentName,
                    id: detail.parentId,
                    unitType: 1,
                  },
                ],
                deptLeader: detail.managerId ? detail.managerId : "",
              });
              setTimeout(() => {
                this.isLoading = false;
              }, 800);
            }
          });
        }
      });
    } else {
      this.deptEdit = true;
      this.modalTitle = "新建账套";
      this.cacheDeptId = this.unitTitleObj.id;
      this.$nextTick(() => {
        if (this.form.setFieldsValue) {
          this.deptParam = {
            open: "ALL_VISIBLE",
            openUser: "ALL_VISIBLE",
          };
          this.selectDeptData = [];
          this.selectUserData = [];
          this.form.setFieldsValue({
            department: [
              {
                name: this.unitTitleObj.name,
                id: this.unitTitleObj.id,
                unitType: 1,
              },
            ],
          });
          setTimeout(() => {
            this.isLoading = false;
          }, 800);
        }
      });
    }
  }

  searchText: any = ''
  
  onSearch(name) {
    this.searchText = name
    this.pageParam = {
      page: 0,
      size: 100,
    }
    if(name){
      this.getOrgUserListByName(this.deptData.id)
    } else {
      this.getOrgUserList(this.deptData.id)
    }
  }
}
</script>

<style lang="less" scoped>
.loading-icon {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.drawer-dept {
  margin-bottom: 24px;
  padding-bottom: 50px;;
  .line {
    height: 1px;
    background: #e8e8e8;
  }
  .drawer-dept-title {
    font-size: 16px;
    color: #000000;
    font-weight: 600;
  }
  .drawer-dept-content {
    margin-top: 24px;
    margin-bottom: 24px;
    /deep/ .ant-radio-group {
      display: block;
    }
    .radioStyle {
      display: block;
      height: 30px;
      line-height: 30px;
      margin-bottom: 8px;
      margin-right: 0px;
    }
  }
}
.drawer-dept-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: center;
  z-index: 1;
}
</style>
