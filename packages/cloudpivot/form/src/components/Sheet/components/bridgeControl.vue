<template>
  <div class="sheetBaseControl">
    <div v-if="control.type === 1">
      <AInput
        v-if="edit"
        style="width: 100%"
        :defaultValue="control.controller._value"
        @blur="blurAInput"
      />
      <div v-else>
        {{ control.controller._value }}
      </div>
    </div>

    <div v-else-if="control.type === 2">
      <ATextarea
        v-if="edit"
        :autoSize="{ minRows: 1, maxRows: 3 }"
        :defaultValue="control.controller._value"
        style="width: 100%"
        @blur="blurAInput"
      />
      <div v-else>
        {{ control.controller._value }}
      </div>
    </div>

    <div v-else-if="control.type === 3">
      <ADatePicker
        v-if="edit"
        style="width: 100%"
        :value="control.controller._value"
        @change="onChangeADatePicker"
      />
      <div v-else>
        {{ geStrtDate(control.controller._value) }}
      </div>
    </div>

    <div v-else-if="control.type === 4">
      <AInputNumber
        v-if="edit"
        style="width: 100%"
        :value="control.controller._value"
        @change="changeNumber"
      />
      <div v-else>
        {{ control.controller._value }}
      </div>
    </div>

    <div v-else-if="control.type === 5">
      <ARadioGroup
        v-if="edit"
        style="width: 100%"
        :defaultValue="control.controller._value"
        :options="control.options.options.split(';')"
        @change="onChangeRadio"
      />
      <div v-else>
        {{ control.controller._value }}
      </div>
    </div>

    <div v-else-if="control.type === 6">
      <ACheckboxGroup
        v-if="edit"
        style="width: 100%"
        :defaultValue="control.controller._value"
        :options="control.options.options.split(';')"
        @change="onChangeCheckbox"
      />
      <div v-else>
        {{ control.controller._value && control.controller._value.join('; ') }}
      </div>
    </div>

    <div v-else-if="control.type === 7" @click.stop="() => {}">
      <!-- 防止点击事件冒泡出去失去焦点从而无法点击 -->
      <ASelect
        v-if="edit"
        style="width: 100%"
        :defaultValue="control.controller._value"
        @change="onChangeSelect"
      >
        <a-select-option
          v-for="(item, index) in control.options.options.split(';')"
          :key="index"
        >
          {{ item }}
        </a-select-option>
      </ASelect>
      <div v-else>
        {{ control.controller._value }}
      </div>
    </div>

    <div v-else-if="control.type === 19" @click.stop="() => {}">
      <!-- 防止点击事件冒泡出去失去焦点从而无法点击 -->
      <ASelect
        v-if="edit"
        v-model="control.controller._value"
        :style="{ width: '100%' }"
        mode="multiple"
        @change="onChangeMultSelect"
      >
        <a-select-option
          v-for="item in control.options.options.split(';')"
          :key="item"
        >
          {{ item }}
        </a-select-option>
      </ASelect>
      <div v-else>
        {{ control.controller._value && control.controller._value.join('; ') }}
      </div>
    </div>

    <div v-else-if="control.type === 8">
      <ASwitch
        v-if="edit"
        v-model="control.controller._value"
        @change="onChangeLogic"
      />
      <div v-else>
        {{ control.controller._value ? '是' : '否' }}
      </div>
    </div>

    <div v-else-if="control.type === 9">
      <SheetUpload :control="control" :edit="edit" @change="onChangeFile" />
    </div>

    <div v-else-if="control.type === 10">
      <SheetImage :control="control" :edit="edit" @change="ImageChange" />
    </div>

    <div v-else-if="control.type === 11">
      <SheetMap :control="control" :edit="edit" @change="onMapChange" />
    </div>

    <div v-else-if="control.type === 15">暂不支持</div>

    <div
      v-else-if="
        control.type === 50 ||
        control.type === 51 ||
        control.type === 60 ||
        control.type === 61 ||
        control.type === 62
      "
    >
      <SheetStaffSelector
        :control="control"
        :edit="edit"
        @change="onChangeStaff"
      />
    </div>

    <div v-else-if="control.type === 80">
      <SheetRelavanceFrom
        :control="control"
        :edit="edit"
        @change="onChangeRelavan"
      />
    </div>

    <div v-else-if="control.type === 81">
      <SheetRelavanceFrom
        :control="control"
        :multiple="true"
        :edit="edit"
        @change="onChangeRelavan"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';

import SheetRelavanceFrom from './SheetControl/sheetRelavanceFrom.vue';

import SheetUpload from './SheetControl/sheetUpload.vue';

import SheetImage from './SheetControl/sheetImage.vue';

import SheetStaffSelector from './SheetControl/sheetStaffSelector.vue';

import SheetMap from './SheetControl/SheetMap.vue';

import {
  DatePicker,
  Input,
  InputNumber,
  Radio,
  Checkbox,
  Select,
  Switch,
  Upload,
  Button,
} from '@h3/antd-vue';

@Component({
  name: 'bridgeControl',
  components: {
    ADatePicker: DatePicker,
    AInput: Input,
    AInputNumber: InputNumber,
    ATextarea: Input.TextArea,
    ARadioGroup: Radio.Group,
    ACheckboxGroup: Checkbox.Group,
    ASelect: Select,
    ASwitch: Switch,
    AUpload: Upload,
    AButton: Button,
    SheetRelavanceFrom,
    SheetUpload,
    SheetImage,
    SheetStaffSelector,
    SheetMap,
  },
})
export default class BridgeControl extends Vue {
  @Prop() control: any;

  @Prop({ default: false }) edit?: boolean;

  emitChange(val) {
    this.$emit('change', val);
  }

  geStrtDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  onChangeADatePicker(a, b) {
    this.control.controller._value = a;
    if (a) {
      this.emitChange(new Date(a._d));
    } else {
      this.emitChange(null);
    }
  }

  blurAInput(e) {
    this.control.controller._value = e.target._value;
    this.emitChange(e.target._value);
    console.log('e.==============>', e);
  }

  changeNumber(e) {
    this.control.controller._value = e;
    this.emitChange(e);
    console.log('e.==============>', e);
  }

  onChangeRadio(e) {
    this.control.controller._value = e.target.value;
    this.emitChange(e.target.value);
    console.log('e.==============>', e);
  }

  onChangeCheckbox(e) {
    this.control.controller._value = e;
    this.emitChange(e);
    console.log('e.==============>', e);
  }

  onChangeSelect(e, b) {
    this.control.controller._value = this.control.options.options.split(';')[e];
    this.emitChange(this.control.options.options.split(';')[e]);
    console.log(
      this,
      this.control.options.options.split(';')[e],
      'this--------------------',
    );
  }

  onChangeMultSelect(e, b) {
    this.control.controller._value = e;
    this.emitChange(e);
    console.log('e.==============>', e);
  }

  onChangeLogic(e) {
    this.control.controller._value = e;
    this.emitChange(e);
    console.log('e.==============>', e);
  }

  //文件<--------
  onChangeFile(fileList) {
    console.log('e.==============>', fileList);
    this.emitChange(fileList);
  }
  //文件-------->

  //图片<-------
  ImageChange(fileList) {
    this.emitChange(fileList);
  }
  //图片------->

  //选人控件
  onChangeStaff(e) {
    this.emitChange(e);
    console.log(this, e, 'this--------------------');
  }

  onChangeRelavan(e) {
    this.emitChange(e);
  }

  onMapChange(e) {
    this.emitChange(e);
    console.log(e, '地图控件的值');
  }

  mounted() {}
}
</script>

<style lang="less" scoped>
.sheetBaseControl {
  z-index: 9;
}

.textarea {
  height: 60%;
}
</style>
