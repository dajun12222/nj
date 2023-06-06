<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="permission-setting">
    <h4>
      {{ $t('languages.appSettings.VisibleRangeSetting') }}
    </h4>

    <div class="title-small">
      {{ $t('languages.appSettings.AppVisibleRange') }}
    </div>

    <div class="range-type-wrap">
      <a-radio-group v-model="visibleType" @change="onVisibleTypeChange">
        <a-radio :value="1">
          {{ $t('languages.appSettings.AllUserVisible') }}
        </a-radio>
        <a-radio :value="2">
          {{ $t('languages.appSettings.AccessByGroup') }}
        </a-radio>
      </a-radio-group>
      <div v-show="visibleType === 1" class="desc">
        {{ $t('languages.appSettings.AllUserCanViewSelfDataAndModify') }}
      </div>
    </div>

    <div v-show="visibleType === 2 && !showModel" class="overflow__x">
      <div class="header-bar">
        <h3 class="model-title">
          {{ $t('languages.appSettings.PermissionGroupSetting') }}
        </h3>
        <div
          v-if="historyData.name"
          class="model-name-wrap"
          @click="toSetPermission"
        >
          <span class="model-name">{{ historyData.name }}</span>
          <i
            class="icon aufontAll h-icon-all-close close"
            @click.stop="cancel"
          ></i>
        </div>
      </div>

      <div class="actions">
        <a-button type="primary" @click="handleAdd">新 建</a-button>
      </div>

      <div class="permission-group-list">
        <table>
          <thead>
            <tr>
              <th class="index">
                <span>
                  {{ $t('languages.appSettings.index') }}
                </span>
              </th>
              <th class="name">
                <span>
                  {{ $t('languages.appSettings.name') }}
                </span>
              </th>
              <th class="dept">
                <span>
                  {{ $t('languages.appSettings.departmentsOrg') }}
                </span>
              </th>
              <th class="role">
                <span>
                  {{ $t('languages.appSettings.roles') }}
                </span>
              </th>
              <th class="exter">
                <span>
                  {{ $t('languages.appSettings.externalUser') }}
                </span>
              </th>
              <th class="opt">
                <span>
                  {{ $t('languages.appSettings.operation') }}
                </span>
              </th>
            </tr>
          </thead>
          <draggable
            v-if="data.length"
            :list="data"
            :options="dragOptions"
            handle=".handles"
            tag="tbody"
            @end="onEnd"
          >
            <tr v-for="(item, index) in data" :key="index">
              <td class="index handles">
                <span class="icon aufontAll drag-icon">&#xe63e;</span>
                <span class="index-num">
                  {{ index + 1 }}
                </span>
              </td>
              <td class="name">
                <span>
                  {{ item.name }}
                </span>
              </td>
              <td class="dept">
                <template>
                  <a-popover
                    v-if="Array.isArray(item.departments)"
                    overlayClassName="text-info-detail"
                    placement="bottomLeft"
                  >
                    <template slot="content">
                      <div class="text-info-box">
                        <div
                          v-for="(dept, idx) in item.departments"
                          :key="idx"
                          class="text-info-item"
                        >
                          <div class="item-name" :title="dept.name">
                            {{ dept.name }}
                          </div>
                          <div class="item-path" :title="dept.fullDepartment">
                            {{ dept.fullDepartment }}
                          </div>
                        </div>
                      </div>
                    </template>
                    <span>
                      {{ item.departments.map((el) => el.name).join('、') }}
                    </span>
                  </a-popover>
                  <span v-else>
                    {{ item.departments }}
                  </span>
                </template>
              </td>
              <td class="role">
                <span>
                  {{ item.roles }}
                </span>
              </td>
              <td class="exter">
                <span>
                  {{ item.externalUser ? '是' : '否' }}
                  <!-- <a-switch disabled :checked="item.externalUser" /> -->
                </span>
              </td>
              <td class="opt">
                <div class="opt-wrap">
                  <template>
                    <!-- 模型设置 -->
                    <span>
                      <i @click="() => viewModelSettings(item.id, item.name)">
                        权限设置
                      </i>
                    </span>

                    <!-- 编辑权限组 -->
                    <span>
                      <i @click="() => handleEdit(item.id)"> 编辑 </i>
                    </span>

                    <!-- 删除权限组 -->
                    <a-popconfirm
                      :title="$t('languages.appSettings.ConfirmDelete')"
                      :okText="$t('languages.appSettings.OK')"
                      :cancelText="$t('languages.appSettings.cancel')"
                      placement="left"
                      @confirm="() => handleDelete(item.id)"
                    >
                      <span>
                        <i> 删除 </i>
                      </span>
                    </a-popconfirm>
          <!-- 批量设置 -->
          <span class="volumeSet" @click="() => viewModelVolumeSet(item.id, item.name)">
            <i>批量设置</i>
          </span>
                  </template>
                </div>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>

    <!-- 新增/编辑权限组 -->
    <permission-group-modal
      v-model="showForm"
      :groupId="groupId"
      :propOrData="propOrData"
      @modifyDone="onFormOk"
      @change="handleModalChange"
    />
  </div>
</template>

<script lang="ts">
import permissionApi from '@/apis/system/permission.api';
import PermissionGroupForm from '@/components/apps/settings/permission-group-form.vue';
import {
  Drawer,
  Popconfirm,
  Radio,
  Switch,
  Icon,
  Table,
  Tooltip,
  Popover,
  Button,
} from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import PermissionGroupModal from './components/permission-group-modal.vue';
import Draggable from 'vuedraggable';

const AppCenterModule = namespace('Apps/AppCenter');

@Component({
  name: 'permission-setting',
  components: {
    ADrawer: Drawer,
    APopconfirm: Popconfirm,
    ARadio: Radio,
    ASwitch: Switch,
    AIcon: Icon,
    ATable: Table,
    ARadioGroup: Radio.Group,
    ATooltip: Tooltip,
    APopover: Popover,
    PermissionGroupForm,
    PermissionGroupModal,
    Draggable,
    AButton: Button,
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      (vm as PermissionSetting).load();
    });
  },

  beforeRouteUpdate(to, from, next) {
    const vm = this as PermissionSetting;
    // vm.clean();
    next();
    vm.load();
  },
})
export default class PermissionSetting extends Vue {
  @AppCenterModule.State('appInfo') appInfo: any;

  @Prop() isTabPane?: boolean;

  @Prop() historyData?: any;

  @Prop() showModel!: boolean;

  cancel() {
    this.$emit('viewModelSettings', false, '', '');
  }

  toSetPermission() {
    this.historyData &&
      this.historyData.id &&
      this.historyData.name &&
      this.viewModelSettings(this.historyData.id, this.historyData.name);
  }

  groupId = '';

  showForm = false;

  visibleType = 1;

  columns: any[] = [];

  data: BPM.System.PermissionGroupModel[] = [];

  dragOptions: any = {
    animation: 150,
    ghostClass: 'ghostClass',
    forceFallback: true,
    fallbackClass: 'dragClass',
    touchStartThreshold: 20,
    delay: 100,
  };

  propOrData: any = null; //获取权限组信息，供权限组编辑使用

  setColumns() {
    this.columns = [
      {
        title: this.$t('languages.appSettings.index') as string,
        dataIndex: 'index',
        width: 70,
      },
      {
        title: this.$t('languages.appSettings.name') as string,
        dataIndex: 'name',
        width: 158,
      },
      {
        title: this.$t('languages.appSettings.departmentsOrg') as string,
        dataIndex: 'departments',
        scopedSlots: { customRender: 'departments' },
        width: 162,
      },
      {
        title: this.$t('languages.appSettings.roles') as string,
        dataIndex: 'roles',
        width: 202,
      },
      {
        title: this.$t('languages.appSettings.externalUser') as string,
        dataIndex: 'externalUser',
        scopedSlots: { customRender: 'externalUser' },
        width: 140,
      },
      {
        title: this.$t('languages.appSettings.operation') as string,
        dataIndex: 'operation',
        scopedSlots: { customRender: 'operation' },
        width: 140,
      },
    ];
  }

  load() {
    const hideLoader = (this.$message as any).loading();

    const appCode = this.$route.params.appCode || this.appInfo.code;

    permissionApi.getAppPackage(appCode).then((res) => {
      hideLoader();
      if (res.data) {
        const data = res.data.permissionGroups;

        this.visibleType = res.data.visibleType;

        this.$emit('visibleTypeChange', res.data.visibleType);

        data.forEach((item: any, i) => {
          item.index = i + 1;

          if (item.departments) {
            item.departments = JSON.parse(item.departments).map((x: any) => {
              const obj: any = {
                name: x.name,
                fullDepartment: x.fullDepartment,
              };
              return obj;
            });
          }

          if (item.roles) {
            item.roles = JSON.parse(item.roles)
              .map((x: any) => x.name)
              .join('、');
          }

          // item.externalUser = item.externalUser ? '开' : '关';

          Object.entries(item).forEach((d: any) => {
            const [key, value] = d;
            if (typeof value !== 'boolean' && !value) {
              item[key] = '- -';
            }
          });
        });

        this.data = data;
      }
    });
  }

  handleAdd() {
    this.groupId = '';
    this.showForm = true;
  }

  handleEdit(groupId: string) {
    //权限组ID一致时未触发permission-group-modal中onGroupIdChange监听
    if (this.groupId && this.groupId === groupId) {
      this.getGroup();
    } else {
      this.groupId = groupId;
    }
    this.showForm = true;
  }

  getGroup() {
    let appCode: string = '';
    if (!this.groupId) {
      appCode = this.$route.params.appCode || this.appInfo.code;
      return;
    }

    permissionApi.getGroup(this.groupId, appCode).then((res) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      }
      const { data } = res;
      if (data) {
        this.propOrData = data;
      } else {
        this.propOrData = null;
      }
    });
  }

  viewModelSettings(groupId: string, name: any) {
    this.groupId = groupId;
    this.$emit('viewModelSettings', true, this.groupId, name);
  }

viewModelVolumeSet(groupId: string, name: any) {
    this.groupId = groupId;
    this.$emit('viewModelVolumeSet', true, this.groupId, name)
  }
  
  deleteIng: boolean = false;

  handleDelete(groupId: string) {
    if (this.deleteIng) {
      return;
    }
    this.deleteIng = true;
    permissionApi.deleteGroup(groupId).then((res) => {
      this.deleteIng = false;
      if (res.errcode === 0) {
        this.load();
        const that = this;
        setTimeout(function () {
          that.$message.success('已删除');
        }, 500);
      } else {
        this.$message.error('删除失败');
      }
    });
  }

  clearHistoryName() {
    this.$emit('clearHistoryName', '');
  }

  onFormOk() {
    this.showForm = false;
    this.load();
  }

  onVisibleTypeChange(e: any) {
    const type = e.target.value;
    const params = {
      appCode: this.$route.params.appCode || this.appInfo.code,
      visibleType: type,
    };
    this.$emit('visibleTypeChange', type);
    permissionApi.updateAppPackage(params);
  }

  handleModalChange(e) {
    this.groupId = '';
    this.showForm = e;
  }

  mounted() {
    this.setColumns();
    if (!this.data.length) {
      this.load();
    }
  }

  /**
   * 结束拖拽
   */
  onEnd(evt: any) {
    console.log(evt, this.data);
    const codeList = this.data.map((res: any) => {
      return res.id;
    });
    const beDraggedItem =
      evt.item && evt.item._underlying_vm_ && evt.item._underlying_vm_.id;
    if (codeList[evt.newIndex] === beDraggedItem) {
      console.log(codeList, '------------NEWSORT');
      // this.$emit('sortEnd', codeList, true);
      const params = {
        appCode: this.$route.params.appCode || this.appInfo.code,
        permissionGroupIds: codeList,
      };
      permissionApi.updateSort(params);
    } else {
      const item = codeList.find((i, v) => v === evt.oldIndex);
      const data = codeList.filter((res: any, i: any) => {
        return i !== evt.oldIndex;
      });
      data.splice(evt.newIndex, 0, item);
      console.log(data, '------------NEWSORT');
      // this.$emit('sortEnd', data, true);
      const params = {
        appCode: this.$route.params.appCode || this.appInfo.code,
        permissionGroupIds: data,
      };
      permissionApi.updateSort(params);
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/components/shared/ant-table.less';
@import '~@/styles/color/colors.less';

.header-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  .model-title {
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    height: 35px;
    margin-right: 32px;
    padding-bottom: 13px;
    cursor: pointer;
    color: @primary-color;
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
  }
}

.model-name-wrap {
  line-height: 22px;
  padding-bottom: 13px;
  position: relative;
  .model-name {
    font-size: 14px;
    color: #111218;
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

h4 {
  font-size: 14px;
  font-weight: 600;
  color: @nav-font-color;
  line-height: 22px;
  position: relative;
  padding-left: 13px;
  margin-bottom: 16px;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 3px;
    height: 10px;
    background-color: @primary-color;
  }
}

.title-small {
  font-size: 14px;
  font-weight: 400;
  color: #111218;
  line-height: 22px;
  margin-bottom: 6px;
}

.range-type-wrap {
  line-height: 32px;
  margin-right: 32px;
  color: #111218;
  .ant-radio-wrapper {
    color: #111218;
    font-size: 14px;
  }
  .desc {
    margin-left: 28px;
    font-size: 12px;
    font-weight: 400;
    color: @light-font-color;
    line-height: 20px;
  }
}

.permission-setting {
  text-align: left;
  padding: 0;
  margin-bottom: 24px;
  color: rgba(17, 18, 24, 0.5);
  overflow: auto;
  max-height: 100%;
  .permission-setting__row {
    padding: 0 24px;
  }
  .permisson-title {
    font-size: 18px;
    font-weight: bolder;
    color: @primary-color;
    border-bottom: 2px solid @primary-color;
    line-height: 59px;
    height: 59px;
    padding: 0 24px;
    cursor: pointer;
  }

  .overflow__x {
    overflow-x: auto;
    margin-top: 29px;
    .flex__title {
      font-size: 14px;
      font-weight: 600;
      color: @primary-color;
      line-height: 22px;
      padding-bottom: 13px;
      border-bottom: 1px solid #ddd;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        width: 62px;
        height: 3px;
        background-color: @primary-color;
        left: 5px;
        bottom: 0;
      }
      span {
        padding-left: 1px;
      }
    }
    .permission-group-list {
      width: 100%;
      table {
        width: 100%;
        color: #111218;
        thead {
          height: 44px;
          line-height: 44px;
          background: #f5f6f9;
          box-shadow: 0px -1px 0px 0px #eeeeee;
          th {
            font-size: 14px;
            font-weight: 600;
          }
        }

        tbody {
          tr:hover {
            background: #f0f7ff;
          }
        }
        tr {
          border-bottom: 1px solid #e8e8e8;
          td,
          th {
            padding: 8px 16px;
            position: relative;
            span {
              display: block;
              // height: 22px;
              line-height: 22px;
            }
          }
        }
      }
      .handles {
        cursor: move;
        .drag-icon {
          display: none;
        }
        .index-num {
          display: block;
        }
        &:hover {
          .drag-icon {
            display: block;
          }
          .index-num {
            display: none;
          }
        }
      }
      .index {
        width: 80px;
        text-align: center;
      }
      .name {
        width: 120px;
      }
      .dept {
        width: 278px;
        position: relative;
        overflow: hidden;
        span {
          position: absolute;
          width: 100%;
          height: 22px;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          top: 8px;
        }
      }
      th.dept {
        span {
          top: 12px;
        }
      }

      .role {
        width: 278px;
      }
      .exter {
        width: 120px;
      }
      .opt {
        width: 184px;

        .opt-wrap {
          display: flex;
          align-items: center;
          span {
            i {
              font-style: normal;
              color: @primary-color;
              margin-right: 14px;
              &:hover {
                cursor: pointer;
              }
            }
            &:last-child {
              i {
                margin-right: unset;
              }
            }
          }
        }
      }
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 500;
    color: #000;
    height: 64px;
    line-height: 64px;
  }
  /deep/.ant-table-body {
    color: #111218;
  }
.volumeSet {
  cursor: pointer;
}
  .actions {
    text-align: right;
    margin: 16px 0 16px;
  }

  i.anticon {
    font-size: 16px;
    margin-right: 17px;
    cursor: pointer;
  }

  &__row {
    display: flex;
  }
  .desc {
    padding-top: 4px;
  }
}

.desc {
  color: rgba(17, 18, 24, 0.5);
  font-size: 12px;
}
</style>

<style lang="less">
.permission-group-drawer {
  .ant-drawer-title {
    font-weight: 600;
  }
  .ant-drawer-body {
    height: calc(100% - 57px - 52px);
    padding: 24px !important;
  }
  .ant-drawer-wrapper-body {
    overflow: inherit !important;
  }
  .ant-drawer-body {
    overflow: scroll;
  }
}
</style>
