---
title: VUE3源码学习
tags: [前端]
index_img: /article-img/v5.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-03-24
mermaid: true
---
「时光不负，创作不停」
  <!--more-->
#  Vue 对象的入口
  （不得不佩服这个学室内艺术和艺术史的尤大大是真的强的离谱）
  源码地址：https://github.com/vuejs/core/blob/main/packages/vue/src/index.ts
  Vue 对象的入口来开始我们的源码阅读 <font color="#66b787" size=4 face=""> packages/vue/index.ts </font> 只有一个函数 <font color="#66b787" size=4 face=""> compileToFunction </font>
  - 先来看看这个函数完成了哪些事情
  <!-- (runtime registerRuntimeCompiler(compileToFunction))  B{依赖注入编译函数} -->C()-->
  ```
    1. 依赖注入编译函数 --> runtime registerRuntimeCompiler(compileToFunction)
    2. runtime 调用编译函数 (compileToFunction) --> 调用compile函数  export { compileToFunction as compile }
    3. 返回包含 code 的编译结果
    4. 将code 作为参数换入Function的构造函数 -> 生成函数赋值给render变量
    5. 将render 函数作为编译结果返回
  ``` 
   上面便是整个index.ts 的整个流程