/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-11-08 19:20:23
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-11-11 19:20:28
 */
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SetTimeTypeMixin extends Vue {
  get isChinese() {
    return !(this.$i18n.locale && this.$i18n.locale === 'en');
  }

  /**
   * 去除后台传值的秒
   */
  removeSeconds(time: string) {
    if (!time) {
      return '';
    }
    if (typeof time === 'string') {
      return time.substring(0, time.lastIndexOf(':'));
    } else if (typeof time === 'number') {
      const timeStr: string = new Date(time).toISOString().replace('T', ' ');
      return timeStr.substring(0, timeStr.lastIndexOf(':'));
    } else {
      return '';
    }
  }

  /**
   * 时间处理
   * @param data 需处理的数据
   */
  SetTimeType(workitem) {
    let day: number = 0;
    let hour: number = 0;
    let min: number = 0;
    let stayTime = '';
    if (workitem.stayTime) {
      const { stayTime } = workitem;
      const { remainingTime } = workitem;
      if (
        workitem.workItemTimeoutStatus === 'RED' ||
        workitem.workItemTimeoutStatus === 'ORANGE'
      ) {
        day = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        hour = Math.floor(
          (remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
        );
        min = Math.floor(
          ((remainingTime % (24 * 60 * 60 * 1000)) % (60 * 60 * 1000)) /
            (60 * 1000),
        );
      } else {
        day = Math.floor(stayTime / (24 * 60 * 60 * 1000));
        hour = Math.floor(
          (stayTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
        );
        min = Math.floor(
          ((stayTime % (24 * 60 * 60 * 1000)) % (60 * 60 * 1000)) / (60 * 1000),
        );
      }
    }
    const getTimerString: Array<number> = [day, hour, min];
    switch (workitem.workItemTimeoutStatus) {
      case 'TIMEOUT':
        stayTime = this.isChinese
          ? `已超时${this.getTimerString(getTimerString)}`
          : `Timed out ${this.getTimerString(getTimerString)}`;
        // if (day > 0) {
        //   this.stayTime = `已超时${day}天${hour}小时`;
        // } else {
        //   this.stayTime = `已超时${hour}小时${min}分钟`;
        // }
        break;
      case 'RED':
      case 'ORANGE':
        stayTime = this.isChinese
          ? `${this.getTimerString(getTimerString)}后超时`
          : `Timeout after ${this.getTimerString(getTimerString)}`;
        // if (day > 0) {
        //   this.stayTime = `${day}天${hour}小时后超时`;
        // } else {
        //   this.stayTime = `${hour}小时${min}分钟超时`;
        // }
        break;
      default:
        stayTime = this.isChinese
          ? `已等待${this.getTimerString(getTimerString)}`
          : `Waited ${this.getTimerString(getTimerString)}`;
        // if (day > 0) {
        //   this.stayTime = `已等待${day}天${hour}小时`;
        // } else {
        //   this.stayTime = `已等待${hour}小时${min}分钟`;
        // }
        break;
    }
    workitem.stayTimeStr = this.getTimerString(getTimerString);
    workitem.stayTimeStrHint = stayTime;
    return workitem;
  }

  getTimerNumber(time: number) {
    let day = 0,
      hour = 0,
      min = 0;
    day = Math.floor(time / (24 * 60 * 60 * 1000));
    hour = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    min = Math.floor(
      ((time % (24 * 60 * 60 * 1000)) % (60 * 60 * 1000)) / (60 * 1000),
    );
    return this.getTimerString([day, hour, min]);
  }

  getTimerString(list: Array<number>): string {
    let str = '';

    let count = 0;
    list.forEach((res: number, index: number) => {
      count += res;
      if (index === 0 && res > 0) {
        str += this.isChinese
          ? `${res}天`
          : res === 1
          ? `${res} day `
          : `${res} days `;
      }
      if (index === 1 && res > 0) {
        str += this.isChinese
          ? `${res}小时`
          : res === 1
          ? `${res} hour `
          : `${res} hours `;
      }
      if (index === 2 && res > 0) {
        str += this.isChinese
          ? `${res}分钟`
          : res === 1
          ? `${res} min`
          : `${res} mins`;
      }
    });
    if (count === 0) {
      return this.isChinese ? '时间小于1分钟' : 'less than 1 minute';
    }
    return str;
  }

  getTimerStr(number: number, type: string) {
    if (!number) {
      return '';
    }
    let str = '';
    switch (type) {
      case 'day':
        str = this.isChinese
          ? `${number}天`
          : number === 1
          ? `${number} day`
          : `${number} days`;
        break;
      case 'hour':
        str = this.isChinese
          ? `${number}小时`
          : number === 1
          ? `${number} hour`
          : `${number} hours`;
        break;
      case 'min':
        str = this.isChinese
          ? `${number}分钟`
          : number === 1
          ? `${number} min`
          : `${number} mins`;
        break;
      default:
        break;
    }
  }
}
