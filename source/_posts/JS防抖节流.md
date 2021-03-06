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
   * 利用闭包 设置timer 保存定时器状态 
   * @param func  执行函数
   * @param delay 间隔时间
   * @param immediate 是否立即执行
  */
    function debounce(func, delay=1000, immediate){
      let timer = null
      return function () {
        if(timer) clearTimeout(timer)
        if (immediate) {
          const callNow = !timer
          // 如果已经执行过，便不再执行
          timer = setTimeout(()=>{
            timer = null
          },delay)
          if(callNow){
            func.apply(this, arguments)
          }
        } else{
          timer = setTimeout(()=>{
            func.apply(this, arguments)
          },delay)
        }
      }
    }
  ```
 ##### 二， 函数节流
 **节流是指连续触发事件，但是在 n 秒中只执行一次函数。 节流会稀释函数的执行频率。**
  ```js
   /** 利用闭包 保留任务状态， 任务存在将不再触发，
    * @param func  执行函数
    * @param wait 间隔时间
    * @param type 1.时间戳模式，否择为定时器模式
   */
  function throttle(func, wait=1000,type){
    let timer = null
    let previous = 0
    return function(){
      if(type === 1){
        let now = Date.now()
        if(now - previous > wait){
          func.apply(this, arguments)
          previous = now
        }
      } else {
        if(!timer){
          timer = setTimeout(()=>{
            func.apply(this, arguments)
            timer = null
          },wait)
        }
      }
    }
  }
  ```
