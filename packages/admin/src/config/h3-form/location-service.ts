/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { renderer } from 'cloudpivot/form';

import Vue from 'vue';

import { getLocationKey } from 'cloudpivot/common/src/config/common/common-config';

let vueAMap: any;

export class DefaultLocationService implements renderer.LocationService {
  async initMap() {
    if (vueAMap) {
      return vueAMap;
    }

    vueAMap = await import(/* webpackChunkName: "vue-amap" */ 'vue-amap');

    Vue.use(vueAMap.default);
    const locationKey = await getLocationKey();
    vueAMap.initAMapApiLoader({
      key: locationKey,
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

    return vueAMap;
  }

  position(
    range?: number,
    showMap?: boolean,
  ): Promise<renderer.LocationPositionResult> {
    return Promise.resolve({} as any);
  }

  navigation(latitude: number, longitude: number, title: string): void {}

  isEl(): boolean {
    return false;
  }
}
