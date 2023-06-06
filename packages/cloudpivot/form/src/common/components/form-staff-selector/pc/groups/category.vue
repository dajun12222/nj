<template>
  <div>
    <div
      v-for="item in list"
      :key="item.id"
      class="category"
      :class="{ active: selectID === item.id }"
      @click="change(item.id)"
    >
      <div>
        <i></i>
        <a>{{ item.name }}</a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  Modal,
  Radio,
  Select,
  Col,
  Row,
} from '@h3/antd-vue';
// @ts-ignore
import cloneDeep from 'lodash/cloneDeep';
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';
import getDownloadUrlNew from '../../../../../../../common/src/utils/getDownloadUrlNew';
import { StaticUtils } from '../../../../../../utils/utils';

@Component({
  name: 'category',
  components: {
    AAvatar: Avatar,
    AIcon: Icon,
    AButton: Button,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACheckbox: Checkbox,
    ARadio: Radio,
    ARow: Row,
    ACol: Col,
  },
})
export default class category extends Vue {
  list: any = [
    {
      id: 1,
      name: '按组织机构',
      icon: '',
    },
    {
      id: 2,
      name: '按自定义组',
      icon: '',
    },
  ];

  selectID: number = 1;

  change(id: number) {
    this.selectID = id;
    this.$emit('changes', id);
  }
}
</script>
<style lang="less" scoped>
.category {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  cursor: pointer;
}
.active {
  background-color: #60a6f0;
  color: #fff;
  a {
    color: #fff;
  }
}
</style>
