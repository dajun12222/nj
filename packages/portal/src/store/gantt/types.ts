/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { Dayjs } from 'dayjs';
// import { ScaleItem } from '../../components/table-gantt/utils.types';
export interface GanttState {
  moveBgSvgAttr: MoveBgSvgAttr;
  viewBoxX: number;
  // 甘特图可视区域(svg的viewBox 实际宽度)
  viewBoxWidth: number;
  showDateRange: boolean;
  // 任务起始时间时的时间范围
  dateRange: Array<Dayjs | undefined>;
  // 顶部显示的格式化后的时间范围
  dateRangeFormated: Array<string | undefined>;
  createNew: boolean;
  // 主要为了兼容小时刻度的偏移量，因为当前时间戳转换为小时刻度数字太大了，浏览器会自动能转换为科学计数法，有偏差
  // 除了小时刻度其余皆为0
  scaleTranslateX: number;
  // 垂直泳道
  swinLanes: any[];

  clientFirstIndex: number; // 容器可视范围内第一条数据的索引
  clientLastIndex: number; // 容器可视范围内最后一条数据的索引

  ganttTimeScale: string; // 默认时间刻度
}

export interface MoveBgSvgAttr {
  newTaskTranslateX: number;
  minUnitWidth: number;
}
