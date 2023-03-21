---
title: VUE3之Computed
tags: [前端]
index_img: /article-img/v5.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2023-03-19
mermaid: true
---
「时光不负，创作不停」
  <!--more-->

  # 主题： 本文将深入探讨Vue3.2.47 中 computed 的实现
  ### 一. computed 介绍  
  - <font color="#66b787" size=3 face=""> 1. computed 基本使用</font>
    > computed ： 是Vue中的一个计算属性。它的本质是一个函数，可以根据依赖数据计算并返回一个新值，只有当它依赖的数据发生了变化，它才会重新计算。因为在template中对数据进行复杂计算一般使用它代替。
  <font color="#66b787" size=3 face="">官方介绍：</font> 传入一个 getter 函数，返回一个默认不可手动修改的 ref 对象。

  ```js
    const count = ref(1)
    const numb = computed(() => count.value *2) // count.value改变它才会重新计算
    console.log(numb.value) // 2
    count.value = 2
    console.log(numb.value) // 4
    numb.value ++ // 控制台会警告 Write operation failed: computed value is readonly
  ```
  > 或者传入一个拥有 get 和 set 函数的对象，创建一个可手动修改的计算状态。
  ```typeScript
    const count = ref(2)
    const num = computed({
      set(val: number) { 
        count.value = val
      },
      get() {
        return count.value++
      }
    })
    console.log(num.value)
    num.value = 33
    console.log(num.value) // 33
    console.log(count.value) // 34
  ```

  <font color="#66b787" size=3 face=""> 2. computed 使用场景</font>

  - 对列表数据进行过滤、排序、计算，返回新的数组
  - 同时依赖价格、数量，多个商品，返回总价
  - 配合 v-model 使用的比较多
  - 子组件 依赖父组件状态，并需要emit 通知父组件改值时

  ```ts
    const emit = defineEmits(['changeShow'])
    const props = defineProps({
      show: {
        type: Boolean,
        default: false
      }
    })
    const isShow = computed({
      set(val){
        emit('changeShow', val)
      },
      get() {
        return props.show
      }
    })
  ```
  相信大家也经常听到别人说， <font color="#66b787" size=2 face=""> computed</font> 计算属性有缓存、可以优化性能？？

  <font color="#66b787" size=3 face=""> 3. computed 缓存表现</font>

  ```vue
    <template>
      <div>
        <h3>{{ fn() }}</h3>
        <h3>{{ fn() }}</h3>
        <h3>{{ count }}</h3>
        <h3>{{ count }}</h3>
      </div>
    </template>
    <script lang="ts" setup>
      const fn = () => {
        console.log('fn被执行了...')
        return 'fn被执行了...'
      }
    // 使用的 nuxt3 所以不需要引入
      const count = computed(() => {
        console.log('computed进行了计算..')
        return 'computed进行了计算..'
      })
    </script>
  ```
  上面的代码是把computed 和 方法 做了对比

  ## 二 、computed源码
  <font color="#66b787" size=3 face=""> 1. computed 主函数</font>
  <font color="#66b787" size=2 face="">  前置知识点</font>
  - computed 从代码层面来看 computed本质是 一个 ref 对象，使用层面它是一个计算属性
  - 只传 get函数 返回的是 只读 ref ; 修改值，需要传对象，且需包含get 、set 函数
  - computed 参数一般两种： 一种get函数 ；另一种对象 {set get} ；注意get函数需要有返回值
  ```ts
    // https://github1s.com/vuejs/core/blob/v3.2.47/packages/reactivity/src/computed.ts#L79-L108
    export function computed<T> (
      getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
      debugOptions?: DebuggerOptions,
      isSSR = false
    ) {
      let getter: ComputedGetter<T>
      let setter: ComputedSetter<T>
      //  如果传入的getterOrOptions是函数说明只传了 get ==> comput(()=> {})
      //  只读
      const onlyGetter = isFunction(getterOrOptions)
      if (onlyGetter) {
        getter = getterOrOptions
        // 只传get , dev 环境下，修改computed 的值会抛出警告，pro 啥也不做
        setter = __DEV__ ? () => {
          console.warn('Write operation failed: computed value is readonly')
        } : NOOP // export const NOOP = () => {}
      } else {
        // 传入是对象的，初始化赋值 getter\setter
        getter = getterOrOptions.get
        setter = getterOrOptions.set
      }
      // 创建 ComputedRefImpl实例 基于 RefImpl 类进行实现【解释一下前面说的本质是ref】
      const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR)
      // dev环境 && 传了 debugOptions && 不是服务端渲染
      if (__DEV__ && debugOptions && !isSSR) {
        // 开发者可以 在dev 下 监听 依赖收集、触发更新的回调
        cRef.effect.onTrack = debugOptions.onTrack
        cRef.effect.onTrigger = debugOptions.onTrigger
      }
      // 返回 ComputedRefImpl实例
      return cRef as any
    }
  ```
  从上面的源码中我们可以知道： <font color="#66b787" size=1 face="">computed</font>函数主要是做了两件事：
  - 初始化并赋值 getter setter，没有传setter 则使用 () => {}
  - 实例化并返回 ComputedRefImpl核心类


  下面我们来看看 <font color="#66b787" size=1 face="">ComputedRefImpl</font> 核心类中具体做了什么
  <font color="#9ce4f3" size=3 face="">2. ComputedRefImpl 核心类</font>
  <font color="#9ce4f3" size=2 face="">ComputedRefImpl</font>  是计算属性的核心类
  - dep 保存计算属性所依赖的响应式对象的依赖关系
  - _value 缓存的值
  - effect 副作用对象
  - __v_isRef ref 标识
  - _dirty 缓存是否过期标识
  - trackRefValue 属性被访问时进行依赖收集

  ```ts
    // https://github1s.com/vuejs/core/blob/v3.2.47/packages/reactivity/src/computed.ts#L26-L69
    export class ComputedRefImpl<T> {
      public dep?: Dep = void 0
      private _value!: T  // 缓存的值

      public readonly effect: ReactiveEffect<T> // 副作用对象
      public readonly __v_isRef = true // ref 标识

      public readonly [ReactiveFlags.IS_READONLY]: boolean = false // 只读标识

      public _dirty = true // 脏数据【缓存是否过期标识】

      public _cacheable: boolean // 是否能被缓存

      constructor(
        getter: ComputedGetter<T>,
        private readonly _setter: ComputedSetter<T>,
        isReadonly: boolean,
        isSSR: boolean
      ) {
        // 创建了一个 ReactiveEffect 用存储计算属性的值和依赖项
        // effect 用于获取计算属性对应的响应式对象
        // 在计算属性被访问时，如果缓存过期 则self.effect.run()! 重新计算
        this.effect = new ReactiveEffect(getter, () => {
          // getter => fn 
          // getter 后面的回调是 更新函数的执行调度器，用于在执行更新函数前后进行一些处理
          if (!this._dirty) {
            this._dirty = true
            triggerRefValue(this)
          }
        })
        // computed 用于获取计算属性的getter 
        this.effect.computed = this
        // _cacheable 默认true， isSSR 表示服务端渲染
        // 表示 需不需要进行缓存
        this.effect.active = this._cacheable = !isSSR
        // 只读
        this[ReactiveFlags.IS_READONLY] = isReadonly
      }
      // get 拦截器
      get value() {
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376 // 计算的引用可能会被其他代理包装，例如只读
        const self = toRaw(this) // 获取原始值
        trackRefValue(self) // 依赖收集
        if (self._dirty || !self._cacheable) { // _dirty 脏 || 不能缓存
          self._dirty = false // 先把 _dirty 设置为false 缓存过期
          self._value = self.effect.run()! // 响应式对象.run 的返回值赋值给 _value
        }
        return self._value
      }
      // 拦截
      set value(newValue: T) {
        // 执行 传进来的setter函数
        this._setter(newValue)
      }
    }
  ```

  <font color="#9ce4f3" size=3 face="">3. ReactiveEffect</font>
  ReactiveEffect 是 effect函数的实现类。effect 函数返回一个 ReactiveEffect 对象，用于追踪副作用函数的执行、触发响应式对象的拦截操作、停止追踪时做一些清理 cleanupEffect。
  ```ts
    // https://github1s.com/vuejs/core/blob/v3.2.47/packages/reactivity/src/effect.ts#L53-L140
    export class ReactiveEffect<T = any> {
      active = true
      deps: Dep[] = []
      parent: ReactiveEffect | undefined = void 0
      /**
      * Can be attached after creation
      * @internal
      */
      computed?: ComputedRefImpl<T>
      /**
      * @internal
      */
      allowRecurse?: boolean
      /**
      * @internal
      */
      private deferStop?: boolean

      onStop?: () => void
      // dev only
      onTrack?: (event: DebuggerEvent) => void
      // dev only
      onTrigger?: (event: DebuggerEvent) => void

      constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null,
        scope?: EffectScope
      ) {
        recordEffectScope(this, scope)
      }

      run() {
        if (!this.active) {
          return this.fn()
        }
        let parent: ReactiveEffect | undefined = activeEffect
        let lastShouldTrack = shouldTrack
        while (parent) {
          if (parent === this) {
            return
          }
          parent = parent.parent
        }
        try {
          this.parent = activeEffect
          activeEffect = this
          shouldTrack = true

          trackOpBit = 1 << ++effectTrackDepth
          if (effectTrackDepth <= maxMarkerBits) {
            initDepMarkers(this)
          } else {
            cleanupEffect(this)
          }
          return this.fn()
        } finally {
          if (effectTrackDepth <= maxMarkerBits) {
            finalizeDepMarkers(this)
          }
          trackOpBit = 1 << --effectTrackDepth
          activeEffect = this.parent
          shouldTrack = lastShouldTrack
          this.parent = void 0
          if (this.deferStop) {
            this.stop()
          }
        }
      }
      stop() {
        // stopped while running itself - defer the cleanup  运行自身时停止 - 推迟清理
        if (activeEffect === this) {
          this.deferStop = true
        } else if (this.active) {
          cleanupEffect(this)
          if (this.onStop) {
            this.onStop()
          }
          this.active = false
        }
      }
    }
  ```
  
  <font color="#9ce4f3" size=3 face="">4. trackRefValue</font>
  > trackRefValue 依赖收集

  - 判断 shouldTrack 和 activeEffect，存在则往下执行
  - activeEffect 是一个全局变量，执行get 依赖收集时会赋值为副作用函数, 副作用函数执行之后，activeEffect 会赋值为null 【这里只需先知道有这么个事儿 就好了】
  - 拿到原始值
  - 调用trackEffects 并把 ref.dep 传进去，刚开始 ref.dep是 undefined，然后创建dep

  ```ts
    // https://github1s.com/vuejs/core/blob/v3.2.47/packages/reactivity/src/ref.ts#L40-L53
    export function trackRefValue(ref: RefBase<any>) {
      // shouldTrack为true => 处于响应式状态
      // activeEffect不为undefined => 存在运行的Effect函数
      if (shouldTrack && activeEffect) {
        // 拿到原始值
        // 调用 trackEffects, 把ref.dep 传进去，没有则创建
        ref = toRaw(ref)
        if (__DEV__) { // 开发环境 记录一些调试信息
          trackEffects(ref.dep || (ref.dep = createDep()), {
            target: ref,
            type: TrackOpTypes.GET,
            key: 'value'
          })
        } else {
          trackEffects(ref.dep || (ref.dep = createDep()))
        }
      }
    }
  ```
  <font color="#9ce4f3" size=3 face="">5. trackEffects</font>
  > trackEffects 函数就是根据传过来的dep 对象，将当前的副作用加入到指定的 dep 中，以便依赖跟新时 触发副作用函数跟新。这个模块比较绕，我们先梳理一下几个概念
    - 每个computed 对象是独立的，所以每个computed 有一个对应的 dep对象来存储 这个computed 的所以依赖项（就是所有用到这个computed 的地方），每个依赖项会存在一个或多个的 副作用函数，副作用函数被存储在依赖项的deps 中（activeEffect.deps.push(dep)）
    - 当一个响应式对象computed\ref\reactive被访问时，它所对应的 dep 对象就会被加入当前正在执行的副作用函数（即 activeEffect）的依赖列表中（activeEffect.deps.push(dep) ），同时这个 dep 对象也会记录下这个副作用函数。
    - 函数副作用 副作用指函数在正常工作任务之外对外部环境所施加的影响

    ```ts
      // https://github1s.com/vuejs/core/blob/v3.2.47/packages/reactivity/src/effect.ts#L232-L257
      const maxMarkerBits = 30
      export function trackEffects(
        dep: Dep, // 依赖集合
        debuggerEventExtraInfo?: DebuggerEventExtraInfo
      ) {
        let shouldTrack = false // 是否应该 追踪依赖关系
        if (effectTrackDepth <= maxMarkerBits /*20*/) { // 效果追踪深度小于等于最大标记位数
          if (!newTracked(dep)) { // 当前的 effect 不存在了 dep
            dep.n |= trackOpBit // 设置新的 追踪标记
            shouldTrack = !wasTracked(dep) // 判断是否应该被追踪
          }
        } else {
          // Full cleanup mode. 完全清理模式
          shouldTrack = !dep.has(activeEffect!)
        }


        /*
        * effect 响应式副作用函数
        * activeEffect 是一个全局变量 表示当前正在运行的 effect  
        * ReactiveEffect 表示响应式对象的订阅者
        * activeEffect!.deps 用于存储当前 effect 依赖的所有 dep 对象
        */

        // 依赖应该被追踪 => 将 dep 和 副作用 双向关联

        if (shouldTrack) {
          // 将当前正在执行的 activeEffect 添加到dep
          // 谁用到了这个响应式数据 就把谁添加到依赖数组中
          dep.add(activeEffect!)
          // 将 dep 添加到 activeEffect 的 deps 数组中，表示 activeEffect 依赖于该 dep。
          activeEffect!.deps.push(dep)
          if (__DEV__ && activeEffect!.onTrack) {
            activeEffect!.onTrack({
              effect: activeEffect!,
              ...debuggerEventExtraInfo!
            })
          }
        }
      }
    ```

    # 总结
    ###  <font color="#9ce4f3" size=4 face=""> 1. computed 触发计算的场景</font>
    - 计算属性被读取时
    - 计算属性的依赖发生变化时

    <font color="#9ce4f3" size=3 face=""> 在第一次访问计算属性时：</font>
    > 在js 中 或者 template中，计算属性会进行第一次计算：先进行依赖的收集，初始化 时_dirt为true，通过 _dirty 属性判断缓存的值是否需要重新计算，需要重新计算则先把_dirty属性置为false，然后执行effect.run，将计算结果缓存在_value中，后面访问计算属性时,_dirty是false 直接返回缓存的值，如果_dirt，run 其实就是入参传的的gtter函数，只是里面做了一些处理，最后返回计算结果。
    <font color="#9ce4f3" size=3 face=""> 计算属性的依赖发生变化时：</font>
    > 当计算属性的依赖发生改时，计算属性并不会立即重新进行计算，【注意：他只是会先把_dirty 设置为false，标记为脏数据，数据已过期】，然后在我们下一次进行访问计算属性时，触发getter 判断_dirty 为脏，才会重新进行计算，并缓存其计算的结果

    ###  <font color="#9ce4f3" size=4 face=""> 2. dirty缓存的关键</font>
    > computed 计算属性可以实现缓存，进行性能的提升，主要靠它。
    > computed 被访问时，如果 _dirty 的值为 true，说明缓存的计算结果已经过期了，需要重新计算。
    > 依赖项发生改变时，_dirty的值会被置为false，下次访问才会进行计算
    
 