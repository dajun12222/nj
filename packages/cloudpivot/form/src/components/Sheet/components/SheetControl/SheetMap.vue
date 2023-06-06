<template>
  <div :key="mapChanngeKey" class="sheetMap">
    <a-input v-if="edit" :value="mapValueStr" @click="showMapModal" />
    <div v-else>
      {{ mapValueStr || defaultCtrVal }}
    </div>
    <a-modal
      v-if="edit"
      class="modal-map"
      :visible="visible"
      :bodyStyle="{ padding: 0 }"
      :closable="false"
      :footer="null"
      :maskClosable="false"
      :keyboard="false"
    >
      <div class="map-box">
        <div class="search-box">
          <a-input
            ref="searchInput"
            v-model="searchKey"
            @focus="onSearchInputFocus"
            @change="onSearchInputChange"
          >
            <a-icon
              v-show="searchKey.length > 0"
              slot="suffix"
              type="close-circle"
              @click="clearSearchInput"
            />
            <a-icon slot="suffix" type="search" />
          </a-input>
          <div v-show="showSearchResult" class="search-result-box">
            <div ref="searchResult" class="search-result"></div>
            <div class="search-result__nodata">未找到相关地址</div>
          </div>
        </div>
        <el-amap
          vid="amap"
          class="amap"
          :zoom="12"
          :center="mapCenter"
          :events="events"
          @click="onClickMap"
        >
          <el-amap-marker vid="component-marker" :position="marker" />
        </el-amap>
      </div>
      <div class="h3-location-map-footer">
        <div class="button-group">
          <a-button type="default" class="cancle" @click="onClickCancle">
            返回
          </a-button>
          <a-button type="primary" @click="ok"> 确定 </a-button>
        </div>
        <div v-show="address !== ''">
          <span class="aufontAll h-icon-all-get-address-o"></span>
          {{ address }}
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Provide } from 'vue-property-decorator';
import VueAMap from 'vue-amap';
import { Input, Modal, Icon } from '@h3/antd-vue';

import { getLocationKey } from 'cloudpivot/common/src/config/common/common-config';

Vue.use(VueAMap);

getLocationKey().then((res) => {
  VueAMap.initAMapApiLoader({
    key: res,
    plugin: [
      'Geocoder',
      'AMap.Geolocation',
      'AMap.Autocomplete',
      'AMap.PlaceSearch',
      'AMap.Scale',
      'AMap.OverView',
      'AMap.ToolBar',
      'AMap.MapType',
      'AMap.PolyEditor',
      'AMap.CircleEditor',
      'AMap.Map',
    ],
    // 默认高德 sdk 版本为 1.4.4
    v: '1.4.14',
    uiVersion: '1.0.11',
  });
});

declare var AMap: any;
declare var AMapUI: any;
@Component({
  name: 'SheetMap',
  components: {
    AInput: Input,
    AModal: Modal,
    AIcon: Icon,
  },
})
export default class SheetMap extends Vue {
  @Prop() control: any;

  @Prop({ default: false }) edit?: boolean;

  mapChanngeKey: number = 1;

  mapValueStr: string = '';

  get defaultCtrVal() {
    if (this.control.controller._value) {
      return `${
        this.control.controller._value.provinceName +
        this.control.controller._value.cityName +
        this.control.controller._value.districtName +
        this.control.controller._value.address
      }`;
    } else {
      return '';
    }
  }

  setmapValue(value?) {
    let currentValue;
    if (value) {
      currentValue = `${
        value.provinceName + value.cityName + value.districtName + value.address
      }`;
    }
    this.mapValueStr = currentValue || this.defaultCtrVal;
  }

  mapCenter: Array<number> = [121.59996, 31.197646];

  lng: number = 0;

  lat: number = 0;

  marker: number[] = this.mapCenter;

  province = '';

  city = '';

  district = '';

  adDetail = '';

  adcode: String = '';

  address: string = '';

  events: any = null;

  visible: boolean = false;

  geolocation: any;

  @Watch('visible', {
    immediate: true,
  })
  focus() {
    if (this.visible) {
      this.initGeolocation();

      this.initPoiPicker();
    }
  }

  onClickMap(e: any) {
    const { lng, lat } = e.lnglat;
    this.lng = lng;
    this.lat = lat;
    this.transformLoaction(lng, lat);
    this.marker = [lng, lat];
  }

  transformLoaction(lng: number, lat: number, ad?: string) {
    const self = this;
    // 这里通过高德 SDK 完成。
    const geocoder = new AMap.Geocoder({
      radius: 1000,
      extensions: 'all',
    });
    geocoder.getAddress([lng, lat], (status: any, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        if (result && result.regeocode) {
          console.log(result, '点击位置');
          const adComponent: any = result.regeocode.addressComponent;
          const add = ad
            ? ad
            : `${adComponent.township}${adComponent.street}${adComponent.streetNumber}`;
          self.province = adComponent.province;
          self.city = adComponent.city;
          self.district = adComponent.district;
          self.adDetail = add;
          self.adcode = result.regeocode.addressComponent.adcode;
          self.address = `${self.province}${self.city}${self.district}${self.adDetail}`;
        }
      }
    });
  }

  initGeolocation() {
    if (!this.geolocation) {
      this.geolocation = new AMap.Geolocation({
        // 是否使用高精度定位，默认：true
        enableHighAccuracy: true,
        // 设置定位超时时间，默认：无穷大
        timeout: 10000,
        // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
        buttonOffset: new AMap.Pixel(10, 20),
        //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        zoomToAccuracy: true,
        //  定位按钮的排放位置,  RB表示右下
        buttonPosition: 'RB',
      });
    }
    const self = this;
    // 由于IP定位不稳定，经常出现失败，故先定位到城市
    this.geolocation.getCityInfo((status: any, result: any) => {
      if (status === 'complete' && result.info === 'SUCCESS') {
        console.log(result, '当前城市');
        self.mapCenter = result.center;
        self.marker = self.mapCenter;
        self.address = result.province + result.city;
        self.lng = result.center[0];
        self.lat = result.center[1];
        self.adcode = result.adcode;
      }
    });
    this.geolocation.getCurrentPosition((status: any, result: any) => {
      console.log(status, result, 'result-------');

      if (status === 'complete' && result.info === 'SUCCESS') {
        console.log(result, '当前位置');
        const adComponent: any = result.addressComponent;
        const add = `${adComponent.township}${adComponent.street}${adComponent.streetNumber}`;
        self.province = adComponent.province;
        self.city = adComponent.city;
        self.district = adComponent.district;
        self.adDetail = add;
        self.adcode = result.addressComponent.adcode;
        self.lng = result.position.lng;
        self.lat = result.position.lat;
        self.mapCenter = [result.position.lng, result.position.lat];
        self.marker = self.mapCenter;
        self.address = `${self.province}${self.city}${self.district}${self.adDetail}`;
      }
    });
  }

  ok() {
    this.clearSearchInput();
    const val = {
      provinceName: this.province,
      cityName: this.city,
      districtName: this.district,
      address: this.adDetail,
      lng: this.lng,
      lat: this.lat,
      adcode: this.adcode,
    };
    this.setmapValue(val);
    this.visible = false;
    this.$emit('change', val);
    this.mapChanngeKey = this.mapChanngeKey + 1; //每次调用完再次调用都要key值变化去重新渲染一个新的视图，不然地图控件第二次无法渲染。
  }

  onClickCancle() {
    this.visible = false;
    this.clearSearchInput();
    this.mapChanngeKey = this.mapChanngeKey + 1; //每次调用完再次调用都要key值变化去重新渲染一个新的视图，不然地图控件第二次无法渲染。
  }

  /*******/
  //搜索功能
  loaded = false;

  showMap: boolean = false;

  initPoiPicker() {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    const self = this;
    AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker: any) {
      self.showMap = true;
      const searchResultEl = self.$refs.searchResult;
      const searchInputEl = (self.$refs.searchInput as Vue).$el.firstChild;

      const poiPicker = new PoiPicker({
        input: searchInputEl, //输入框id
        autocompleteOptions: {
          pageSize: 8,
        }, //地点搜索配置
        suggestContainer: searchResultEl, //输入提示显示DOM
        // searchResultsContainer:searchResultEl//搜索结果显示DOM
      });
      poiPicker.on('poiPicked', function (poiResult: any) {
        self.showSearchResult = false;
        const poi = poiResult.item;
        self.mapCenter = [poi.location.lng, poi.location.lat];
        const ad = poi.address + poi.name;
        self.transformLoaction(poi.location.lng, poi.location.lat, ad);
        self.marker = self.mapCenter;
        self.lng = poi.location.lng;
        self.lat = poi.location.lat;
      });
    });
  }

  searchKey: string = '';

  showSearchResult: boolean = false;

  clearSearchInput() {
    this.searchKey = '';
    this.showSearchResult = false;
  }

  onSearchInputFocus() {
    if (this.searchKey) {
      this.showSearchResult = true;
    }
  }

  onSearchInputChange() {
    this.showSearchResult = true;
  }
  /*******/

  showMapModal() {
    this.visible = true;
  }

  mounted() {
    this.events = {
      click: this.onClickMap,
    };
    this.setmapValue();
  }

  destroyed() {
    console.log('destroyed');
  }
}
</script>

<style lang="less" scoped>
.sheetMap {
  /* height: 100px;
  width: 100%; */
}
.modal-map {
  .map-box {
    width: 560px;
    height: 300px;
  }
}

.h3-location-map-footer {
  width: 560px;
  .button-group {
    display: flex;
  }
}

.search-box {
  transform: translate(16px, 16px);
  position: absolute;
  z-index: 201;
  width: 340px;

  .search-result-box {
    margin-top: 2px;
    overflow: hidden;
    max-height: 257px;
    background: #fff;
    border-radius: 4px;
  }

  .search-result {
    height: 257px;
    overflow: auto;

    &.hidden {
      display: none;
    }

    .sugg-item {
      background: none;
      border-bottom: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        background-color: #e4e4e4;
      }

      &.sugg-no-id {
        display: none;
      }
    }
  }

  .search-result__nodata {
    height: 72px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 0.45);
  }

  .anticon-close-circle {
    cursor: pointer;
    color: #e4e4e4;
    transition: color 0.3s;
    font-size: 1em;
    margin-right: 10px;
  }
}

@prefixCls: h3-location;
@import '../../../../../../common/common.less';
</style>
