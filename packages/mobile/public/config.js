var host = window.location.protocol + '//' + window.location.host;
var oauthHost = window.location.protocol + '//' + window.location.host;

window.config = {
  oauthHost: oauthHost + '/api',
  redirectHost: host + '/mobile',
  client_id: 'api',
  scope: 'read',
  secret: '',
  apiHost: host + '/api',
  portalHost: host,
  isMobile: true,
};
