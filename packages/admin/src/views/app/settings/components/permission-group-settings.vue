<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div>
    <div class="model-bar">
      <div class="header-bar">
        <h4 class="model-title" @click="cancel">
          {{ $t('languages.appSettings.PermissionGroupSetting') }}
        </h4>
        <div v-if="groupName" class="model-name-wrap">
          <span class="model-name">{{ groupName }}</span>
          <i class="icon aufontAll h-icon-all-close close" @click="close"></i>
        </div>
      </div>
    </div>

    <div class="group-settings-wrap">
      <!-- 模型名称 -->
      <div class="model-menu">
        <div class="menu-tree">
          <div class="menu-content">
            <div
              v-for="childItem in childrenList"
              :key="childItem.key"
              class="menu-item"
              :title="childItem.name"
              :class="{ active: childItem.key === modelKey ? true : false }"
              @click="choiceModal(childItem.key, childItem.schemaCode)"
            >
              {{ childItem.name }}
            </div>
          </div>
        </div>
      </div>
      <!-- 权限设置 -->
      <div class="model-settings">
        <template>
          <div v-for="(item, index) in list" :key="index" class="panel-content">
            <template>
              <div
                v-for="(childItem, childIndex) in item.children"
                :key="childIndex"
              >
                <div
                  v-if="childItem.key === modelKey"
                  class="permission-group-panel-wrapper"
                >
                  <div class="permission-group-panel-item">
                    <h3>模型权限</h3>

                    <div class="item-title">
                      <span>
                        <span class="sub-title">{{
                          $t('languages.appSettings.visible')
                        }}</span>
                        <a-switch
                          v-if="childItem.visible !== undefined"
                          :checked="childItem.visible"
                          size="small"
                          @change="(e) => setField(childItem, 'visible', e)"
                        />
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="
                      childItem.dataPermissionType !== undefined &&
                      childItem.nodeType !== 'Page' &&
                      childItem.nodeType !== 'Report'
                    "
                    class="permission-group-panel-item"
                  >
                    <h3>
                      {{ $t('languages.appSettings.dataPermission') }}
                      <a-tooltip v-if="dataCopy.modelType === 'TREE'">
                        <div slot="title">
                          <span> 树形模型的数据权限可传递, </span><br />
                          <span> 即用户能看到第一层数据,也 </span><br />
                          <span> 有权看到其下所有子数据 </span>
                        </div>
                        <a-icon type="question-circle-o" />
                      </a-tooltip>
                    </h3>

                    <div class="item-list">
                      <a-radio-group
                        v-model="childItem.dataPermissionType"
                        @change="
                          (e) => {
                            dataPermissionSelect(
                              childItem,
                              e.target.value,
                              index,
                              childIndex,
                            );
                          }
                        "
                      >
                        <a-radio :value="1">
                          {{ $t('languages.appSettings.AllVisible') }}
                        </a-radio>
                        <a-radio :value="3">
                          {{ $t('languages.appSettings.OnlySelf') }}
                        </a-radio>
                        <a-radio :value="2">
                          {{ $t('languages.appSettings.MyDepartment') }}
                        </a-radio>
                        <a-radio
                          v-if="groupDataInfo.authorType === 1"
                          :value="5"
                        >
                          {{ $t('languages.appSettings.RoleManagerRange') }}
                        </a-radio>
                        <a-radio
                          v-if="groupDataInfo.authorType === 1"
			   :disabled="isAccountDisap"
                          :value="6"
                        >
                          {{ $t('languages.appSettings.AccounManagerRange') }}
                        </a-radio>
                        <a-radio :value="4">
                          {{ $t('languages.appSettings.Customize') }}
                        </a-radio>
                      </a-radio-group>
                      <!-- 自定义显示条件 -->
                      <dataitem-condition
                        ref="condition"
                        :permission="childItem"
                        @updateCondition="handleConditionData"
                      />
                    </div>
                  </div>

                  <div
                    v-if="
                      childItem.actionPermission &&
                      childItem.nodeType !== 'Page' &&
                      childItem.nodeType !== 'Report'
                    "
                    class="permission-group-panel-item"
                  >
                    <h3>
                      {{ $t('languages.appSettings.permissionAction') }}
                    </h3>
                    <div class="item-list">
                      <a-checkbox-group
                        :value="getChoiceData"
                        @change="
                          (e) => {
                            actionPermissionSelect(
                              e,
                              childItem.actionPermission,
                            );
                          }
                        "
                      >
                        <a-checkbox value="creatable">
                          {{ $t('languages.appSettings.Add') }}
                        </a-checkbox>
                        <a-checkbox value="editable">
                          {{ $t('languages.appSettings.Edit') }}
                        </a-checkbox>
                        <a-checkbox value="deletable">
                          {{ $t('languages.appSettings.Delete') }}
                        </a-checkbox>
                        <a-checkbox value="importable">
                          {{ $t('languages.appSettings.Import') }}
                        </a-checkbox>
                        <a-checkbox value="exportable">
                          {{ $t('languages.appSettings.Export') }}
                        </a-checkbox>
                        <a-checkbox value="printAble">
                          {{ $t('languages.appSettings.PrintQr') }}
                        </a-checkbox>
                        <a-checkbox value="editOwnerAble">
                          {{ $t('languages.appSettings.UpdateOwner') }}
                        </a-checkbox>
                        <a-checkbox value="batchPrintAble">
                          {{ $t('languages.appSettings.printTemp') }}
                        </a-checkbox>
                        <a-checkbox value="batchUpdateAble">
                          {{ $t('languages.appSettings.batchUpdate') }}
                        </a-checkbox>
                        <a-checkbox
                          v-for="(items, ind) in customRulesList"
                          :key="ind"
                          :value="items.code"
                        >
                          {{ items.name }}
                        </a-checkbox>
                      </a-checkbox-group>
                      <!-- <a-checkbox-group
                      >
                        <a-checkbox  
                          v-for="(items, ind) in customRulesList" 
                          :key="ind"
                          :value="items.code"
                        >
                          {{ items.name }}
                        </a-checkbox>
                      </a-checkbox-group> -->
                    </div>
                  </div>

                  <!-- 表单数据权限 -->
                  <div
                    v-if="
                      childItem.dataPermissionType !== undefined &&
                      childItem.nodeType !== 'Page' &&
                      childItem.nodeType !== 'Report'
                    "
                    class="permission-group-panel-item"
                    style="padding-top: 0px"
                  >
                    <h3>表单数据项权限</h3>
                    <div
                      class="item-list _item-list"
                      style="flex-direction: column"
                    >
                      <section
                        v-if="childItem.propertityPermissionGroups"
                        class="data-permission-handler__tabs"
                      >
                        <div class="tab-wrapper">
                          <a-tabs
                            v-model="childItem.bizPermType"
                            :animated="false"
                          >
                            <a-tab-pane key="1" tab="新增时">
                              <data-item
                                :tableHeight="height"
                                :dataItems="
                                  getCurrentDataItems(
                                    childItem.propertityPermissionGroups,
                                    1,
                                  )
                                "
                                :bizPermType="childItem.bizPermType"
                                @propertityPermissionGroupsChange="
                                  propertityPermissionGroupsChange(
                                    $event,
                                    childItem,
                                  )
                                "
                              />
                            </a-tab-pane>
                            <a-tab-pane key="2" tab="查看时">
                              <data-item
                                :tableHeight="height"
                                :dataItems="
                                  getCurrentDataItems(
                                    childItem.propertityPermissionGroups,
                                    2,
                                  )
                                "
                                :bizPermType="childItem.bizPermType"
                                @propertityPermissionGroupsChange="
                                  propertityPermissionGroupsChange(
                                    $event,
                                    childItem,
                                  )
                                "
                              />
                            </a-tab-pane>
                            <a-tab-pane key="3" tab="编辑时">
                              <data-item
                                :tableHeight="height"
                                :dataItems="
                                  getCurrentDataItems(
                                    childItem.propertityPermissionGroups,
                                    3,
                                  )
                                "
                                :bizPermType="childItem.bizPermType"
                                @propertityPermissionGroupsChange="
                                  propertityPermissionGroupsChange(
                                    $event,
                                    childItem,
                                  )
                                "
                              />
                            </a-tab-pane>
                          </a-tabs>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
        <div class="option-bar">
          <a-button style="margin-right: 10px" @click="cancel"> 取消 </a-button>
          <a-button type="primary" @click="submit"> 保存 </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Radio,
  Checkbox,
  Icon,
  Switch,
  Tooltip,
  Tabs,
  Button,
} from '@h3/antd-vue';
// 权限组配置页面
import * as dataPermissionApi from '@/apis/data-permission';
import permissionApi from '@/apis/system/permission.api';
import { bizpropertyApi } from 'cloudpivot/api';
import DataitemConditionModal from '@/components/apps/settings/dataitem-condition-modal.vue';
import DataitemCondition from '@/components/apps/settings/dataitem-condition.vue';
import h3Panel from '@/components/apps/settings/panel.vue';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DataItem from '../../data-permission/data-item.vue';

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'permission-group-settings',
  components: {
    h3Panel,
    DataitemConditionModal,
    DataitemCondition,
    DataItem,
    AButton: Button,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    AIcon: Icon,
    ASwitch: Switch,
    ATooltip: Tooltip,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
  },
})
export default class PermissionGroupSettings extends Vue {
  list: Array<any> = [];

  record: BPM.System.AppFunctionPermissionModel = {} as any;

  groupDataInfo: any = {};

  @AppCenterModule.State('appInfo') appInfo: any;

  modelKey: string = '';

  customRulesList: Array<any> = [];

  getChoiceData: Array<any> = [];

  attribute: any = {
    code: '',
    customBusinessRulePerm: [],
  };

  @Prop({
    default: '',
  })
  groupId!: string;

  @Prop({
    default: '',
  })
  groupName!: string;

  visibleType = {
    staffs: true,
    isExternalUser: true,
    roles: false,
    rolesRange: false,
  };

  get childrenList(): Array<any> {
    return this.list.reduce((stat: any, item: any) => {
      if (item.children) {
        stat = [...stat, ...item.children];
      }
      return stat;
    }, []);
  }

  handleConditionData(val: any) {
    if (val && Array.isArray(val.conditions)) {
      val.conditions.forEach((c: any) => {
        if (c.propertyType === 3 && c.value && typeof c.value === 'object') {
          c.value = moment(c.value).format('YYYY-MM-DD HH:mm:ss');
        }
      });
    }
    const target = this.findModelByKey(this.modelKey);
    if (target) {
      target.filterType = val.type;
      target.conditions = val.conditions;
    }
  }

  dataPermissionSelect(
    item: any,
    val: number,
    index?: number,
    childIndex?: number,
  ) {
    // console.log(item, val, index, childIndex)
    const condition: any = this.$refs.condition;
    if (val === 4) {
      condition[0].show();
      this.openConditionModal(item);
    } else {
      condition[0].cancel();
    }
    item.edit = true;
    item.dataPermissionType = val;
  }

  openConditionModal(record: any) {
    const conditionValueCache = JSON.parse(JSON.stringify(record));
    if (record && Array.isArray(conditionValueCache.conditions)) {
      conditionValueCache.conditions.forEach((c: any) => {
        if (c.propertyType === 3 && c.value && typeof c.value === 'string') {
          c.value = moment(c.value);
        }
      });
    }
    record = conditionValueCache;
  }

  // 配置表单数据权限显示控制
  setPermission(record: any, key: string, value: any) {
    this.$set(record, key, value);
    if (!value) {
      this.temporaryStorage[record.schemaCode] = record;
    } else {
      delete this.temporaryStorage[record.schemaCode];
      // if(!record.propertityPermissionGroups){
      // alert('还没配置表单数据权限')
      this.addPropertityPermissionGroups(record);
      // }
    }
  }

  // 新建表单数据权限
  async addPropertityPermissionGroups(record) {
    if (record.propertityPermissionGroups) {
      this.changeDatas[record.schemaCode] = record;
      return;
    }
    console.log('record===>', record);
    let formData = [];
    const res = await dataPermissionApi.getDataItemList({
      schemaCode: record.schemaCode,
    });
    if (res.errcode === 0) {
      // @ts-ignore
      formData = res.data.filter(
        (item: any) => !item.defaultProperty && item.published,
      );

      const dataItems: any[] = [];
      formData.forEach((item: any) => {
        const name_i18n: any =
          typeof item.name_i18n === 'string' && item.name_i18n
            ? JSON.parse(item.name_i18n)
            : '';
        dataItems.push({
          name: item.name,
          name_i18n: '',
          propertyEmpty: item.propertyEmpty,
          propertyCode: item.code,
          propertyType: item.propertyType,
          required: false,
          visible: true,
          writeAble: true,
          hasSubSchema:
            item.subSchema && Array.isArray(item.subSchema.properties),
        });
        if (item.subSchema && Array.isArray(item.subSchema.properties)) {
          item.subSchema.properties.forEach((subItem: any) => {
            if (!subItem.defaultProperty) {
              let sub_name_i18n: any =
                typeof subItem.name_i18n === 'string' && subItem.name_i18n
                  ? JSON.parse(subItem.name_i18n)
                  : '';
              if (typeof sub_name_i18n === 'object') {
                sub_name_i18n = JSON.stringify(sub_name_i18n);
              }
              dataItems.push({
                name: subItem.name,
                name_i18n: sub_name_i18n,
                propertyEmpty: subItem.propertyEmpty,
                propertyCode: subItem.code,
                propertyType: subItem.propertyType,
                required: false,
                visible: true,
                writeAble: true,
                parentCode: item.code, // 父级数据项code
                parentName: item.name, // 父级数据项name
                parentNameI18n: name_i18n, // 父级数据项name_i18n
                schemaCode: subItem.schemaCode,
              });
            }
          });
        }
      });
      console.log('dataItems===>', dataItems);
      const resData = this.initAdd(dataItems);
      this.$set(record, 'propertityPermissionGroups', resData);

      this.changeDatas[record.schemaCode] = record;
    }
  }

  changeDatas: object = {};

  // 记录修改过的表单数据权限
  propertityPermissionGroupsChange(val, changeData) {
    this.changeDatas[changeData.schemaCode].propertityPermissionGroups.forEach(
      (item) => {
        val.forEach((el) => {
          if (
            el.propertyCode === item.propertyCode &&
            el.bizPermType === item.bizPermType
          ) {
            item.writeAble = el.writeAble;
            item.visible = el.visible;
            item.required = el.required;
          }
        });
      },
    );
    console.log('changeData===>', changeData);
  }

  // 返回可配置数据
  getCurrentDataItems(data, bizPermType) {
    if (!data) {
      return data;
    }
    return data.filter((el) => el.bizPermType === bizPermType);
  }

  /**
   * 初始化新建的数据项权限基础数据
   */
  initAdd(dataItems) {
    // 默认可见/可写
    const addDataItems = JSON.parse(JSON.stringify(dataItems));
    addDataItems.forEach((item: any) => {
      item.visible = true;
      item.writeAble = true;
      item.required = item.propertyEmpty;
      item.bizPermType = 1;
    });
    const viewDataItems = JSON.parse(JSON.stringify(dataItems));
    viewDataItems.forEach((item: any) => {
      item.visible = true;
      item.bizPermType = 2;
    });
    const editDataItems = JSON.parse(JSON.stringify(dataItems));
    editDataItems.forEach((item: any) => {
      item.visible = true;
      item.writeAble = true;
      item.required = item.propertyEmpty;
      item.bizPermType = 3;
    });

    return [...addDataItems, ...viewDataItems, ...editDataItems];
  }

  // 暂存删除的表单数据权限
  temporaryStorage: object = {};

  bizPermType: string = '1';

  height = 500;

  setTableHeight() {
    const roleSelect: any = this.$refs.roleSelect;
    const staffsSelect: any = this.$refs.staffsSelect;
    let h: number = 37;
    if (roleSelect) {
      h = roleSelect.$el.clientHeight;
    } else if (staffsSelect) {
      h = staffsSelect.$el.clientHeight;
    } else {
      //Else Empty block statement
    }
    const docH = document.body.clientHeight;
    this.height = docH - h - 336;
  }

  cancel() {
    const histroyData: any = {
      name: this.groupDataInfo.name,
      id: this.groupId,
    };
    this.$emit('viewModelSettings', false, '', histroyData);
  }

  close() {
    const histroyData: any = {
      name: '',
      id: '',
    };
    this.$emit('viewModelSettings', false, '', histroyData);
  }

  timer: any;

  submit() {
    if (this.timer) {
      this.$message.warning('正在保存中,请稍后...');
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      const params: any = {
        appCode: this.$route.params.appCode || this.appInfo.code,
      };

      if (this.groupId) {
        params.id = this.groupId;
      } else {
        params.id = '';
      }

      const map = (x: any, i: number) => {
        const temp = Object.assign({}, x, x.actionPermission);

        if (
          this.attribute.customBusinessRulePerm.length > 0 &&
          x.schemaCode === this.attribute.code
        ) {
          for (const rue of this.attribute.customBusinessRulePerm) {
            if (x.actionPermission[rue.businessRuleCode]) {
              rue.checked = true;
            }
            delete temp[rue.businessRuleCode];
          }
          temp.attribute = JSON.stringify({
            customBusinessRulePerm: this.attribute.customBusinessRulePerm,
          });
          for (const listCon of this.list) {
            var customRulesGroup = listCon.children.filter((y) => {
              return y.schemaCode === x.schemaCode;
            });
            if (customRulesGroup.length > 0) {
              break;
            }
          }
          customRulesGroup[0].attribute = temp.attribute;
        }

        delete temp.actionPermission;

        if (!temp.conditions) {
          temp.conditions = null;
        }
        temp.id = temp.key !== temp.schemaCode + i ? temp.key : null;
        delete temp.key;
        delete temp.edit;
        return temp;
      };

      let list = this.list.filter((x) => !x.children).map(map);
      list = this.list
        .filter((x) => x.children)
        .flatMap((x) => x.children)
        .map(map)
        .concat(list);
      list = JSON.parse(JSON.stringify(list));
      for (let i = 0; i < list.length; i++) {
        const list_i = list[i];
        if (list_i.conditions) {
          for (let j = 0; j < list_i.conditions.length; j++) {
            const conditions_j = list_i.conditions[j];
            if (
              (conditions_j.operatorType === 11 ||
                conditions_j.operatorType === 12) &&
              (conditions_j.value === '[]' || conditions_j.value.length === 0)
            ) {
              conditions_j.value = '';
            }
            if (
              (conditions_j.operatorType === 11 ||
                conditions_j.operatorType === 12) &&
              typeof conditions_j.value === 'object'
            ) {
              list[i].conditions[j].value = JSON.stringify(conditions_j.value);
            }
            // 防止选人控件初始值为数组, 这里作为条件需传参字符串
            if (
              conditions_j.propertyType === 5 &&
              Array.isArray(conditions_j.value)
            ) {
              list[i].conditions[j].value = conditions_j.value.join();
            }
          }
        }
      }

      params.dataPermissionGroups = list;

      console.log(params);

      if (!params.dataPermissionGroups.length) {
        delete params.dataPermissionGroups;
      }

      // 拦截表单设置了自定义但没有设置condition的情况
      if (
        params &&
        params.dataPermissionGroups &&
        params.dataPermissionGroups.length
      ) {
        const hassNoConditionForms: Array<string | number> = [];
        params.dataPermissionGroups.map((item: any) => {
          if (item.dataPermissionType === 4) {
            // 自定义数据权限
            if (
              !item.conditions ||
              item.conditions.some((el) => el.value === '')
            ) {
              hassNoConditionForms.push(item.name);
            }
          }

          // item.dataPermissionType === 4 && !item.conditions ? hassNoConditionForms.push(item.name) : ''
        });
        // console.log(hassNoConditionForms);
        if (hassNoConditionForms.length) {
          // this.$message.error(`${hassNoConditionForms.join('、')}表单数据权限请设置`);
          this.$message.error(
            this.$t('languages.appSettings.PlzSelectFormPermission', {
              form: hassNoConditionForms.join('、'),
            }) as string,
          );
          return;
        }
      }

      if (this.groupDataInfo.authorType === 0) {
        params.departments = this.groupDataInfo.departments;
      }
      if (this.groupDataInfo.authorType === 1) {
        params.roles = this.groupDataInfo.roles;
      }
      params.name = this.groupDataInfo.name;

      params.externalUser = this.groupDataInfo.externalUser;

      const p = permissionApi.updateGroup(params);

      p.then((res: any) => {
        if (res.errcode === 0) {
          if (
            Object.keys(this.changeDatas).length ||
            Object.keys(this.temporaryStorage).length
          ) {
            if (Object.keys(this.changeDatas).length) {
              // 保存表单数据权限
              this.isUpdataPermissionOver = false;
              this.updataFormDataPermission(res.data.id, params);
            }

            if (Object.keys(this.temporaryStorage).length) {
              // 删除表单数据权限
              this.isDeletePermissionOver = false;
              this.deleteFormDataPermission();
            }
          } else {
            this.$message.success(
              this.$t('languages.appSettings.saveSuccessfully') as string,
            );
          }
          // this.$message.success(this.$t('languages.appSettings.saveSuccessfully') as string);
          // this.$emit('ok')
          // 操作成功后重置当前dataCopy的值
          const now = this.childrenList.find(
            (elment: any) => elment.id === this.modelKey,
          );
          this.dataCopy = cloneDeep(now);
        } else {
          this.$message.error(res.errmsg as string);
        }
      });
    }, 500);
    /* setTimeout(function(){
    },500) */
  }

  isUpdataPermissionOver: boolean = true; // 更新完毕表单数据权限

  isDeletePermissionOver: boolean = true; // 删除完毕表单数据权限

  // 更新表单数据权限
  async updataFormDataPermission(id: any, query: any) {
    let count = 0;
    for (const key in this.changeDatas) {
      if (this.changeDatas.hasOwnProperty(key)) {
        count++;
        const currentItem = this.changeDatas[key];

        const schemaCode = currentItem.schemaCode;

        const addPerms: any[] = [];
        const viewPerms: any[] = [];
        const editPerms: any[] = [];
        currentItem.propertityPermissionGroups.forEach((element: any) => {
          const item = {
            bizPermType: element.bizPermType,
            groupId: element.groupId,
            id: element.id,
            name: element.name,
            name_i18n: '',
            propertyCode: element.propertyCode,
            propertyType: element.propertyType,
            required: element.required,
            schemaCode: element.schemaCode || schemaCode,
            visible: element.visible,
            writeAble: element.writeAble,
            parentCode: element.schemaCode || '',
            parentName: element.parentName || '',
          };

          if (element.bizPermType === 1) {
            addPerms.push(item);
          } else if (element.bizPermType === 2) {
            viewPerms.push(item);
          } else {
            editPerms.push(item);
          }
        });

        const result: any = await dataPermissionApi.getPermissions({
          schemaCode: currentItem.schemaCode,
        });

        const objId: any = result.data.find((item: any) => {
          return item.appPermGroupId === id;
        });

        const params: any = {
          enabled: true,
          schemaCode: currentItem.schemaCode,
          permProperties: [...addPerms, ...viewPerms, ...editPerms],
          id: objId ? objId.id : '',
          appPermGroupId: this.groupDataInfo.id || id,
          name: query.name,
          departments: query.departments ? query.departments : '',
          roles: query.roles ? query.roles : '',
          appCode: query.appCode ? query.appCode : '',
        };
        dataPermissionApi.updatePermission(params).then((res: any) => {
          if (res.errcode === 0) {
            count--;
            if (count === 0) {
              this.$message.success(
                this.$t('languages.appSettings.saveSuccessfully') as string,
              );
              this.isUpdataPermissionOver = true;
              if (this.isDeletePermissionOver) {
                this.$emit('ok');
              }
            }
          } else {
            this.$message.error(res.errmsg);
          }
        });
      }
    }
  }

  // 删除表单数据权限
  deleteFormDataPermission() {
    let count = 0;
    for (const key in this.temporaryStorage) {
      if (this.temporaryStorage.hasOwnProperty(key)) {
        count++;
        const currentItem = this.temporaryStorage[key];
        console.log('需要删除的currentItem===>', currentItem);
        if (
          currentItem.propertityPermissionGroups[0] &&
          currentItem.propertityPermissionGroups[0].groupId
        ) {
          dataPermissionApi
            .deletePermission({
              groupId: currentItem.propertityPermissionGroups[0].groupId,
            })
            .then((res: any) => {
              if (res.errcode === 0) {
                count--;
                if (count === 0) {
                  this.$message.success(
                    this.$t('languages.appSettings.saveSuccessfully') as string,
                  );
                  this.isDeletePermissionOver = true;
                  if (this.isUpdataPermissionOver) {
                    this.$emit('ok');
                  }
                }
              } else {
                this.$message.error(res.errmsg);
              }
            });
        }
      }
    }
  }

  convert(x: BPM.System.AppFunctionPermissionModel, i: number) {
    if (x.propertityPermissionGroups) {
      x.propertityPermissionGroups.forEach((el: any) => {
        const item = x.propertityPermissionGroups.find((obj: any) => {
          return obj.propertyCode === el.schemaCode;
        });
        if (item && !el.parentName) {
          el.parentName = item.name;
          el.parentCode = item.propertyCode;
        }
      });
    }
    return {
      id: x.id || x.schemaCode + i,
      key: x.id || x.schemaCode + i,
      edit: false,
      name: x.schemaName || x.functionName,
      functionCode: x.functionCode,
      schemaCode: x.schemaCode,
      visible: x.visible,
      filterType: x.filterType,
      conditions: x.conditions,
      attribute: x.attribute,
      dataPermissionType: x.dataPermissionType,
      nodeType: x.nodeType,
      modelType: x.modelType,
      actionPermission: {
        creatable: x.creatable,
        deletable: x.deletable,
        editable: x.editable,
        exportable: x.exportable,
        importable: x.importable,
        printAble: x.printAble,
        editOwnerAble: !!x.editOwnerAble, // 老数据可能为null
        batchPrintAble: x.batchPrintAble,
        batchUpdateAble: x.batchUpdateAble,
      },
      propertityPermissionGroups: x.propertityPermissionGroups,
      setPermission: !!x.propertityPermissionGroups,
      bizPermType: '1',
    };
  }

  choiceModal(key: string, code?: string) {
    this.modelKey = key;
    this.customRules(code);
  }

  //获取自定义规则
  customRules(code: string) {
    for (const listCon of this.list) {
      var customRulesGroup = listCon.children.filter((x) => {
        return x.schemaCode === code;
      });
      if (customRulesGroup.length > 0) {
        break;
      }
    }
    bizpropertyApi.listBySchemacode({ schemaCode: code }).then((res) => {
      if (res.errcode === 0) {
        if (res.data) {
          this.customRulesList = res.data.filter((x) => {
            return !x.defaultRule;
          });
          if (this.customRulesList.length > 0) {
            for (const val of this.customRulesList) {
              customRulesGroup[0].actionPermission[val.code] = false;
              this.attribute.code = code;
              this.attribute.customBusinessRulePerm.push({
                businessRuleCode: val.code,
                checked: false,
              });
              if (customRulesGroup[0].attribute) {
                const attributes = JSON.parse(customRulesGroup[0].attribute);
                for (const vals of attributes.customBusinessRulePerm) {
                  if (val.code === vals.businessRuleCode) {
                    customRulesGroup[0].actionPermission[val.code] =
                      vals.checked;
                  }
                }
              }
            }
          }
          this.getChoiceData = [];
          for (const key in customRulesGroup[0].actionPermission) {
            if (customRulesGroup[0].actionPermission[key]) {
              this.getChoiceData.push(key);
            }
          }
        }
      }
    });
  }

  // 根据key查找对应的模型对象
  findModelByKey(key: string) {
    let targetModel: any = {};
    this.list.forEach((item: any) => {
      if (item.children) {
        const result = item.children.find((subItem: any) => subItem.id === key);
        if (result) {
          return (targetModel = result);
        }
      }
    });
    return targetModel;
  }

  dataCopy: any = null;

  get dataNow() {
    return this.childrenList.find((item: any) => item.key === this.modelKey);
  }

  // 菜单变化时触发自定义规则视图
  @Watch('modelKey', {
    immediate: true,
  })
  onModelChange(after: string, before: string) {
    const tar = this.childrenList.find((item: any) => item.key === after);
    if (tar) {
      this.setPermission(tar, 'setPermission', true);
      this.dataCopy = cloneDeep(tar);
    }
  }

  get isModify() {
    if (this.modelKey === '') {
      return false;
    }
    const nowData = this.childrenList.find(
      (item: any) => item.key === this.modelKey,
    );
    try {
      if (isEqual(this.dataCopy, nowData)) {
        return false;
      } else {
        return true;
      }
    } catch (error) {}
  }

  get isAccountDisap(){
    console.log(this.groupDataInfo.dataPermissionGroups);
    console.log(this.modelKey);
    let result = true;
    let obj = this.groupDataInfo.dataPermissionGroups.find((item) => {
      return item['id'] === this.modelKey;
    })
    if(obj && obj['remarks'] === 'ACCOUNT'){
      result = false;
    }
    return result;
  }
  @Watch('groupId', {
    immediate: true,
  })
  onGroupIdChange(groupId: string) {
    this.fetchListData(groupId);
  }

  // 获取数据列表
  fetchListData(groupId: string) {
    let appCode: string = '';
    if (!groupId) {
      appCode = this.$route.params.appCode || this.appInfo.code;
    }
    permissionApi.getGroup(groupId, appCode).then((res) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      }

      const { data } = res;

      if (data) {
        this.groupDataInfo = data; // 存储当前权限组数据

        const list: any[] = [];
        const obj: any = {
          name: this.appInfo.name,
          children: [],
        };
        data.dataPermissionGroups.forEach((x, i) => {
          if (x.functionCode === x.schemaCode) {
            obj.key = x.functionCode;
            obj.children.push(this.convert(x, i));
          } else {
            const key = x.functionCode;
            let group = list.find((y: any) => y.key === key);
            if (!group) {
              group = {
                key,
                name: x.functionName,
                children: [],
              };
              list.push(group);
            }
            group.children.push(this.convert(x, i));
          }
        });
        //当模型没有分组时，取应用名称作为模型的分组 并且要把他们归并到一个组
        if (obj.children.length > 0) {
          list.unshift(obj);
        }

        this.list = list;
        this.modelKey = this.list.reduce(
          (stat: any, item: any, index: number) => {
            if (item.children && index === 0) {
              stat = item.children[0].key;
            }
            return stat;
          },
          '',
        );
        this.customRules(this.list[0].children[0].schemaCode);
      }
    });
  }

  actionPermissionSelect(selected: Array<string>, actions: any) {
    actions.edit = true;
    for (const key in actions) {
      if (actions.hasOwnProperty(key)) {
        selected.includes(key) ? (actions[key] = true) : (actions[key] = false);
      }
    }
    this.getChoiceData = selected;
  }

  setField(record: any, key: string, value: any) {
    record.edit = true;
    record[key] = value;
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.header-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  margin-top: 29px;
  .model-title {
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
    margin-right: 32px;
    padding-bottom: 13px;
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
  }
}
.model-name-wrap {
  line-height: 22px;
  padding-bottom: 13px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    bottom: 0;
    background-color: @primary-color;
  }
  .model-name {
    font-size: 14px;
    color: @primary-color;
    cursor: pointer;
  }
  .close {
    position: absolute;
    left: 100%;
    cursor: pointer;
    font-size: 12px;
    color: rgba(17, 18, 24, 0.5);
    top: 2px;
    margin-left: 8px;
  }
}

.group-settings-wrap {
  text-align: left;
  color: rgba(17, 18, 24, 0.5);
  display: flex;
  .model-menu {
    width: 204px;
    padding-right: 1px;
    float: left;
    box-shadow: 1px 0px 0px 0px #e8e8e8;
    position: relative;
    z-index: 2;
    .menu-tree {
      position: relative;
      color: @nav-font-color;
      .menu-title {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        margin-top: 10px;
        font-weight: 600;
      }
      .menu-content {
        overflow: auto;
        height: calc(100vh - 324px);
        padding-top: 16px;
      }

      .menu-item {
        height: 36px;
        line-height: 36px;
        padding: 0px 12px !important;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        color: #111218;
        cursor: pointer;
        white-space: nowrap;
        &.active,
        &:hover {
          background: #eef4fd;
          color: @primary-color;
        }
      }
    }
  }
  .model-settings {
    padding-bottom: 68px;
    position: relative;
    overflow-y: auto;
    height: calc(100vh - 300px);
    flex: 1;
    .option-bar {
      position: fixed;
      // left: 0;
      bottom: 0;
      width: 853px;
      height: 52px;
      line-height: 52px;
      text-align: center;
      border-top: 1px solid #e8e8e8;
      background-color: #fff;
    }
  }
}

._item-list {
  display: flex;
  flex-direction: column;
  p {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }
}
.permission-group-form {
  // position: relative;
  // min-height: 100%;
  margin-bottom: 70px;
  // /deep/.ant-table-thead span {
  //   font-weight: 600;
  //   color: rgba(0,0,0,0.65);
  // }
  /deep/.ant-table-body {
    color: #111218;
  }
  .ant-drawer-btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 52px;
    line-height: 52px;
    text-align: center;
    border-top: 1px solid #e8e8e8;
    background-color: #fff;
    .cancel-btn {
      margin-right: 16px;
    }
  }
  h4 {
    font-weight: 600;
    color: #000;
    margin-bottom: 16px;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  a {
    color: @primary-color;
    font-size: 14px;
  }
  /deep/.ant-row-flex {
    margin: 20px 0;
    align-items: flex-start;
  }

  .ant-col-4 {
    display: flex;
    align-items: center;
    height: 32px;
    color: rgba(17, 18, 24, 0.5);
  }
  .ant-col-20.checkbox {
    line-height: 32px;
  }
  .setting-groups {
    display: flex;
  }
  .error {
    /deep/.ant-select-selection,
    /deep/.h3-organization__label {
      border: 1px solid #f5222d;
    }

    & > .message {
      color: #f5222d;
      font-size: 12px;
    }
  }
}
// .panel-content+.panel-content{
//   margin-top: 16px;
// }
.permission-group-panel-wrapper {
  margin: 24px 0 0 24px;
  border-top: 1px solid #e8e8e8;
  .permission-group-panel-item {
    margin-bottom: 16px;
    /deep/.ant-radio-wrapper {
      margin-right: 32px;
      color: #111218;
    }
    /deep/.ant-checkbox-group {
      .ant-checkbox-wrapper {
        margin-left: 0;
        margin-right: 32px;
      }
      label {
        color: #111218;
      }
    }
    .item-title {
      display: flex;
      flex-direction: row;
      flex-wrap: no-wrap;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #111218;
      line-height: 32px;
      .sub-title {
        margin-right: 20px;
      }
    }
    .ant-checkbox-wrapper {
      margin-bottom: 8px;
    }

    h3 {
      font-size: 12px;
      font-weight: 600;
      color: #111218;
      line-height: 20px;
      margin-bottom: 6px;
    }
    .data-permission-handler__tabs {
      width: 100%;
    }
    .item-list {
      line-height: 32px;
    }

    /deep/.ant-tabs-nav {
      &::before,
      &::after {
        display: none;
      }

      & > div:first-child {
        display: flex;
        border: 1px solid #eee;
        border-radius: 2px;
        padding: 3px;
        background-color: #fff;
        align-items: center;
        margin-bottom: 16px;
        .ant-tabs-tab {
          padding: 0;
          width: 68px;
          text-align: center;
          height: 26px;
          line-height: 26px;
          margin: 0;
          font-size: 12px;
          color: #111218;
        }
        .ant-tabs-tab-active {
          background: #eef4fd;
          border-radius: 2px;
          color: #2970ff !important;
        }
      }

      .ant-tabs-ink-bar {
        display: none !important;
      }
    }
  }
}
.panel-content
  .permission-group-panel-wrapper:last-of-type
  .permission-group-panel-item:last-of-type {
  margin-bottom: 0;
}
.permission-group-panel-wrapper:first-of-type {
  border-top: none;
}
.item-list {
  // display: flex;
  // flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: flex-start;
  align-items: center;
  color: rgba(17, 18, 24, 0.5);
  span.form_data_title {
    min-width: 8em;
    align-self: flex-start;
    justify-self: flex-start;
    line-height: 44px;
  }
  h4 {
    margin-bottom: 16px;
    font-weight: bolder;
    color: rgba(17, 18, 24, 0.5);
  }
}
/deep/.h3-panel-header > span {
  font-weight: 600;
}
/deep/.item-title .ant-checkbox + span {
  padding-right: 0;
  color: rgba(17, 18, 24, 0.5);
}

.menu-item {
  position: relative;
  .change-info {
    display: block;
    height: 10px;
    width: 10px;
    border: 1px solid orange;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translate(0, -50%);
  }
}

.tab-wrapper {
  width: 508px;
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 2px;
}
</style>

<style lang="less">
// 修改新增权限组 select 框之间的对齐问题，在scope不生效
.permission-group-form {
  .ant-select-allow-clear
    .ant-select-selection--multiple
    .ant-select-selection__rendered {
    margin-right: 11px !important;
  }

  .ant-select-selection--multiple .ant-select-selection__rendered {
    margin-left: 11px !important;
  }
}

// 表格每个 tr 的第一个 td样式
.permission-group-form table tr td:nth-of-type(1) {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ant-select-tree-dropdown {
  max-height: 60vh !important;
}
.ant-select-tree li span.ant-select-tree-checkbox {
  display: none;
}
.ant-select-tree
  li
  span.ant-select-tree-checkbox
  + .ant-select-tree-node-content-wrapper {
  width: calc(100% - 24px);
}
.ant-select-tree
  > .ant-select-tree-treenode-checkbox-checked
  > .ant-select-tree-node-content-wrapper,
.ant-select-tree-child-tree
  .ant-select-tree-treenode-checkbox-checked
  .ant-select-tree-node-content-wrapper {
  background-color: #fafafa !important;
  font-weight: bold;
}
.ant-select-tree
  > .ant-select-tree-treenode-checkbox-checked
  > .ant-select-tree-node-content-wrapper::after,
.ant-select-tree-child-tree
  .ant-select-tree-treenode-checkbox-checked
  .ant-select-tree-node-content-wrapper::after {
  content: '\E98F';
  color: @primary-color;
  position: absolute;
  right: 8px;
  display: inline-block;
  font-family: 'aufontAll' !important;
  font-weight: bold;
}
.ant-select-tree-node-content-wrapper {
  background-color: #ffffff !important;
}
.ant-select-tree-node-content-wrapper:after {
  content: '';
}
</style>
<style lang="less">
.data-permission-handler__tabs {
  .ant-tabs-bar {
    margin-bottom: 0;
    border-bottom: none;
  }
  .ant-table-thead {
    background: #fafafa;
  }
}
</style>
