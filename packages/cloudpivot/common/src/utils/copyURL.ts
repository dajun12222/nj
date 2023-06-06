function funcUrlDel(names) {
  if (typeof names === 'string') {
    names = [names];
  }

  let href: string = window.location.href as string;

  const index: string[] = href.split('?');
  let hashes: string[], hash;
  const urlObj: any = {}; //存储所有参数的对象
  if (index.length > 1) {
    hashes = index[1].split('&');
    for (let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      urlObj[hash[0]] = decodeURIComponent(hash[1]);
    }
  }

  for (let i = 0; i < names.length; i++) {
    let reg = '';
    if (urlObj[names[i]]) {
      reg = `${names[i]}=${urlObj[names[i]]}`;
    }
    if (reg) {
      href = href.replace(reg || '', '');
    }
  }
  return href;
}

//  query之前传送过来就有参数为undefined,此处只过滤下不等于query的数据。,
//  此方法只删除url上token，重新进行渲染页面
export default function copyURL(query: any, status: string) {
  const oldToken = localStorage.getItem('token');
  const urls = window.location.pathname;
  if (query.T) {
    localStorage.setItem('token', query.T);
    const url = funcUrlDel(['T', 'admin_token']);
    history.pushState({}, '', url); //修改url查询参数不重新加载页面
  } else if (!query.T && !oldToken && status === 'portal') {
    if (
      !(urls.indexOf('login') > -1) &&
      !window.location.hash.endsWith('/oauth')
    ) {
      const url = funcUrlDel('');
      localStorage.setItem('copy_link_url_path', url);
    }
  } else {
    //Else Empty block statement
  }
}
