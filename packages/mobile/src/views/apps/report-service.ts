/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Author: Fu Zhuohang
 * @Date: 2022-02-17 13:31:00
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-02-18 11:24:45
 * @FilePath: \yunshu6.0-3\entries\mobile\src\views\apps\report-service.ts
 * @Description:
 */

import { Component } from 'vue';
import ReportOptions from '@h3/report/dist/options';
import reportOrg from './report-org.vue';
import ReportAddress from './report-address.vue';
import ReportDropdown from './report-dropdown.vue';
import { FieldColumn } from '@h3/report';
let inited = false;
import { schema } from 'cloudpivot/form';

import env from '@/config/env';
import { DataItemType } from 'cloudpivot/form/src/schema';

export function init() {
  if (inited) {
    return;
  }

  inited = true;

  ReportOptions.baseUrl = env.portalHost;
  ReportOptions.charts.list.dimension = 50;
  ReportOptions.charts.dimension.supportedTypes = [
    'string',
    'date',
    'address',
    'number',
  ];

  ReportOptions.download.list = true;
  ReportOptions.download.pivotTable = true;

  ReportOptions.requestHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return {
      Authorization: 'Bearer ' + token,
    };
  };
  ReportOptions.integrateComponents = (
    field: FieldColumn,
    formula: string,
    format: string,
  ): Component | null => {
    let components: any = null;
    switch (field.dataType) {
      case schema.DataItemType.Address:
        components = ReportAddress;
        break;
      default:
        break;
    }
    switch (field.dataType) {
      case schema.DataItemType.StaffSingle:
      case schema.DataItemType.StaffMulti:
      case schema.DataItemType.DeptSingle:
      case schema.DataItemType.DeptMulti:
      case schema.DataItemType.StaffDeptMix:
        components = reportOrg;
        break;
      case DataItemType.Dropdown:
      case DataItemType.Checkbox:
      case DataItemType.Radio:
      case DataItemType.DropdownMulti:
        if (format === '2') {
          components = ReportDropdown;
        }
        break;
      default:
        break;
    }
    return components;
  };
}

init();
