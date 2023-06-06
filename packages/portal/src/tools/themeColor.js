// themeColor.js
import client from 'webpack-theme-color-replacer/client';
import { generate } from '@ant-design/colors';

export default {
  getAntdSerials(color) {
    // 淡化（即less的tint）
    const lightens = new Array(9).fill().map((t, i) => {
      return client.varyColor.lighten(color, i / 10);
    });
    const colorPalettes = generate(color);
    const rgb = client.varyColor.toNum3(color.replace('#', '')).join(',');
    return lightens.concat(colorPalettes).concat(rgb);
  },
  // 运行时更改主题颜色
  changeColor(newColor) {
    const options = {
      newColors: this.getAntdSerials(newColor), // 新颜色数组，与" matchColors"一一对应
      changeUrl(cssUrl) {
        return `/${cssUrl}`; // while router is not `hash` mode, it needs absolute path
      },
      // appendToEl: 'head', //optional. The element selector for appending child with `<style>`, default is 'body'. Using `appendToEl: 'body'` can make the css priority higher than any css in <head>
    };
    return client.changer.changeColor(options, Promise);
  },
};
