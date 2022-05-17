---
title: Vue配置打包
tags: [vue，前端]
index_img: /article-img/Fall.jpg
categories: webpack
date: 2022-05-02
mermaid: true
---

0.env.developmentEn本地加密

# just a flag
ENV = 'development'
NODE_ENV = development
VUE_APP_ENCRYPTION = '1'
<!-- more -->
# base api
VUE_APP_BASE_API = 'api'

1 .env.production文件

NODE_ENV='production'
# just a flag
ENV = 'production'
VUE_APP_ENV = 'production'
VUE_APP_ENCRYPTION = '0'

# base api
VUE_APP_BASE_API = '/' //生产的地址 比如'http://www.jscnsc.com.cn'    /是配置的相对路径 后台使用的jinks打包工具自动识别打包到那个镜像

2 .env.staging文件 测试环境  文件名  .evn 文件类型是staging

NODE_ENV = production

# just a flag
ENV = 'staging'
VUE_APP_ENV = 'staging'
VUE_APP_ENCRYPTION = '0'    //0不加密 必须用字符串

# base api
VUE_APP_BASE_API = '/'    //生产的地址 比如'http://www.jscnsc.com.cn'    /是配置的相对路径 后台使用的jinks打包工具自动识别打包到那个镜像

3加密配置.env.productionEn

NODE_ENV='production'
# just a flag
ENV = 'production'
VUE_APP_ENV = 'production'
VUE_APP_ENCRYPTION = '1'   //1加密

# base api
VUE_APP_BASE_API = '/'
VUE_CLI_BABEL_TRANSPILE_MODULES = true

 

4package.json

"serve-en": "vue-cli-service serve --mode developmentEn",
"build:prod": "vue-cli-service build",  //不加密生产环境
"build:prod-en": "vue-cli-service build --mode productionEn",   //加密环境
"build:stage": "vue-cli-service build --mode staging", /不加密测试环境
5命令
本地启动 npm run serve-en
测试环境 npm run build:stage
生产环境 npm run build:prod