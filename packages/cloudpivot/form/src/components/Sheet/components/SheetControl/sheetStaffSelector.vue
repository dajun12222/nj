<template>
  <div class="SheetStaffSelector">
    <div v-if="edit">
      <div v-if="control.type === 50">
        <StaffSelector
          v-model="control.controller._value"
          :options="staffSelectorSingleOpts"
          displayType="input"
          :params="params"
          @change="onChangeStaff"
        />
      </div>
      <div v-else-if="control.type === 51">
        <StaffSelector
          v-model="control.controller._value"
          :options="staffSelectorMultiOpts"
          displayType="input"
          :params="params"
          @change="onChangeStaff"
        />
      </div>
      <div v-else-if="control.type === 60">
        <StaffSelector
          v-model="control.controller._value"
          :options="staffSelectorDeptSingleOpts"
          displayType="input"
          :params="params"
          @change="onChangeStaff"
        />
      </div>
      <div v-else-if="control.type === 61">
        <StaffSelector
          v-model="control.controller._value"
          :options="staffSelectorDeptMultiOpts"
          displayType="input"
          :params="params"
          @change="onChangeStaff"
        />
      </div>
      <div v-else-if="control.type === 62">
        <StaffSelector
          v-model="control.controller._value"
          :options="staffSelectorDeptMixOpts"
          displayType="input"
          :params="params"
          @change="onChangeStaff"
        />
      </div>
    </div>
    <div v-else>
      <div class="form-staff">
        <template v-for="item in control.controller._value">
          <a-tooltip :key="item.id" placement="top">
            <template v-if="item.fullDepartment" slot="title">
              {{ item.fullDepartment }}
            </template>
            <div :key="item.id" class="form-staff-item">
              <a-avatar
                v-if="item.type === 1"
                size="small"
                :src="
                  require('../../../../renderer/components/images/dept.png')
                "
              />
              <a-avatar
                v-if="item.type === 3"
                icon="user"
                size="small"
                :src="getDownloadUrlNew(item.imgUrl)"
              />
              <span class="user-name" :title="item.name">{{ item.name }}</span>
            </div>
          </a-tooltip>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';

import { Button, Tooltip, Avatar } from '@h3/antd-vue';

import StaffSelector from '../../../../common/components/form-staff-selector/pc/staff-selector.vue';

import getDownloadUrlNew from '../../../../../../common/src/utils/getDownloadUrlNew';

@Component({
  name: 'SheetUpload',
  components: {
    StaffSelector,
    ATooltip: Tooltip,
    AAvatar: Avatar,
  },
})
export default class sheetStaffSelector extends Vue {
  @Prop() control: any;

  @Prop({ default: false }) edit?: boolean;

  onChangeStaff(e) {
    this.$emit('change', e);
  }

  staffSelectorSingleOpts: any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  staffSelectorMultiOpts: any = {
    selectOrg: false,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  staffSelectorDeptSingleOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: false,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  staffSelectorDeptMultiOpts: any = {
    selectOrg: true,
    selectUser: false,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  staffSelectorDeptMixOpts: any = {
    selectOrg: true,
    selectUser: true,
    mulpitle: true,
    showModel: true,
    showSelect: true,
    placeholder: '请选择',
  };

  params: any = {
    corpId: '',
  };

  getDownloadUrlNew(img) {
    if (img && img.includes('http')) {
      return img;
    } else if (img) {
      return getDownloadUrlNew.getImageUrl(img);
    } else {
      return img;
    }
  }

  mounted() {}
}
</script>

<style lang="less" scoped>
@import './../../../../../../common/common';

.form-staff {
  max-height: 100px;
  overflow: hidden;
  transition: all 0.15s ease;

  &.expanded {
    max-height: 100rem;
  }

  &__more {
    color: @primary-color;
    display: inline-block;
    right: 0.5em;
    bottom: 0.5em;
    cursor: pointer;

    & > i {
      display: inline-block;
      margin-left: 2px;
      font-size: 12px;
      transition: transform 0.24s;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }
}

.form-staff-item {
  display: inline-flex;
  align-items: center;
  background: #eceff2;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 72px;
  min-height: 32px;
  vertical-align: top;
  margin-bottom: 0.5em;
  cursor: pointer;

  &:not(:last-child) {
    margin-right: 0.5em;
  }

  & > .ant-avatar {
    margin-right: 4px;
  }

  & > .user-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 8em;
  }
}
</style>
