let host = `${window.location.protocol}//${window.location.host}`;
let oauthHost = `${window.location.protocol}//${window.location.host}`;

window.config = {
  oauthHost: `${oauthHost}/api`,
  redirectHost: `${host}/admin`,
  client_id: 'api',
  scope: 'read',
  secret: '',
  apiHost: `${host}/api`,
  portalHost: host,
  marketPortalHost: `${host}:8085/#/market/dashboard`,
  marketPortalSwitch: true,
  refreshTokenEachHour: true,
  refreshTokenPeroid: 20,
};
