<template>
  <div>
    <!-- 地址 -->
    <template v-if="propertyType === 14">
      <pca-selector v-model="address" :format="locationType" />
      <a-textarea
        v-if="showDetails === 'true'"
        v-model="address.address"
        style="margin-top: 8px"
        :placeholder="$t('cloudpivot.form.renderer.inputAddress')"
        :autosize="{ minRows: 3, maxRows: 6 }"
        @change="onAdChange"
      />
    </template>

    <!-- 定位 -->
    <div v-if="propertyType === 11" class="address-textarea">
      <SmartLocation v-model="location" :initMap="initMap" @ok="mapChange" />
    </div>
  </div>
</template>
<script lang="ts">
import { FormLocationControl } from '../controls/form-location-control';
import { FromAddressValueService } from '../services';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Modal, Input } from '@h3/antd-vue';

@Component({
  name: 'AddressModal',
  components: {
    SmartLocation: () => import('./smart-location/index.vue'),
    PcaSelector: () => import('./pca-selector/pca-selector.vue'),
    AModal: Modal,
    ATextarea: Input.TextArea,
  },
})
export default class RequiredConditon extends Vue {
  @Prop({
    type: Object,
  })
  modalData!: any;

  @Prop({ type: Object })
  modalOptions!: any;

  @Prop({})
  getControl!: any;

  get title() {
    if (this.control && this.control.type === 14) {
      return '设置地址';
    }
    if (this.control && this.control.type === 11) {
      return '设置定位';
    }
  }

  get propertyType() {
    if (this.control && this.control.type) {
      return this.control.type;
    }
  }

  get initMap() {
    return FormLocationControl.service.initMap;
  }

  get showDetails() {
    return this.control && this.control.options.addressDetail;
  }

  // 地址格式同步
  get locationType() {
    return this.control && this.control.options.locationType;
  }

  @Watch('modalData', {
    immediate: true,
  })
  onModalDataChange(modalData: any) {
    // 每次数据改变同步control
    this.control = this.getControl();

    if (this.propertyType === 14) {
      if (!modalData.data.value) {
        this.address = {
          address: '',
        };
        return;
      }
    }
    if (this.propertyType === 11) {
      if (!modalData.data.value) {
        this.location = {
          cityAdcode: '',
          cityName: '',
          districtAdcode: '',
          districtName: '',
          provinceAdcode: '',
          provinceName: '',
        };
        return;
      }
    }

    const { data } = modalData;

    if (this.propertyType === 11) {
      this.location = data.value;
    }
    if (this.propertyType === 14) {
      this.address = Object.assign({}, this.address, data.value);
    }
  }

  address: any = {
    address: '',
  };

  location: any = {};

  locationInfo: any = {};

  mapChange(val: any) {
    FromAddressValueService.setAddressVal(val.adcode).then((value: any) => {
      // 获取区县code并组合成参数
      this.location = Object.assign({}, this.location, value);
    });
    this.backData();
  }

  backData() {
    const backData: any = {};
    switch (this.propertyType) {
      case 11:
        backData.value = this.location;
        backData.default = this.location;
        break;
      case 14:
        backData.value = this.address;
        backData.default = this.address;
        break;
      default:
        break;
    }
    this.$emit('backData', backData.value);
  }

  closeModal() {
    this.$emit('closeModal');
  }

  onAdChange(evt: any) {
    const val = evt.target.value;
    this.address.address = val;
    this.backData();
  }

  control: any = null;
}
</script>

<style lang="less" scoped>
/deep/ .pca-selector--options {
  .ant-tabs-tabpane {
    height: 226px;
  }
}
</style>
