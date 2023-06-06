<template>
  <div>
    <p v-if="data.length > 0">
      <a-checkbox :checked="isCheckedAll" @change="(e) => onChange(e, 'all')">
        全部
      </a-checkbox>
    </p>
    <ul>
      <li v-for="(item, index) in data" :key="index">
        <span
          v-if="item.children"
          class="is-show-icon"
          @click="toggleShowChild(item)"
        >
          <a-icon v-if="item.showChild" type="caret-down" />
          <a-icon v-else type="caret-right" />
        </span>

        <a-checkbox
          :checked="item.checked"
          @change="(e) => onChange(e, item)"
        />

        <span class="text">{{ item.name }}</span>

        <template v-if="item.children && item.showChild">
          <TreeList :treeData="item.children" />
        </template>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Icon, Checkbox } from '@h3/antd-vue';
@Component({
  name: 'TreeList',
  components: {
    ACheckbox: Checkbox,
    AIcon: Icon,
  },
})
export default class TreeList extends Vue {
  @Prop({
    type: Array,
  })
  treeData!: any;

  @Prop({
    type: Array,
  })
  checkedList!: any[];

  toggleShowChild(item) {
    this.$set(item, 'showChild', !item.showChild);
  }

  @Watch('data', {
    deep: true,
    immediate: true,
  })
  onDataChange() {
    this.isCheckedAll = this.computeIsCheckedAll();
    this.$emit('treeDataChange', this.data);
  }

  onChange(e, item: any) {
    if (item === 'all') {
      this.isCheckedAll = e.target.checked;
      this.setCheckedList(this.isCheckedAll);
    } else {
      this.$set(item, 'checked', !item.checked);
    }
  }

  setCheckedList(type) {
    const _this = this;
    function dee(data) {
      data.forEach((element) => {
        _this.$set(element, 'checked', type);
        if (element.children) {
          dee(element.children);
        }
      });
    }
    dee(this.data);
  }

  isCheckedAll: boolean = true;

  computeIsCheckedAll() {
    // 计算是否全部选中
    let res = true;
    function dee(data) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (!element.checked) {
          res = false;
          break;
        }
        if (element.children) {
          dee(element.children);
        }
      }
    }
    dee(this.data);
    return res;
  }

  @Watch('treeData')
  onTreeDataChange() {
    this.data = this.treeData;
  }

  data: any = [];

  created() {
    this.data = this.treeData;
  }
}
</script>
<style lang="less" scoped>
p {
  padding-left: 16px;
  margin: 8px 0;
}
ul {
  li {
    padding-left: 16px;
    position: relative;
    margin-bottom: 8px;
    .is-show-icon {
      position: absolute;
      left: 0;
      i {
        cursor: pointer;
        font-size: 12px;
        color: #999;
      }
    }
  }
}
span.text {
  margin-left: 8px;
}
</style>
