var host = window.location.protocol + '//' + window.location.hostname;

window.config = {
  oauthHost: host + ':8888',
  redirectHost: host + '/mobile',
  client_id: 'api',
  scope: 'read',
  secret: '',
  apiHost: host + ':8080',
  isMobile: true,
};
