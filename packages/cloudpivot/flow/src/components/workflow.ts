/*
 * @Author: Fu Zhuohang
 * @Date: 2022-01-04 18:06:34
 * @LastEditors: Fu Zhuohang
 * @LastEditTime: 2022-03-02 15:11:50
 * @FilePath: \yunshu6.0\modules\cloudpivot\flow\src\components\workflow.ts
 * @Description:
 */
import { Component, Vue } from 'vue-property-decorator';
import { workflowActionStatus, workItemStatus } from '../typings/workflow-enum';
import { workflow } from '../../../api';

@Component
export default class WorkflowActionStatusMixin extends Vue {
  /**
   * 获取流程行为状态
   * @param approvalActionStatus
   */
  getWorkflowActionStatus(approvalActionStatus: number) {
    if (!approvalActionStatus && approvalActionStatus !== 0) {
      approvalActionStatus = 99;
    }
    if (workflowActionStatus[approvalActionStatus.toString()]) {
      let btnConfigList: any = sessionStorage.getItem('btnConfigList');
      if (btnConfigList) {
        btnConfigList = JSON.parse(btnConfigList);
        for (const con of btnConfigList) {
          if (
            workflowActionStatus[
              approvalActionStatus.toString()
            ].toLowerCase() === con.code.toLowerCase() &&
            con.displayName
          ) {
            return con.displayName;
          }
          if (approvalActionStatus === 8) {
            //驳回特殊处理
            if (con.code === 'rejects' && con.displayName) {
              return con.displayName;
            }
          }
          if (approvalActionStatus === 16) {
            if (con.code === 'circulate' && con.displayName) {
              return con.displayName;
            }
          }
        }
      }
      return this.$t(
        `cloudpivot.flow.mobile.WorkflowActionStatus.${
          workflowActionStatus[approvalActionStatus.toString()]
        }`,
      );
    }
    return '';
  }

  /**
   * 获取流程行为状态颜色样式
   * @param approvalActionStatus
   */
  getWorkflowActionStatusColorClass(approvalActionStatus: number) {
    let colorClass = 'gray';
    switch (approvalActionStatus) {
      case 1:
      case 2:
        colorClass = 'gray';
        break;
      case 3:
        colorClass = 'green';
        break;
      case 5:
      case 6:
      case 7:
        colorClass = 'blue';
        break;
      case 4:
      case 8:
      case 9:
        colorClass = 'red';
        break;
      case 10:
        break;
      case 11:
        break;
      default:
        colorClass = 'gray';
        break;
    }
    return colorClass;
  }

  /**
   * 获取流程任务状态
   * @param subWorkItemStatus
   */
  getWorkItemStatus(subWorkItemStatus: number) {
    if (workItemStatus[subWorkItemStatus.toString()]) {
      return `${this.$t(
        `cloudpivot.flow.mobile.WorkItemStatus.${
          workItemStatus[subWorkItemStatus.toString()]
        }`,
      )}`;
    }
    return '';
  }

  /**
   * 日志时间格式化
   * @param text
   * @param record
   * @param index
   */
  workItemLogTimeFormat(text: any, record: workflow.WorkflowTrackLog): string {
    if (!text || text === '') {
      if (record.subInstanceActivity) {
        return this.getWorkItemStatus(record.workItemStatus);
      }
      return '处理中';
    }
    return text;
  }
}
