---
title: Vue知识点
tags: [前端, Vue.js]
index_img: /article-img/canvas.jpg
categories: 前端
date: 2020-08-26
---

##  Vue.js 知识整理
  [vue-2.x 文档](https://cn.vuejs.org/v2/guide/)
    <!--more-->
### 1. Vue 组件通讯方式
  1. props和$emit 父组件向子组件传递数据是通过props传递，子组件向父组件传递数据是通过$emit触发事件进行传递

  2. $parent, $children获取当前组件的父组件和子组件，需要注意的是$parent 是获取当前组件树的根vue实例，如果没有父实例，那便是自身实例。
     $children 是获取当前实例的直接子组件，但并不保证顺序

  3. $attrs,$listeners 主要应用是多层嵌套传递 A->B->C。
    3.1 $attrs的使用
      官方定义: 包含了父作用域中不作为 prop 被识别 (且获取) 的 attribute 绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="$attrs" 传入内部组件——在创建高级别的组件时非常有用。（好抽象一脸懵逼。。。）
      $attrs 只代表了没有被声明为props的属性，如果某个prop在子组件种声明了，那么在子组件中的$attrs会把声明的prop剔除
      个人理解：一个组件被父组件引用，$attrs就是组件标签上的静态属性值和动态属性值的对象集合（不包括class,style和事件属性）
    3.2 $listeners的使用
      官方定义：包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。它可以通过 v-on="$listeners" 传入内部组件——在创建更高层次的组件时非常有用。

      - $listeners是组件的内置属性，它的值是父组件（不含.native修饰器） v-on事件监听器
      - 组件可以通过在自己的子组件绑定v-on="$listeners", 进一步把值传给自己的子组件，如果子组件中有绑定$listeners同名的监听器，则两个监听器会以冒泡的形式先后执行
  4. provide 父组件通过provide来提供变量，在子组件中通过inject来注入变量

  5. $refs 获取组件实例

  6. eventBus 兄弟组件数据传递，这种情况可是使用事件总线的方式

  7. vuex 状态管理

### 2. Vue内置指令

  - v-once  定义组件或者元素只渲染一次，包括内部所有子节点首次渲染后不再随数据变化重新渲染，将被视为静态内容
  - v-cloak 这个指令保持到元素上直到关联实例结束编译，解决初始化慢和页面闪动s
  - v-pre   跳过这个元素以及子元素的编译，以达到快速编译整个项目的速度
  - v-bind  绑定属性，动态更新HTML
  - v-on    监听dom事件，例如 v-on:click,
  - v-html  赋值变量html,注意放置xss攻击
  - v-text  更新元素的textContent
  - v-model 处理value和input的语法糖
  - v-if/v-else 可以配合template,在render函数里就是三元表达式
  - v-show 最终是通过display进行显示与隐藏
  - v-for 循环指令，优先级比v-if高

### 3. computed 和 watch 的区别与运用

    3.1 computed 是计算属性，并且计算值具有缓存，只有计算值发生变化才会返回新值，可以设置getter和setter
    3.2 watch 监听到新值与旧值便会执行回调

### 4. vue2.x 响应式数据的原理
    整体实现思路为数据劫持+订阅者模式
    对象内部通过defineReactive方法，通过object.defineProperty将属性进行劫持(只会劫持已经存在的属性),数组则是通过重写数组的方法来实现，当页面使用对应属性时，每个属性都有自己的dep属性
    ，存放他所依赖的watcher(依赖收集)，当属性发生改变，会去通知他所对应的watcher去更新(派发更新)。

### 5. vue中检测数组变化
    由于考虑性能，数组没有使用defineProPerty对数组的每一项进行拦截，而是选择对数据的方法(7种方法：push,shift, pop, splice,unshift,sort,reverse)进行重写(AOP切片思想),所以在vue中修改数组的索引和长度是无法被监控，需要通过以上变异方法修改数组才会触发数组对应的watcher更新。
### 6. Vue3.x 相关了解

  -  响应式原理的改变，Vue3.x使用proxy替代Vue2.x的Object.defineProperty
  -  组件选项声明方式 Vue3.x 使用Componsition API， setup是vue3.x新增的选项，是组件内使用Componsition API的入口
  -  模板语法变化，slot具名插槽语法，自定义指令v-model升级
  -  其他方面更改：Suspense支持fragment(多个根节点)和Protal(在dom其他部分渲染组建内容)组件

### 7. Vue父子组件生命周期执行顺序
  - 加载渲染过程：
    父 beforeCreate -> 父 created -> 父 beforeMount -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted -> 父 mounted

  - 子组件更新过程
    父 beforeUpdate -> 子 beforeUpdate -> 子updated -> 父 updated

  - 父组件更新
    父 beforeUpdate -> 父 updated
  - 销毁过程
    父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed

### 8. Vue mixin 使用场景以及原理
    日常开发会需要一些相同的代码逻辑，可以使用Vue的mixin 抽离公共的业务逻辑，原理类似“对象的继承”，当组件初始化时会调用mergeOptions方法进行合并，
    采用策略模式针对不同属性进行合并，当组件和混入对象含有同名选项时，这些选项将以恰当的方式进行合并

### 9. nextTick 使用场景以及原理
    nextTick 中的回调是在下次DOM更新循环结束之后执行的延迟回调，在修改数据之后立即使用这个方法，获取更新后的DOM，
    思路就是采用微任务优先的方法调用异步方法去执行nextTick包装的方法

### 10. keep-alive 使用场景以及原理
    keep-alive 是Vue内置组件，实现组件缓存，当组件切换不会对当前组件进行卸载
    - 常用的两个属性 include/exclude,允许组件有条件的进行缓存
    - 两个生命周期，activeted/deactiveted,用来得知当前组件是否为活跃状态

### 11. 自定义指令

    指令本质是装饰器，是vue对html元素的扩展，给html增加自定义功能，vue编译DOM时会找到指令对象，执行指令相关方法
    自定义指令有五个生命周期:

    1. bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。

    2. inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
    
    3. update：被绑定于元素所在的模板更新时调用，而无论绑定值是否变化。通过比较更新前后的绑定值，可以忽略不必要的模板更新。
    
    4. componentUpdated：被绑定元素所在模板完成一次更新周期时调用。
    
    5. unbind：只调用一次，指令与元素解绑时调用。 

  原理：

    1. 在生成ast语法树时，遇到指令会给当前元素添加 directives 属性 

    2. 通过genDirectives 生成指令代码

    3. 在patch前将指令钩子提取到cbs中，在patch过程中调用对应钩子

    4. 当执行指令对应钩子函数时，调用对应指令指定的方法
