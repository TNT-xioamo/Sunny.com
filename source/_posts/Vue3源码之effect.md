---
title: Vue3源码之effect
tags: [前端]
index_img: /article-img/v2.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2023-04-24
mermaid: true
---

「时光不负，创作不停」

  <!--more-->

# 一、effect 介绍

## effect 是什么？

> effec 是响应式系统的核心 api 之一，主要负责收集依赖、更新依赖。其本质是一个封装了具有响应式依赖的函数，可以通过 effect 函数将传入的函数转为副作用函数。那么这个副作用函数会在定义时就会执行一次，并且副作用函数会在 dom 更新、响应式数据改变时执行。
> 简单理解为： 加强版的 watch, watch 是监听某个响应式对象或者属性发生改变时，执行回调，而 effect 是所有依赖改变它都会执行回调，和 react 中的 useEffect 传入空数组很像。定义很空洞，接下来我们来使用一下 effect

## effect 怎么的使用？

> 参数：第一个是副作用函数，第二个是个对象: {scope,lazy,scheduler,allowRecurse，onStop}
> 副作用函数：声明会默认执行一下（取消：在第二个参数传入 lazy: true, ），依赖更新新也会执行
> 返回值：ReactiveEffect 对象，可以用来停止监听，或重新调用

```vue
<template>
  <div>
    <div>count: {{ count }}</div>
    <button @click="count++">修改 count</button>
  </div>
</template>
<script lang="ts" setup>
let num = 0;
const count = ref(0);
effect(() => {
  console.log("effect 回调执行", ++num);
  return count.value * 2;
});
</script>
```

> 默认执行第一次
> 取消第一次的执行

```js
effect(
  () => {
    console.log("effect 回调执行", ++num);
    return count.value * 2;
  },
  {
    lazy: true,
  }
);
```

> 当我修改 count 的值时：点击一次按钮，副作用函数就会执行一次，这是因为 count 这个依赖项发生了改变，effect 的副作用函数就会执行

- 手动触发副作用函数 和 停止自动监听副作用函数

```xml
  <template>
<div>
  <div>count: {{ count }}</div>
  <button @click="count++">修改 count</button>
  <button @click="effectCb">手动触发effect</button>
  <button @click="effectCb.effect.stop">停止监听effect</button>
</div>
</template>

<script lang="ts" setup>
let num = 0;
const count = ref(0);
const effectCb = effect(() => {
console.log("effect 回调执行", ++num);
return count.value * 2;
});
</script>
```
## 为什么使用effect?