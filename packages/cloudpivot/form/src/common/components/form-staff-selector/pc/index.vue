<!--
 * @Author: your name
 * @Date: 2020-04-22 13:53:03
 * @LastEditTime: 2020-04-26 17:28:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \frontend\modules\cloudpivot\form\src\common\components\form-staff-selector\pc\index.vue
 -->

<template>
  <staff-selector
    v-if="!readonly && !isExternal"
    v-model="val"
    :options="staffSelectorOpts"
    :onlyForm="true"
    :controlOpts="controlOpts"
    :placeholder="placeholder"
    :disabled="readonlyFormula"
    :params="{ sourceType: getSourceType() || '', filterType: 'root_display' }"
    :queryDisplayType="displayType"
    :showDetail="true"
    @change="onValueChange"
  />

  <div v-else class="form-staff-warp">
    <template v-if="displayType === 'text'">
      {{ text }}
    </template>

    <template v-else>
      <div class="form-staff" :class="{ expanded: !collapsed }">
        <template v-for="item in val">
          <a-tooltip :key="item.id" placement="top">
            <template v-if="item.fullDepartment" slot="title">
              {{ item.fullDepartment }}
            </template>
            <div :key="item.id" class="form-staff-item">
              <a-avatar
                v-if="item.type === 1"
                size="small"
                :src="require('../images/dept.png')"
              />

              <a-avatar
                v-if="item.type === 3 && getDownloadUrlNew(item.imgUrl)"
                icon="user"
                size="small"
                :src="getDownloadUrlNew(item.imgUrl)"
              />
              <i
                v-else-if="item.type === 3 && !getDownloadUrlNew(item.imgUrl)"
                class="user_icon icon aufontAll h-icon-all-head-portrait"
              ></i>

              <span class="user-name" :title="item.name">{{ item.name }}</span>
            </div>
          </a-tooltip>
        </template>
      </div>

      <div style="text-align: right">
        <span v-if="showToggle" class="form-staff__more" @click="toggle">
          <span v-show="collapsed">{{
            $t('cloudpivot.form.renderer.expand')
          }}</span>
          <span v-show="!collapsed">{{
            $t('cloudpivot.form.renderer.collapse')
          }}</span>
          <i
            class="icon aufontAll h-icon-all-down-o"
            :class="{ expanded: !collapsed }"
          ></i>
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Avatar, Icon, Tag, Tooltip } from '@h3/antd-vue';
import { Component,Watch } from 'vue-property-decorator';
import { StaffSelectorControl } from '../controls/staff-selector-control';
import StaffSelector from './staff-selector.vue';
import getDownloadUrlNew from '../../../../../../common/src/utils/getDownloadUrlNew';
@Component({
  name: 'form-staff-selector',
  components: {
    ATag: Tag,
    AIcon: Icon,
    AAvatar: Avatar,
    StaffSelector,
    ATooltip: Tooltip,
  },
})
export default class FormStaffSelector extends StaffSelectorControl {
  showToggle = false;

  collapsed = true;

  taskRef: any;

  // @Watch('controlOpts', { deep: true, immediate: true })
  // onChangeControlOpts(newVal: any) {}

  toggle() {
    this.collapsed = !this.collapsed;
  }

  scroll() {
    const el = this.$el.querySelector('.form-staff') as HTMLDivElement;
    if (el) {
      this.showToggle = el.scrollHeight > el.offsetHeight + 3;
      if (el.offsetHeight === 0) {
        clearTimeout(this.taskRef);
        this.taskRef = setTimeout(() => {
          this.scroll();
        }, 1000);
      }
    }
  }

  onValueChange(value: any[]) {
    const val = value && value.length > 0 ? value : null;
    this.setValue(val);
  }

  mounted() {
    // 选人控件需要从根节点开始显示
    this.staffSelectorOpts.isDisplayRoot = true;
    if (this.readonly) {
      this.$nextTick(() => {
        this.scroll();
      });
    }
  }

  get apiHost() {
    return (window as any).config.apiHost;
  }

  get token() {
    return window.localStorage.getItem('token');
  }

  getDownloadUrlNew(img) {
    if (img && img.includes('http')) {
      return img;
    } else if (img) {
      return getDownloadUrlNew.getImageUrl(img);
    } else {
      return img;
    }
  }

  // 是否为外部用户
  get isExternal() {
    if ((window as any).isExternal) {
      return true;
    }
    return false;
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../common/common';

// .form-staff-warp{
//   position: relative;
// }

.user_icon {
  font-size: 22px;
  margin-right: 4px;
  color: #ffb131;
}

.form-staff {
  max-height: 115px;
  overflow: hidden;
  transition: all 0.15s ease;

  &.expanded {
    max-height: 100rem;
  }

  &__more {
    color: @primary-color;
    // position: absolute;
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
