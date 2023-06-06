<template>
  <SmartLocation
    v-if="!readonly"
    v-model="val"
    :vid="control.key"
    :showTip="controlOpts.displayMode === 'accurate'"
    :placeholder="placeholder"
    :disabled="readonlyFormula"
    :initMap="initMap"
    :isShowSearch="isShowSearch"
    @ok="valueChange"
  />

  <div v-else>
    {{ address }}
  </div>
</template>

<script lang="ts">
import SmartLocation from '../../../../../form/src/common/components/smart-location/index.vue';
import { FormLocationControl } from '../../../../../form/src/common/controls/form-location-control';
import { FromAddressValueService } from '../../../../../form/src/common/services';
import { Component } from 'vue-property-decorator';

@Component({
  name: 'input-location',
  components: {
    SmartLocation,
  },
})
export default class InputLocation extends FormLocationControl {
  get initMap() {
    console.log(FormLocationControl.service);
    return FormLocationControl.service.initMap;
  }

  get isShowSearch() {
    const options: any = this.control.options;
    if (!options) {
      return true;
    }
    return options.showSearch === 'false' ? false : true;
  }

  valueChange(val: any) {
    if (val.adcode) {
      FromAddressValueService.setAddressVal(val.adcode).then((value: any) => {
        // this.ctrl.value = Object.assign(this.val,value);
        this.setValue(Object.assign(this.val, value));
      });
    } else {
      this.ctrl.value = null;
    }
  }
}
</script>

<style lang="less" scoped></style>
