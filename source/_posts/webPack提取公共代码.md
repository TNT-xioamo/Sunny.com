---
title: WebPack 提取公共代码
tags: [WebPack, 前端工程化]
index_img: /article-img/feather.jpg
categories: 前端
date: 2021-08-27
---

## webpack提取公共代码以及js,css的分离操作

#### 一，概述
    多页面应用中会有很多重复使用代码，如: 头部，尾部，侧边栏，各种css以及js方法
#### 二，分离业务模块代码与公共代码
    1. 将所有页面分别放入pages 文件夹
    2. 将 css, js, font, icon, image 抽离放入static 文件夹
    3. 修改webpack.config.js 文件
    
 ```js

  ---将自动化方法中检索目录由src 修改为 src/pages
  function getMpa() {
    const entry = {},
        htmlwebpackplugins = [];
    const entryfiles = glob.sync(path.resolve(__dirname, "./src/page/*/index.js"));
    entryfiles.forEach(function (item) {
        const folder = item.match(/\/src\/page\/(\w+)\/index\.js$/)[1];

        entry[folder] = `./page/${folder}/index.js`;

        htmlwebpackplugins.push(new HtmlWebpackPlugin({
            title: `${folder}页面`,
            filename: `./${folder}/index.html`,
            template: `./page/${folder}/index.html`,
            chunks: [folder], //以数组的形式指定由html-webpack-plugin负责加载的chunk文件（打包后生成的js文件），不指定的话就会加载所有的chunk。
            inject: "body",//指示把加载js文件用的<script>插入到哪里，默认是插到<body>的末端，如果设置为'head'，则把<script>插入到<head>里。
            minify: true,//生成压缩后的HTML代码。
        }));
    });
    return { entry, htmlwebpackplugins };
  }

 ```

 #### 创建公共js,css

 ```js
    // util.js
    const Util = {
      getNow: function () {
          console.log("util.js输出公共方法");
      }
    };

    module.exports = Util;

    // launch.js
    const run = {
        init: function () {
            console.log("launch.js:启动自动运行");
        }
    };
    run.init();
 ```

#### 修改webpack.config.js
  1. 比较重点修改
  - 新增resolve配置项，配置公共文件别名
  ```js
    resolve: {
       alias: {
          '@': path.resolve(__dirname, ''),//将@定位到项目根目录,require、import引入外部文件时注意
          'vue$': 'vue/dist/vue',
          'src': path.resolve(__dirname, '../src'),
          'common': path.resolve(__dirname, '../src/common'),
          'components': path.resolve(__dirname, '../src/components')
          'utilJs': path.resolve(__dirname, 'src/static/js/util.js'),
       }
    },
  ```
  - 新增ProvidePlugin插件，自动化引入部分插件
  ```js
    plugins: [
      new webpack.ProvidePlugin({ //代码中如果引用，则自动导入对应文件；未引入则不导入
          'process.env': config.dev.env,
          'util': 'utilJs'		//调用方法：util.funcname(param)
      })
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ],
  ```
  - 修改getEntry 添加入口的公共方法
    ```js
    function getEntry(globPath) {
      const entry = {},
      htmlwebpackplugins = [];
      const entryfiles = glob.sync(path.resolve(__dirname, "./src/page/*/index.js"));
      entryfiles.forEach(function (item) {
          const folder = item.match(/\/src\/page\/(\w+)\/index\.js$/)[1];

          entry[folder] = (param && param.mustIncludeFile) ? param.mustIncludeFile.slice() : [];
          entry[folder].push(`./page/${folder}/index.js`);

          htmlwebpackplugins.push(new HtmlWebpackPlugin({
              title: `${folder}页面`,
              filename: `./${folder}/index.html`,
              template: `./page/${folder}/index.html`,
              chunks: [folder],//以数组的形式指定由html-webpack-plugin负责加载的chunk文件（打包后生成的js文件），不指 定的话就会加载所有的chunk。
              inject: "body",//指示把加载js文件用的<script>插入到哪里，默认是插到<body>的末端，如果设置为'head'，则把 <script>插入到<head>里。
              minify: true,//生成压缩后的HTML代码。
          }));
      });
      return { entry, htmlwebpackplugins };
    }

  //@表示src目录
  const { entry, htmlwebpackplugins } = getMpa({
      mustIncludeFile: ["/static/js/launch.js", "/static/css/common.css"]
  });
  ```