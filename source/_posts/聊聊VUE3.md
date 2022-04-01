---
title: 聊聊vue3
tags: [vue，前端]
index_img: /article-img/feather.jpg
categories: vue3
date: 2022-01-03
mermaid: true
---


### script setup 是什么东西
  它是 Vue3 的一个新语法糖，在 setup 函数中。所有 ES 模块导出都被认为是暴露给上下文的值，并包含在 setup() 返回对象中。相对于之前的写法，使用后，语法也变得更简单。
  使用方式极其简单，仅需要在 script 标签加上 setup 关键字即可。示例：
<!-- more -->
  ```js
    <script setup></script>
  ```
### 组件自动注册

  在 script setup 中，引入的组件可以直接使用，无需再通过components进行注册，并且无法指定当前组件的名字，它会自动以文件名为主，也就是不用再写name属性了
  ```js
    <template>
      <Child />
    </template>

    <script setup>
      import Child from './Child.vue'
    </script>
  ```
#### 使用 props
通过defineProps指定当前 props 类型，获得上下文的props对象。示例：
```js
    <script setup>
      import { defineProps } from 'vue'

      const props = defineProps({
        title: String,
      })
    </script>

```

#### 使用 emits
使用defineEmit定义当前组件含有的事件，并通过返回的上下文去执行 emit。示例：
```js
  <script setup>
  import { defineEmits } from 'vue'

  const emit = defineEmits(['change', 'delete'])
  </script>

```
#### 获取 slots 和 attrs
可以通过useContext从上下文中获取 slots 和 attrs。不过提案在正式通过后，废除了这个语法，被拆分成了useAttrs和useSlots。示例：
```js
  // 旧
  <script setup>
    import { useContext } from 'vue'
  
    const { slots, attrs } = useContext()
  </script>
  
  // 新
  <script setup>
    import { useAttrs, useSlots } from 'vue'
  
    const attrs = useAttrs()
    const slots = useSlots()
  </script>

```
### defineExpose API
传统的写法，我们可以在父组件中，通过 ref 实例的方式去访问子组件的内容，但在 script setup 中，该方法就不能用了，setup 相当于是一个闭包，除了内部的 template模板，谁都不能访问内部的数据和方法。
如果需要对外暴露 setup 中的数据和方法，需要使用 defineExpose API。示例：
```js
  <script setup>
	  import { defineExpose } from 'vue'
	  const a = 1
	  const b = 2
	  defineExpose({
	      a
	  })
  </script>
```
##### 属性和方法无需返回，直接使用！
```js
  <template>
    <div>
     	<p>My name is {{name}}</p>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue';
  
  const name = ref('Sam')
  </script>

```

### Proxy 响应式绑定
Vue2.x 内部是通过 Object.defineProperty 这个 API 去劫持数据的 getter 和 setter 来实现响应式的。因为这个 API 它必须预先知道要拦截的 key 是什么，所以它并不能检测对象属性的添加和删除。直接造成了数组元素的直接修改不会触发响应式机制

例如：对象obj的 name 属性进行劫持：

```js
  const obj = {};
  Object.defineProperty(obj, 'name', {
    get: function() {
        console.log('get val'); &emsp
    },
    set: function(newVal) {
        console.log(`set val: ${newVal}`)
        document.getElementById('input').value = newVal
        document.getElementById('span').innerHTML = newVal
    }
  });
  const input = document.getElementById('input')
  input.addEventListener('keyup', function(e){
    obj.text = e.target.value
  })

```

  那么在3.x使用了Proxy API 做数据劫持，它劫持的是整个对象，自然对象的增删都可以监测到，便很好的规避了以上的问题，那么可以将上述例子改写为：

 ```js
    const input = document.getElementById('input')
    const p = document.getElementById('p')
    const obj = {}
    const newObj = new Proxy(obj, {
      get: function(target, key, receiver) {
        console.error(`getting: ${key}`)
        return Reflect.get(target, key, receiver)
      },
      set: function(target, key, value, receiver) {
        console.error(target, key, value, receiver)
        if(key = 'name') {
          input.value = value
          p.innerHtml = value
        }
        return Reflect.set(target, key, value, receiver)
      }
    })
    input.addEventListener('keyup', function(e) {
      newObj.name = e.target.value
    })
 ```
  通过 Proxy 实现双向响应式绑定，相比 defineProperty 的遍历属性的方式效率更高，性能更好，另外 Virtual DOM 更新只 diff 动态部分、事件缓存等，也带来了性能上的提升。

### Tree-Shaking Support（摇树优化）

tree-sharking 即在构建工具构建后消除程序中无用的代码，来减少包的体积。
相比 Vue2.x 导入整个 Vue 对象，Vue3.0 支持按需导入，只打包需要的代码。Tree-Shaking 依赖 ES2015 模块语法的静态结构（即 import 和 export），通过编译阶段的静态分析，找到没有引入的模块并打上标记。像我们在项目中如果没有引入 Transition、KeepAlive 等不常用的组件，那么它们对应的代码就不会打包进去。

### 组合式 API

Vue2.x 中组件传统的 data，computed，watch，methods 写法，我们称之为选项式 API（Options API 

 #### (1) 选项式 API 存在的缺陷
 随着业务复杂度越来越高，代码量会不断的加大；由于代码需要遵循 option 的配置写到特定的区域，导致后续维护非常的复杂，代码可复用性也不高。比如，很长的 methods 区域代码、data变量声明与方法区域未在一起。
 #### (2) 与mixins 相比较
 对于上述问题，第一想到的可能是利用mixins解决，但当抽离并引用了大量的 mixins，会有两个不可避免的问题发生，命名冲突与数据来源不清晰

 组合式API和mixins 的差别：
  
  - 层级不同： 组合式API 与组件是嵌套关系，而mixins与组件是同级关系
  - 影响层面不同：组合式API 作为组件被调用，并且变量逻辑是组件控制，耦合性很低，而mixins是耦合在代码逻辑里面的， 并且存在了变量的互相引用，为后续更新与维护存在隐患，需小心使用

  #### (3) 与React Hook 相比较

  组合式API受到了 React Hook 的启发，是相似的概念与语法，那么组合式API使用上相对于React Hook 简便很多：

  - 相同的逻辑组合，组件的复用能力
  - 只调用一次 setup 方法更符合js, 规避了闭包变量问题,(我们都知道React Hook 存在闭包变量问题)，没有内存/GC压力，不存在内联回调导致子组件永远更新的问题

  #### (4) 组合式API的使用

  - setup方法: 可使用(script setup)替代
    Vue3.X 所有代码逻辑将在setup 方法中实现，包括： data， watchcomputed，methods等，并且不再有this(解决了this)，
    会先执行 setup 方法，再兼容2.x的其他方法，需要注意的是 3.x中setup 方法在组件生命周期内只会执行一次，不会再重复执行

  - 生命周期函数 (生命周期钩子):