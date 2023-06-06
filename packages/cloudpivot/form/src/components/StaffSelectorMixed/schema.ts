/*
 * @Author: Fan
 * @Date: 2020-04-18 21:23:13
 * @description:
 * @LastEditors: Fan
 */
import { inputControlOptions } from '../../../../form/component-schema';
import {
  DisplayType,
  StaffSelectorSelectType,
  StaffSelectorValueType,
} from '../../../../form/src/common/component-schema/complex-control-options';
import { DataType, ObjectPropertyInfo } from '../../../../form/typings';
export default {
  $id: 'staffSelector',
  type: DataType.Object,
  $ref: inputControlOptions.$id,
  properties: {
    widgetType: {
      type: DataType.String,
      title: '控件类型',
    },
    dataItemType: {
      type: DataType.String,
      title: '数据项类型',
    },
    deptVisible: {
      type: DataType.String,
      title: '可选类型',
      default: StaffSelectorSelectType.All,
    },
    defaultValue: {
      type: DataType.Array,
      title: '默认值',
      default: [],
    },
    defaultValueType: {
      type: DataType.String,
      title: '默认值',
      default: StaffSelectorValueType.None,
    },
    orgRoot: {
      type: DataType.Array,
      title: '组织根节点',
      default: [],
    },
    orgRootValueType: {
      type: DataType.String,
      title: '组织根节点',
      default: StaffSelectorValueType.None,
    },
    recursive: {
      type: DataType.Boolean,
      title: '是否递归展示',
      default: true,
    },
    multi: {
      type: DataType.String,
      title: '是否多选',
      default: 'true',
    },
    roles: {
      type: DataType.String,
      title: '角色范围',
      default: '',
    },
    mappings: {
      type: DataType.String,
      title: '映射关系',
    },
    displayType: {
      type: DataType.String,
      title: 'displayType',
      default: DisplayType.Tag,
    },
    dataLinkage: {
      type: DataType.String,
      title: '数据联动',
    },
    labelVisible: {
      type: DataType.Checkbox,
      title: '标题显示',
      default: true,
    },
    readonlyCondition: {
      type: DataType.String,
      title: '只读条件',
    },
    isShowGroups: {
      type: DataType.Boolean,
      title: "是否显示为组",
      default: false,
    },
    style: {
      type: DataType.String,
      title: '控件样式',
      tip: {
        content: `<div>控件标题样式，css样式</div>
                  <div>例：color: red</div>`,
        icon: 'question-circle-o',
      } as any,
    },
    span: {
      type: DataType.RadioGroup,
      title: '控件宽度',
    },
  },
} as ObjectPropertyInfo;
