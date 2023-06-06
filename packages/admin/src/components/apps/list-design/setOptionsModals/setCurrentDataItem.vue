<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="set-data-item">
    <div class="check-all">
      <a-checkbox
        :indeterminate="indeterminate"
        :checked="checkAll"
        @change="onCheckAllChange"
      >
        全选
      </a-checkbox>
    </div>

    <div
      class="scroll-wrapper"
      :style="{ maxHeight: maxHeight, width: wrapperWidth }"
    >
      <a-checkbox-group v-model="checkedList">
        <h4>业务数据项</h4>

        <template v-for="(item, key) in bizs">
          <div v-show="isCanShow(item)" :key="key + item.id" class="data-item">
            <a-checkbox :value="item.id">
              {{ item.name }}
            </a-checkbox>
            <span class="code">
              {{ item.code }}
            </span>
          </div>
        </template>

        <h4>系统数据项</h4>
        <template v-for="(item, key) in systems">
          <div :key="key + item.id" class="data-item">
            <a-checkbox :value="item.id">
              {{ item.name }}
            </a-checkbox>
            <span class="code">
              {{ item.code }}
            </span>
          </div>
        </template>
      </a-checkbox-group>
    </div>
  </div>
</template>
<script lang="ts">
import { Checkbox } from '@h3/antd-vue';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'setCurrentDataItem',
  components: {
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
  },
})
export default class setCurrentDataItem extends Vue {
  @Prop() data!: any[];

  @Prop() checkedDataItemList!: string[];

  @Prop({
    default: '500px',
  })
  maxHeight?: string;

  @Prop({
    default: 'unset',
  })
  wrapperWidth?: string;

  indeterminate: boolean = false;

  checkAll: boolean = false;

  checkedList: string[] = [];

  @Watch('checkedDataItemList', {
    immediate: true,
  })
  onCheckedDataItemListChange(list) {
    this.checkedList = list;
  }

  onCheckAllChange(e) {
    const type = e.target.checked;
    if (type) {
      this.checkedList = this.data.map((el) => el.id);
    } else {
      this.checkedList = [];
    }
  }

  created() {
    this.onCheckedListChange(this.checkedList);
  }

  @Watch('checkedList')
  onCheckedListChange(checkedList, oldCheckedList?) {
    if (checkedList && this.data && checkedList.length === this.data.length) {
      this.checkAll = true;
      this.indeterminate = false;
    } else if (checkedList.length) {
      this.checkAll = false;
      this.indeterminate = true;
    } else {
      this.checkAll = false;
      this.indeterminate = false;
    }

    // 筛选出选中数据项中，在子表中的关联表单并判断 子表是否选中： 子表未选中，删除子表中关联表单的选中状态
    const inSheetCheckedDataItems =
      this.bizs &&
      this.bizs.filter(
        (el: any) => checkedList.includes(el.id) && el.parentSheetId,
      );
    if (inSheetCheckedDataItems && inSheetCheckedDataItems.length) {
      inSheetCheckedDataItems.forEach((el) => {
        if (!this.checkedList.includes(el.parentSheetId)) {
          this.checkedList = this.checkedList.filter((ele) => ele !== el.id);
        }
      });
    }
    if (
      (!oldCheckedList || oldCheckedList.length === 0) &&
      checkedList.length === 0
    ) {
      return;
    }

    this.$emit('checkedListChange', this.checkedList);
  }

  get bizs() {
    // 业务数据项
    return this.data && this.data.filter((x) => !x.defaultProperty);
  }

  get systems() {
    // 系统数据项
    return this.data && this.data.filter((x) => x.defaultProperty);
  }

  get checkedDataItems() {
    return (
      this.data && this.data.filter((el) => this.checkedList.includes(el.id))
    );
  }

  isCanShow(item) {
    //  子表中的关联表单 需要在子表被选中状态才能显示
    let res = true;
    if (item.parentSheetId) {
      res = false;
    }
    return res;
  }
}
</script>
<style lang="less" scoped>
.check-all {
  margin-top: 22px;
  margin-bottom: 12px;
}
.scroll-wrapper {
  max-height: 500px;
  overflow: auto;
  h4 {
    font-weight: 400;
    color: #bfbfbf;
    margin: 10px 0;
    font-size: 12px;
  }
}

.data-item {
  display: flex;
  justify-content: space-between;
  height: 40px;
  align-items: center;
  .code {
    color: #999;
    padding-right: 14px;
  }
}
</style>
<style lang="less">
.set-data-item {
  .ant-checkbox-group {
    width: 100%;
  }
}
</style>
