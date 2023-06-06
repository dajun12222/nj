var host = window.location.protocol + '//' + window.location.host;
var oauthHost = window.location.protocol + '//' + window.location.host;

window.config = {
  oauthHost: oauthHost + '/api',
  redirectHost: host,
  client_id: 'api',
  scope: 'read',
  secret: '',
  apiHost: host + '/api',
  portalHost: host,
  openApplicationPortal: false, // 是否开启应用门户
  refreshTokenEachHour: true,
  refreshTokenPeroid: 20,
};
