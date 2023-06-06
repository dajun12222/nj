// 搜索高亮文本显示
export const searchHighLight = (searchWord: string, text: string) => {
  // 处理xss漏洞
  let handledText: string = '';
  if (!text) {
    return handledText;
  }

  handledText = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (searchWord && handledText) {
    let html: string = '';
    const arr: any = handledText.split(
      new RegExp(`(${searchWord})|(?=${searchWord})`, 'i'),
    );
    arr.forEach((fragment: string) => {
      if (fragment.toLowerCase() === searchWord.toLowerCase()) {
        html += `<span style='color:#2970FF !important;'>${fragment}</span>`;
      } else {
        html += `${fragment}`;
      }
    });
    return html;
  }
  return handledText;
};

/**
 * 时间戳转年月日时分秒
 * formateType: 'YY-MM-DD'
 * formateType: 'YY-MM-DD HH:mm:ss'
 * */
export const timeStampToDate = (formateType: string, timeStamp: string) => {
  if (!formateType) {
    return;
  }
  const D = new Date(timeStamp);
  const year = D.getFullYear();
  const month = zeroFormater(D.getMonth() + 1);
  const date = zeroFormater(D.getDate());
  const hour = zeroFormater(D.getHours());
  const minute = zeroFormater(D.getMinutes());
  const second = zeroFormater(D.getSeconds());

  if (formateType === 'YY-MM-DD') {
    return `${year}-${month}-${date}`;
  } else if (formateType === 'YY-MM-DD HH:mm:ss') {
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
  } else {
    //Else Empty block statement
  }
};

// 补0
export const zeroFormater = (p: number | string) => {
  let str: string = '';
  if (typeof p === 'number') {
    str = p.toString();
  } else if (typeof p === 'string') {
    str = p;
  } else {
    console.log('error');
  }
  return str.length > 1 ? str : `0${str}`;
};

export const downloadFileByPost = (
  url: string,
  data: any,
  enctype?: string,
) => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'down-file-iframe');
  const form = document.createElement('form');
  form.setAttribute('target', 'down-file-iframe');
  form.setAttribute('method', 'post');
  form.setAttribute('action', url);

  Object.keys(data).forEach((key) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    if (Array.isArray(data[key])) {
      input.value = data[key].join(',');
    } else {
      input.value = data[key];
    }
    form.appendChild(input);
  });
  iframe.appendChild(form);
  document.body.appendChild(iframe);
  form.submit();
  // ((iframe.parentNode) as any).removeChild(iframe);
};

/**
 * 国际化兼容
 * @param data 需要处理的数据，例如表格的行数据
 * @param zhKey 中文的字段名
 * @param i18nKey 国际化字段名 非必填
 */
const langList: Array<string> = ['en'];
const parseI18n: any = function (I18nString: any) {
  if (I18nString && typeof I18nString === 'object') {
    return I18nString;
  } else if (/^\{.+?\}$/.test(I18nString)) {
    return parseI18n(JSON.parse(I18nString));
  } else {
    return {};
  }
};
export const compatible = (data: any, zhKey: string, i18nKey?: string): any => {
  const _i18nKey = !i18nKey ? 'name_i18n' : i18nKey;
  const _i18nNames = data[_i18nKey];
  if (!_i18nNames) {
    data[_i18nKey] = {};
    langList.forEach((locale: string) => {
      data[_i18nKey][locale] = data[zhKey];
    });
  } else {
    if (typeof _i18nNames === 'string') {
      data[_i18nKey] = parseI18n(_i18nNames);
    }
    langList.forEach((locale: string) => {
      if (!data[_i18nKey][locale]) {
        data[_i18nKey][locale] = data[zhKey];
      }
    });
  }
  return data;
};
