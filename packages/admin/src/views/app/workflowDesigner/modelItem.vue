<!--
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
-->
<template>
  <div class="model-item">
    <i class="icon aufontAll" v-html="item.icon"></i>
    <div>
      {{
        $i18n.locale === 'zh' ? item.activityName : item.name_i18n[$i18n.locale]
      }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { H3Draggable } from '@/directives/drag';

@Component({
  name: 'ModelItem',
})
export default class ModelItem extends Vue implements H3Draggable {
  @Prop()
  item!: any;

  onDragstart(evt: DragEvent) {
    if (evt.dataTransfer) {
      evt.dataTransfer.setData('item-data', JSON.stringify(this.item));
      evt.dataTransfer.setData('workflow-element-type', 'activityModel');
      evt.dataTransfer.setData(
        'origin-offsets',
        JSON.stringify({
          x: evt.offsetX,
          y: evt.offsetY,
        }),
      );
    }
    // console.log('开始拖拽', evt);
  }
}
</script>

<style lang="less" scoped>
@import '~@/styles/color/colors.less';
.model-item {
  width: 112px;
  height: 32px;
  cursor: move;
  margin-left: 24px;
  margin-right: 24px;
  text-align: left;
  margin-top: 8px;
  line-height: 32px;
  font-size: 14px;
  color: #111218;
  background: #f8faff;
  border: 1px dashed #dde4eb;
  &:hover {
    color: @primary-color;
    border-color: @primary-color;
  }
  &:first-child {
    margin-top: 16px;
  }
  i {
    margin-right: 8px;
    margin-left: 16px;
    font-size: 12px;
    color: @primary-color;
  }
  div {
    display: inline-block;
    width: 60px;
  }
}
</style>
