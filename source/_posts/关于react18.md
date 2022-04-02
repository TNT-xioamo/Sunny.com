---
title: 关于React18新特性
tags: [React，前端]
index_img: /article-img/Fall.jpg
categories: React 18
date: 2022-03-31
mermaid: true
---


## React18正式引入了对并发模式/特性的[渐进升级]策略

    React18把重点放在解决兼容性和如何做迁移的问题上,自从Concurrent Mode(并发模式)
<!-- more -->
    关于18版本之前并发打磨很久的问题一直受大家关注，这次更新并发的引入将会是opt-in 不用的话就没有breaking changes 整体采用了渐进升级的策略

    1.React团队对'Concurrency opt-in'roots的兼容性做了很多优化-如果不用CM特性的话大概率能just works 从此再无CM,只有Concurrent Features(并发特性)

    2.对于直接想让应用的某一部分[躺平]的可以用legacy root-对系统的修改目的之一就是为了让你的React应用同事可以跑在不同的版本上

  <strong> 18的实际做法是引入了新的Root API ReactDOM.createRoot来与旧的ReactDOM.render API区分开来 </strong>

    你可以将整个React树分形成不同的roots,用旧的API的legacy roots会跑在[legacy mode 传统模式]上(相当于跑在17上)
    用新API的roots会跑在 'Concurrency opt-in'  roots下

### <font color="#74cdde" size=3 face=""> 「 什么是Concurrent 」 </font>
    Concurrent最主要的特点就是  <font color="#74cdde" size=3 face=""> [ 渲染是可中断的 ] </font>。没错，以前是不可中断的，也就是说，以前React中的update是同步渲染，在这种情况下，一旦update开启，在任务完成前，都不可中断。
    注意：这里说的同步，和setState所谓的同步异步不是一码事，而且setState所谓的异步本质上是个批量处理。

### <font color="#74cdde" size=3 face=""> 「 Concurrent模式特点 」 </font>

  <font color="#ebc193" size=3 face=""> 「 在Concurrent模式下，update开始了也可以中断，晚点再继续嘛，当然中间也可能被遗弃掉 」。</font>

  #### <font color="#74cdde" size=3 face="">  关于中断问题  </font>

      在React中呢，如果高优先级任务来了，但是低优先级任务还没有处理完毕，就会造成高优先级任务等待的局面。比如说，某个低优先级任务还在缓慢中，
      input框忽然被用户触发，但是由于主线程被占着，没有人搭理用户，结果是用户哐哐输入，但是input没有任何反应。用户一怒之下就走了，
      那你那个低优先级的任务还更新个什么呢，用户都没了。
      由此可见，对于复杂项目来说，任务可中断这件事情很重要。那么问题来了，React是如何做到的呢，其实基础还是fiber，
      fiber本身链表结构，就是指针，想指向别的地方加个属性值就行了。
  #### <font color="#74cdde" size=3 face="">  关于遗弃问题  </font>

      在Concurrent模式下，有些update可能会被遗弃掉，使用UI 进行举例:
      在UI 1 切换到2， 切换到3，切换到4， 我的最终目标是UI4的内容，如果此时程序将2和3的UI也渲染，最终导致4的很久之后才会渲染处理，其实是很影响用户体验的
      那么正确做法是直接遗弃2和3，直接去4，因为2和3也不需要了

  #### <font color="#74cdde" size=3 face="">  关于状态的复用问题  </font>
      Concurrent模式下，还支持状态的复用。某些情况下，比如用户走了，又回来，那么上一次的页面状态应当被保存下来，而不是完全从头再来。当然实际情况下不能缓存所有的页面，
      不然内存不得爆炸，所以还得做成可选的。目前，React正在用Offscreen组件来实现这个功能。嗯，也就是这关于这个状态复用，其实还没完成呢。不过源码中已经在做了处理
      另外，使用OffScreen，除了可以复用原先的状态，我们也可以使用它来当做新UI的缓存准备，就是虽然新UI还没登场，但是可以先在后台准备着嘛，这样一旦轮到它，就可以立马快速地渲染出来

### <font color="#74cdde" size=3 face=""> 「 自动批量处理 Automatic Batching 」 </font>

  React 技术面试中会被问到 <strong> “ steState 是同步还是异步，可以实现同步吗？ 怎么实现，异步的原理又是什么” </strong>

    先回答这个问题：(可同步，可异步)，如果同步的话，只需要把 setState 放在 Promises，setTimeout 或者原生事件中，异步可理解为批量处理，为什么批量处理，
    对于react来说，state攒够了一波一起更新来的简单点。
    但是 18 版本以前批处理是依赖于合成事件，这次更新React 18 之后，state 的批处理更新不再与合成事件有直接关系，而是自动进行处理

    ```js
      // 以前版本 会render两次
      setTimeout(_ => {
        setCount(c => c + 1)
        setFlag(f => !f)
      })

      // React 18 自动批处理 只会render一次
      setTimeout(_ => {
        setCount(c => c + 1)
        setFlag(f => !f)
      }, 1000)
    ```
    虽然建议setState自动批处理，但是有应急处理，想要同步setState，这个时候可以使用flushSync,

    ```js
      // import { flushSync } from 'react-dom'
      
    ```
  

