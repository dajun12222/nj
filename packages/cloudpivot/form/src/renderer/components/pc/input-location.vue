<template>
  <SmartLocation
    v-if="!readonly"
    v-model="val"
    :vid="control.key"
    :showTip="controlOpts.displayMode === 'accurate'"
    :placeholder="placeholder"
    :disabled="readonlyFormula"
    :initMap="initMap"
    @ok="valueChange"
  />

  <div v-else>
    {{ address }}
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { FormLocationControl } from '../../controls';
import { FromAddressValueService } from '../../services';
import SmartLocation from '../shared/smart-location/index.vue';

@Component({
  name: 'input-location',
  components: {
    SmartLocation,
  },
})
export default class InputLocation extends FormLocationControl {
  get initMap() {
    return FormLocationControl.service.initMap;
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
