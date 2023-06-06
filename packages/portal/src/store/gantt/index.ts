/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { GanttState, MoveBgSvgAttr } from './types';
// import { ScaleItem } from '../../components/table-gantt/utils.types';

const GANTT_SCALE = {
  HOUR: 'HOUR',
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR',
};

const initState: GanttState = {
  moveBgSvgAttr: {
    minUnitWidth: 30,
    newTaskTranslateX: 0,
  },
  viewBoxX: 560000,
  viewBoxWidth: 0,
  showDateRange: false,
  dateRange: [],
  dateRangeFormated: [],
  createNew: false,
  scaleTranslateX: 0,
  swinLanes: [],
  clientFirstIndex: 0,
  clientLastIndex: -1,
  ganttTimeScale: GANTT_SCALE.DAY,
};

interface DateRange {
  dateRange: GanttState['dateRange'];
  dateRangeFormated: GanttState['dateRangeFormated'];
  showDateRange?: boolean;
}
export default {
  namespaced: true,
  state: initState,
  mutations: {
    setViewBoxX(state: GanttState, payload: number) {
      state.viewBoxX = payload;
    },
    setViewBoxWidth(state: GanttState, payload: number) {
      state.viewBoxWidth = payload;
    },
    setMoveBgSvgAttr(state: GanttState, payload: MoveBgSvgAttr) {
      state.moveBgSvgAttr = payload;
    },
    setNewTaskBool(state: GanttState, payload: boolean) {
      state.createNew = payload;
    },
    setDateRange(state: GanttState, payload: DateRange) {
      state.dateRange = payload.dateRange;
      state.dateRangeFormated = payload.dateRangeFormated;
      if (typeof payload.showDateRange === 'boolean') {
        state.showDateRange = payload.showDateRange;
      }
    },
    setShowDateRange(state: GanttState, payload: boolean) {
      state.showDateRange = payload;
    },
    setScaleTranslateX(state: GanttState, payload: number) {
      state.scaleTranslateX = payload;
    },
    setSwinLanes(state: GanttState, payload: any[]) {
      state.swinLanes = payload;
    },
    setClientIndexRange(
      state: GanttState,
      payload: { clientFirstIndex: number; clientLastIndex: number },
    ) {
      state.clientFirstIndex = payload.clientFirstIndex;
      state.clientLastIndex = payload.clientLastIndex;
    },
    setGanttTimeScale(state: GanttState, payload: string) {
      state.ganttTimeScale = payload;
    },
  },
  getters: {},
  actions: {},
};
