<template>
  <div class="number">
    <template
      v-if="!readonly && ctrl.options && ctrl.options.rangeType !== 'new'"
    >
      <h3-input-number
        style="width: 40%"
        :value="begin"
        :placeholder="placeholder"
        @change="onBeginChange"
      />
      <span class="separate">~</span>
      <h3-input-number
        style="width: 40%"
        :value="end"
        :placeholder="placeholder"
        @change="onEndChange"
      />
    </template>
    <template
      v-else-if="!readonly && ctrl.options && ctrl.options.rangeType === 'new'"
    >
      <a-row>
        <a-col :span="22">
          <h3-input-number
            style="width: 100%"
            :value="begin"
            class="query-range-number"
            :placeholder="placeholder"
            @change="onBeginChange"
          />
          <!-- <span class="separate">~</span> -->
          <h3-input-number
            style="width: 100%"
            :value="end"
            class="query-range-number"
            :placeholder="placeholder"
            @change="onEndChange"
          />
        </a-col>
        <a-col :span="2">
          <div class="tips">
            <span>
              <span>至</span>
            </span>
          </div>
        </a-col>
      </a-row>
    </template>

    <div v-else>
      <template v-if="ctrl.value">
        <span>{{ ctrl.value[0] }}</span> ~
        <span>{{ ctrl.value[1] }}</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { InputNumber, Row, Col } from '@h3/antd-vue';
import { Component } from 'vue-property-decorator';
import { NumberInputControl } from '../../controls';
import H3InputNumber from '../shared/h3-input-number.vue';

@Component({
  name: 'input-number-range',
  components: {
    AInputNumber: InputNumber,
    H3InputNumber,
    ARow: Row,
    ACol: Col,
  },
})
export default class NumberRangeInput extends NumberInputControl {
  get begin() {
    if (
      this.ctrl.value &&
      this.ctrl.value.length > 0 &&
      !isNaN(this.ctrl.value[0])
    ) {
      return this.ctrl.value[0]
        ? Number(this.ctrl.value[0])
        : this.ctrl.value[0];
    }
  }

  get end() {
    if (
      this.ctrl.value &&
      this.ctrl.value.length === 2 &&
      !isNaN(this.ctrl.value[1])
    ) {
      return this.ctrl.value[1]
        ? Number(this.ctrl.value[1])
        : this.ctrl.value[1];
    }
  }

  onBeginChange(value: number) {
    if (!this.ctrl.value || this.ctrl.value.length === 0) {
      this.ctrl.value = [value];
    } else {
      this.ctrl.value.splice(0, 1, value);
      this.ctrl.value = this.ctrl.value.slice();
    }
  }

  onEndChange(value: number) {
    if (!this.ctrl.value || this.ctrl.value.length === 0) {
      this.ctrl.value = [null, value];
    } else if (this.ctrl.value.length === 1) {
      this.ctrl.value.push(value);
      this.ctrl.value = this.ctrl.value.slice();
    } else {
      this.ctrl.value.splice(1, 1, value);
      this.ctrl.value = this.ctrl.value.slice();
    }
  }
}
</script>

<style lang="less" scoped>
.number {
  .separate {
    line-height: 32px;
    display: inline-block;
    margin: 0 5px;
  }
  /deep/.h3-input-number {
    &.query-range-number {
      border-radius: 2px;
      & + .query-range-number {
        margin-top: 12px;
      }
    }
    input {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  /deep/.tips {
    position: relative;
    & > span {
      font-size: 12px;
      position: absolute;
      width: 21px;
      height: 21px;
      color: rgba(0, 0, 0, 0.85);
      border-radius: 50%;
      line-height: 21px;
      text-align: center;
      background: #e8e8e8;
      right: -11px;
      top: 28px;
      span {
        position: relative;
        z-index: 2;
      }
      &::before {
        content: '';
        position: absolute;
        width: 23px;
        height: 46px;
        border: 1px solid #e8e8e8;
        border-left: none;
        top: 50%;
        transform: translateY(-50%);
        right: 10px;
      }
    }
  }
  &::before {
    content: ' ' !important;
  }
}
</style>
