---
title: VUE3源码学习
tags: [前端]
index_img: /article-img/v5.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-09-08
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
   ## ES6的代理模式 | Proxy
   > proxy修改的是程序默认形为，就形同于在编程语言层面上做修改，属于元编程(meta programming)
   元编程优点：与手工编写全部代码相比，程序员可以获得更高的工作效率，或者给与程序更大的灵活度去处理新的情形而无需重新编译(不做多解释)
   ### 语法
    - target 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理
    - handler 一个通常以函数作为属性的对象，用来定制拦截行为
    举个栗子
    ```js
      const origin = {}
      const obj = new Proxy(origin, {
        get: function(target, proxyKey, receiver) {
          return 10
        }
      })
    ```