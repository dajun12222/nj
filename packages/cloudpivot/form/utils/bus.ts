/*
 * @Author: Fan
 * @Date: 2020-04-16 21:25:37
 * @description:
 * @LastEditors: Fan
 */
// 这里输出一个空的 Vue 实例作为中央事件总线，用来帮助非父子组件之间的通信，减少vuex数量
import Vue from 'vue';

export default new Vue();
