# 云枢前端工程项目

## 说明

    基于 `yarn`构建，使用`lerna` 发布

    yarn命令参考:  https://yarnpkg.com/getting-started/usage
    lerna命令参考：http://www.febeacon.com/lerna-docs-zh-cn/routes/commands/publish.html

## 环境

- [x] `node`  >= v14
- [x] `yarn`  >  v1.1 => `npm install -g yarn`
- [x] `lerna` >  v3.0 => `npm install -g lerna`

### 安装依赖

    yarn install

## 启动

### 启动portal端

    yarn run dev:portal

### 启动admin端

    yarn run dev:admin

### 启动mobile端

    yarn run dev:mobile

## 开发

### 开发模式配置

   config/proxy.js       代理配置
   config/dev-token.js   开发token

### 提交代码

     1. git add .
     2. yarn run cz
     3. git push

### 包与依赖管理

#### 添加一个包（packages下）

    示例: lerna create gpnote packages

#### 添加一个全局依赖(所有包下都安装)

    lerna add <package>[@version] [--dev] [--exact]

    示例: lerna add babel-core --dev

## 打包

### 打包单个项目

    yarn run build:portal
    yarn run build:admin
    yarn run build:mobile

### 一键打包(打包三端 自动压缩输出portal.zip文件在外层)

    yarn run build:all （当前只支持linux）

## 文件结构

    ├── README.md
    ├── babel.config.js
    ├── bin
    │   ├── build.sh
    │   └── clean.js
    ├── config
    │   ├── commitlint-config-standard.js
    │   ├── common-config.js
    │   ├── cz-customizable-config-standard.js
    │   ├── js-standard.js
    │   ├── ts-standard.js
    │   └── vue-standard.js
    ├── lerna.json
    ├── package.json
    ├── packages
    │   ├── admin
    │   ├── cloudpivot
    │   ├── cloudpivot-designer
    │   ├── cloudpivot-forms
    │   ├── mobile
    │   └── portal
    ├── postcss.config.js
    ├── tsconfig.json
    └── yarn.lock

## 结构改造(6.10 => 6.11）

    替换: @cloudpivot => cloudpivot
         @h3-designer/designer-core => cloudpivot-designer/designer-core
         @h3/ui-designe => cloudpivot-designer/ui-designer

## 发布私服
    添加用户:
    npm adduser --https://nexus01.authine.cn/repository/npm-cloudpivot/
    登录用:
    npm login --registry=https://nexus01.authine.cn/repository/npm-cloudpivot/
    查看所有私有包:
    lerna list
    发布:
    lerna publish

## 更多

### 清理所有模块下依赖(不会删除根目录的依赖)

    lerna clean

### 快捷命令-删除所有模块下(包括根目录) node_modules

    yarn run clean

    注意⚠️：如果没有安装依赖 要先安装后再删除
         1. yarn install (安装所以目录下的依赖)
         2. yarn run clean（删除所有目录下的node_modules）

### 单元测试框架相关依赖
    "@vue/cli-plugin-unit-jest": "~4.5.13",
    "@types/jest": "^24.0.19",
    "@vue/test-utils": "^1.0.3"
