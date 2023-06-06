import { StyleControlOptions } from './form-control-options';

export class SequenceNoOptions extends StyleControlOptions {
  // /**
  //  * 流水号编码
  //  */
  // prefix: string | null = null

  // /**
  //  * 最大长度
  //  */
  // maxLength: string = '6'

  // /**
  //  * 重置策略时间 'none' | 'year' | 'month' | 'week' | 'day'
  //  */
  // resetDate: string = 'YEAR'

  // /**
  //  * 连接符 '-' | '#' | '、' | '_' |
  //  */
  // delimiter: string = 'mark1'
  seqNoSetting: any[] = [
    {
      type: 'DATE', //日期
      value: 'yyyyMM',
    },
    {
      type: 'DELIMITER', //分割符
      value: '#',
    },
    {
      type: 'SEQNO', //流水号
      value: {
        maxLength: 6, //长度
        leftPad: true, //自动补0
        resetDate: 'MONTH', //重置策略
      },
    },
  ];
}

/**
 * 创建时间
 */
export class CreatedTimeOptions extends StyleControlOptions {
  format1: string = 'YYYY-MM-DD HH:mm:ss';

  format: string = 'YYYY-MM-DD HH:mm:ss';
}
