<template>
  <div class="query-field-group">
    <template v-if="index !== 0">
      <div class="line">
        <span>或</span>
      </div>
    </template>
    <template v-for="(control, index) in useFields">
      <queryFieldItem
        :key="control.key + index"
        :ref="'item_' + index"
        :control="control"
        :controls="cur_controls"
        :index="index"
        :isRelevance="isRelevance"
        @delFieldItem="delFieldItem"
        @valueChange="valueChange"
        @fieldChange="fieldChange"
      />
    </template>

    <div
      :class="{ 'btn-disabled': useFields.length >= cur_controls.length }"
      class="btn"
    >
      <span @click="addFieldItem(false)">
        <em class="icon aufontAll h-icon-all-plus-circle-o"></em>
        添加且条件
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import queryFieldItem from './query-field-item.vue';

@Component({
  name: 'queryFieldGroup',
  components: {
    queryFieldItem,
  },
})
export default class queryFieldGroup extends Vue {
  @Prop() controls!: any[];

  @Prop() index!: number;

  @Prop() isRelevance!: boolean;

  @Prop({
    default: false,
  })
  isReset?: boolean;

  cur_controls: any[] = [];

  valueChange() {
    this.$emit('valueChange');
    this.getData();
  }

  // 获取值
  getData() {
    const res: any[] = [];
    this.resetIsUsed();
    this.useFields.forEach((el, index) => {
      const ref: any =
        this.$refs['item_' + index] && this.$refs['item_' + index][0];
      if (ref && ref.getValue) {
        const ResVal = ref.getValue();
        this.setIsUsed(ResVal.propertyCode, true);
        res.push(ResVal);
      }
    });
    return res;
  }

  getValue() {
    return this.getData();
  }

  getControler() {
    const res: any[] = [];
    this.useFields.forEach((el, index) => {
      const ref: any =
        this.$refs['item_' + index] && this.$refs['item_' + index][0];
      if (ref && ref.getControler) {
        const ResVal = ref.getControler();
        res.push(ResVal);
      }
    });
    return res;
  }

  useFields: any[] = [];

  fieldChange(data) {
    this.useFields[data.index] = this.controls.find(
      (el) => el.key === data.key,
    );
  }

  delFieldItem(propertyCode) {
    this.useFields = this.useFields.filter((el) => {
      if (el.key === propertyCode) {
        this.setIsUsed(propertyCode, false);
        return false;
      } else {
        return true;
      }
    });

    if (this.useFields.length === 0) {
      // 没有字段之后删除组
      this.$emit('delGroup', this.index);
    }

    this.$emit('valueChange');
  }

  resetIsUsed() {
    this.cur_controls.forEach((el) => {
      el.isUsed = false;
    });
  }

  setIsUsed(propertyCode, type: boolean) {
    this.cur_controls.forEach((el) => {
      if (el.key === propertyCode) {
        this.$set(el, 'isUsed', type);
      }
    });
    this.cur_controls = [...this.cur_controls];
  }

  addFieldItem(el?: any) {
    if (el) {
      this.useFields.push(el);
    } else {
      const item = this.getNextItem();
      if (item) {
        item.isUsed = true;
        this.useFields.push(item);
      }
    }
  }

  // 获取下一个未用过的字段
  getNextItem() {
    return this.controls.find((el) => !el.isUsed);
  }

  created() {
    this.cur_controls = [...this.controls];

    this.cur_controls.forEach((el) => {
      if (el.isUsed) {
        this.addFieldItem(el);
      }
    });

    if (this.isReset) {
      // this.useFields = [...this.controls]
      this.$emit('resetOver', this.index);
    }
  }
}
</script>

<style lang="less" scoped>
@import './../../../../../../application/src/components/pc/style/custom-themes';
.query-field-group {
  padding: 10px 25px 5px;
}
.line {
  height: 20px;
  margin-bottom: 4px;
  position: relative;
  text-align: center;
  span {
    position: relative;
    z-index: 2;
    font-size: 12px;
    line-height: 20px;
    color: rgba(17, 18, 24, 0.5);
    background-color: #fff;
    padding: 0 16px;
  }
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 0px;
    background-color: #eee;
    border-top: 1px solid #eee;
    top: 50%;
    margin-top: -0.5px;
  }
}
.btn {
  font-size: 14px;
  color: @primaryColor;
  margin-top: 18px;
  display: inline-block;
  span {
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  em {
    font-size: 17px;
    margin-right: 13px;
  }

  &.btn-disabled {
    color: rgba(17, 18, 24, 0.5);
    span {
      &:hover {
        opacity: 1;
        cursor: not-allowed;
      }
    }
  }
}
</style>
