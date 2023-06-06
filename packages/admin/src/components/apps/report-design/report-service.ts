/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import env from '@/env';
import { DataItemType } from 'cloudpivot/form/schema';
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
  ReportOptions.charts.list.dimension = 50;
  ReportOptions.charts.dimension.supportedTypes = [
    'string',
    'date',
    'address',
    'number',
  ];

  ReportOptions.components = [
    {
      label: '图表组件',
      value: 'chart',
      icon: 'chart',
    },
    {
      label: '文本组件',
      value: 'long-text',
      icon: 'text',
    },
    {
      label: '筛选组件',
      value: 'filter-picker',
      icon: 'filter',
    },
    {
      label: '图片组件',
      value: 'image',
      icon: 'image',
    },
  ];

  ReportOptions.download.list = true;
  ReportOptions.download.pivotTable = true;

  ReportOptions.requestHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return {
      // 二次开发
      Authorization: 'Bearer ' + token,
    };
  };

  /**
   * 字段类型分类
   */
  ReportOptions.classification = (field: FieldColumn) => {
    return [field.dataType];
    // let arr: Array<number> = [];
    // // 通过field.dataType判断业务对象值类型 返回同类型值对象的dataType值
    // switch (field.dataType) {
    //     case 7:
    //         arr = [1, 2, 7];
    //         break;
    // }
    // return arr;
  };

  ReportOptions.filterFormatComponents = (field: any, formula, format) => {
    let components: any = null;
    if (
      field.dataType === DataItemType.Dropdown ||
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
    console.log(field.dataType);
    console.log(format);
    let components: any = null;
    switch (field.dataType) {
      case DataItemType.StaffSingle:
      case DataItemType.StaffMulti:
      case DataItemType.StaffDeptMix:
      case DataItemType.DeptMulti:
      case DataItemType.DeptSingle:
        components = ReportCustomSelector;
        break;
      case DataItemType.Address:
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
