import baseAttribute from '../../../../form/src/common/component-base-attribute';
import {
  ControlAttributeType,
  ControllerConduct,
} from '../../../../form/typings';
import { formatterValueToSetStatus } from '../../../../form/utils';
import { DataItemType } from '../../schema';
export default {
  groups: {
    base: {
      label: '基础信息',
      keys: [
        'widgetType',
        'name',
        'labelVisible',
        'style',
        'tips',
        'dataItemType',
        'dataItemName',
      ],
    },
    controller: {
      label: '控制属性',
      keys: [
        'rows',
        'sheetFiters',
        'mobileDisplayMode',
        'importFormRelevanceForm',
        'editable',
        'importable',
        'exportable',
        'showTotal',
        'showAllEdit',
        'visible',
        'span',
      ],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
      options: {
        //对子表的options进行重写，其名称最大长度只支持到50
        regexps: {
          required: '控件名称不能为空',
          maxLength: {
            len: 50,
            message: '长度不能超过50',
          },
          regexps: [
            {
              regexp: /^[^ ]/,
              message: '不能以空格开始',
            },
          ],
        },
      },
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    style: {
      ...baseAttribute.style,
    },
    widgetType: {
      ...baseAttribute.widgetType,
      value: '子表',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '子表',
    },
    width: {
      options: {
        regexps: {
          required: '列宽不能为空',
          regexps: [
            {
              regexp: /^[1-9]\d*$/,
              message: '只能输入正整数',
            },
            {
              regexp: (value: string) => parseFloat(value) <= 885,
              message: '不能超过最大宽度885',
            },
            {
              regexp: (value: string) => parseFloat(value) >= 150,
              message: `不能小于最小宽度${150}`,
            },
          ],
        },
      },
    },
    // 默认行数
    rows: {
      options: {
        regexps: {
          required: '默认行数不能为空',
          regexps: [
            {
              regexp: /^[0-9]\d*$/,
              message: '只能输入正整数',
            },
            {
              regexp: (value: string) => parseFloat(value) <= 100,
              message: '默认行数不能超过100',
            },
          ],
        },
      },
    },
    editable: {
      options: {
        // disabled: true
        hideField: (value: boolean) => {
          return !value ? ['importable'] : [];
        },
        callback: (key: boolean, attr: any, attrs: any, vm: any) => {
          const { value } = attr;
          vm.updateAttribute(key, 'importable', value);
        },
      },
    },
    importFormRelevanceForm: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        dataList: (attr: any, attrs: any) => {
          const list = [
            {
              value: '',
              label: '请选择',
            },
          ];
          if (attr.dataItem && attr.dataItem.properties) {
            attr.dataItem.properties.forEach((res: any) => {
              // 对于在数据项列表但是不在表单中的需要过滤掉
              if (res.used && (res.type === 9 || res.type === 11)) {
                const listItme = {
                  value: res.code,
                  label: res.name,
                };
                list.push(listItme);
              }
            });
          } else if (attr.dataItem && attr.dataItem.children) {
            //此分支为历史表单逻辑，其他情况进入会出问题
            attr.dataItem.children.forEach((res: any) => {
              // 历史表单不过滤
              if (res.propertyType === 9 || res.propertyType === 11) {
                const listItme = {
                  value: res.code,
                  label: res.name,
                };
                list.push(listItme);
              }
            });
          } else {
            //Else Empty block statement
          }
          return new Promise((resolve, reject) => {
            resolve(list);
          });
        },
      },
    },
    sheetFiters: {
      value: [],
      type: ControlAttributeType.Array,
      options: {
        dataList(attr: any, attrs: any) {
          const list: any = [];
          // 支持类型：短文本、日期、数值、选人控件、逻辑、关联表单
          const type = [
            DataItemType.ShortText,
            DataItemType.LongText,
            DataItemType.Number,
            DataItemType.Date,
            DataItemType.Logic,
            DataItemType.StaffSingle,
            DataItemType.StaffMulti,
            DataItemType.DeptSingle,
            DataItemType.DeptMulti,
            DataItemType.StaffDeptMix,
            DataItemType.RelevanceForm,
            DataItemType.RelevanceFormEx,
          ];
          //const type = [0, 1, 2, 3, 4, 5, 50, 51, 60, 61, 8, 80, 81];
          if (attr.dataItem && attr.dataItem.properties) {
            attr.dataItem.properties.forEach((res: any) => {
              //在数据模型新建的数据项type可能为0或者2
              if (res.type === 0 || res.formPropertyType === 0) {
                list.push(res);
              } else if (
                type.includes(res.type || res.formPropertyType) &&
                res.code !== 'sortKey'
              ) {
                list.push(res);
              } else {
                //Else Empty block statement
              }
            });
          }
          return new Promise((resolve, reject) => {
            resolve(list);
          });
        },
      },
      label: '弹出框字段',
    },
    displayFormula: {
      ...baseAttribute.displayFormula,
    },
    mobileDisplayMode: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'waterfall',
            label: '瀑布样式',
          },
          {
            value: 'table',
            label: '二维表',
          },
          {
            value: 'page',
            label: '分页样式',
          },
        ],
      },
    },
    tips: {
      options: {
        regexps: {
          maxLength: {
            len: 200,
            message: '长度不能超过200字节',
          },
        },
        placeholder: '控件提示',
      },
    },
    span: {
      ...baseAttribute.span,
    },
  },
} as ControllerConduct;
