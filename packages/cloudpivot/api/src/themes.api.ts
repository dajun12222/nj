import Axios from './axios';
const env = (window as any).config;
declare namespace Common {
  /* 接口响应数据内容 */
  interface Data {
    data: any;
    errcode?: number;
    errmsg?: string;
  }
  /* HTTP响应 */
  interface Response {
    data: Data;
  }
}

export class ThemesApi {
  getThemesInfo() {
    return Axios.get(`${env.apiHost}/public/theme/findAll`);
  }

  editTheme(params: any): Promise<Common.Data> {
    return Axios.post('/api/system/theme/edit', params);
  }
}
