import * as ControlFactory from '../../helper/control-factory';
import { renderer } from '../../../../../../form';
import zhToEn from '../../locales/zhToEn';
import { DataItemType } from './../../../../../../form/schema';
import common from '../../../../../../common/pc';
import {
  QueryDateTypeList,
  QueryOptionType,
  QueryOptionTypeList,
} from 'cloudpivot/form/src/schema/query-type';
import * as Helper from 'cloudpivot/list/src/components/pc/helper/helper';
import moment from 'moment';

const staffSelectorDefaultMap: any = {
  0: '',
  1: 'originator',
  2: 'originatorDept',
};

/**
 *
 * 生成controler
 * @export
 * @param {*} field
 * @return {*}
 */
export function toFormControl(field: any) {
  const type: any = toFormControlType(field);
  const sourceOpts = {
    visible: field.visible,
    name: field.name,
    defaultValue: field.defaultValue,
    options: field.options,
  };

  const options = ControlFactory.buildControlOptions(type, sourceOpts);
  if (type === 1 && field.options && field.options.includes('dictionaryData')) {
    options.dictionaryData = field.options;
  }
  switch (type) {
    case renderer.FormControlType.StaffSelector:
      options.deptVisible = 'user';
      options.multi = false;
      options.displayType = 'plus';
      break;
    case renderer.FormControlType.StaffMultiSelector:
      options.deptVisible = 'user';
      options.multi = true;
      options.displayType = 'plus';
      break;
    case renderer.FormControlType.DepartmentSelector:
      options.deptVisible = 'org';
      options.multi = false;
      options.displayType = 'plus';
      break;
    case renderer.FormControlType.DepartmentMultiSelector:
      options.deptVisible = 'org';
      options.multi = true;
      options.displayType = 'plus';
      break;
    case renderer.FormControlType.StaffDeptMixed:
      options.deptVisible = 'all';
      options.multi = true;
      options.displayType = 'plus';
      break;
    case renderer.FormControlType.RelevanceForm:
    case renderer.FormControlType.RelevanceFormEx:
      options.queryCode = field.associationCode || field.relativeQueryCode;
      options.schemaCode = field.relativeSchemaCode;
      if (field.options) {
        const parseOpts = JSON.parse(field.options) || {};
        options.displayField =
          parseOpts.displayField ||
          parseOpts.displayCode ||
          options.displayField;
        options.showStyle = (parseOpts && parseOpts.showStyle) || '';
        options.selectMode =
          field.choiceType === 2
            ? renderer.RelevanceFormSelectMode.Popup
            : renderer.RelevanceFormSelectMode.Dropdown;

        options.treeView = field.choiceType === 3 ? true : false; //判断树形视图是不是为树形外部显示样式。是的话不在表单控件展示，放在门户左边展示。
      }
      break;
    case renderer.FormControlType.Address:
      options.addressDetail = 'false';
      options.showEmpty = `${!field.accurateSearch}`;
      const addressFormatMap: any = {
        '0': 'pp-cc-aa',
        '1': 'pp-cc',
        '2': 'pp',
      };

      options.locationType = addressFormatMap[field.displayFormat];
      break;
    case renderer.FormControlType.Dropdown:
      if (field.propertyType === renderer.DataItemType.Logic) {
        // 逻辑使用下拉控件
        options.options = '全部;是;否';
      }
      options.displayEmpty = false;

      break;
    case renderer.FormControlType.DropdownMulti:
      // 单行文本下拉框模式 支持多选 @Fan
      // if (field.propertyCode === "sequenceStatus") {
      options.multi = true;
      options.displayEmpty = false;
      // }
      break;
    case renderer.FormControlType.DateRange:
    case renderer.FormControlType.TimeRange:
      const displayFormat: string = field.displayFormat || '';
      options.displayFormat = displayFormat;
      options.format = getFormat(options.displayFormat || '');
      options.format1 = getFormat(options.displayFormat || '');
      break;
    case renderer.FormControlType.Date:
      options.displayFormat = field.displayFormat || '';
      options.format = getFormat(options.displayFormat || '');
      options.format1 = getFormat(options.displayFormat || '');
      break;

    default:
      break;
  }

  const dv = field.defaultValue;
  if (dv !== undefined && dv !== null && dv !== '') {
    if (
      (type === renderer.FormControlType.StaffSelector ||
        type === renderer.FormControlType.StaffMultiSelector ||
        type === renderer.FormControlType.DepartmentSelector ||
        type === renderer.FormControlType.DepartmentMultiSelector) &&
      typeof field.defaultValue === 'string'
    ) {
      options.defaultValueType = staffSelectorDefaultMap[field.defaultValue];
    } else {
      options.defaultValue = field.defaultValue;
    }
  } else {
    switch (type) {
      case renderer.FormControlType.StaffSelector:
        options.defaultValueType = staffSelectorDefaultMap[field.defaultValue];
        break;
      case renderer.FormControlType.DateRange:
      case renderer.FormControlType.NumberRange:
      case renderer.FormControlType.TimeRange:
        options.rangeType = 'new';
        options.defaultValue = [field.startValue, field.endValue];
        break;
      case renderer.FormControlType.Date:
        // options.defaultValue = field.startValue;
        break;
      case renderer.FormControlType.Logic:
        options.defaultValue = field.defaultState;
        break;
      case renderer.FormControlType.Dropdown:
        if (field.propertyType === renderer.DataItemType.Logic) {
          // 下拉单选，目前只有逻辑在用
          const map = {
            0: '否',
            1: '是',
            2: '全部',
          };
          options.defaultValue = map[field.defaultState];
        }
        break;
      case renderer.FormControlType.Number:
        options.defaultValue = field.startValue;
        options.format = '';
        options.format1 = '';
        break;
      default:
        break;
    }
  }

  if (typeof field.name_i18n === 'object' && field.name_i18n !== null) {
    field.name_i18n.en = zhToEn[field.name_i18n.en] || field.name_i18n.en;
    field.name_i18n = JSON.stringify(field.name_i18n);
  } else if (typeof field.name_i18n === 'string') {
    field.name_i18n = JSON.parse(field.name_i18n);
    field.name_i18n.en = zhToEn[field.name_i18n.en] || field.name_i18n.en;
    field.name_i18n = JSON.stringify(field.name_i18n);
  } else {
    //Else Empty block statement
  }
  options.name_i18n = field.name_i18n;

  const control: any = {
    key: field.propertyCode,
    writable: true,
    type,
    options,
    propertyType: field.propertyType,
    souceField: field,
    filterType: field.filterType,
    isQuery: true, // 标记来源是搜索条件
  };

  if ([renderer.FormControlType.Date].includes(type)) {
    control.options.dataItemDefault = field.startValue;
    control.options.defaultValue = 'dataItemDefault';
  }
  if ([renderer.FormControlType.Number].includes(type)) {
    control.hasValue = true; // 数值控件根据这个判断是否有值
    control.options.format = '';
    control.options.format1 = '';
  }

  if ([renderer.FormControlType.DropdownMulti].includes(type)) {
    control.maxTagCount = 2;
    control.ellipsisText = true;
  }

  return control;
}

export function toFormControlType(field: any) {
  switch (field.propertyType) {
    case renderer.DataItemType.Date:
      if (['Between', 'NotBetween'].includes(field.filterType)) {
        return renderer.FormControlType.DateRange;
      }
      return renderer.FormControlType.Date;
    case renderer.DataItemType.Number:
      if (['Between', 'NotBetween'].includes(field.filterType)) {
        return renderer.FormControlType.NumberRange;
      }
      return renderer.FormControlType.Number;
    case renderer.DataItemType.StaffSingle:
      return renderer.FormControlType.StaffSelector;
    case renderer.DataItemType.StaffMulti:
      return renderer.FormControlType.StaffMultiSelector;
    case renderer.DataItemType.DeptSingle:
      return renderer.FormControlType.DepartmentSelector;
    case renderer.DataItemType.DeptMulti:
      return renderer.FormControlType.DepartmentMultiSelector;
    case renderer.DataItemType.StaffDeptMix:
      return renderer.FormControlType.StaffDeptMixed;
    case renderer.DataItemType.RelevanceForm:
      return renderer.FormControlType.RelevanceForm;
    case renderer.DataItemType.RelevanceFormEx:
      return renderer.FormControlType.RelevanceFormEx;
    case renderer.DataItemType.Logic:
      // return renderer.FormControlType.Logic;
      return renderer.FormControlType.Dropdown;
    case renderer.DataItemType.Address:
      if (['Like', 'NotLike'].includes(field.filterType)) {
        return renderer.FormControlType.Text;
      }
      return renderer.FormControlType.Address;
    case renderer.DataItemType.Time:
      return renderer.FormControlType.TimeRange;
    default:
      break;
  }

  switch (field.displayType) {
    case 1:
      return renderer.FormControlType.Radio;
    case 2:
      return renderer.FormControlType.Checkbox;
    case 3:
      if (
        [renderer.DataItemType.Radio, renderer.DataItemType.Dropdown].includes(
          field.propertyType,
        )
      ) {
        return renderer.FormControlType.Dropdown;
      }
      return renderer.FormControlType.DropdownMulti;
    case 0:
    default:
      return renderer.FormControlType.Text;
  }
}

/**
 *
 * 根据控件类型、值返回查询接口需要参数
 * @export
 * @param {*} propertyType: 控件类型
 * @param {*} value: 控件值
 * @param {*} propertyCode: 控件编码
 * @param {*} filterType: 操作符号
 * @param {*} format: 日期控件 显示类型 YYYY-MM-DD...
 * @return {*}
 */
export function formatVal(
  propertyType,
  value,
  propertyCode,
  filterType,
  format = 'YYYY-MM-DD',
) {
  let res: any = value;
  switch (propertyType) {
    case DataItemType.Radio:
    case DataItemType.Checkbox:
    case DataItemType.Dropdown:
    case DataItemType.DropdownMulti:
      res = Array.isArray(res) ? res.join(';') : res;
      break;
    case DataItemType.Date:
      if (['Between', 'NotBetween'].includes(filterType)) {
        res = Array.isArray(res) ? res.join(';') : res;
        res = res === ';' ? '' : res;
      } else {
        if (res) {
          if (typeof res === 'string') {
            res = new Date(res);
          }
          res = common.utils.DateHandle.dateFormat(res, format);
        }
      }
      break;
    case DataItemType.Number:
      if (['Between', 'NotBetween'].includes(filterType)) {
        res = Array.isArray(res) ? res.join(';') : res;
        res = res === ';' ? '' : res;
      }
      break;
    case DataItemType.StaffSingle:
    case DataItemType.StaffMulti:
    case DataItemType.DeptSingle:
    case DataItemType.DeptMulti:
    case DataItemType.StaffDeptMix:
      if (res) {
        res = JSON.stringify(
          res.map((p) => ({
            id: p.id,
            unitType: p.unitType,
            name: p.name,
          })),
        );
      }
      break;
    case DataItemType.RelevanceForm:
      if (res) {
        res = res.id;
      }
      break;
    case DataItemType.RelevanceFormEx:
      if (res) {
        res = res.map((el) => el.id).join(';');
      }
      break;

    case DataItemType.Logic:
      if (res) {
        const obj = {
          是: true,
          否: false,
          全部: undefined,
        };
        res = obj[res];
      }
      break;
    case DataItemType.Address:
      if (res && !['NotLike', 'Like'].includes(filterType)) {
        res = JSON.stringify(res);
      }
      break;
    case DataItemType.ShortText:
      if (res && propertyCode === 'sequenceStatus') {
        const obj = {
          草稿: 'DRAFT',
          进行中: 'PROCESSING',
          已完成: 'COMPLETED',
          已作废: 'CANCELED',
        };
        if (typeof res === 'string') {
          res = res.split(';');
        }
        res = res.map((el) => obj[el] || el).join(';');
      }
      break;
    default:
      break;
  }
  return res;
}

function getFormat(displayFormat) {
  switch (Number(displayFormat)) {
    case 2:
      return 'YYYY-MM-DD HH:mm:ss';
    case 3:
      return 'YYYY-MM-DD HH:mm';
    case 4:
      return 'YYYY-MM';
    case 5:
      return 'YYYY';
    case 6:
      return 'MM-DD';
    case 7:
      return 'HH:mm';
    case 8:
      return 'HH:mm:ss';
    case 9:
      return 'YYYY-MM-DD HH:mm';
    case 10:
      return 'YYYY-MM-DD HH:mm';
    case 11:
      return 'YYYY-MM-DD HH:mm';
    case 12:
      return 'YYYY-MM-DD HH:mm';
    default:
      return 'YYYY-MM-DD';
  }
}

export function queryData2Conditions(queryData, controls, formObjSource, query?:any) {
  // console.log('queryData2Conditions', queryData, controls, formObjSource);
  const conditions = queryData;
  const queryTexts = conditions.queryText.split(';').map((item) => {
    const arr = item.split(':');
    return { k: arr[0], v: arr.splice(1).join(':') };
  });
  let queryFormRendererFields = conditions.$queryData.map((item) => {
    const obj = {
      ...item,
      filterType: (QueryOptionTypeList as Array<any>).find(
        (x) => x.op === item.op,
      ).queryType,
    };
    const queryTextObj = queryTexts.find((x) => x.k === item.propertyCode);
    if (!queryTextObj) {
      return false;
    }
    const value = queryTextObj.v;
    if (value) {
      if (
        [DataItemType.Date].includes(obj.propertyType) &&
        [QueryOptionType.Between, QueryOptionType.Not_Between].includes(
          obj.op,
        ) &&
        obj.isConst === false
      ) {
        obj.dateType = value;
      } else if (value.startsWith('[')) {
        const arr = JSON.parse(value);
        if (
          [DataItemType.Date, DataItemType.Number].includes(obj.propertyType)
        ) {
          obj.startValue = arr[0];
          obj.endValue = arr[1];
        } else {
          obj.defaultValue = arr;
        }
      } else if (
        value.startsWith('{') &&
        value.endsWith('}') &&
        !value.includes(':')
      ) {
        const id = value.substring(1, value.length - 1);
        const control = controls.find((x) => x.key === id);
        const formObjData = formObjSource.bizObject.data;
        if (formObjData || (control && control.controller)) {
          let val = control && control.controller ? control.controller.value : formObjData[id];

          if(!val && query && Array.isArray(query)){
            const item = query.find(q => q.propertyCode === queryTextObj.k);
            if(item){
              val = item.propertyValue
            }
          }
          
          if ([DataItemType.Logic].includes(obj.propertyType)) {
            obj.defaultState = val ? 1 : 0;
          } else if (val) {
            obj.defaultValue = val;
            obj.startValue = val;
          } else {
            //Else Empty block statement
          }
        }
      } else if (
        obj.propertyCode === 'sequenceStatus' &&
        obj.isConst &&
        ['PROCESSING', 'COMPLETED'].includes(value)
      ) {
        obj.defaultValue = value === 'PROCESSING' ? '进行中' : '已完成';
      } else if ([DataItemType.Logic].includes(obj.propertyType)) {
        obj.defaultState = value;
      } else {
        obj.defaultValue = value;
        obj.startValue = value;
      }
    }
    return obj;
  });
  //过滤掉有问题的数据兼容老数据
  queryFormRendererFields = queryFormRendererFields.filter((x) => {
    return x;
  });
  return queryFormRendererFields;
}

export function conditions2fields(conditions, vm) {
  conditions.forEach((condition: any) => {
    if (condition.propertyCode === 'sequenceStatus') {
      condition.options =
        vm.$t('cloudpivot.flow.pc.WorkflowState.Draft') +
        ';' +
        vm.$t('cloudpivot.flow.pc.WorkflowState.Processing') +
        ';' +
        vm.$t('cloudpivot.flow.pc.WorkflowState.Completed') +
        ';' +
        vm.$t('cloudpivot.flow.pc.WorkflowState.Canceled');
      if (!condition.defaultValue) {
        return;
      }
      const vals_zh: Array<string> = condition.defaultValue.split(';');
      const vals_en: Array<string> = [];
      vals_zh.forEach((val: string) => {
        switch (val) {
          case 'DRAFT':
            vals_en.push('草稿');
            break;
          case 'PROCESSING':
            vals_en.push('进行中');
            break;
          case 'COMPLETED':
            vals_en.push('已完成');
            break;
          case 'CANCELED':
            vals_en.push('已作废');
            break;
          default:
            vals_en.push(val);
            break;
        }
      });
      condition.defaultValue = vals_en.join(';');
    }
    // 日期格式配置了dateType则获取本地当前时间进行过滤
    if (condition.propertyType === 3 && condition.dateType) {
      const date = Helper.setDateByDateType(
        condition.dateType,
        getFormat(condition.displayFormat),
      );
      condition.startValue = date[0];
      condition.endValue = date[1];
    }

    common.utils.compatible(condition, 'name');
    condition.name_i18n['zh'] = condition.name;
    condition.name_i18n = JSON.stringify(condition.name_i18n);
  });

  return conditions;
}
