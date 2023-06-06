export default {
  //获取图片下载的URL
  getImageUrl(refId: string, type: string = 'person') {
    if (!refId) {
      return '';
    }
    //头像默认为person，是应用图标该参数application
    // if(type === undefined){
    //   type = 'person'
    // }
    if (['https', 'http'].some((el) => refId.indexOf(el) > -1)) {
      return refId;
    }

    const url = `${apiHost()}/public/image/${type}/${refId}`;
    return url;
  },

  getRefId(refId: string) {
    let RefId = refId;
    RefId = RefId.replace(/\%/g, '%25');
    RefId = RefId.replace(/\+/g, '%2B');
    RefId = RefId.replace(/\#/g, '%23');
    RefId = RefId.replace(/\^/g, '%5E');
    RefId = RefId.replace(/\&/g, '%26');
    RefId = RefId.replace(/\{/g, '%7B');
    RefId = RefId.replace(/\}/g, '%7D');
    RefId = RefId.replace(/\[/g, '%5B');
    RefId = RefId.replace(/\]/g, '%5D');
    RefId = RefId.replace(/\;/g, '%3B');
    RefId = RefId.replace(/\`/g, '%60');
    RefId = RefId.replace(/\~/g, '%7E');
    return RefId;
  },
};

function apiHost() {
  return (window as any).config.apiHost;
}
