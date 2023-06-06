/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import Axios from 'axios';

export default {
  uploadFile(params: AppSettings.uploadParam): Promise<Common.Data> {
    const formData: FormData = new FormData();
    Object.entries(params).forEach(([k, v]) => {
      formData.append(k, v);
    });
    return Axios.post('/api/aliyun/upload', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  updatePackage(
    params: Apps.AppCenter.AppInfo,
  ): Promise<AppSettings.uploadResponse> {
    return Axios.put('/api/app/apppackage/update', params);
  },
};
