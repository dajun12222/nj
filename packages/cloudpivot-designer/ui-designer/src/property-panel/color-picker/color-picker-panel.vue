<template>
  <div class="color-picker-panel">
    <div class="origin-color" @click="itemClick('default')">
      {{ $t('designer.colorPicker.default') }}
    </div>

    <div>{{ $t('designer.colorPicker.theme') }}</div>

    <div class="main-color">
      <div
        v-for="(item, index) in pColor"
        :key="index"
        class="panel-item"
        :style="`background-color: ${item};`"
        @click="itemClick(item)"
      >
        <span :style="`color: ${item};`">{{ item }}</span>
      </div>
    </div>

    <div style="margin-top: 10px">
      {{ $t('designer.colorPicker.standard') }}
    </div>

    <div class="standard-color">
      <div
        v-for="item in sColor"
        :key="item"
        class="item-sColor"
        :style="`background-color: ${item};`"
        @click="itemClick(item)"
      >
        <span :style="`color: ${item};`">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class ColorPickerPanel extends Vue {
  // 颜色面板
  pColor: any = [
    '#000000',
    '#ffffff',
    '#EEECE1',
    '#1E497B',
    '#4E81BB',
    '#E2534D',
    '#9ABA60',
    '#8165A0',
    '#47acc5',
    '#f9974c',
    '#F2F2F2',
    '#808080',
    '#DDD8C3',
    '#C6D9F0',
    '#DAE5F0',
    '#F2DBDB',
    '#EAF1DE',
    '#E6E0EC',
    '#D9EEF3',
    '#FEE9DA',
    '#DBDBDB',
    '#696969',
    '#B6B29F',
    '#A1B4CC',
    '#B5C3D2',
    '#D5B6B6',
    '#CAD4BA',
    '#C4BDCC',
    '#B3D0D7',
    '#E9C9B1',
    '#C4C4C4',
    '#525252',
    '#8F8C7B',
    '#7C90A8',
    '#90A2B5',
    '#B89291',
    '#ABB796',
    '#A39AAD',
    '#8EB2BB',
    '#D5A988',
    '#ADADAD',
    '#3B3B3B',
    '#696657',
    '#576C84',
    '#6C8198',
    '#9C6E6C',
    '#8B9A73',
    '#81778E',
    '#68949F',
    '#C18960',
    '#969696',
    '#242424',
    '#424033',
    '#324860',
    '#47607B',
    '#7F4A47',
    '#6C7D4F',
    '#60546F',
    '#437683',
    '#AD6937',
  ];

  // 标准颜色
  sColor: string[] = [
    '#c21401',
    '#ff1e02',
    '#ffc12a',
    '#ffff3a',
    '#90cf5b',
    '#00af57',
    '#00afee',
    '#0071be',
    '#00215f',
    '#72349d',
  ];

  created() {}

  itemClick(color: string) {
    this.$emit('change', color);
  }
}
</script>

<style lang="less" scoped>
@font-size-12: 12px;

.color-picker-panel {
  width: 220px;
  height: 224px;
  .origin-color {
    width: 100%;
    margin: 0 auto;
    height: 20px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    text-align: center;
    line-height: 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: @font-size-12;
  }
}

.main-color {
  display: flex;
  flex-wrap: wrap;
  .panel-item {
    width: 16px;
    height: 16px;
    margin: 1.5px 3px;
    span {
      display: none;
    }
    &:hover {
      box-shadow: 0 0 15px #ccc;
      transition: all 0.2s;
      cursor: pointer;
    }
  }
}

.standard-color {
  display: flex;
  .item-sColor {
    width: 16px;
    height: 16px;
    margin: 3px;
    span {
      display: none;
    }
    &:hover {
      box-shadow: 0 0 15px #ccc;
      transition: all 0.2s;
      cursor: pointer;
    }
  }
}
</style>
