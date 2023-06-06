<template>
  <a-input
    ref="search"
    v-model="valueTemp"
    :placeholder="placeholder"
    :allowClear="allowClear"
    @pressEnter="pressEnter"
  >
    <span
      v-if="isAsync"
      slot="prefix"
      class="icon aufontAll h-icon-all-search-zj"
    ></span>
    <span
      v-else
      slot="suffix"
      class="icon aufontAll h-icon-all-search-zj"
      @click="callback"
    ></span>
  </a-input>
</template>
<script lang="ts">
import { Input } from '@h3/antd-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import throttle from 'lodash/throttle';

@Component({
  name: 'input-search',
  components: {
    AInput: Input,
  },
})
export default class InputSearch extends Vue {
  @Prop()
  value!: string;

  @Prop({ default: '请输入' })
  placeholder!: string;

  @Prop({ default: false })
  allowClear!: boolean;

  //搜索与输入同步进行
  @Prop({ default: false })
  isAsync!: boolean;

  valueTemp: string = '';

  @Watch('value')
  onValueChange(value) {
    this.valueTemp = value;
  }

  @Watch('valueTemp')
  onValueTempChange(value) {
    this.$emit('input', value);
    if (this.isAsync || !value) {
      this.callback();
    }
  }

  pressEnter() {
    if (!this.isAsync) {
      this.callback();
    }
  }

  callback() {
    this.$emit('search');
  }

  focus() {
    (this.$refs.search as any).focus();
  }

  mounted() {
    this.callback = throttle(this.callback, 100);
  }
}
</script>
<style lang="less" scoped>
/deep/.ant-input-prefix,
.ant-input-suffix {
  .h-icon-all-search-zj {
    font-size: 14px;
    color: rgba(17, 18, 24, 0.25);
  }
  & + input {
    padding-left: 34px;
  }
}
/deep/.ant-input-suffix {
  .h-icon-all-search-zj {
    cursor: pointer;
    &:hover {
      color: rgba(17, 18, 24, 0.5);
    }
  }
  .ant-input-clear-icon {
    padding-right: 7px;
    svg {
      font-size: 13px;
    }
  }
}
</style>
