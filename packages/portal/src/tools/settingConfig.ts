/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import themeColor from './themeColor.js';

import { colorsMap } from './colorsMap';
import type { COLORS } from './colorsMap';
interface params {
  color: string;
  outwardType: 'light' | 'dark';
  store: any;
}

// 更新主题方法
const updateTheme = (params: params) => {
  console.log(colorsMap);
  const item = colorsMap.find((el) => el.name === params.color) as COLORS;
  let primaryColor = item.primaryColor;
  if (params.color === 'black') {
    primaryColor = '#0076F6';
  }

  //  这里可以写上切换loading 或者 提示等等
  themeColor.changeColor(primaryColor).finally(() => {
    // 切换成功后回调方法 这里可以关闭loading 或者 提示等等
  });

  if (params.store) {
    params.store.commit('setOutwardType', params.outwardType);
    params.store.commit('setThemeColor', item.name);
  }

  changeCuscomThemes(item, params.outwardType);
};

export { updateTheme, colorsMap, COLORS };

// 修改自定义主题颜色：除antd控件外的主题色
const changeCuscomThemes = (item: COLORS, outwardType) => {
  const colors = {
    primaryColor: item.primaryColor,
    subColor: item[outwardType + '_subColor'],
    textColor: item[outwardType + '_textColor'],
    activeBGColor: item[outwardType + '_activeBGColor'],
    headBGColor: item[outwardType + '_headBGColor'],
    hoverColor: item.hoverColor,
    headMenuActiveColor: item.headMenuActiveColor,
    highlightColor: item.highlightColor,
    borderColor: item.borderColor,
    shadowColor: item.shadowColor,
    hoveBGColor: item[outwardType + '_hoveBGColor'],
    headerMenuHoverColor: item.headerMenuHoverColor,
  };
  Object.keys(colors).forEach((key) => {
    document.body.style.setProperty('--' + key, colors[key]);
  });
};
