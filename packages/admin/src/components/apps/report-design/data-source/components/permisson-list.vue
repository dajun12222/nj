<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :class="`${prefixCls}-wrap`">
    <div :class="`${prefixCls}`">
      <div :class="`${prefixCls}-header`">权限管理</div>
      <div :class="`${prefixCls}-describe`">
        <h4>权限概览</h4>
        <p>数据流使用者可以使用该数据流创建仪表盘中的图表</p>
      </div>
      <div :class="`${prefixCls}-user`">
        <div :class="`${prefixCls}-user-title`">使用者</div>
        <a-row :gutter="20">
          <div :class="`${prefixCls}-user-list`">
            <a-col
              v-for="item in userScope"
              :key="item.id"
              :xl="4"
              :xxl="4"
              :lg="6"
              :md="6"
              :sm="12"
            >
              <div :class="`${prefixCls}-list-item`">
                <div class="left">
                  <a-avatar v-if="item.imgUrl" :size="40" :src="item.imgUrl" />
                  <i
                    v-else
                    class="icon aufontAll h-icon-all-normal_smile default-avatar"
                  ></i>
                </div>
                <div class="center">
                  <p class="name">
                    {{ item.name }}
                  </p>
                  <p class="department">组织：{{ item.departmentName }}</p>
                </div>
                <div class="right">
                  <a-icon
                    class="delet-btn"
                    type="delete"
                    @click="deleteMember(item.id)"
                  />
                </div>
              </div>
            </a-col>

            <!-- 添加成员按钮 -->
            <a-col :xl="4" :xxl="4" :lg="6" :md="6" :sm="12">
              <div
                :class="`${prefixCls}-list-item add-block`"
                @click="addMembers"
              >
                <a-icon type="plus" class="add-icon" />
                <span class="text">添加成员</span>
              </div>
            </a-col>
          </div>
        </a-row>
      </div>
    </div>

    <!-- 选择子管理员模态框 -->
    <a-modal
      :visible="staffSelectorModalVisble"
      width="600px"
      title="选择子管理员"
      :maskClosable="false"
      :closable="true"
      @cancel="closeModal"
      @ok="submitMember"
    >
      <div class="modal-wrapper">
        <p>子管理员:</p>
        <a-select
          v-model="selectedStaffSelectorList"
          class="select"
          showSearch
          mode="multiple"
          placeholder="请选择"
          optionFilterProp="children"
          :filterOption="filterOption"
        >
          <a-select-option
            v-for="(manager, index) in childManagerList"
            :key="index"
            :value="manager.userId"
          >
            {{ `${manager.name} [${manager.departmentName}]` }}
          </a-select-option>
        </a-select>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import reportApi from '@/apis/report/data-source-api';
import systemApi from '@/apis/system/system-manager.api';
import { Modal, Select, Row, Col, Icon, Avatar } from '@h3/antd-vue';

@Component({
  name: 'permission-list',
  components: {
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARow: Row,
    ACol: Col,
    AIcon: Icon,
    AAvatar: Avatar,
  },
})
export default class PermissionForm extends Vue {
  prefixCls: string = 'permission-list';

  staffSelectorModalVisble: boolean = false; //选择子管理员模态框控制

  selectedStaffSelectorList: any = []; //选择子管理员清单

  userScope: any = null;

  mainId: string = '';

  @Prop({ default: '' })
  objectId!: String;

  @Prop({ default: '' })
  nodeType!: String;

  childManagerList = []; //子管理员源数据

  created() {
    this.getManagetList();
  }

  manageParams = {
    managerType: 2,
    listShow: true,
    searchWord: '',
    page: 0,
    size: 9999,
  };

  async fetchPermissons() {
    const params = {
      objectId: this.objectId,
    };
    reportApi.getPermission(params).then((res: any) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      } else {
        // 获取用户组信息
        if (res.data) {
          const data: any = res.data;
          this.mainId = data.id;
          this.userScope = data.userScope;
          this.userScope.forEach((item) => {
            this.selectedStaffSelectorList.push(item.id);
          });
        }
      }
    });
  }

  closeModal() {
    this.staffSelectorModalVisble = false;
  }

  submitMember(val) {
    if (this.selectedStaffSelectorList.length === 0) {
      this.$message.error('请选择使用者！');
      return;
    }
    const ids = this.selectedStaffSelectorList.join(',');
    this.updatePermissFunction(ids);
  }

  updatePermissFunction(ids) {
    const params = {
      id: this.mainId,
      objectId: this.objectId,
      userScope: ids,
      nodeType: this.nodeType,
    };
    console.log(params);
    reportApi.updatePermiss(params).then((res: any) => {
      if (res.errcode !== 0) {
        this.$message.error(res.errmsg as string);
        return;
      } else {
        this.staffSelectorModalVisble = false;
        this.$message.success(res.errmsg as string);
        this.fetchPermissons();
      }
    });
  }

  @Watch('objectId', {
    immediate: true,
  })
  onObjectIdChange(id: string) {
    console.log(id);
    if (id && id !== '') {
      this.fetchPermissons();
    }
  }

  // 删除成员
  deleteMember(id: string) {
    console.log('删除成员', id);
    const self = this;
    this.$confirm({
      title: '确定删除该使用者吗?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        self.userScope = self.userScope.filter((item: any) => item.id !== id);
        const ids = self.userScope
          .reduce((stat: any, item: any) => {
            stat.push(item.id);
            return stat;
          }, [])
          .join(',');
        self.updatePermissFunction(ids);
      },
    });
  }

  // 添加成员
  addMembers() {
    this.staffSelectorModalVisble = true;
    this.selectedStaffSelectorList = [];
    this.fetchPermissons();
  }

  // 获取管理员列表
  getManagetList() {
    systemApi.getListManager(this.manageParams).then((res: any) => {
      if (!res.errcode && res.data) {
        const obj = {};
        this.childManagerList = res.data.content.reduce((cur, next) => {
          if (!obj[next.userId]) {
            obj[next.userId] = true;
            cur.push(next);
          }
          return cur;
        }, []);
        this.childManagerList.forEach((item: any, index: number) => {
          if (!item.departmentName) {
            item.departmentName = [];
          }
          item.departmentName.reverse();

          // 所属组织超过三级 中间以省略号代替
          if (item.departmentName.length > 3) {
            const arr: Array<string> = [
              item.departmentName[0],
              '...',
              item.departmentName[item.departmentName.length - 1],
            ];
            item.departmentName = arr;
          }
          item.departmentName = item.departmentName.join('/');
        });
      } else {
        this.childManagerList = [];
      }
    });
  }

  filterOption(input: any, option: any) {
    return (
      option.componentOptions.children[0].text
        .toLowerCase()
        .indexOf(input.toLowerCase()) >= 0
    );
  }

  async mounted() {}
}
</script>

<style lang="less" scoped></style>

<style lang="less">
.permission-list-wrap {
  flex: 1;
  overflow: hidden;
  background-color: #f3f5f8;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-content: center;
  width: 100%;
  .permission-list {
    flex: 1;
    background: #fff;
    padding: 24px;
  }

  .permission-list-header {
    font-size: 18px;
    color: #333;
  }

  .permission-list-user {
    height: 100%;
    .ant-row {
      overflow: auto;
      height: calc(100% - 200px);
    }
    .permission-list-user-title {
      color: #333;
      font-size: 14px;
      font-weight: 700;
      line-height: 40px;
      margin-top: 28px;
      margin-bottom: 14px;
    }
  }

  .permission-list-describe {
    h4 {
      font-size: 14px;
      font-weight: 700;
      line-height: 40px;
      margin-top: 28px;
      margin-bottom: 14px;
    }
    p {
      font-size: 12px;
      color: #1e1e1e;
    }
  }

  .permission-list-user-list {
    .permission-list-list-item {
      height: 84px;
      padding: 16px;
      display: flex;
      background: #f9f9f9;
      margin-bottom: 20px;
      .left {
        padding-right: 10px;
        padding-top: 5px;
        .default-avatar {
          width: 32px;
          height: 32px;
          line-height: 40px;
          border-radius: 50%;
          font-size: 40px;
          text-align: center;
          color: #ffb131;
        }
      }
      .center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        p {
          &:last-child {
            margin-top: 5px;
          }
        }
        .name {
          color: #17bc92;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .department {
          color: #999;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .right {
        display: flex;
        align-items: center;
        .delet-btn {
          display: none;
          cursor: pointer;
        }
      }
      &:hover {
        background: #fff;
        border-radius: 2px;
        box-shadow: 0px 2px 5px #ddd;
        .delet-btn {
          display: block;
        }
      }
    }
    .add-block {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .add-icon {
        margin-right: 10px;
        font-size: 20px;
        color: #666;
      }
      .text {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
.modal-wrapper {
  .select {
    width: 90%;
  }
}
</style>
