<template>
  <div class="modify-owner">
    <div class="row">
      <label><span class="label-required">{{ i18nData.selectOwner }}</span></label>
      <div>
        <staff-selector
          v-model="owner"
          :options="taffSelectorOpts"
          displayType="plus"
          @change="onValueChange"
        />
      </div>
    </div>
    <div class="row">
      <label>{{ i18nData.ownerDepartment }}</label>
      <div>
        <config-provider :locale="locale">
          <a-select
            v-model="departments"
            :placeholder="i18nData.pleaseSelect"
            style="width: 100%"
          >
            <a-select-option
              v-for="(opt, index) in departmentsList"
              :key="index"
              :value="opt.deptId"
              :title="opt.deptName"
            >
              {{ opt.deptName }}
            </a-select-option>
          </a-select>
        </config-provider>
      </div>
    </div>
    <div class="row">
      <label>{{ i18nData.modifyExplain }}</label>
      <div>
        <a-textarea v-model="remark" placeholder="请输入" :maxLength="1000" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { Row, Col, Input, Select } from '@h3/antd-vue';

import StaffSelector from '../../../../form/src/common/components/form-staff-selector/pc/staff-selector.vue';
import { ConfigProvider } from '@h3/antd-vue';
import { userApi } from '../../../../api';
import zhCN from '@h3/antd-vue/lib/locale-provider/zh_CN';
import enUS from '@h3/antd-vue/lib/locale-provider/en_US';

@Component({
  name: 'form-modify-owner',
  components: {
    ARow: Row,
    ACol: Col,
    ATextarea: Input.TextArea,
    ASelect: Select,
    ASelectOption: Select.Option,
    StaffSelector,
    ConfigProvider,
  },
})
export default class FormModifyOwner extends Vue {
  @Prop()
  i18nData!: any;

  @Prop() newLocale: any;

  owner: Array<any> = [];

  departments = undefined;

  departmentsList: Array<any> = [];

  remark: string = '';

  taffSelectorOpts: any = {
    selectOrg: false,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '选择拥有者',
  };

  get locale() {
    switch (this.newLocale) {
      case 'zh':
      default:
        return zhCN;

      case 'en':
        return enUS;
    }
  }

  onValueChange(value: any[]) {
    if (value.length > 0) {
      this.getUserDepartments(value[0].id);
    } else {
      this.departmentsList = [];
      this.departments = undefined;
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
  height: 275px;
  .row {
    margin-bottom: 15px;
    > label {
      position: relative;
      display: inline-block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #111218;
      line-height: 22px;
    }
    textarea {
      height: 96px;
    }
  }
}
.label-required:after {
  content: '*';
  display: block;
  font-size: 14px;
  position: absolute;
  right: -13px;
  top: 4px;
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
  color: #f0353f;
  line-height: 19px;
}
</style>
