import form from 'cloudpivot/form/locales/en-US';
import list from 'cloudpivot/list/locales/en-US';
import flow from 'cloudpivot/flow/locales/en-US';
import system from '@/locale/system/system.en-US';
import apps from './apps.en-US';
import appSettings from './app-settings.en-US';
import formDesign from './form-design.en-US';
import listDesign from './list-design.zh-CN'; //NOTE: 现在admin不做国际化
import integration from './integration.en-US';
import report from './report-settings.en-US';

export default {
  cloudpivot: {
    form,
    flow,
    list,
    report,
  },
  languages: {
    system,
    integration,
    cloudpivot: {
      form,
    },
    appSettings,
    Apps: {
      ...apps,
      FormDesignPage: formDesign,
      listDesignPage: listDesign,
    },
    ConsoleManager: 'Console Manager',
    PortalManager: 'PortalManager',
    HelpCenter: 'Help Center',
    PersonalInformation: 'PersonalInformation',
    ChangePwd: 'ChangePassword',
    OppositeLanguage: '中文',
    Exit: 'Log out',
    AppManager: 'App_Manager',
    Organization: 'Organization',
    BizIntegration: 'BizIntegration',
    SystemManager: 'System_Manager',
    OrganizationRole: 'OrganizationRole',
    OrganizationSync: 'OrganizationSync',
    UserInfoExt: 'UserInfoExt',
    NoUser: 'No User',
    Ok: 'OK',
    Cancel: 'Cancel',
    DeleteSuccess: 'successfully deleted',
    versionChanged: 'Version $ updated, this will cover the latest',
    PublishSuccess: 'Successfully published',
    ImportDepartment: 'Import department',
    ExportDepartment: 'Export department',
    ImportPerson: 'Import person',
    ExportPerson: 'Export person',
    modal: {
      ImportData: 'Import data',
      StartImport: 'Start Import',
      ImportTips1:
        'For make sure uploaded data matches your organization, please',
      ImportTips2: 'download department sample files、 personnel sample files',
      ImportTips3: 'Only support csv/xlsx file,and limited to 10000 lines data',
      ImportLocalFaile: 'Upload the local file',
      ClickToImport: 'Click or drag file to upload',
      DownloadFailed: 'Download Failed',
    },
    User: {
      UserInformation: 'UserInformation',
      BaseInfo: 'BaseInformation',
      Avatar: 'Avatar',
      UserAccount: 'UserAccount',
      UserDepartment: 'UserDepartment',
      UserMainDepartment: 'UserMainDepartment',
      UserName: 'UserName',
      Gender: 'Gender',
      Manager: 'Manager',
      Role: 'Role',
      PersonInfo: 'PersonInfo',
      Birthday: 'Birthday',
      IdentityNumber: 'IdentityNumber',
      Contact: 'Contact',
      department: 'Departments',
      MobilePhone: 'MobilePhone',
      OfficePhone: 'OfficePhone',
      DingTalk: 'DingTalk',
      Email: 'Email',
      OrganizationInfo: 'OrganizationInfo',
      EmployeeInfo: 'EmployeeInfo',
      EmployeeNumber: 'EmployeeNumber',
      EmployeeRank: 'EmployeeRank',
      Appellation: 'Appellation',
      Secretary: 'Secretary',
      EntryDate: 'EntryDate',
      DepartureDate: 'DepartureDate',
      PartTimeDepartment: 'Part-time Department',
      SettingMainDepartment: 'SettingMainDepartment',
      StudentInfo: 'StudentInfo',
      ChildsInfo: 'ChildsInfo',
      TeachersInfo: 'TeachersInfo',
      StudentId: 'StudentId',
      Class: 'Class',
      Parents: 'Parents',
      IsHeadTeacher: 'IsHeadTeacher',
      ChildName: 'ChildName',
    },
    Account: {
      UserAccount: 'Account',
      UserName: 'AccountName',
    },
    PlaceHolder: {
      SearchByName: 'Input name/account search',
      SearchByNameDept: 'name/account/department search',
      SearchByCodeOrName: 'Input name or code search',
      Select: 'Select',
      InputCode: 'Input code',
      InputName: 'Input name',
      BizType: 'Biz type',
      InputDefaultVal: 'Input default value',
      InputAppName: 'Please input app name',
      InputAppCode: 'Please input app code',
      InputFolderName: 'Please input folder name',
      Input: 'Input',
      InputRole: 'Input role name',
    },
    Password: {
      ChangePwd: 'Change password',
      OldPwd: 'Old password',
      PleaseInputOldPwd: 'Please enter the old password',
      OldPwdError: 'Input error of old password',
      PleaseInputNewPwd: 'Please enter a new password',
      SurePwd: 'Confirm password',
      InputNewPwdAgain: 'Please enter a new password again',
      SurePwdError: 'Modify password and confirm password inconsistency',
      PwdIsNullTip: 'Passwords are not allowed to be empty',
      ChangePwdSuccess: 'Password modification was successful!',
      CanNotSamePwd:
        'The old password and the new password can not be the same!',
    },
    Name: 'Name',
    NO: 'No.',
    Roles: 'Roles',
    Department: 'Department',
    ManagementScope: 'Management Scope',
    Operation: 'Operation',
    WorkHandover: 'Work Handover',
    HistoryRec: 'History Records',
    ResetPassWord: 'Reset PassWord',
    Delete: 'Delete',
    NoRelevantData: 'No relevant data is available',
    NoSearchData: 'No search results yet',
    NoRelevantDataTips: 'No relevant data is available, input again',
    ClickToLoadMore: 'Click to load more',
    LoadMore: 'loading...',
    HasLoadedAllData: 'No More',
    // 组织同步
    Synching: 'Synching',
    SynchronizeNow: 'Synchronize Now',
    Query: 'Query',
    ProcessName: 'Process Name',
    DeptOfOriginator: 'Dept.ofOriginator',
    ReceiveTime: 'Receive Time',
    TaskNode: 'Workflow Node',
    TaskTransfer: {
      TaskTransfer: 'TaskTransfer of {name}',
      WorkerFlow: 'WorkerFlow',
      BizModel: 'Business model',
      SequenceStatus: 'SequenceStatus',
      Originator: 'Originator',
      Delegatee: 'Delegatee',
      DelegateeOrg: 'Handover Dept',
      HandoverRole: 'Handover Role',
      SearchWorkerFlow: 'Input workerFlow search',
      SearchByOriginator: 'Select originator search',
      SelectDelegatee: 'Select delegatee',
      Selected: 'Selected',
      TransferAll: 'Transfer the current {num} tas',
      TransferAll2: 'Transfer the current {num} items',
      TransferSelected: 'Transfer selected',
      TransferSelected2: 'Transfer selected',
      Name: 'Name',
      OwnerDept: 'OwnerDept',
      CreatedTime: 'CreatedTime',
      SchemaCode: 'SchemaCode',
      TranferTips: 'Are you sure you want to handover the current {num} task?',
      TranferTips2: 'Are you sure you want to handover the current {num} data?',
      TranferTips3:
        'After the handover is completed, it can not be withdrawn. Please operate with caution',
      TranferTips4:
        'Determine all data for the current user under the handover of all applications?',
      TransferAllAppData: 'Are you sure you want to transfer all the data?',
      TransferAllContent:
        'The current transfer data volume is too large, it will take a long time, the system will perform the transfer action in the background.',
      ContinueTransfer: 'Continue',
    },
    Save: 'Save',
    UserAction: 'UserAction',
    BizAction: 'BizAction',
    SubInstance: 'SubInstance',
    Connection: 'Connection',
    Notify: 'Notify',
    Switch: 'Switch',
    Prompt: 'Prompt',
    Iknow: 'I Know',
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      clear: 'Clear',
      reset: 'Reset',
      search: 'Search',
      approval: 'Approval logs',
    },
  },
};
