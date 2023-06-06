/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export enum ComponentType {
  Input = 'AInput',

  InputNumber = 'AInputNumber',

  Switch = 'ASwitch',

  Select = 'ASelect',

  Radio = 'ARadio',

  Textarea = 'ATextarea',

  /**
   * 日期选取器
   */
  DatePicker = 'ADatePicker',

  /**
   * 颜色选取器
   */
  ColorPicker = 'ColorPicker',

  /**
   * 边框选取器
   * 大小、颜色、四边
   */
  BorderPicker = 'BorderPicker',

  /**
   * 字体样式选取器
   * 大小、颜色、加粗、斜体
   */
  FontStylePicker = 'AFontStylePicker',

  /**
   * 文本对齐选取器
   * 水平、垂直
   */
  TextPositionPicker = 'ATextPositionPicker',

  /**
   * 水平对齐单选
   */
  TextAlignRadio = 'TextAlignRadio',

  /**
   * 垂直对齐单选
   */
  VerticalAlignRadio = 'VerticalAlignRadio',

  /**
   * 文本装饰单选
   * 下划线、删除线
   */
  TextDecorationRadio = 'TextDecorationRadio',

  /**
   * 背景设置器
   */
  BackgroundSetter = 'BackgroundSetter',

  /**
   * 边框设置器
   */
  BorderSetter = 'BorderSetter',

  /**
   * 盒模型设置器
   */
  BoxModal = 'BoxModal',

  /**
   * 字体属性
   */
  FontStyle = 'FontStyle',
}
