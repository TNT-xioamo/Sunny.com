---
title: loading.vue
tags: [js, vue]
index_img: /article-img/v1.jpg
categories: 
date: 2022-06-27
mermaid: true
---

「时光不负，创作不停」
  <!--more-->
### loading.vue组件，用来插入到自定义指令的目标元素中
```js
// src/directive/loading/Loading.vue
<template>
	<div v-show="visible" class="loading-wrap"><div class="loading-box">加载中...</div></div>
</template>

<script>
export default {
	data() {
		return {
			visible: true
		}
	}
}
</script>
<style lang="less" scoped>
.loading-wrap {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}
.loading-box {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 100px;
	transform: translate(-50%, -50%);
}
</style>
```

#### index.js 编写自定义指令

```js
// src/directive/loading/index.js
import Vue from 'vue'
import Loading from './loading.vue'
/**
 * Vue.extend 接受参数并返回一个构造器，new 该构造器可以返回一个组件实例
 * 当我们 new Mask() 的时候，把该组件实例挂载到一个 div 上
 **/
const Mask = Vue.extend(Loading)

const toggleLoading = (el, binding) => {
  if (binding.value) {
    Vue.nextTick(() => {
      el.instance.visible = true
      insertDom(el, el, binding)
    })
  } else {
    el.instance.visible = false
  }
}

 插入到目标元素
const insertDom = (parent, el) => {
  parent.appendChild(el.mask)
}

export default {
  bind: function (el, binding, vnode) {
    const mask = new Mask({
      el: document.createElement('div'),
      data () {}
    })
    el.instance = mask
    el.mask = mask.$el
    el.maskStyle = {}
    binding.value && toggleLoading(el, binding)
  },
  update: function (el, binding) {
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, binding)
    }
  },
  unbind: function (el, binding) {
    el.instance && el.instance.$destroy()
  }
}

```
#### 暴露安装插件

```js
// src/directive/index.js
import Loading from './loading'
export default {
  install (Vue) {
    Vue.directive('loading', Loading)
  }
}

```

#### 引入插件

```js
// main.js
import Directive from './directive'
Vue.use(Directive)

```