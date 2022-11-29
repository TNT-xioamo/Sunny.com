---
title: 重学js
tags: [javaScript]
index_img: /article-img/v1.jpg
categories: 前端
date: 2022-11-24
comments: true
mermaid: true
---

「时光不负，创作不停」
  <!--more-->

  ## 纯函数（pure function）
  > 函数式编程中有一个非常重要的概念叫纯函数，JavaScript符合函数式编程的范式，所以也有纯函数的概念；

  - 在react开发中纯函数是被多次提及的；比如react中组件就被要求像是一个纯函数（为什么是像，因为还有class组件），redux中有一个reducer的概念，也是要求必须是一个纯函数；纯函数的维基百科定义：  在程序设计中，若一个函数符合以下条件，那么这个函数被称为纯函数：
  - 此函数在相同的输入值时，需产生相同的输出。
  - 函数的输出和输入值以外的其他隐藏信息或状态无关，也和由I/O设备产生的外部输出无关。
  - 该函数不能有语义上可观察的函数副作用，诸如“触发事件”，使输出设备输出，或更改输出值以外物件的内容等
  <font color="#42cadd" size=2 face="">「 确定的输入，一定会产生确定的输出； 函数在执行过程中，不能产生副作用 」</font>

  > 举个例子：🌰
  ```js
    function sum(num1, num2) {
      return num1 + num2
    }
  ```
  > 我们输入的一样的值，一定会得到一样的结果。sum这个函数我们就可以称为纯函数
  再举个例子：🌰
  ```js
    var name = "stark"
    function changeName() {
      name = "krats"
    }
  ```
  > 在changeName这个函数里面，会对全局的变量name进行改变，所以changeName不能被称为一个纯函数

  ## 函数柯里化
  - 柯里化属于函数式编程里面一个非常重要的概念。
  - 柯里化声称 “如果你固定某些参数，你将得到接受余下参数的一个函数” 
  <font color="#42cadd" size=2 face="">「 只传递给函数一部分参数来调用它，让它返回一个函数去处理剩余的参数； 这个过程就称之为柯里化； 」 </font>
  > 举个例子：🌰
  ```js
    function add(x, y, z) {
      return x + y + z
    }
    var cum = add(10, 20, 30)
    console.dir(cum)
    
    // 那么换种方式呢？
    function sum1(x) {
      return function(y) {
        return function(z) {
          return x + y + z
        }
      }
    }
    var cum1 = sum1(10)(20)(30)
    console.dir(cum1)
    // 那如果使用箭头函数呢？
    const sum2 = x => y => z => {
      return x + y + z
    }
  ```
  ### 那么为什么需要有柯里化呢？
  - 函数式编程中，其实往往希望一个函数处理的问题尽可能的单一
  - 我们是否就可以将每次传入的参数在单一的函数中进行处理，处理完后在下一个函数中再使用处理后的结果？
  - 单一职责原则
  > 举个例子：🌰
  ```js
    // 假如在程序中,我们经常需要把某一个固定的数字的自身倍数和另外一个数字进行相加
    function makeAdd(cou) {
      cou = cou * cou
      return function(num) {
        return cou + num
      }
    }
  ```
  > 再举个例子：🌰
  ```js
    // 假如业务中需要打印一些日志
    function log(date, type, msg) {
      console.dir(`[${date.getHours()}:${date.getMinutes()}][${type}]: [${msg}]`)
    }
    // 柯里化
    var log = date => type => msg => {
      console.dir(`[${date.getHours()}:${date.getMinutes()}][${type}]: [${msg}]`)
    }
    // 使用日志
    const clog = log(new Date())
    clog('error')
    clog('error')('阻塞 UI')
  ```
  ## 自动柯里化函数
  > 既然我们要使用用柯里化，那是就可以将所用的函数改造为自动柯里化
  > 举个例子：🌰
  ```js
    function add(x, y, z) {
      return x + y + z
    }
    // 柯里化函数的实现myCurrying
    function myCurrying(fn) {
      function curried(...args) {
        // 先进行判断当前已经接收的参数的个数，可以参数本身需要接受的参数是否已经一致了
        // 当已经传入的参数 大于等于 需要的参数时, 就执行函数
        if (args.length >= fn.length) {
          return fn.apply(this, args)
        } else {
          function curriedTow(...args2) {
            return curried.apply(this, args.concat(args2))
          }
          return curriedTow
        }
      }
      return  return curried
    }
    var curryAdd = myCurrying(add)
    console.dir(curryAdd(10, 20, 30))
    console.dir(curryAdd(10, 20)(30))
    console.dir(curryAdd(10)(20)(30))
  ```

  ## 组合函数
  > Compose 函数是在JavaScript开发过程中一种对函数的使用技巧、模式：
  ```js

  ```


