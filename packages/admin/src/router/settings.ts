/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
export default {
  path: ':appCode/settings',
  name: 'appSettings',
  redirect: { name: 'baseSetting' },
  props: true,
  component: () => import('../views/app/settings/index.vue'),
  children: [
    {
      path: 'base',
      name: 'baseSetting',
      props: true,
      meta: { title: '云枢-应用设置-基础设置' },
      component: () => import('../views/app/settings/base-setting.vue'),
    },
    {
      path: 'permission',
      name: 'permissionSetting',
      meta: { title: '云枢-应用设置-权限设置' },
      component: () => import('../views/app/settings/permission-setting.vue'),
    },
    {
      path: 'deploy',
      name: 'packageSetting',
      meta: { title: '云枢-应用设置-应用部署' },
      component: () => import('../views/app/settings/package-setting.vue'),
    },
  ],
};
