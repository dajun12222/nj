import Vue from 'vue';
import VueAMap from 'vue-amap';
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
    // v: '1.4.4',
    v: '1.4.14',
    uiVersion: '1.0.11',
  });
});
