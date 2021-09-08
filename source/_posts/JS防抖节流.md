---
title: Js 防抖节流
tags: [防抖节流, JavaScript]
index_img: /article-img/canvas.jpg
categories: 前端
date: 2021-6-16
mermaid: true
---

#### 防抖和节流
  函数防抖与节流的使用场景与实现方法
  <!-- more -->
  在进行窗口的resize、scroll，输入框内容校验等操作时，如果事件处理函数调用的频率无限制，会加重浏览器的负担，导致用户体验非常糟糕。
  此时我们可以采用debounce（防抖）和throttle（节流）的方式来减少调用频率，同时又不影响实际效果。

 ##### 一， 函数防抖
   **在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。**
  ```js
  /**
   *description
  */
    function debounce(callBack, delay){
      let timer = null
    }
  ```