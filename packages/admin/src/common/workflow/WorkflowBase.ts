/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { factoryLast } from 'cloudpivot-designer/designer-core/property-panel';

import * as WorkflowNamespace from '../../typings/workflow';

import StartSchema from '../workflow-schema/node-start-property/schema';
import EndSchema from '../workflow-schema/node-end-property/schema';
import UserSchema from '../workflow-schema/node-user-property/schema';
import SysSchema from '../workflow-schema/node-system-property/schema';
import SubInstanceSchema from '../workflow-schema/node-subinstance-property/schema';
import ConnectionSchema from '../workflow-schema/node-connection-property/schema';
import CirculateSchema from '../workflow-schema/node-circulate-property/schema';

export default class WorkflowBase {
  StartActivity: WorkflowNamespace.Activity = factoryLast.build(StartSchema)
    .value as WorkflowNamespace.Activity;

  EndActivity: WorkflowNamespace.Activity = factoryLast.build(EndSchema)
    .value as WorkflowNamespace.Activity;

  UserActivity: WorkflowNamespace.Activity = factoryLast.build(
    UserSchema as any,
  ).value as WorkflowNamespace.Activity;

  SysActivity: WorkflowNamespace.Activity = factoryLast.build(SysSchema)
    .value as WorkflowNamespace.Activity;

  SubWorkflow: WorkflowNamespace.Activity = factoryLast.build(
    SubInstanceSchema as any,
  ).value as WorkflowNamespace.Activity;

  Connection: WorkflowNamespace.Activity = factoryLast.build(ConnectionSchema)
    .value as WorkflowNamespace.Activity;

  Circulate: WorkflowNamespace.Activity = factoryLast.build(
    CirculateSchema as any,
  ).value as WorkflowNamespace.Activity;
}
