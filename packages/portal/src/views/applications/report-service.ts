/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Author: Fu Zhuohang
 * @Date: 2022-02-17 13:31:00
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-02-17 17:06:57
 * @FilePath: \yunshu6.0-3\entries\portal\src\views\applications\report-service.ts
 * @Description:
 */
import env from '@/config/env';
// 初始化表单组件配置
import '@/config/h3-form';
import { schema } from 'cloudpivot/form';
import { DataItemType } from 'cloudpivot/form/src/schema';
import { FieldColumn } from '@h3/report';
import ReportOptions from '@h3/report/dist/options';
import { Component } from 'vue';
import ReportAddress from './report-address.vue';
import ReportCustomSelector from './report-custom-selector.vue';
import ReportDropdown from './report-dropdown.vue';
import ReportSelectSimple from './report-select-simple.vue';
import ReportSelect from './report-select.vue';

let inited = false;

export function init() {
  if (inited) {
    return;
  }

  inited = true;

  ReportOptions.baseUrl = env.portalHost;
  console.log(ReportOptions.baseUrl);
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
  ReportOptions.filterFormatComponents = (field: any, formula, format) => {
    let components: any = null;
    if (
      field.dataType === DataItemType.Checkbox ||
      field.dataType === DataItemType.Radio ||
      field.dataType === DataItemType.DropdownMulti
    ) {
      components = ReportSelect; // 自定义的筛选组件
    }
    return components;
  };
  ReportOptions.integrateComponents = (
    field: FieldColumn,
    formula: string,
    format: string,
  ): Component | null => {
    let components: any = null;
    switch (field.dataType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        components = ReportCustomSelector;
        break;
      case schema.DataItemType.Address:
        components = ReportAddress;
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
    switch (field.field) {
      case 'sequenceStatus':
        components = ReportSelectSimple;
        break;
      default:
        break;
    }
    return components;
  };

  /**
   * 仪表盘跳转功能
   * https://authine.yuque.com/staff-caknf9/hoagdz/agdooy
   */
  ReportOptions.jumpDashboard = {
    open: true,
    allDashboardList: [],
    allDataTableList: [],
    getJumpUrl: null,
    openMethod: null,
  };
}

init();
