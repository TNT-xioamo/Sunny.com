---
title: VUE3源码学习
tags: [前端]
index_img: /article-img/v5.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-09-25
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
        },
        set: function(target, key, value, receiver) {
          console.log(`设置对象属性的${key}值`)
          return Reflect.set(target, key, value, receiver)
        },
        deleteProperty: function(target, key) {
          console.log(`删除对象属性${key}值`)
          return Reflect.deleteProperty(target, key)
        }
      })
    ```
  > 注意：
    - 🏁 this关键字表示的是代理的handler对象，<font color="#66b787" size=4 face="">所以不能使用this而是receiver进行传递</font>
  receiver 代表当前Proxy对象或者继承Proxy的对象，它保证传递正确的this给getter， setter
    - set 和 deleteProperty 也需要返回，(添加return)， 返回一个布尔值，设置/删除 成功返回true，反之返回false

  ## reactive 
  > 了解了上面的Proxy和Reflect，我们来看一下reactive的实现，reactive，返回proxy对象，这个reactive可以深层次递归，如果发现子元素存在引用类型，递归处理。
  ```js
    // 判断是否为对象，null 也是对象
    const isObject = val => val !== null && typeOf val === 'object'
    const hasOwn = (target, key) => Object => prototype.hasOwnProperty.call(target, key)
    export function reactive(target) {
      if (!isObject(target)) return target
      const handler = {
        get: function(target, key, receiver) {
          console.log(`获取对象属性${key}值`)
          const result = Reflect.get(target, key, receiver)

          if (!isObject(target)) return result
          // 如果发现对象为引用类型，进行递归处理
          return reactive(result)
        },
        set: function(target, key, value, receiver) {
          console.log(`设置对象属性${key}值`)
          // 先获取旧值
          const oldValue = Reflect.get(target, key, reactive)
          let result = true // set 是需要返回布尔值
          // 判断新值与旧值是否一致来决定是否更新setter
          if (oldValue !== value) result = Reflect.set(target, key, value, receiver)
          return result
        },
        deleteProperty: function(target, key) {
          console.log(`删除对象属性${key}值`)
          // 先判断是否存在key
          const hadKey = hasOwn(target, key)
          const result = Reflect.deleteProperty(target, key)
          if (hadKey && result) { // 更新操作}
          return result
        }
      }
    }
  ```
  ### 收集依赖，触发更新 
  > 收集依赖涉及到 track， effect， 响应式顺序： effect=> track => trigger
  在组件渲染的过程中，一个effect会触发get, 从而对值进行track，当值发生改变，就会进行trigge，执行effect来完成响应
  先实现effect
  #### effect
  ```js
    // activeEffect 表示当前正在走的 effect
    let activeEffect = null
    export function effect(callback) {
      activeEffect = callback
      callback()
      activeEffect = null
    }
  ```
  #### track

  ```js
    // targetMap 表里每个key都是一个普通对象 对应他们的 depsMap
    let targetMap = new WeakMap()
    export function track(target, key) {
      // 如果当前没有effect就不执行追踪
      if (!activeEffect) return
      // 获取当前对象的依赖图
      let depsMap = targetMap.get(target)
      if (!depsMap) targetMap.set(target, (targetMap = new Map()))
      // 根据key 从依赖图 里获取到effect 集合
      let dep depsMap.get(key)
      if(!dep) depsMap.set(key, (dep = new Set()))
      // 如果当前effect 不存在，才注册到 dep里
      if (!dep.has(activeEffect)) dep.add(activeEffect)
    }
  ```
  > 最后添加到hander 里 get 中
  ```js
    get(tagger, key, receiver) {
      // ...
      // 收集依赖
      track(target, key)
    }
  ```
  
  ## effect
  - effect(() => state.name) 过程
  -  初始化 fn = 包装createReactiveEffect(fn) => activeEffect
  - fn() => 触发get => track 收集依赖
  ```typescript
    /**
     * effect 包装 createReactiveEffect(fn) => activeEffect
     * fn 具体要执行的函数
     * options 配置项
     **/
    export function effect<T = any>(
      fn: () => T,
      options: ReactiveEffectOptions = EMPTY_OBJ
    ): ReactiveEffect<T> {
      // 如果fn已经是一个被effect包装过的函数，那就直接指向原始函数
      if (isEffect(fn)) {
        fn = fn.raw
      }
      /** 
      * 创建一个包装逻辑
      * 需要在数据获取的时候收集依赖，那就应该在执行之前，把处理逻辑赋值给reactiveEffect
      * 当effect内部函数执行是，内部获取数据的逻辑，就可以直接添加依赖
      **/
      const effect = createReactiveEffect(fn, option)
      // 判断是否需要lazy，如果不是lazy，直接执行一次
      if (!options.lazy) {
        effect()
      }
      return effect
    }
    // effect栈
    const effectStack: ReactiveEffect[] = [
      // 包装函数
      function createReactiveEffect<T = any>(
        fn: () => T,
        options: ReactiveEffectOptions
      ): ReactiveEffect<T> {
        const effect = function reactiveEffect(): unknown {
          // 在effect 没有激活并没有调度选项时直接执行fn
          if(!effect.active) {
            return option.scheduler ? undefined : fn()
          }
          
        }
      }
    ]
  ```



