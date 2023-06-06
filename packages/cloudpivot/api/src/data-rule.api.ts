import Axios from './axios';
const newPath = '/api/app/bizdatarule';
import * as Common from './common';

export class DataRuleApi {
  // 检测规则
  testRules(params: any): Promise<Common.Data> {
    return Axios.post(`${newPath}/check`, params);
  }
}
