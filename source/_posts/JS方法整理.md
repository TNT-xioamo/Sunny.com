---
title: Js 的一些方法整理
tags: [防抖节流, JavaScript]
index_img: /article-img/canvas.jpg
categories: 前端
date: 2022-05-26
mermaid: true
---

## 防抖和节流
  函数防抖与节流的使用场景与实现方法
  <!-- more -->
  在进行窗口的resize、scroll，输入框内容校验等操作时，如果事件处理函数调用的频率无限制，会加重浏览器的负担，导致用户体验非常糟糕。
  此时我们可以采用debounce（防抖）和throttle（节流）的方式来减少调用频率，同时又不影响实际效果。

 ### 一， 函数防抖
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
 ### 二， 函数节流
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
## -redux 中间件

```js
  /**
   * 
  */
  export default function applyMiddleware(...middlewares) {
    return (...args) => {
      // 通过createStore方法创建一个store
      const store = createStore(...args)
      // 定义一个dispatch 如果中间件构造过程调用，抛出异常
      let dispatch = () => {
        throw new Error('')
      }
      // 定义middlewareAPI，有两个方法，一个是getState,一个是dispatch,将其作为中间件调用store的侨接
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      }
      const chain = middlewares.map((middleware) => middleware(middlewareAPI))
      // 使用compose整合chain数组，并赋值给dispatch
      // 中间件的初始化是从右往左的，而dispatch 执行是从左往右
      // compose执行完后，middlewareAPI定义的dispatch方法内的dispatch变量被覆盖
      // 调用dispatch,会重新从左往右执行
      dispatch = compose(...chain)(store.dispatch)
      return {
        ...store,
        dispatch
      }
    }
  }
```

## 优雅的使用 JavaScript 运算符
  ### 1. 什么是管道运算符 （目前处于审议草案）
  ```
    output = input -> func1 -> func2 -> func3
  ```
  现在的写法：
  ```js
    const output = func3(func2(func1(input)))
  ```
  - 手动实现
```js
  const pipe = (...args) => args.reduce((acc, el) => el(acc))
  const title = 'Front End Interview Questions'
  const toLowerCase = (str) => str.toLowerCase()
  const addHyphens = (str) => str.replace(/\s/g, '-')
  pipe(title, toLowerCase, addHyphens)

  // 管道示例：
  // 定义一些函数：
  const add = (num) => num1 + 10
  const subtract = (num) => num1 - 5
  const multiply = (num) => num1 * 9
  // 使用管道通过级联函数传递值:
  const num = multiply(add(subtract(15)))
  console.log(num)
```
 - 有了管道运算符就可以很优雅的写

  ```js
    const numPiped = 15 |> add |> subtract |> multiply
    console.log(numPiped)
  ```
  ### 2. 逻辑空分配（??=）
  ```js
   expr1 ??= expr2
  ```
  逻辑空值运算符仅在无效值（null 或者 undefined）时才将值分配给expr1，表达方式：

  ```js
    x ??= y
  ```
  空的合并运算符（??）从左到右操作，如果x不为nullish值则中表达式不执行。因此，如果x不为null 或者 undefined，则永远不会对表达式y进行求值。如果y是一个函数，它将根本不会被调用。因此，此逻辑赋值运算符等效于
  ```js
    x ?? (x = y)
  ```
  ### 3. 逻辑或分配（|| =）
    此逻辑赋值运算符仅在左侧表达式为 「 虚值 」 时才赋值。Falsy值（虚值）与null有所不同，因为falsy值（虚值）可以是任何一种值：undefined，null，空字符串(双引号""、单引号’’、反引号``)，NaN，0。IE浏览器中的 document.all，也算是一个。
  ```js
    x ||= y
    document.getElementById('search').innerHTML ||= '<i>No posts found matching this search.</i>'
  ```
  ### 4. 逻辑与分配 (&& =)
  ```js
  x &&= y // 仅在左侧为真时才赋值
  ```
  ## JavaScript 位运算
  ### - 判断奇偶数
  ```js
    num & 1 === 1 // num 为奇数
    num & 1 === 0 // num 为偶数
    // 与 % 2来判断奇偶速度差不多
  ```
  ### - 取整
  ```js
  // 类似于parseInt
    ~~3.14159 // 3
    3.14159 >> 0 //3
    3.14159 >>> 0 //3
    3.14159 | 0 // 3
    // '>>>' 不用于对负数取整,其他都可以
  ```

