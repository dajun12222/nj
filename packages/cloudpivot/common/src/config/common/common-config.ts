import { systemManageApi } from '../../../../api';
//默认的授权码，不需要安全密钥即可运行
const locationKey = '719e768fc97480afacc18895a6cd4828';
/**
 * 从接口获取自定义的地址授权码
 * @returns
 */
export async function getLocationKey() {
  return (window as any)._AMapSecurityKey || locationKey;
}

//当后台存有自定义地图授权码时，首次加载时需要设置
//地图安全密钥
export function initMapSecret() {
  if (localStorage.getItem('token')) {
    systemManageApi
      .getSettingByType({ settingType: 'MAP_CONF' })
      .then((res: any) => {
        if (
          res.errcode === 0 &&
          res.data &&
          res.data['map.secret'] &&
          res.data['map.key']
        ) {
          (window as any)._AMapSecurityConfig = {
            securityJsCode: res.data['map.secret'],
          };
          (window as any)._AMapSecurityKey = res.data['map.key'];
        }
      });
  } else {
    setTimeout(() => {
      initMapSecret();
    }, 100);
  }
}
