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

  ### 二 、computed源码
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
        
      }
    }
  ```
 

 