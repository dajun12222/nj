import axios from 'axios';
export default {
     /**
   * ����ҵ�񷽷�
   * @param params 
   */
  getCopyProess(params) {
    return axios.get('/api/workflow/list', { params });
  },
  saveCopyProess(params) {
    return axios.post('/api/ceec/flow/copyWorkFlow', params );
  },
    // workflow : {
    //     searchWorkitems : '/aaaa'
    // },

    // fff:{
    //     f : 'ff'
    // }

};