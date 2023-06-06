<template>
  <a-modal
    v-model="visible"
    :title="$t('cloudpivot.list.pc.modifyOwner')"
    :width="480"
    :maskClosable="false"
    :keyboard="false"
    :okText="$t('cloudpivot.list.pc.OK')"
    :cancelText="$t('cloudpivot.list.pc.Cancel')"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    @ok="ok"
    @cancel="close"
  >
    <div class="modify-owner">
      <a-row v-if="num > 0" class="modify-owner__item">
        <a-col :span="24">
          <a-alert
            :message="$t('cloudpivot.list.pc.ownerTip', { num: num })"
            banner
          />
        </a-col>
      </a-row>

      <a-row class="modify-owner__item">
        <a-col :span="24" class="modify-owner__left" style="margin-bottom: 6px">
          <span class="label-required">{{
            $t('cloudpivot.list.pc.owner')
          }}</span>
        </a-col>
        <a-col :span="24" class="modify-owner__right">
          <staff-selector
            v-model="owner"
            :options="taffSelectorOpts"
            displayType="plus"
            @change="onValueChange"
          />
        </a-col>
      </a-row>

      <a-row v-if="owner.length > 0" class="modify-owner__item">
        <a-col :span="24" class="modify-owner__left" style="margin-bottom: 6px">
          <span>{{ $t('cloudpivot.list.pc.ownerDepartment') }}</span>
        </a-col>
        <a-col :span="24" class="modify-ownerr__right">
          <a-select v-model="departments" style="width: 100%">
            <a-select-option
              v-for="(opt, index) in departmentsList"
              :key="index"
              :value="opt.deptId"
              :title="opt.deptName"
            >
              {{ opt.deptName }}
            </a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <a-row class="modify-owner__item">
        <a-col :span="24" class="modify-owner__left" style="margin-bottom: 6px">
          <span>{{ $t('cloudpivot.list.pc.modifyExplain') }}</span>
        </a-col>
        <a-col :span="24" class="modify-owner__right">
          <a-textarea
            v-model="remark"
            :placeholder="$t('cloudpivot.list.pc.placeholder')"
            :maxLength="1000"
          />
        </a-col>
      </a-row>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Alert, Col, Input, Modal, Row, Select } from '@h3/antd-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { userApi } from '../../../../../api';
import StaffSelector from '../../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';

@Component({
  name: 'form-modify-owner-modal',
  components: {
    AModal: Modal,
    ARow: Row,
    ACol: Col,
    Alert,
    ATextarea: Input.TextArea,
    ASelect: Select,
    ASelectOption: Select.Option,
    StaffSelector,
  },
})
export default class FormModifyOwnerModal extends Vue {
  @Prop() checkeds!: Array<any>;

  @Prop() dataSource!: Array<any>;

  @Prop({ default: 20 }) pageSize!: number;

  @Prop({ default: 0 }) curPage!: number;

  @Prop() schemaCode!: string;

  @Prop() queryCode!: string;

  visible: boolean = false;

  modal: string = '';

  owner: Array<any> = [];

  departments: string = '';

  departmentsList: Array<any> = [];

  remark: string = '';

  num: number = 0;

  confirmLoading: boolean = false;

  action: any = '';

  layout: any = {
    left: 6,
    right: 18,
  };

  taffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '选择拥有者',
  };

  init(num: number, action: any) {
    this.num = num;
    this.action = action;
    this.show();
  }

  show() {
    this.visible = true;
  }

  close() {
    this.confirmLoading = false;
    this.owner = [];
    this.departmentsList = [];
    this.departments = '';
    this.remark = '';
    this.visible = false;
  }

  ok() {
    if (this.owner.length === 0) {
      this.$message.info(
        this.$t('cloudpivot.list.pc.pleaseSelectOwner') as string,
      );
      return;
    }
    const objectIds: any = [];
    this.checkeds.forEach((c: boolean, index: number) => {
      if (c) {
        objectIds.push(this.dataSource[index].id);
      }
    });
    const data = {
      mobile: false,
      isSheet: false,
      page: this.curPage - 1,
      size: this.pageSize,
      schemaCode: this.schemaCode,
      objectIds,
      ownerId: this.owner[0].id,
      ownerDeptId: this.departments,
      remark: this.remark,
      filters: [
        {
          propertyCode: 'id',
          propertyType: 13,
          propertyValue: objectIds.join(';'),
          propertyValueName: '',
          queryFilterType: 'In',
        },
      ],
    };
    this.$emit('modifyOwnerClick', data, this.action);
  }

  onValueChange(value: any[]) {
    if (value.length > 0) {
      this.getUserDepartments(value[0].id);
    } else {
      this.departmentsList = [];
      this.departments = '';
    }
  }

  async getUserDepartments(userId: string) {
    const res: any = await userApi.getUserDepartments(userId);
    if (res && res.errcode === 0) {
      this.departmentsList = res.data;
      const resoure = res.data.find((d: any) => d.isMain);
      this.departments = resoure.deptId;
    } else {
      this.$message.error(res.errmsg);
    }
  }
}
</script>

<style lang="less" scoped>
.modify-owner {
  &__item + &__item {
    margin-top: 16px;
    // .modify-owner__left {
    //   height: 32px;
    //   line-height: 32px;
    // }
    .modify-owner__right {
      & textarea.ant-input {
        min-height: 96px;
      }
    }
  }
  &__left > span {
    height: 22px;
    font-size: 14px;
    font-weight: 400;
    color: #111218;
    line-height: 22px;
  }
}
.label-required:after {
  content: '*';
  display: block;
  font-size: 14px;
  position: absolute;
  left: 50px;
  top: 3px;
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
  color: #f5222d;
  line-height: 22px;
  height: 22px;
}

/deep/.ant-select-selection {
  border-radius: 2px;
  border: 1px solid #d4d5d6;
}

/deep/.ant-input {
  border-radius: 2px;
  border: 1px solid #d4d5d6;
}

/deep/.ant-modal-content {
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
/deep/.ant-modal-header {
  border-bottom: none;
  padding: 24px;
  .ant-modal-title {
    height: 24px;
    font-size: 16px;
    font-weight: 600;
    color: #111218;
    line-height: 24px;
  }
}
/deep/.ant-modal-close-x {
  width: 57px;
  height: 72px;
  line-height: 72px;
}
/deep/.ant-modal-footer {
  border-top: none;
  padding: 24px;
  .ant-btn {
    height: 32px;
    padding: 0;
    > span {
      height: 22px;
      font-size: 14px;
      color: #111218;
      line-height: 22px;
    }
    &:hover {
      border-color: #5291ff;
      > span {
        color: #5291ff;
      }
    }
    &:active {
      border-color: #2970ff;
      > span {
        color: #2970ff;
      }
    }
    &.ant-btn-primary {
      > span {
        color: rgba(255, 255, 255, 0.9);
      }
      &:hover {
        background: #5291ff;
        border-color: #5291ff;
        > span {
          color: rgba(255, 255, 255, 0.9);
        }
      }
      &:active {
        background: #1852d9;
        border-color: #1852d9;
        > span {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}
/deep/.ant-modal-body {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
