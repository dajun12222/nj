<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div :class="{ long: isDataItem }" :title="text" @click="addItem">
    <i v-if="options.icon" class="icon aufontAll" :class="[options.icon]"></i>
    {{ text }}
  </div>
</template>

<script lang="ts">
import '@/directives/drag';
import { H3Draggable } from '@/directives/drag';
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { EventBus } from 'cloudpivot/form/src/schema/event-bus';

@Component({
  name: 'control-block',
})
export default class ControlBlock extends Vue implements H3Draggable {
  @Prop()
  options!: any;

  @Prop()
  isDataItem!: boolean;

  @Prop({
    default: false,
  })
  isUsed?: boolean;

  @Inject()
  setMovingControl!: Function;

  get text() {
    const opts = this.options;

    let name = opts.name;

    if (opts.name_i18n) {
      const locales = JSON.parse(opts.name_i18n);
      if (locales[this.$i18n.locale]) {
        name = locales[this.$i18n.locale];
      }
    }

    if (this.isDataItem && opts.code && opts.code !== opts.name) {
      return `${name} [${opts.code}]`;
    }

    return name;
  }

  dispatchMouseUpEvent() {
    const e = document.createEvent('MouseEvents');
    e.initEvent('mouseup', true, true);
    document.dispatchEvent(e);
  }

  addItem() {
    if (this.isUsed || this.options.parentCode) {
      return;
    }
    this.setMovingControl(null);
    EventBus.$emit('addController', {
      json: this.options,
      blockType: this.isDataItem ? 'data-item' : 'control',
    });
  }

  onDragstart(evt: DragEvent) {
    this.setMovingControl({ key: '$control-add' });
    this.dispatchMouseUpEvent();

    // 添加拖动的样式
    (evt.target as any).style.background = '#F1F2F6';

    if (evt.dataTransfer) {
      evt.dataTransfer.setData('block', JSON.stringify(this.options));
      evt.dataTransfer.setData(
        'block-type',
        this.isDataItem ? 'data-item' : 'control',
      );
      if (this.isDataItem) {
        evt.dataTransfer.setData('dataitem-type-' + this.options.type, '');
        if (this.options.parentCode) {
          evt.dataTransfer.setData(
            'dataitem-parent-' + this.options.parentCode,
            '',
          );
        }
      } else {
        evt.dataTransfer.setData('control-type-' + this.options.type, '');
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
div {
  display: inline-block;
  align-items: center;
  font-size: 13px;
  font-family: PingFang-SC-Regular;
  font-weight: 400;
  color: @nav-font-color;
  width: 103px;
  height: 30px;
  background: @item-bg-color;
  border: 1px dashed #dde4eb;
  padding-left: 8px;
  cursor: move;
  margin-right: 8px;
  margin-bottom: 8px;
  line-height: 30px;
}

div.long {
  display: block;
  margin-bottom: 8px;
  width: calc(100% - 8px);
  height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

div > i {
  font-size: 12px;
  width: 12px;
  height: 12px;
  margin-right: 3px;
}

div:not(.disabled) > i {
  color: @primary-color !important;
}

div.dragging,
div:hover {
  &:not(.disabled) {
    color: @primary-color !important;
    border-color: @primary-color !important;
  }
}
div.disabled {
  cursor: not-allowed;
  color: #d1d1d1;
}
</style>
