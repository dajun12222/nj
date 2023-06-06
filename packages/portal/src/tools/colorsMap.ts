/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
import { customTheme } from './../../extends/custom-theme';

interface COLORS {
  name: string;
  primaryColor: string;
  dark_subColor: string;
  light_subColor: string;
  dark_textColor: string;
  light_textColor: string;
  dark_headBGColor: string;
  light_headBGColor: string;
  headMenuActiveColor: string;
  dark_activeBGColor: string;
  light_activeBGColor: string;
  hoverColor: string;
  highlightColor: string;
  borderColor: string;
  shadowColor: string;
  headerMenuHoverColor: string;
  dark_hoveBGColor: string;
  light_hoveBGColor: string;
}
export const colorsMap: COLORS[] = [
  {
    name: 'default',
    primaryColor: '#2970FF', // 主色

    dark_subColor: '#B3945E', // 深色辅助色（流程中心、模型列表侧边导航栏背景颜色）
    light_subColor: '#ffffff', // 浅色辅助色

    dark_textColor: '#ffffff', // 深色文字色
    light_textColor: '#2970FF', // 浅色文字色

    dark_headBGColor: '#2970FF', // 深色头部背景色
    light_headBGColor: '#ffffff', // 浅色头部背景色

    headMenuActiveColor: '#bf984a', // 深色头部菜单选中颜色

    dark_activeBGColor: '#f9f9f9', // 深色侧边菜单选中颜色
    light_activeBGColor: '#f1f2f6', // 浅色侧边菜单选中颜色

    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#f1f2f6', // 浅色鼠标经过背景颜色

    hoverColor: '#5291FF', // 侧边菜单鼠标悬停背景色
    highlightColor: '#2970ff', // 高亮文字颜色
    borderColor: '#5291ff', // 表单控件border颜色
    shadowColor: 'rgba(41, 112, 255, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  {
    name: 'golden',
    primaryColor: '#D1AD60', // 主色
    dark_subColor: '#B3945E', // 黑暗辅助色
    light_subColor: '#fff', // 明亮辅助色
    dark_textColor: '#ffffff', // 黑暗文字色
    light_textColor: '#D1AD60', // 明亮文字色
    dark_headBGColor: '#D1AD60', // 头部背景：黑暗
    light_headBGColor: '#ffffff', // 头部背景：明亮
    headMenuActiveColor: '#bf984a', // 头部菜单选中颜色
    dark_activeBGColor: '#f9f9f9', // 黑暗选中颜色
    light_activeBGColor: '#faf6ef', // 明亮选中颜色
    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#faf6ef', // 浅色鼠标经过背景颜色
    hoverColor: '#C2A97E', // 鼠标悬停
    highlightColor: '#D1AD60', // 高亮文字颜色
    borderColor: '#dec68a', // 表单控件border颜色
    shadowColor: 'rgba(209, 173, 96, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  {
    name: 'red',
    primaryColor: '#E05251', // 主色
    dark_subColor: '#BB4443', // 黑暗辅助色
    light_subColor: '#ffffff', // 明亮辅助色
    dark_textColor: '#ffffff', // 黑暗文字色
    light_textColor: '#E05251', // 明亮文字色
    dark_headBGColor: '#E05251', // 头部背景：黑暗
    light_headBGColor: '#ffffff', // 头部背景：明亮
    headMenuActiveColor: '#d13d3c', // 头部菜单选中颜色
    dark_activeBGColor: '#f9f9f9', // 黑暗选中颜色
    light_activeBGColor: '#fdf6f6', // 明亮选中颜色

    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#fdf6f6', // 浅色鼠标经过背景颜色

    hoverColor: '#C86968', // 鼠标悬停
    highlightColor: '#E05251', // 高亮文字颜色
    borderColor: '#ed7f7b', // 表单控件border颜色
    shadowColor: 'rgba(224, 82, 81, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  {
    name: 'green',
    primaryColor: '#18BFA4', // 主色
    dark_subColor: '#0D8F7F', // 黑暗辅助色
    light_subColor: '#fff', // 明亮辅助色
    dark_textColor: '#ffffff', // 黑暗文字色
    light_textColor: '#18BFA4', // 明亮文字色
    dark_headBGColor: '#18BFA4', // 头部背景：黑暗
    light_headBGColor: '#ffffff', // 头部背景：明亮
    headMenuActiveColor: '#3cd0ad', // 头部菜单选中颜色
    dark_activeBGColor: '#f9f9f9', // 黑暗选中颜色
    light_activeBGColor: '#f3fcfa', // 明亮选中颜色

    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#f3fcfa', // 浅色鼠标经过背景颜色

    highlightColor: '#18BFA4', // 高亮文字颜色
    hoverColor: '#3DA598', // 鼠标悬停
    borderColor: '#3bccaf', // 表单控件border颜色
    shadowColor: 'rgba(24, 191, 164, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  {
    name: 'blue',
    primaryColor: '#0076F6', // 主色
    dark_subColor: '#255492', // 黑暗辅助色
    light_subColor: '#fff', // 明亮辅助色
    dark_textColor: '#ffffff', // 黑暗文字色
    light_textColor: '#0076F6', // 明亮文字色
    dark_headBGColor: '#0076F6', // 头部背景：黑暗
    light_headBGColor: '#ffffff', // 头部背景：明亮
    headMenuActiveColor: '#238bfe', // 头部菜单选中颜色
    dark_activeBGColor: '#f9f9f9', // 黑暗选中颜色
    light_activeBGColor: '#f2f8fe', // 明亮选中颜色

    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#f2f8fe', // 浅色鼠标经过背景颜色

    hoverColor: '#5076A7', // 鼠标悬停
    highlightColor: '#0076F6', // 高亮文字颜色
    borderColor: '#2997ff', // 表单控件border颜色
    shadowColor: 'rgba(0, 118, 246, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  {
    name: 'purple',
    primaryColor: '#6F76FA', // 主色
    dark_subColor: '#44467C', // 黑暗辅助色
    light_subColor: '#fff', // 明亮辅助色
    dark_textColor: '#ffffff', // 黑暗文字色
    light_textColor: '#6F76FA', // 明亮文字色
    dark_headBGColor: '#6F76FA', // 头部背景：黑暗
    light_headBGColor: '#ffffff', // 头部背景：明亮
    headMenuActiveColor: '#575df9', // 头部菜单选中颜色

    dark_activeBGColor: '#f9f9f9', // 黑暗选中颜色
    light_activeBGColor: '#f8f8ff', // 明亮选中颜色

    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#f8f8ff', // 浅色鼠标经过背景颜色

    hoverColor: '#696B96', // 鼠标悬停
    highlightColor: '#6F76FA', // 高亮文字颜色
    borderColor: '#99a1ff', // 表单控件border颜色
    shadowColor: 'rgba(111, 118, 250, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  {
    name: 'black',
    primaryColor: '#2F323B', // 主色
    dark_subColor: '#1F2024', // 黑暗辅助色
    light_subColor: '#fff', // 明亮辅助色
    dark_textColor: '#0076F6', // 黑暗文字色
    light_textColor: '#2F323B', // 明亮文字色
    dark_headBGColor: '#2F323B', // 头部背景：黑暗
    light_headBGColor: '#fff', // 头部背景：明亮
    headMenuActiveColor: '#1F2024', // 头部菜单选中颜色

    dark_activeBGColor: '#f9f9f9', // 黑暗选中颜色
    light_activeBGColor: '#f6f6f6', // 明亮选中颜色

    dark_hoveBGColor: '#f9f9f9', // 深色鼠标经过背景颜色
    light_hoveBGColor: '#f4f5f5', // 浅色鼠标经过背景颜色

    hoverColor: '#2F323B', // 鼠标悬停
    highlightColor: '#0076F6', // 高亮文字颜色

    borderColor: '#2997ff', // 表单控件border颜色
    shadowColor: 'rgba(0, 118, 246, 0.2)', // 表单控件投影颜色

    headerMenuHoverColor: '#0076F6', //头部文字hover颜色
  },
  ...customTheme,
];
export type { COLORS };
