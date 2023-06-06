// theme-color-replacer.plugin.config.js
// ant desgin vue 配置
// 引入webpack-theme-color-replacer
const ThemeColorReplacer = require('webpack-theme-color-replacer')
// 引入@ant-design 的 根据传入颜色 变换得到颜色值 方法
const { generate } = require('@ant-design/colors')
// 引入默认主题配置 这里是antdv 的可以去官网查看
// const ThemeObj = require('./theme')

const getAntdSerials = (color) => {
  // 淡化（即less的tint）
  const lightens = new Array(9).fill().map((t, i) => {
    return ThemeColorReplacer.varyColor.lighten(color, i / 10)
  })
  const colorPalettes = generate(color)
  const rgb = ThemeColorReplacer.varyColor.toNum3(color.replace('#', '')).join(',')
  return lightens.concat(colorPalettes).concat(rgb)
}

const themePluginOption = {
  fileName: 'css/theme-colors-[contenthash:8].css', // 输出css文件名 支持[contenthash] 与 [hash]
  matchColors: getAntdSerials("#1890ff"), // 主色系列 这里需要配置默认主题色，切换的时候是根据这里配置颜色值 去获取颜色来替换的
  // 改变样式选择器，解决样式覆盖问题
  changeSelector (selector) {
    switch (selector) {
      case '.ant-calendar-today .ant-calendar-date':
        return ':not(.ant-calendar-selected-date):not(.ant-calendar-selected-day)' + selector
      case '.ant-btn:focus,.ant-btn:hover':
        return '.ant-btn:focus:not(.ant-btn-primary):not(.ant-btn-danger),.ant-btn:hover:not(.ant-btn-primary):not(.ant-btn-danger)'
      case '.ant-btn.active,.ant-btn:active':
        return '.ant-btn.active:not(.ant-btn-primary):not(.ant-btn-danger),.ant-btn:active:not(.ant-btn-primary):not(.ant-btn-danger)'
      case '.ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon':
      case '.ant-steps-item-process .ant-steps-item-icon>.ant-steps-icon':
        return ':not(.ant-steps-item-process)' + selector
      case '.ant-menu-horizontal>.ant-menu-item-active,.ant-menu-horizontal>.ant-menu-item-open,.ant-menu-horizontal>.ant-menu-item-selected,.ant-menu-horizontal>.ant-menu-item:hover,.ant-menu-horizontal>.ant-menu-submenu-active,.ant-menu-horizontal>.ant-menu-submenu-open,.ant-menu-horizontal>.ant-menu-submenu-selected,.ant-menu-horizontal>.ant-menu-submenu:hover':
      case '.ant-menu-horizontal > .ant-menu-item-active,.ant-menu-horizontal > .ant-menu-item-open,.ant-menu-horizontal > .ant-menu-item-selected,.ant-menu-horizontal > .ant-menu-item:hover,.ant-menu-horizontal > .ant-menu-submenu-active,.ant-menu-horizontal > .ant-menu-submenu-open,.ant-menu-horizontal > .ant-menu-submenu-selected,.ant-menu-horizontal > .ant-menu-submenu:hover':
        return '.ant-menu-horizontal > .ant-menu-item-active,.ant-menu-horizontal > .ant-menu-item-open,.ant-menu-horizontal > .ant-menu-item-selected,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover,.ant-menu-horizontal > .ant-menu-submenu-active,.ant-menu-horizontal > .ant-menu-submenu-open,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover'
      case '.ant-menu-horizontal > .ant-menu-item-selected > a':
      case '.ant-menu-horizontal>.ant-menu-item-selected>a':
        return '.ant-menu-horizontal:not(ant-menu-light):not(.ant-menu-dark) > .ant-menu-item-selected > a'
      case '.ant-menu-horizontal > .ant-menu-item > a:hover':
      case '.ant-menu-horizontal>.ant-menu-item>a:hover':
        return '.ant-menu-horizontal:not(ant-menu-light):not(.ant-menu-dark) > .ant-menu-item > a:hover'
      default:
        return selector
    }
  }
}

const createThemeColorReplacerPlugin = () => new ThemeColorReplacer(themePluginOption)

module.exports = createThemeColorReplacerPlugin

