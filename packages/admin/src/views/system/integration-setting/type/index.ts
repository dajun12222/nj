/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export enum SystemSettingType {
  DINGTALK_BASE = 0, //("钉钉配置", 0),
  DINGTALK_SYN, //("钉钉增量同步", 1),
  DINGTALK_PORTAL, //("门户钉钉集成", 2),
  FILE_UPLOAD, //("文件上传配置", 3),
  VERSION_INFO, //("版本信息", 4),
  PERM_LICENSE_MODE, //("授权模式", 5),
  CLOUDPIVOT_MODE, //("云枢自定义类型", 6),
  IDOCV_INFO, //("I DOC VIEW在线预览配置", 7),
  EMAIL_CONF, //("邮件配置", 8),
  NOTIFY_CONF, //("消息推送设置",9),
  SMS_CONF, //("短信开关配置",10),
  THEME_CONF, //("主题配置",11),
  MAP_CONF, //("地图配置",12);
  WORKFLOW_SIMULATIVE, //("流程配置", 13)
}

export interface getSettingParam {
  settingType: string;
}

export interface editSettingParam {
  settingType: string;
  bodyParams: any;
}
