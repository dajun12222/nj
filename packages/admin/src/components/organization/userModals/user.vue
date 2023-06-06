<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <a-drawer
    width="850"
    placement="right"
    :closable="true"
    :visible="userVisible"
    wrapClassName="add-user-drawer"
    @close="onCloseInfoModal"
  >
    <div slot="title">
      <h2>{{ modalTitle }}</h2>

      <!-- 新增的时候才会展示 -->
      <template v-if="userType !== 1">
        <a-button
          v-show="!showImportBtn"
          type="link"
          class="importFromBtn"
          @click="() => (showImportPeople = true)"
        >
          从已有人员中导入
        </a-button>
      </template>
    </div>
    <div v-if="userInfo" class="add-user-wrapper" :class="$i18n.locale">
      <!--基本信息-->
      <div class="box-item space-between">
        <div class="item-title">
          {{ $t('languages.User.BaseInfo') }}
        </div>
        <div class="item-child">
          <div>
            <p class="left-header item-avator-name">
              {{ $t('languages.User.Avatar') }}
            </p>
            <div class="item-avator">
              <template v-if="!isOtherDep">
                <a-upload :showUploadList="false" :beforeUpload="beforeUpload">
                  <div
                    :class="[
                      'item-avator__icon',
                      { 'item-avator__icon--loading': uploading },
                    ]"
                  >
                    <img
                      v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                      :src="userInfo.imgUrl"
                    />
                    <img
                      v-else-if="userInfo.imgUrl"
                      :src="getDownloadUrlNew(userInfo.imgUrl)"
                    />
                    <span
                      v-if="!userInfo.imgUrl"
                      class="icon aufontAll h-icon-all-normal_smile"
                    ></span>
                    <i class="icon aufontAll h-icon-all-form-o"></i>
                    <i class="icon aufontAll h-icon-all-loading-o"></i>
                  </div>
                </a-upload>
                <div class="avator-tips">图片为png/jpg格式，大小100K以内</div>
              </template>
              <template v-else>
                <div class="item-avator">
                  <a-avatar
                    v-if="userInfo.imgUrl && userInfo.imgUrl.includes('http')"
                    :size="64"
                    :src="userInfo.imgUrl"
                    shape="square"
                    icon="user"
                  />
                  <a-avatar
                    v-else-if="userInfo.imgUrl"
                    :size="64"
                    :src="getDownloadUrlNew(userInfo.imgUrl)"
                    shape="square"
                    icon="user"
                  />
                  <i
                    v-else
                    class="icon aufontAll h-icon-all-normal_smile"
                    style="font-size: 64px; color: #ffb131"
                  ></i>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="item-child">
          <div class="child-left">
            <p class="left-header required">
              {{ $t('languages.User.UserName') }}
            </p>
            <div
              class="edit-text"
              :class="{ 'err-input': userValid.name.valid }"
            >
              <a-input
                v-model="userInfo.name"
                class="input-text"
                :maxLength="maxLength"
                :disabled="userType === 1"
                placeholder="请输入用户名称"
                @change="userValid.name.valid = false"
              />
              <p v-if="userValid.name.valid" class="err-tips">
                {{ userValid.name.errMsg }}
              </p>
            </div>
          </div>
          <div class="child-right">
            <p class="left-header required">
              {{ $t('languages.User.UserAccount') }}
            </p>
            <div
              class="edit-text"
              :class="{ 'err-input': userValid.username.valid }"
            >
              <a-input
                v-model="userInfo.userId"
                class="input-text"
                :maxLength="Length"
                :disabled="userType === 1"
                placeholder="请输入账号"
                @change="userValid.username.valid = false"
              />
              <p v-if="userValid.username.valid" class="err-tips">
                {{ userValid.username.errMsg }}
              </p>
            </div>
          </div>
        </div>

        <div class="item-child">
          <div class="child-content">
            <p class="left-header">
              {{ $t('languages.User.Role') }}
            </p>
            <div v-if="!isOtherDep" class="edit-text">
              <role-select
                :defaultValue="userInfo.roleIds"
                :showParent="true"
                :expandAll="true"
                defaultValueKey="id"
                :params="roleParams"
                :multiple="true"
                :showAuthority="true"
                :filterDefaultRoleGroup="true"
                :filterDD="unitTitleObj.relatedOrgType === 'RELEVANCE'"
                :keepRoles="keepRolesList"
                :filterKey="codeProp"
                @select="selectRole"
              />
            </div>

            <template v-else>
              <p v-if="userInfo.roleName" class="inner-text limit2">
                <span
                  v-for="(role, idx) in userInfo.roleName.split(',')"
                  :key="idx"
                >
                  <i class="icon aufontAll h-icon-all-user-list-o"></i>
                  {{ role }}
                </span>
              </p>
              <p v-else>- -</p>
            </template>
          </div>
        </div>

        <div v-if="basicExtInfo.length">
          <template v-if="!isOtherDep">
            <div
              v-for="(row, index) in basicArr"
              :key="index"
              class="item-child"
            >
              <div class="child-left">
                <p class="left-header">
                  {{ basicExtInfo[(row - 1) * 2].name }}
                </p>
                <div class="edit-text">
                  <a-input
                    v-model="basicExtInfo[(row - 1) * 2].mapVal"
                    class="input-text"
                    :maxLength="otherLength"
                  />
                </div>
              </div>
              <div v-if="basicExtInfo.length >= row * 2" class="child-right">
                <p class="left-header">
                  {{ basicExtInfo[(row - 1) * 2 + 1].name }}
                </p>
                <div class="edit-text">
                  <a-input
                    v-model="basicExtInfo[(row - 1) * 2 + 1].mapVal"
                    class="input-text"
                    :maxLength="otherLength"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div
              v-for="(row, index) in basicArr"
              :key="index"
              class="item-child"
            >
              <div class="child-left">
                <p
                  class="left-header"
                  :title="basicExtInfo[(row - 1) * 2].name"
                >
                  {{ basicExtInfo[(row - 1) * 2].name + '：' }}
                </p>
                <p
                  class="inner-text"
                  :title="basicExtInfo[(row - 1) * 2].mapVal"
                >
                  {{ basicExtInfo[(row - 1) * 2].mapVal }}
                </p>
              </div>
              <div v-if="basicExtInfo.length >= row * 2" class="child-right">
                <p
                  class="left-header"
                  :title="basicExtInfo[(row - 1) * 2 + 1].name"
                >
                  {{ basicExtInfo[(row - 1) * 2 + 1].name + '：' }}
                </p>
                <span
                  class="inner-text"
                  :title="basicExtInfo[(row - 1) * 2 + 1].mapVal"
                  >{{ basicExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!--所属部门-->
      <div class="box-item">
        <div class="item-title">
          {{ $t('languages.User.department') }}
        </div>
        <div class="item-child">
          <div class="department-table">
            <a-table
              key="key"
              :dataSource="dataSource"
              :columns="columns"
              :scroll="{ y: 500 }"
              :pagination="false"
            >
              <span slot="departmentTitle" class="resize"><span class=""></span>所属部门</span>
              <span slot="managerTitle" class="resize">
                <span class="line"></span>
                直属主管
                <!-- <a-tooltip title="直属主管同步，请在XX开启同步">
                  <a-icon type="question-circle-o" />
                </a-tooltip> -->
              </span>
              <span slot="mainTitle" class="resize"><span class="line"></span>是否主部门</span>
              <span slot="actionTitle" class="resize"><span class="line"></span>操作</span>

              <template slot="dept" slot-scope="text, record">
                <!-- 选部门控件 单选 当前用户组织为根节点-->
                <staff-selector
                  v-model="record.dept"
                  :params="StuffSelectParams"
                  :disabled="isOtherDep || record.isMainDept"
                  :options="deptOpts"
                  :keepDeptIds="mainDeptKeepIds"
                  class="user-info-staff"
                  :showDetail="true"
                  @change="onCellChange(record.key, 'dept', $event)"
                />
              </template>

              <template slot="manager" slot-scope="text, record">
                <!-- <a-select class="manager-select"
                          :value="setManageDefaultValue(record.manager)"
                          showSearch
                          @focus="onFocus(record)"
                          @change="onCellChange(record.key, 'manager', $event)"
                          optionFilterProp="children"
                          optionLabelProp="label"
                          :getPopupContainer="getPopupContainer"
                          :filterOption="filterOption"
                          :disabled="isOtherDep ||(!record.dept || !record.dept.length)"
                          :notFoundContent="fetching ? undefined : '暂无数据'"
                          @popupScroll="popupScroll"
                          allowClear>
                  <a-select-option v-for="user in orgUserList"
                                   :label="user.name"
                                   :key="user.id">{{ user.name }}</a-select-option>
                </a-select> -->
                <staff-selector
                  v-model="record.manager"
                  :params="StuffSelectParams"
                  :options="managerOpts"
                  :keepDeptIds="mainDeptKeepIds"
                  class="user-info-staff"
                  :showDetail="true"
                  @change="onCellChange(record.key, 'manager', $event)"
                />
              </template>

              <template slot="isMainDept" slot-scope="text, record">
                <a-checkbox
                  :checked="record.isMainDept"
                  :disabled="setDisabled(record)"
                  @change="
                    onCellChange(
                      record.key,
                      'isMainDept',
                      $event.target.checked,
                    )
                  "
                />
              </template>

              <template slot="action" slot-scope="text, record">
                <span
                  v-if="!isOtherDep"
                  class="action-btn"
                  @click="onDelete(record)"
                >
                  <i class="icon aufontAll h-icon-all-delete-o"></i>
                </span>
                <span v-else>- -</span>
              </template>
            </a-table>
          </div>
          <div class="add-row">
            <span v-if="!isOtherDep" @click="handleAdd">
              <span>
                <i class="icon aufontAll h-icon-all-plus-o"></i>
              </span>
              <span class="add-row-text">添加行</span>
            </span>
          </div>
        </div>
      </div>

      <!--联系方式-->
      <div v-if="!isOtherDep" class="box-item space-between">
        <div class="item-title">
          {{ $t('languages.User.Contact') }}
        </div>

        <div class="item-child">
          <div class="child-left">
            <p class="left-header required">
              {{ $t('languages.User.MobilePhone') }}
            </p>

            <div
              class="edit-text"
              :class="{ 'err-input': userValid.mobile.valid }"
            >
              <a-input
                v-model="userInfo.mobile"
                class="input-text"
                :maxLength="Length"
                :disabled="userType === 1"
                placeholder="请输入手机号码"
                @change="userValid.mobile.valid = false"
              />
              <p v-if="userValid.mobile.valid" class="err-tips">
                {{ userValid.mobile.errMsg }}
              </p>
            </div>
          </div>

          <div class="child-right">
            <p class="left-header">
              {{ $t('languages.User.OfficePhone') }}
            </p>
            <div class="edit-text">
              <a-input
                v-model="userInfo.officePhone"
                class="input-text"
                :maxLength="Length"
                placeholder="请输入电话"
              />
            </div>
          </div>
        </div>
        <div class="item-child">
          <div class="child-left">
            <p class="left-header">
              {{ $t('languages.User.Email') }}
            </p>
            <div
              class="edit-text"
              :class="{ 'err-input': userValid.email.valid }"
            >
              <a-input
                v-model="userInfo.email"
                class="input-text"
                :maxLength="maxLength"
                placeholder="请输入邮箱"
                @change="userValid.email.valid = false"
              />
              <p v-if="userValid.email.valid" class="err-tips">
                {{ userValid.email.errMsg }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="contactExtInfo.length">
          <div
            v-for="(row, index) in contactArr"
            :key="index"
            class="item-child"
          >
            <div class="child-left">
              <p class="left-header">
                {{ contactExtInfo[(row - 1) * 2].name }}
              </p>
              <div class="edit-text">
                <a-input
                  v-model="contactExtInfo[(row - 1) * 2].mapVal"
                  class="input-text"
                  :maxLength="otherLength"
                />
              </div>
            </div>
            <div v-if="contactExtInfo.length >= row * 2" class="child-right">
              <p class="left-header">
                {{ contactExtInfo[(row - 1) * 2 + 1].name }}
              </p>
              <div class="edit-text">
                <a-input
                  v-model="contactExtInfo[(row - 1) * 2 + 1].mapVal"
                  class="input-text"
                  :maxLength="otherLength"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="box-item space-between">
        <div class="item-title">
          {{ $t('languages.User.Contact') }}
        </div>
        <div class="item-child">
          <div class="child-left">
            <p class="left-header">
              {{ $t('languages.User.MobilePhone') + '：' }}
            </p>
            <p class="inner-text">
              {{ userInfo.mobile ? userInfo.mobile : '- -' }}
            </p>
          </div>
          <div class="child-right">
            <p class="left-header">
              {{ $t('languages.User.OfficePhone') + '：' }}
            </p>
            <p class="inner-text">
              {{ userInfo.officePhone ? userInfo.officePhone : '- -' }}
            </p>
          </div>
        </div>
        <div class="item-child">
          <div class="child-right">
            <p class="left-header">
              {{ $t('languages.User.Email') + '：' }}
            </p>
            <p class="inner-text">
              {{ userInfo.email ? userInfo.email : '- -' }}
            </p>
          </div>
        </div>
        <div v-if="contactExtInfo.length">
          <div
            v-for="(row, index) in contactArr"
            :key="index"
            class="item-child"
          >
            <div class="child-left">
              <p
                class="left-header"
                :title="contactExtInfo[(row - 1) * 2].name"
              >
                {{ contactExtInfo[(row - 1) * 2].name + '：' }}
              </p>
              <p
                class="inner-text"
                :title="contactExtInfo[(row - 1) * 2].mapVal"
              >
                {{ contactExtInfo[(row - 1) * 2].mapVal }}
              </p>
            </div>
            <div v-if="contactExtInfo.length >= row * 2" class="child-right">
              <p
                class="left-header"
                :title="contactExtInfo[(row - 1) * 2 + 1].name"
              >
                {{ contactExtInfo[(row - 1) * 2 + 1].name + '：' }}
              </p>
              <span
                class="inner-text"
                :title="contactExtInfo[(row - 1) * 2 + 1].mapVal"
                >{{ contactExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
            </div>
          </div>
        </div>
      </div>

      <!--员工信息-->
      <div
        class="box-item space-between"
        :class="{ last: otherExtInfo.length === 0 }"
      >
        <template v-if="!isOtherDep">
          <div class="item-title">
            {{ $t('languages.User.EmployeeInfo') }}
          </div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header">
                {{ $t('languages.User.EmployeeNumber') }}
              </p>
              <div
                class="edit-text"
                :class="{ 'err-input': userValid.employeeNo.valid }"
              >
                <a-input
                  v-model="userInfo.employeeNo"
                  class="input-text"
                  :maxLength="otherLength"
                  placeholder="请输入员工编号"
                  @change="userValid.employeeNo.valid = false"
                />
                <p v-if="userValid.employeeNo.valid" class="err-tips">
                  {{ userValid.employeeNo.errMsg }}
                </p>
              </div>
            </div>
            <div class="child-right">
              <p class="left-header">
                {{ $t('languages.User.EntryDate') }}
              </p>
              <div class="edit-text">
                <a-date-picker
                  v-model="userInfo.entryDate"
                  class="entry-date"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="item-title">
            {{ $t('languages.User.EmployeeInfo') }}
          </div>
          <div class="item-child">
            <div class="child-left">
              <p class="left-header">
                {{ $t('languages.User.EmployeeNumber') + '：' }}
              </p>
              <p class="inner-text">
                {{ userInfo.employeeNo ? userInfo.employeeNo : '- -' }}
              </p>
            </div>
            <div class="child-left">
              <p class="left-header">
                {{ $t('languages.User.EntryDate') + '：' }}
              </p>
              <p class="inner-text">
                {{ userInfo.entryDate ? userInfo.entryDate : '- -' }}
              </p>
            </div>
          </div>
        </template>

        <div v-if="orgExtInfo.length > 0">
          <div v-for="(row, index) in orgArr" :key="index" class="item-child">
            <div class="child-left">
              <p class="left-header">
                {{ orgExtInfo[(row - 1) * 2].name }}
              </p>
              <div class="edit-text">
                <a-input
                  v-model="orgExtInfo[(row - 1) * 2].mapVal"
                  class="input-text"
                  :maxLength="otherLength"
                />
              </div>
            </div>
            <div v-if="orgExtInfo.length >= row * 2" class="child-right">
              <p class="left-header">
                {{ orgExtInfo[(row - 1) * 2 + 1].name }}
              </p>
              <div class="edit-text">
                <a-input
                  v-model="orgExtInfo[(row - 1) * 2 + 1].mapVal"
                  class="input-text"
                  :maxLength="otherLength"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="otherExtInfo.length"
        class="box-item space-between"
        :class="{ last: otherExtInfo.length > 0 }"
      >
        <template v-if="!isOtherDep">
          <div class="item-title">其它信息</div>
          <div v-for="(row, index) in otherArr" :key="index" class="item-child">
            <div class="child-left">
              <p class="left-header">
                {{ otherExtInfo[(row - 1) * 2].name }}
              </p>
              <div class="edit-text">
                <a-input
                  v-model="otherExtInfo[(row - 1) * 2].mapVal"
                  class="input-text"
                  :maxLength="otherLength"
                />
              </div>
            </div>
            <div v-if="otherExtInfo.length >= row * 2" class="child-right">
              <p class="left-header">
                {{ otherExtInfo[(row - 1) * 2 + 1].name }}
              </p>
              <div class="edit-text">
                <a-input
                  v-model="otherExtInfo[(row - 1) * 2 + 1].mapVal"
                  class="input-text"
                  :maxLength="otherLength"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="item-title">其它信息</div>
          <div v-for="(row, index) in otherArr" :key="index" class="item-child">
            <div class="child-left">
              <p class="left-header" :title="otherExtInfo[(row - 1) * 2].name">
                {{ otherExtInfo[(row - 1) * 2].name + '：' }}
              </p>
              <p class="inner-text" :title="otherExtInfo[(row - 1) * 2].mapVal">
                {{ otherExtInfo[(row - 1) * 2].mapVal }}
              </p>
            </div>
            <div v-if="otherExtInfo.length >= row * 2" class="child-right">
              <p
                class="left-header"
                :title="otherExtInfo[(row - 1) * 2 + 1].name"
              >
                {{ otherExtInfo[(row - 1) * 2 + 1].name + '：' }}
              </p>
              <span
                class="inner-text"
                :title="otherExtInfo[(row - 1) * 2 + 1].mapVal"
                >{{ otherExtInfo[(row - 1) * 2 + 1].mapVal }}</span>
            </div>
          </div>
        </template>
      </div>

      <div class="footer">
        <a-button type="primary" @click="saveData"> 保存 </a-button>
      </div>
    </div>

    <import-people
      :visable="showImportPeople"
      :corpId="corpId"
      @changeVisable="changeShowImportPeople"
      @update="changePeoPleInfo"
    />
  </a-drawer>
</template>

<script lang="ts">
import appBaseApi from '@/apis/app-settings/base.api';
import OrgApi, { getUserExtList } from '@/apis/organization';
import common from 'cloudpivot/common/pc';
import getDownloadUrlNew from 'cloudpivot/common/src/utils/getDownloadUrlNew';
import StaffSelector from 'cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import {
  Table,
  Select,
  Tooltip,
  Drawer,
  Button,
  Upload,
  Avatar,
  Input,
  Checkbox,
  DatePicker,
} from '@h3/antd-vue';
import moment from 'moment';
import UUID from 'uuidjs';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import ImportPeople from './import-people.vue';

@Component({
  name: 'add-user',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    StaffSelector,
    RoleSelect: common.components.RoleSelect,
    ImportPeople,
    ATable: Table,
    ATooltip: Tooltip,
    ADrawer: Drawer,
    AButton: Button,
    AUpload: Upload,
    AAvatar: Avatar,
    AInput: Input,
    ACheckbox: Checkbox,
    ADatePicker: DatePicker,
  },
})
export default class AddUser extends Vue {
  // @UserModule.State("unitTitleObj") unitTitleObj: any;
  @Prop() value!: boolean;

  @Prop() unitTitleObj!: any;

  @Prop() userType!: number; // 0：新增，1：编辑

  @Prop() userData!: any;

  @Prop() bannedSwitch!: boolean;

  columns: any = [
    {
      dataIndex: 'dept',
      width: '30%',
      slots: { title: 'departmentTitle' },
      scopedSlots: { customRender: 'dept' },
    },
    {
      dataIndex: 'manager',
      slots: { title: 'managerTitle' },
      width: '30%',
      scopedSlots: { customRender: 'manager' },
    },
    {
      slots: { title: 'mainTitle' },
      dataIndex: 'isMainDept',
      width: '30%',
      scopedSlots: { customRender: 'isMainDept' },
    },
    {
      slots: { title: 'actionTitle' },
      dataIndex: 'action',
      width: '100px',
      scopedSlots: { customRender: 'action' },
    },
  ];

  dataSource: any = [
    {
      key: 0,
      dept: [],
      // manager: {
      //   id: '',
      //   name: ''
      // },
      manager: null,
      isMainDept: false,
    },
  ];

  page = 0;

  loadedAll = false; // 全部数据加载完成

  fetching = false;

  get corpId() {
    const { corpId } = this.unitTitleObj;
    return corpId;
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  // 主组织自维护，新增人员要隐藏导入 入口
  get showImportBtn() {
    const { relatedSyncType, relatedOrgType } = this.unitTitleObj;
    return relatedSyncType === 'PUSH' && relatedOrgType === 'MAIN';
  }

  codeProp: string = 'code';

  keepRolesList: any = [{ code: 'SYS_2000000' }, { code: 'SYS_1000000' }];

  userVisible: boolean = false;

  maxLength: number = 50;

  // userInfoLength: number = 32;

  otherLength: number = 32;

  Length: number = 20;

  userExtList: Array<any> = [];

  modalTitle: string = '新建用户信息';

  userInfo: any = {
    name: '',
    mobile: '',
    userId: '',
    // departmentNames: [],
    roleIds: [],
    userExtAttrModels: [],
  };

  userValid: any = {
    name: {
      valid: false,
      errMsg: '仅支持字母数字中文,中间空格(50个字符内)',
    },
    username: {
      valid: false,
      errMsg: '仅支持字母数字,下划线(20个字符以内)',
    },
    // mainDepartment: {
    //   valid: false,
    //   errMsg: "主部门不允许为空",
    // },
    mobile: {
      valid: false,
      errMsg: '请输入正确的手机号码',
    },
    email: {
      valid: false,
      errMsg: '邮箱格式错误',
    },
    employeeNo: {
      valid: false,
      errMsg: '员工编号只允许字母和数字',
    },
  };

  mainDepartment: any = []; // 主部门

  orgUserList: any = [];

  uploading: boolean = false; // 是否上传中

  file: File | null = null; // 上传的图片文件

  deptOpts: any = {
    selectOrg: true,
    selectUser: false,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true,
    rootNode: [],
  };

  managerOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: false,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    appManagerFilter: true,
    rootNode: [],
  };

  // 导入人员参数
  showImportPeople: boolean = false;

  isImportPeople: boolean = false;

  // 当前用户所属组织的corpId
  curCorpId: string = '';

  // 当前用户所属部门的id
  selectDepId: string = '';

  mainDeptKeepIds: string[] = [];

  partTimeDeptKeepIds: string[] = [];

  basicArr: number[] = [];

  contactArr: number[] = [];

  orgArr: number[] = [];

  otherArr: number[] = [];

  get isOtherDep() {
    // 非自维护组织且为允许编辑
    return this.userInfo.relatedSyncType !== 'PUSH' && this.bannedSwitch;
  }

  get roleParams() {
    // if (this.userType === 1) {return {}} ;
    // // 新增人员的时候需要过滤主管角色
    return { roleType: 'SYS' };
  }

  get StuffSelectParams() {
    const { userType } = this;
    const cid: string = userType === 1 ? this.curCorpId : this.corpId;
    return { corpId: cid, filterType: 'admin_corp' };
  }

  setDisabled(record: any) {
    return !record.dept || !record.dept.length || this.dataSource.length === 1;
  }

  getPopupContainer(triggerNode: any) {
    return triggerNode.parentNode.parentNode.parentNode.parentNode.parentNode
      .parentNode;
  }

  popupScroll($ev) {
    if (
      $ev.target.scrollHeight <
      $ev.target.offsetHeight + $ev.target.scrollTop + 64
    ) {
      // 滚动到底||加载全部数据
      if (this.fetching || this.loadedAll) {
        return;
      }
      this.page++;
      this.getOrgUserList(this.selectDepId, this.page);
    }
  }

  filterOption(input: any, option: any) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  onFocus(record: any) {
    if (record.dept && record.dept[0].id) {
      this.orgUserList = [];
      const id: string = record.dept[0].id;
      this.getOrgUserList(id);
    }
  }

  setManageDefaultValue(val: any) {
    if (val) {
      return val.name;
    }
    return '';
  }

  onSelectChange(value: any) {
    console.log(value, 'value');
  }

  async getOrgUserList(id: any, page?: number, value?: any) {
    if (!page) {
      this.page = 0;
    }
    const params: any = {
      deptId: id,
      page: page === undefined ? 0 : page,
      size: 100,
      filterType: 'admin',
    };
    if (this.fetching) {
      return;
    }
    this.fetching = true;
    const res: any = await OrgApi.getOrgList(params);
    if (!res.errcode && res.data && res.data.content) {
      this.fetching = false;
      let dataList: any = [];
      const data: any = res.data.content;
      if (this.userType === 1) {
        dataList = data.filter((item: any) => item.id !== this.userData.id);
      } else {
        dataList = data;
      }
      console.log(dataList, 'dataList');
      if (page && page > 0) {
        this.orgUserList = [...this.orgUserList, ...dataList];
      } else {
        this.orgUserList = dataList;
      }
      this.loadedAll = res.data.totalElements === this.orgUserList.length;
    } else {
      this.fetching = false;
      this.orgUserList = [];
    }
  }

  // 获取当前用户的信息
  async getUserInfo(user: any) {
    const params = {
      id: user.id,
    };
    const res = await OrgApi.getOrgUserInfo(params);
    if (res.errcode === 0 && res.data) {
      this.curCorpId = res.data.corpId;
      this.userInfo = res.data;
      this.userInfo.entryDate = this.userInfo.entryDate
        ? moment(this.userInfo.entryDate, 'YYYY-MM-DD')
        : null;
      this.isImportPeople = res.data.isImport;
      // 设置主部门
      this.mainDepartment = this.userInfo.mainDepartmentName
        ? [
            {
              name: this.userInfo.mainDepartmentName.name,
              id: this.userInfo.mainDepartmentName.id,
              unitType: 1,
              operatable: this.userInfo.mainDepartmentName.operatable,
            },
          ]
        : [];
      this.mainDeptKeepIds = this.mainDepartment.map((item: any) => {
        if (!item.operatable) {
          return item.id;
        }
      });
      // this.partTimeDeptKeepIds = (res.data.departmentNames || []).map(
      //     (item: any) => {
      //       if (!item.operatable) {
      //         return item.id;
      //       }
      //     }
      // );
    }
  }

  // 获取当前用户部门列表
  async getUserDepInfo(userId: string) {
    const params = {
      userId,
    };
    const res = await OrgApi.getOrgUserDepList(params);
    if (res.errcode === 0 && res.data) {
      const data: any = res.data;
      if (data.length > 0) {
        data.forEach((item: any) => {
          item.key = UUID.generate();
          if (item.isMainDept) {
            item.dept[0].parentDepartmentName =
              this.userInfo &&
              this.userInfo.mainDepartmentName &&
              this.userInfo.mainDepartmentName.mainDeptPath;
          } else {
            item.dept[0].parentDepartmentName =
              this.userInfo.departmentNames.find((i: any) => {
                return i.id === item.dept[0].id;
              }).mainDeptPath;
          }
        });
      }
      this.dataSource = data;
    }
  }

  // 单元格事件
  onCellChange(key, dataIndex, value, record?: any) {
    console.log(key, 'key');
    console.log(dataIndex, value, 'dataIndex');

    // 其他组织不支持反选
    if (this.isOtherDep && !value) {
      return;
    }

    const dataSource: any = [...this.dataSource];
    const target: any = dataSource.find((item) => item.key === key);
    if (target) {
      if (dataIndex === 'isMainDept') {
        // 主部门只有一个
        this.dataSource.forEach((item: any) => {
          item.isMainDept = false;
        });
        if (value) {
          this.mainDepartment = target['dept']; // 设置原先的主部门
        }
        target[dataIndex] = value;
      } else if (dataIndex === 'dept') {
        // 清空部门 直属主管要清空 主部门无
        if (Array.isArray(value) && value.length === 0) {
          // target['manager'] =  {
          //   id: '',
          //   name: '',
          // }
          target['manager'] = null;
          target['isMainDept'] = false;
        }
        target[dataIndex] = value;
      } else if (dataIndex === 'manager') {
        const selectItem: any = value[0];
        if (value && value[0] && value[0].id) {
          // selectItem = this.orgUserList.find((item:any) => item.id === value[0].id);
          target['manager'] = {
            id: value[0].id,
            name: selectItem ? selectItem.name : '',
          };
        }
        // target[dataIndex] = {
        //   id: value && value[0] && value[0].id,
        //   name: selectItem ? selectItem.name : '',
        // };
      } else {
        //Else Empty block statement
      }
      this.dataSource = dataSource;
    }
  }

  onDelete(record: any) {
    if (record.isMainDept) {
      return this.$message.warning('主部门不能删除!');
    }
    const dataSource = [...this.dataSource];
    const key: string = record.key;
    const data: any = dataSource.filter((item) => item.key !== key);
    if (Array.isArray(data) && data.length === 1) {
      data[0].isMainDept = true;
    }
    this.dataSource = data;
  }

  handleAdd() {
    const { dataSource } = this;
    const newData = {
      key: UUID.generate(),
      dept: [],
      // manager: {
      //   id: '',
      //   name: ''
      // },
      manager: null,
      isMainDept: false,
    };
    console.log(this.dataSource, 'this.dataSource');
    this.dataSource = [...dataSource, newData];
  }

  /**
   * @desc 导入人员
   */
  changePeoPleInfo(info) {
    if (info) {
      const { name, mobile, username } = info;
      this.userInfo.name = name;
      this.userInfo.mobile = mobile;
      this.userInfo.userId = username;
      this.isImportPeople = true;
    } else {
      this.userInfo.name = '';
      this.userInfo.mobile = '';
      this.userInfo.userId = '';
      this.isImportPeople = false;
    }

    this.changeShowImportPeople(false);
  }

  /**
   * @desc 切换展示容易有人员导入弹框
   */
  changeShowImportPeople(showImportPeople) {
    this.showImportPeople = showImportPeople;
  }

  /*
   * 选择角色
   */
  selectRole(value: any[]) {
    if (!value || !value.length) {
      this.userInfo.roleIds = [];
      return;
    }
    this.userInfo.roleIds = value.map((role: any) => {
      return role.id;
    });
  }

  /**
   * 获取上传的应用图标并判断是否符合限制
   */
  beforeUpload(file: File) {
    this.uploading = true;
    this.$nextTick(() => {
      this.uploading = false;
    });
    const isPic = ['image/jpeg', 'image/png'].includes(file.type);
    const isLimitSize = file.size / 1024 < 100;
    if (!isPic) {
      this.$message.error(
        this.$t('languages.appSettings.PlzUploadImageFile') as string,
      );
      return;
    }
    if (!isLimitSize) {
      this.$message.error(
        this.$t('languages.appSettings.ImageSizeTip', {
          size: '100KB',
        }) as string,
      );
      return;
    }
    if (isPic && isLimitSize) {
      this.file = file;
      const URL = window.URL || (window as any).webkitURL;
      this.userInfo.imgUrl = URL.createObjectURL(file);
    }
  }

  getDownloadUrlNew(refId: string) {
    if (!refId) {
      return '';
    } else if (refId.indexOf('http') > -1) {
      return refId;
    } else {
      return getDownloadUrlNew.getImageUrl(refId);
    }
  }

  // 保存
  async saveData() {
    console.log(this.dataSource, 'dataSource');
    const hasDep: any = this.dataSource.filter((item: any) => item.isMainDept);
    if (!hasDep || hasDep.length === 0) {
      return this.$message.error('主部门不能设置为空');
    }
    // if(!this.isImportPeople) { // 不是导入的，全部需要校验
    const isDataOk: boolean = this.validInfo();
    if (!isDataOk) {
      return;
    }
    const UserList: any = this.dataSource.map((item: any) => {
      return {
        deptId: item.dept.length > 0 ? item.dept[0].id : '',
        managerId: item.manager ? item.manager.id : '',
      };
    });
    // console.log(UserList, 'UserList');
    const userManagerConfigList: any = UserList.filter(
      (item: any) => item.deptId,
    );
    let imgUrl = '';
    if (this.file) {
      this.uploading = true;
      const res: any = await appBaseApi.uploadFile({
        file: this.file,
        rewriteFilename: false,
      });
      this.userInfo.imgUrlId = res.data.refId;
      this.uploading = false;
      this.file = null;
      imgUrl = `${res.data.refId}` as any;
    }
    // 兼职部门
    const otherDep: any =
      Array.isArray(this.dataSource) && this.dataSource.length > 0
        ? this.dataSource
            .filter((item: any) => !item.isMainDept && item.dept[0])
            .map((dept: any) => dept.dept[0])
        : [];
    // console.log(otherDep, 'otherDep');
    const deptIds =
      otherDep.length > 0 ? otherDep.map((dept: any) => dept.id) : [];

    const entryTime = this.userInfo.entryDate
      ? moment(this.userInfo.entryDate).format('YYYY-MM-DD')
      : null;

    // 拓展字段允许修改传参
    const userExtAllList: any[] = this.basicExtInfo
      .concat(this.contactExtInfo)
      .concat(this.orgExtInfo)
      .concat(this.otherExtInfo);
    const userExtParams: any[] = userExtAllList.map((item) => {
      return {
        userId: this.userInfo.id,
        extendAttrId: item.id,
        mapVal: item.mapVal,
      };
    });

    if (this.userType === 1) {
      // 编辑用户接口
      const params: any = {
        departmentId: this.mainDepartment[0] ? this.mainDepartment[0].id : '', // 主部门
        deptIds,
        roleIds: this.userInfo.roleIds,
        username: this.userInfo.userId,
        name: this.userInfo.name,
        mobile: this.userInfo.mobile,
        officePhone: this.userInfo.officePhone,
        email: this.userInfo.email,
        employeeNo: this.userInfo.employeeNo,
        entryTime,
        // imgUrl: imgUrl ? imgUrl : this.userInfo.imgUrl,
        imgUrl: this.userInfo.imgUrlId,
        imgUrlId: this.userInfo.imgUrlId,
        id: this.userInfo.id,
        userUnion: userExtParams,
        userManagerConfigList,
      };

      OrgApi.updateUser(params).then((res: any) => {
        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }

        this.$message.success('编辑用户成功！');
        this.$emit('reloadTree');
        this.onCloseInfoModal();
      });
    } else {
      // 新建用户接口
      const params: any = {
        departmentId: this.mainDepartment[0] ? this.mainDepartment[0].id : '',
        deptIds,
        roleIds: this.userInfo.roleIds,
        username: this.userInfo.userId,
        name: this.userInfo.name,
        mobile: this.userInfo.mobile,
        officePhone: this.userInfo.officePhone,
        email: this.userInfo.email,
        employeeNo: this.userInfo.employeeNo,
        entryTime,
        // imgUrl: imgUrl ? imgUrl : this.userInfo.imgUrl,
        imgUrl: this.userInfo.imgUrlId,
        imgUrlId: this.userInfo.imgUrlId,
        userUnion: userExtParams,
        userManagerConfigList,
      };
      // 导入人员需要做区分
      if (this.isImportPeople) {
        params.isImport = true;
      }
      OrgApi.addUser(params).then((res: any) => {
        if (res.errcode) {
          this.$message.error(res.errmsg);
          return;
        }

        this.$message.success('新建用户成功！');
        this.$emit('reloadTree');
        this.onCloseInfoModal();
      });
    }
    this.$emit('watchChild');
  }

  isAdd() {
    return this.userType !== 1;
  }

  // 校验用户信息合法性
  validInfo() {
    let flag = true;
    // 校验用户姓名
    if (
      this.isAdd() &&
      (!this.userInfo.name ||
        !/^[\w\u4e00-\u9fa5\-_][\s\w\u4e00-\u9fa5\-_]*[\w\u4e00-\u9fa5\-_]$/.test(
          this.userInfo.name,
        ))
    ) {
      // 仅限50个字符以内中文数字字母 允许中间空格，并不能以空格开头和结尾
      this.userValid.name.valid = true;
      flag = false;
    }

    // 校验用户账号
    if (
      this.isAdd() &&
      (!this.userInfo.userId ||
        !/^[_a-zA-Z0-9_]{1,20}$/.test(this.userInfo.userId))
    ) {
      // 仅支持字母、数字、不超过20个字符
      this.userValid.username.valid = true;
      flag = false;
    }

    // 校验主部门
    // if (!this.mainDepartment || !this.mainDepartment.length) {
    //   this.userValid.mainDepartment.valid = true;
    //   flag = false;
    // }

    // 校验手机号
    if (
      this.isAdd() &&
      !/^1[3|4|5|6|7|8|9][0-9]{9}$/.test(this.userInfo.mobile)
    ) {
      this.userValid.mobile.valid = true;
      flag = false;
    }

    // 校验邮箱
    if (
      this.userInfo.email &&
      !/^\w+([-+.]\w+)*@\w+([-.]\\w+)*\.\w+([-.]\w+)*$/.test(
        this.userInfo.email,
      )
    ) {
      this.userValid.email.valid = true;
      flag = false;
    }

    // 校验员工编号
    if (
      this.userInfo.employeeNo &&
      !/^[a-zA-Z0-9]{1,32}$/.test(this.userInfo.employeeNo)
    ) {
      // 仅支持字母、数字、不超过20个字符
      this.userValid.employeeNo.valid = true;
      flag = false;
    }

    return flag;
  }

  resetUserValid() {
    this.userValid = {
      name: {
        valid: false,
        errMsg: '用户姓名不合法',
      },
      username: {
        valid: false,
        errMsg: '账号不合法',
      },
      // mainDepartment: {
      //   valid: false,
      //   errMsg: "主部门不允许为空",
      // },
      mobile: {
        valid: false,
        errMsg: '手机号格式不合法',
      },
      email: {
        valid: false,
        errMsg: '邮箱格式错误',
      },
      employeeNo: {
        valid: false,
        errMsg: '员工编号只允许字母和数字',
      },
    };
  }

  onCloseInfoModal() {
    this.userVisible = false;
    this.isImportPeople = false;
    this.selectDepId = '';
    this.orgUserList = [];
    this.userInfo = {
      // departmentNames: [],
      roleIds: [],
      name: '',
      mobile: '',
      userId: '',
      userExtAttrModels: [],
    };
    this.dataSource = [
      {
        userId: 0,
        dept: [],
        // manager: {
        //   id: '',
        //   name: ''
        // },
        manager: null,
        isMainDept: false,
      },
    ];
    this.resetUserValid();
    this.$emit('input', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.userVisible = v;
    if (!v) {
      return;
    }
    if (this.userType === 1) {
      this.modalTitle = '编辑用户信息';
      this.selectDepId = this.userData.departmentId;
      this.getUserInfo(this.userData).then(() => {
        this.getUserDepInfo(this.userData.id);
      });
    } else {
      this.modalTitle = '新建用户信息';
      this.selectDepId = this.unitTitleObj.id;
      const mainDep: any = {
        name: this.unitTitleObj.name,
        id: this.unitTitleObj.id,
        unitType: 1,
      };
      this.mainDepartment = [mainDep];
      this.dataSource[0].dept = [mainDep];
      this.dataSource[0].isMainDept = true;
      this.getUserExtList();
    }
  }

  get basicExtInfo() {
    if (
      Array.isArray(this.userInfo.userExtAttrModels) &&
      this.userInfo.userExtAttrModels.length > 0
    ) {
      const basicArrInfo = this.userInfo.userExtAttrModels.filter((x) => {
        return x.belong === 'base' && x.enable === 1;
      });
      basicArrInfo.sort((a, b) => {
        const aTime = new Date(a.createdTime).getTime();
        const bTime = new Date(b.createdTime).getTime();
        return aTime - bTime;
      });

      this.basicArr = this.generateDynamicArr(basicArrInfo, 2);
      return basicArrInfo;
    } else {
      this.basicArr = [];
      return [];
    }
  }

  get contactExtInfo() {
    if (
      Array.isArray(this.userInfo.userExtAttrModels) &&
      this.userInfo.userExtAttrModels.length > 0
    ) {
      const contactArrInfo = this.userInfo.userExtAttrModels.filter((x) => {
        return x.belong === 'contact' && x.enable === 1;
      });
      contactArrInfo.sort((a, b) => {
        const aTime = new Date(a.createdTime).getTime();
        const bTime = new Date(b.createdTime).getTime();
        return aTime - bTime;
      });
      this.contactArr = this.generateDynamicArr(contactArrInfo, 2);
      return contactArrInfo;
    }
    this.contactArr = [];
    return [];
  }

  get orgExtInfo() {
    if (
      Array.isArray(this.userInfo.userExtAttrModels) &&
      this.userInfo.userExtAttrModels.length > 0
    ) {
      const orgArrInfo = this.userInfo.userExtAttrModels.filter((x) => {
        return x.belong === 'org' && x.enable === 1;
      });
      orgArrInfo.sort((a, b) => {
        const aTime = new Date(a.createdTime).getTime();
        const bTime = new Date(b.createdTime).getTime();
        return aTime - bTime;
      });
      this.orgArr = this.generateDynamicArr(orgArrInfo, 2);
      return orgArrInfo;
    }
    this.orgArr = [];
    return [];
  }

  get otherExtInfo() {
    if (
      Array.isArray(this.userInfo.userExtAttrModels) &&
      this.userInfo.userExtAttrModels.length > 0
    ) {
      const otherArrInfo = this.userInfo.userExtAttrModels.filter((x) => {
        return x.belong === 'other' && x.enable === 1;
      });
      otherArrInfo.sort((a, b) => {
        const aTime = new Date(a.createdTime).getTime();
        const bTime = new Date(b.createdTime).getTime();
        return aTime - bTime;
      });
      this.otherArr = this.generateDynamicArr(otherArrInfo, 2);
      return otherArrInfo;
    }
    this.otherArr = [];
    return [];
  }

  // 根据实际数组创建行数组，用于循环输出
  generateDynamicArr(source: any[], column = 2) {
    const arr: number[] = [];
    if (Array.isArray(source) && source.length > 0) {
      let row: number = 1;
      arr.push(row);
      while (row * column < source.length) {
        row++;
        arr.push(row);
      }
    }
    return arr;
  }

  getUserExtList() {
    const userExtparams: Organization.searchDemissionUserParams = {
      page: 0,
      size: 1000,
    };
    getUserExtList(userExtparams)
      .then((res: any) => {
        if (res.errcode === 0 && res.data && Array.isArray(res.data.content)) {
          this.userInfo.userExtAttrModels = res.data.content.filter((x) => {
            return x.corpId === this.corpId;
          });
        }
      })
      .catch(() => {})
      .finally(() => {});
  }
}
</script>

<style lang="less">
.add-user-drawer {
  .ant-drawer-body {
    padding-top: 0;
    padding-left: 0;
  }
  .ant-drawer-wrapper-body {
    overflow: hidden;
  }

  .importFromBtn {
    position: absolute;
    right: 60px;
    top: 18px;
  }
  .add-user-wrapper {
    padding: 0;
    height: 100%;
    overflow: auto;
    padding-left: 24px;

    .role-selector__span {
      float: left;
    }

    .box-item {
      padding: 21px 0 19px;
      border-bottom: 1px solid rgb(232, 232, 232);
      &.last {
        border-bottom: 0 none;
        padding-bottom: 50px;
      }
      .item-title {
        padding-bottom: 6px;
        text-align: left;
        font-size: 16px;
        color: #000;
        font-weight: 600;
      }

      &.space-between {
        .item-child {
          display: flex;
          justify-content: space-between;
          .child-left,
          .child-right {
            display: flex;
            .edit-text {
              flex: 1;
            }
          }
          .child-content {
            display: flex;
            .edit-text {
              flex: 1;
            }
          }
        }
      }

      .item-child {
        font-size: 0;
        padding: 8px 0;
        p,
        .edit-text {
          display: inline-block;
          vertical-align: top;
          margin-bottom: 0;
        }
        .edit-text {
          width: 70%;
          .ant-radio-wrapper {
            margin-right: 46px;
          }
          .entry-date {
            width: 100%;
          }
          /deep/ .h3-organization__label {
            max-height: 33px;
            overflow-y: auto;
            overflow-x: hidden;
            white-space: normal;
          }
          &.err-input {
            position: relative;
            /deep/ .ant-input,
            .h3-organization__label {
              border-color: #f5222d !important;
              &:focus {
                box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
              }
            }
            .err-tips {
              font-size: 12px;
              color: #f5222d;
              text-align: left;
              line-height: 20px;
              position: absolute;
              top: 30px;
              left: 8px;
            }
          }
        }
        .item-avator-name {
          display: inline-block;
          vertical-align: top;
          font-size: 14px;
        }
        .item-avator {
          display: inline-block;
          vertical-align: top;
          border-radius: 4px;
          overflow: hidden;
          .avator-tips {
            font-size: 14px;
            margin-top: 8px;
            color: rgba(17, 18, 24, 0.5);
          }
        }
        .child-left,
        .child-right,
        .child-content {
          font-size: 14px;
        }
        .child-left,
        .child-right {
          display: inline-block;
          vertical-align: top;
          width: 48%;
        }
        .child-content {
          width: 100%;
          .edit-text {
            width: 85%;
            .role-selector__wrap {
              width: 100%;
              .role-selector__input {
                width: 100%;
              }
            }
          }
        }
        .left-header {
          width: 80px;
          margin-right: 8px;
          color: rgba(17, 18, 24, 0.5);
          line-height: 32px;
          &.required {
            position: relative;
            &:before {
              content: '*';
              color: @error-color;
              position: absolute;
              left: -0.5em;
            }
          }
        }
      }
    }
    .footer {
      text-align: center;
      position: absolute;
      padding: 10px 16px;
      left: 0;
      bottom: 0;
      width: 100%;
      z-index: 6;
      background: #fff;
      border-top: 1px solid #e8e8e8;
    }
  }
  .item-avator__icon {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    span {
      font-size: 64px;
      line-height: 64px;
      color: #ffb131;
    }
    i {
      visibility: hidden;
    }
    &:hover,
    &--loading {
      i {
        position: absolute;
        z-index: 9;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        color: #fff;
        text-align: center;
        line-height: 64px;
      }
      &:after {
        content: '';
        display: block;
        position: absolute;
        z-index: 5;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(17, 18, 24, 0.5);
      }
    }
    &:hover:not(.item-avator--loading) {
      i.h-icon-all-form-o {
        visibility: visible;
      }
    }
    &--loading {
      i.h-icon-all-loading-o {
        visibility: visible;
        animation: rotating 1s linear infinite;
      }
    }
  }
  .add-row {
    display: flex;
    color: @primary-color;
    cursor: pointer;
    span {
      font-size: 14px;
      line-height: 30px;
    }
    .add-row-text {
      padding-left: 8px;
    }
  }
  .action-btn {
    cursor: pointer;
    color: rgba(17, 18, 24, 0.5);
  }
  .department-table {
    table {
      padding: 0;
      .ant-table-tbody {
        tr {
          td {
            padding-left: 33px !important;
          }
        }
      }
      .ant-table-thead {
        box-shadow: 0px -1px 0px 0px rgba(232, 232, 232, 1);
        border-radius: 4px 4px 0px 0px;
        overflow: hidden;
      }

      tr {
        td,
        th {
          padding: 8px 16px;
          padding-top: 9px;

          &:nth-child(1) {
            // width: calc(48 / 542 * 100%);
            min-width: 48px;
            //text-align: center;
          }

          .resize {
            .line {
              display: inline-block;
              vertical-align: middle;
              margin-right: 16px;
              width: 1px;
              height: 22px;
              background: rgba(232, 232, 232, 1);
            }
          }
        }

        th {
          color: #111218 !important;
        }

        td {
          padding: 6px 16px;
          padding-top: 7px;

          // padding-left: 34px;

          &:first-child {
            padding-left: 16px;
          }
        }
      }
    }
  }
}
.manager-select {
  width: 100%;
}

.department-table {
  .ant-table-thead {
    th {
      background-color: #f5f6f9;
      span {
        color: #111218;
      }
    }
  }
  .ant-table-tbody {
    td {
      .h3-organization-selected-name {
        color: #111218;
      }
    }
  }
}
</style>
