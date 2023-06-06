/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export enum Activity {
  Add = 1,
  Remove = 2,
  TextChange = 3,
  TextSizeChange = 4,
  TextColorChange = 5,
  Move = 6,
  Resize = 7,
}

export enum Line {
  Add = 10,
  Remove = 11,
  TextChange = 12,
  TextSizeChange = 13,
  TextColorChange = 14,
  PointChange = 15,
}

export enum Multi {
  SameTop = 16,
  SameRight = 17,
  SameBottom = 18,
  SameLeft = 19,

  ActivitiesMove = 20,
  SameHeight = 22,
  SameWidth = 23,
  SameSize = 24,
  // 竖排等间距
  VerticalDistance = 25,
  // 横排等间距
  HorizontalDistance = 26,
  // 多活动文字大小改变
  ActivitiesTextSizeChange = 27,
  // 多活动文字颜色改变
  ActivitiesTextColorChange = 28,
}
