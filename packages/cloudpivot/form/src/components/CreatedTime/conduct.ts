import { utils } from '../../../../common';
import baseAttribute from '../../common/component-base-attribute';
import { ControlAttributeType, ControllerConduct } from '../../../typings';

const DateHandle = utils.DateHandle;
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
      keys: ['format1', 'syncFormate', 'visible', 'span'],
    },
  },
  properties: {
    name: {
      ...baseAttribute.name,
    },
    dataItemName: {
      ...baseAttribute.dataItemName,
    },
    style: {
      ...baseAttribute.style,
    },
    widgetType: {
      ...baseAttribute.widgetType,
      value: '创建时间',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '日期',
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: 'YYYY',
            label: DateHandle.dateFormat(new Date(), 'YYYY'),
          },
          {
            value: 'YYYY-MM',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM'),
          },
          {
            value: 'YYYY-MM-DD',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD'),
          },
          {
            value: 'YYYY-MM-DD HH:mm',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
          },
          {
            value: 'YYYY-MM-DD HH:mm:ss',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
          },
          {
            value: 'YYYY-MM-DD CN-APM',
            label: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD CN-APM'),
          },
          {
            value: 'YYYY-MM-DD CN-APM HH:mm',
            label: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD CN-APM HH:mm',
            ),
          },
          {
            value: 'YYYY-MM-DD EN-APM',
            label: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD EN-APM'),
          },
          {
            value: 'YYYY-MM-DD EN-APM HH:mm',
            label: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD EN-APM HH:mm',
            ),
          },
        ],
      },
    },
    format1: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        // getValue(value: any, attrs:any, assitAttrs: any){
        //   let formatVal: any = "";
        //   if (Array.isArray(assitAttrs)) {
        //     let formatItem: any = assitAttrs.find(x => x.field === 'format');
        //     if (formatItem) {
        //       formatVal = formatItem.value;
        //     }
        //   }
        //   return value || formatVal;
        // },
        getValue: (value, attributes, assistAttrbute) => {
          const isSync = attributes.find(
            (item) => item.field === 'syncFormate',
          ).value;
          if (isSync && Array.isArray(assistAttrbute)) {
            const formatValue = assistAttrbute.find(
              (item) => item.field === 'format',
            ).value;
            attributes.find((item) => item.field === 'format1').value =
              formatValue;
            return formatValue;
          }
          return value;
        },
        list: [
          {
            value: 'YYYY',
            label: DateHandle.dateFormat(new Date(), 'YYYY'),
          },
          {
            value: 'YYYY-MM',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM'),
          },
          {
            value: 'YYYY-MM-DD',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD'),
          },
          {
            value: 'YYYY-MM-DD HH:mm',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
          },
          {
            value: 'YYYY-MM-DD HH:mm:ss',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
          },
          {
            value: 'YYYY-MM-DD CN-APM',
            label: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD CN-APM'),
          },
          {
            value: 'YYYY-MM-DD CN-APM HH:mm',
            label: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD CN-APM HH:mm',
            ),
          },
          {
            value: 'YYYY-MM-DD EN-APM',
            label: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD EN-APM'),
          },
          {
            value: 'YYYY-MM-DD EN-APM HH:mm',
            label: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD EN-APM HH:mm',
            ),
          },
        ],
      },
      tip: {
        content: '文字为绿色的时候，表示和默认格式同步',
        icon: 'question-circle-o',
      } as any,
    },
    syncFormate: {
      inputMethod: ControlAttributeType.String,
      value: '',
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
