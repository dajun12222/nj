/*
 * @Author: Fan
 * @Date: 2020-04-19 19:31:21
 * @description:
 * @LastEditors: Fu Zhuohang
 */
import { utils } from '../../../../common';
import baseAttribute from '../../common/component-base-attribute';
import { ControlAttributeType, ControllerConduct } from '../../../typings';
import {
  formatterRequiredFormula,
  formatterValueToSetStatus,
} from '../../../utils';
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
      keys: [
        'defaultValue',
        'format1',
        'syncFormate',
        'dataLinkage',
        'readonlyFormula',
        'visible',
        'requiredFormula',
        'span',
      ],
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
      value: '日期',
    },
    dataItemType: {
      ...baseAttribute.dataItemType,
      value: '日期',
    },
    defaultValue: {
      inputMethod: ControlAttributeType.RadioGroup,
      options: {
        list: [
          {
            value: 'none',
            label: '空',
          },
          {
            value: 'current',
            label: '当前时间',
          },
          // {
          //   value: "dataItemDefault",
          //   label: "数据项默认值",
          // },
        ],
      },
    },
    displayFormula: {
      ...baseAttribute.displayFormula,
    },
    requiredFormula: {
      ...baseAttribute.requiredFormula,
    },
    // 只读条件
    readonlyCondition: {
      ...baseAttribute.readonlyCondition,
    },
    dataLinkage: {
      ...baseAttribute.dataLinkage,
    },
    format: {
      inputMethod: ControlAttributeType.Dropdown,
      options: {
        list: [
          {
            value: 'YYYY',
            label: DateHandle.dateFormat(new Date(), 'YYYY'),
            title: DateHandle.dateFormat(new Date(), 'YYYY'),
          },
          {
            value: 'YYYY-MM',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM'),
            title: DateHandle.dateFormat(new Date(), 'YYYY-MM'),
          },
          // {
          //   value: "MM-DD",
          //   label: DateHandle.dateFormat(new Date(), "MM-DD"),
          //   title: DateHandle.dateFormat(new Date(), "MM-DD"),
          // },
          {
            value: 'YYYY-MM-DD',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD'),
            title: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD'),
          },
          {
            value: 'YYYY-MM-DD HH:mm',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
            title: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm'),
          },
          {
            value: 'YYYY-MM-DD HH:mm:ss',
            label: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            title: DateHandle.dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
          },
          {
            value: 'YYYY-MM-DD CN-APM',
            label: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD CN-APM'),
            title: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD CN-APM'),
          },
          {
            value: 'YYYY-MM-DD CN-APM HH:mm',
            label: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD CN-APM HH:mm',
            ),
            title: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD CN-APM HH:mm',
            ),
          },
          {
            value: 'YYYY-MM-DD EN-APM',
            label: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD EN-APM'),
            title: DateHandle.dateFormatApm(new Date(), 'YYYY-MM-DD EN-APM'),
          },
          {
            value: 'YYYY-MM-DD EN-APM HH:mm',
            label: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD EN-APM HH:mm',
            ),
            title: DateHandle.dateFormatApm(
              new Date(),
              'YYYY-MM-DD EN-APM HH:mm',
            ),
          },
          // {
          //   value: "HH:mm",
          //   label: DateHandle.dateFormat(new Date(), "HH:mm"),
          //   title: DateHandle.dateFormat(new Date(), "HH:mm"),
          // },
          // {
          //   value: "HH:mm:ss",
          //   label: DateHandle.dateFormat(new Date(), "HH:mm:ss"),
          //   title: DateHandle.dateFormat(new Date(), "HH:mm:ss"),
          // },
        ],
      },
    },
    format1: {
      inputMethod: ControlAttributeType.Dropdown,
      inputComponent: () =>
        import('../../common/components/formate-default-modal.vue'),
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
        // tip: {
        //   content: '23',
        //   icon: "question-circle-o",
        // } as any,
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
    verifyFormula: {
      inputMethod: ControlAttributeType.Modal,
      attrType: 'verifyFormula',
      inputComponent: () =>
        import('../../common/components/regular-modal2.vue'),
      options: {
        formatter: formatterValueToSetStatus,
      },
    },
    shortTextStitch: {
      inputMethod: ControlAttributeType.Modal,
      inputComponent: () =>
        import('../../../../form/src/common/components/short-text-rouls.vue'),
      options: {
        formatter: formatterValueToSetStatus,
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
