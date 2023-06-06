/*
 * @Author: Fu Zhuohang
 * @Date: 2022-03-07 14:04:00
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-07 15:16:10
 * @FilePath: \yunshu6.0\modules\cloudpivot\common\src\config\portal\h3-form\location-service.ts
 * @Description:
 */
import { renderer } from '../../../../../form';

import {
  FormLocationControl,
  LocationService,
} from '../../../../../form/src/common/controls/form-location-control';

import { getLocationKey } from '../../common/common-config';

import Vue from 'vue';

let vueAMap: any;

export class DefaultLocationService implements LocationService {
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
