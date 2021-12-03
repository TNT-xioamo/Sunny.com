---
title: 中断Promise
tags: [js]
index_img: /article-img/Cover.jpg
categories: 前端
date: 2021-09-22
---


## 如何中断Promise？
 
 Promise 有个缺点就是一旦创建就无法取消，所以本质上 Promise 是无法被终止的，但我们在开发过程中可能会遇到下面两个需求：
 <!--more-->

 ### 中断调用链
  -------------------------------
  就是在某个 then/catch 执行之后，不想让后续的链式调用继续执行了，即：
  ```js
  somePromise
  .then(() => {})
  .then(() => {
    // 终止 Promise 链，让下面的 then、catch 和 finally 都不执行
  })
  .then(() => console.log('then'))
  .catch(() => console.log('catch'))
  .finally(() => console.log('finally'))

  ```
答案就是在 then/catch 的最后一行返回一个永远 pending 的 promise 即可：

```js
    return new Promise((resolve, reject) => {})
    这样的话后面所有的 then、catch 和 finally 都不会执行了。
```

 ### 中断Promise
  注意这里是中断而不是终止，因为 Promise 无法终止，这个中断的意思是：在合适的时候，把 pending 状态的 promise 给 reject 掉。例如一个常见的应用场景就是希望给网络请求设置超时时间，一旦超时就就中断，我们这里用定时器模拟一个网络请求，随机 3 秒之内返回：
```js
  const request = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('收到服务端数据')
    }, Math.random() * 3000)
  })

```
如果认为超过 2 秒就是网络超时，可以对该 promise 写一个包装函数 timeoutWrapper：

```js
    function timeoutWrapper(p, timeout = 2000) {
      const wait = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject('请求超时')
        }, timeout)
      })
      return Promise.race([p, wait])
    }

```
于是就可以像下面这样用了：

```js
    const req = timeoutWrapper(request)
    req.then(res => console.log(res)).catch(e => console.log(e))

```
不过这种方式并不灵活，因为终止 promise 的原因可能有很多，例如当用户点击某个按钮或者出现其他事件时手动终止。所以应该写一个包装函数，提供 abort 方法，让使用者自己决定何时终止：

```js
    function abortWrapper(p1) {
      let abort
      let p2 = new Promise((resolve, reject) => (abort = reject))
      let p = Promise.race([p1, p2])
      p.abort = abort
      return p
    }

```
使用方法如下：

```js
    const req = abortWrapper(request)
    req.then(res => console.log(res)).catch(e => console.log(e))
    setTimeout(() => req.abort('用户手动终止请求'), 2000) // 这里可以是用户主动点击

```
最后，再次强调一下，虽然 promise 被中断了，但是 promise 并没有终止，网络请求依然可能返回，只不过那时我们已经不关心请求结果了。

