/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
const enableProxy = process.env.NODE_ENV === 'debug';

let env = (window as any).config;

if (enableProxy) {
  env = Object.assign({}, env, {
    enableProxy,
    isMobile: true,
    client_id: process.env.VUE_APP_OAUTH_CLINET_ID,
    secret: process.env.VUE_APP_OAUTH_SECRET,
    redirectHost: process.env.VUE_APP_PORTAL_HOST,
    oauthHost: process.env.VUE_APP_OAUTH_HOST,
    apiHost: process.env.VUE_APP_API,
    scope: process.env.VUE_APP_OAUTH_SCOPE,
    nodeEnv: process.env.NODE_ENV,
    portalHost: process.env.VUE_APP_PORTAL_HOST,
  });
  (window as any).config = env;
}

export default env;