<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="role-scope-item" :class="{ syncUser: !syncUserFlag }">
    <div class="title">
      <a-checkbox
        :disabled="!syncUserFlag"
        :indeterminate="indeterminate"
        :checked="checkAll"
        @change="onCheckAllChange"
      />
      <span class="title-name">
        {{ title }}
        <template v-if="title === '管理员'">
          <small>【{{ getSystemType() }}】</small>
        </template>
        <template v-else>
          <span class="font-ele">({{ data.length }})</span>
        </template>
      </span>
    </div>

    <div v-if="title === '部门主管'" class="content">
      <div class="dep">
        <div
          v-for="item in data"
          :key="item.id"
          class="list-item"
          :title="item.name"
        >
          <a-checkbox
            v-model="item.checked"
            :disabled="(!checkAll && !indeterminate) || !syncUserFlag"
            @change="(e) => roleItemChange(e, item)"
          />
          <span class="list-item-name">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <div v-if="title === '角色'" class="content">
      <div v-for="item in data" :key="item.roleId" class="role-wrapper">
        <div class="role" :title="item.roleName">
          <a-checkbox
            :indeterminate="item.indeterminate"
            :checked="item.checked"
            :disabled="!syncUserFlag"
            @change="(e) => roleItemChange(e, item)"
          />
          <span class="list-item-name">{{ item.roleName }}</span>
        </div>
        <div class="role-list">
          <div
            v-for="el in item.list"
            :key="el.id"
            class="list-item"
            :title="el.name"
          >
            <a-checkbox
              v-model="el.checked"
              :disabled="!item.checked && !item.indeterminate"
              @change="(e) => roleItemChange(e, item, el)"
            />
            <span class="list-item-name">{{ el.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Checkbox } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
@Component({
  name: 'roleScopeItem',
  components: {
    ACheckbox: Checkbox,
  },
})
export default class roleScopeItem extends Vue {
  @Prop({ default: '' }) title!: string;

  @Prop({
    default: () => {
      return {};
    },
  })
  data!: any;

  @Prop({ default: false }) value!: boolean;

  @Prop({ default: false }) syncUserFlag!: boolean;

  @Watch('data')
  onDataChange() {
    this.indeterminate = false;
    this.checkAll = false;
  }

  indeterminate: boolean = false;

  checkAll: boolean = false;

  @Watch('indeterminate')
  onIndeterminateChange() {
    this.$emit('input', this.indeterminate || this.checkAll);
  }

  @Watch('checkAll')
  checkAllChange() {
    this.$emit('input', this.indeterminate || this.checkAll);
  }

  getSystemType() {
    const types = this.data.adminModelList.map((el) => el.managerTypeName);
    return [...new Set(types)].join('、');
  }

  onCheckAllChange(e) {
    const val: boolean = e.target.checked;
    this.checkAll = val;
    this.indeterminate = false;
    if (this.title === '管理员') {
      return;
    }
    this.toggleCheckedAll(val);
  }

  // 全选状态修改
  toggleCheckedAll(type) {
    this.data.forEach((item) => {
      item.checked = type;
      item.indeterminate = false;
      if (item.list && Array.isArray(item.list)) {
        item.list.forEach((element) => {
          element.checked = type;
        });
      }
    });
    this.$forceUpdate();
  }

  roleItemChange(e, item: any, el?: any) {
    const val: boolean = e.target.checked;
    if (item.list && el === undefined) {
      item.checked = val;
      item.indeterminate = false;
      item.list.forEach((element) => {
        element.checked = val;
      });
    } else if (el) {
      if (item.list.every((ele) => ele.checked)) {
        item.checked = true;
        item.indeterminate = false;
      } else if (item.list.some((ele) => ele.checked)) {
        item.checked = false;
        item.indeterminate = true;
      } else {
        item.checked = false;
        item.indeterminate = false;
      }
    } else {
      //Else Empty block statement
    }
    this.checkIsAllChecked();
    this.$forceUpdate();
  }

  checkIsAllChecked() {
    if (this.data.every((ele) => ele.checked)) {
      // 所有的都是选中
      this.checkAll = true;
      this.indeterminate = false;
    } else if (this.data.some((ele) => ele.checked || ele.indeterminate)) {
      // 部分选中
      this.checkAll = false;
      this.indeterminate = true;
    } else {
      // 不选中
      this.checkAll = false;
      this.indeterminate = false;
    }
  }
}
</script>
<style lang="less" scoped>
.role-scope-item {
  border: 1px solid #eee;
  border-radius: 2px;
  min-height: 46px;
  margin-top: 10px;
  margin-left: 42px;
  padding: 0 20px;
}

.syncUser {
  .title {
    .title-name {
      color: rgba(17, 18, 24, 0.25);
    }
  }

  .role-wrapper {
    .list-item-name {
      color: rgba(17, 18, 24, 0.25);
    }
  }

  .list-item-name,
  .role-wrapper .role-list .list-item-name {
    color: rgba(17, 18, 24, 0.25);
  }
}

.title {
  height: 46px;
  display: flex;
  align-items: center;
  .title-name {
    font-size: 14px;
    font-weight: 600;
    color: #111218;
    margin-left: 5px;
  }
}
.content {
  border-top: 1px solid #eee;
}

.dep {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
.role-wrapper {
  .role {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .list {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid #eee;
    padding-left: 20px;
    .list-item-name {
      font-size: 14px;
      color: rgba(17, 18, 24, 0.5);
    }
  }
}

.list-item {
  display: flex;
  align-items: center;
  height: 40px;
  margin-right: 20px;
}
.list-item-name {
  margin-left: 8px;
  font-size: 14px;
  color: #111218;
  max-width: 7em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
small {
  font-size: 14px;
  color: rgba(17, 18, 24, 0.5);
}
</style>
