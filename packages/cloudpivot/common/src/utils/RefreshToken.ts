import axios from 'axios';
export default class RefreshToken {
  //token刷新定时器
  private tokenRefreshTimer: any = null;

  //定时器剩余时间计算器
  private restTokenTimer: any = null;

  //token定时器间隔取token有效时间的四分之一或取默认两小时
  private restTokenRefreshTime: any = 0;

  constructor() {
    this.initTimer();
  }

  private getExpiresIn() {
    const expires_in = localStorage.getItem('expires_in');
    if (!!expires_in) {
      return Math.floor(+expires_in / 4);
    }
  }

  private refreshToken(token) {
    return () => {
      const curToken = localStorage.getItem('token');
      const refresh_token = localStorage.getItem('refresh_token');
      const corpId = localStorage.getItem('corpId');
      if (curToken && curToken === token) {
        axios
          .get(
            `${location.origin}/api/login/Authentication/get_refresh_token?refresh_token=${refresh_token}&corpId=${corpId}`,
          )
          .then((res: any) => {
            if (!res.errcode) {
              const token = (res as any).access_token;
              const refreshTokens = (res as any).refresh_token;
              const expireTime = (res as any).exp;

              if (token && refreshTokens && expireTime) {
                localStorage.setItem('refresh_token', refreshTokens);
                localStorage.setItem('expireTime', expireTime);
                localStorage.setItem('token', token);
              }
            }
          });
      }
      localStorage.removeItem('restTokenRefreshTime');

      clearInterval(this.restTokenTimer);
      this.initTimer(true);
    };
  }

  //初始化token刷新定时器
  //afterRefresh 是否为刷新后调用
  initTimer(afterRefresh: boolean = false) {
    //初始化定时器时，当前时间在token有效时间的最后四分之一区间内，直接刷新token
    if (!afterRefresh && this.compareDifferenceWithExpiresIn()) {
      this.refreshToken(localStorage.getItem('token'))();
    } else {
      const restTokenRefreshTime = localStorage.getItem('restTokenRefreshTime');
      if (!!restTokenRefreshTime) {
        this.restTokenRefreshTime = +restTokenRefreshTime;
      } else {
        this.restTokenRefreshTime = this.getExpiresIn();
      }
      //localStorage不存在expires_in（token有效时间）属性时，定时器不初始化
      if (!!localStorage.getItem('expires_in')) {
        this.tokenRefreshTimer = setTimeout(
          this.refreshToken(localStorage.getItem('token')),
          1000 * this.restTokenRefreshTime,
        );
        //当前页面停留五分钟或者五的整数倍分钟时，刷新当前页面的定时器剩余时间，当
        //页面不可见时，刷新token定时器会被销毁，当前页面的定时器剩余时间会被存入缓存中
        this.restTokenTimer = setInterval(() => {
          this.restTokenRefreshTime -= 300;
        }, 300 * 1000);
      }
    }
  }

  clearTimer() {
    const restTokenRefreshTime = localStorage.getItem('restTokenRefreshTime');
    if (
      !restTokenRefreshTime ||
      (this.restTokenRefreshTime &&
        this.restTokenRefreshTime < +restTokenRefreshTime)
    ) {
      localStorage.setItem(
        'restTokenRefreshTime',
        this.restTokenRefreshTime + '',
      );
    }
    clearTimeout(this.tokenRefreshTimer);
    clearInterval(this.restTokenTimer);
  }

  /**
   * 比较当前时间与token到期时间的差值
   * 是否小于四分之一token有效时间
   * 小于返回true
   * 大于等于返回undefined
   * (若缓存中不包含token有效时间和token过期时间，直接返回undefined)
   */
  compareDifferenceWithExpiresIn() {
    const expiration = localStorage.getItem('expireTime')
      ? localStorage.getItem('expireTime')
      : '';
    const nowDate = new Date().getTime();
    if (!!this.getExpiresIn() && !!expiration) {
      return (
        nowDate >
        parseInt(expiration as string) * 1000 - this.getExpiresIn() * 1000
      );
    }
  }
}
