---
title: 初识node
tags: [Node.js, 前端]
index_img: /article-img/Cover.jpg
categories: 前端
date: 2021-08-28
---


### Node.js 
  Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.
  <!--more-->
  Node.js® 是基于Chrome 的 V8 JavaScript 引擎构建的 JavaScript 运行环境。
  nodejs 不能算是语言，只是JavaScript的一个运行环境
  在node中模块规范为commonJs
#### 一， node的异步编程
  node中异步编程直接体现在回调函数,
  异步：不等待运行 非阻塞式I/O操作
  优点：性能高 处理并发请求

  1. 阻塞代码， 使用fs(fileSystem)
    ```js
      const fs = require('fs')
      const data = fs.readfileSync('fileName')
      console.log(data) // 返回一个16进制码
      data.toString() // 得到文件内容
    ```
  2. 非阻塞代码，
  ```js
    const fs = require('fs')
    fs.readfile('fileName', (err,data)=>{
      // 异步编程，不阻塞后续代码运行
      // node 错误优先机制，发生错误先抛出错误信息
      if(err) return console.log(err)
      console.log(data.toString())
    })
    console.log('不等待上面读取文件操作执行完毕')
  ```
    2.1 fs.readfile(params),
        fs.readfile 接受三个参数，
        -1. 文件路径
        -2. 编码格式，'utf-8', 如不指定 则返回 buffer 
        -3. 回调函数，
#### 二，buffer（缓冲器）的相关操作
  [buffer 中文教程](http://nodejs.cn/api/buffer.html) -------- [buffer 英文教程](https://nodejs.org/api/buffer.html)

  ##### 1. 创建buffer
    1.1 Buffer.alloc(size[, fill[, encoding]])
      size: Buffer 所需的长度
      fill：填充的值，默认为 0
      encoding： 如果填充为String,那此参数则为他的编码，默认utf8

      ```js
        // 分配一个长度 10， 0填充的buffer
        const buf1 = Buffer.alloc(10)
        // 分配
      ```
    1.2 通过数据创建 buffer.from('hello world')

      ```js
        // 创建 字符串utf8 buffer
        const buf2 = buffer.from('hello world')
      ```
    1.3 写入buffer 

        ```js
          buf1.write('hello world')
          // 注意，在之前创建buf1 时指定长度为10 此处字符串长度为11 所以超出内容无法写入
          console.log(buf1)
        ```
    1.4 buffer.toString('utf8') // 接受一个参数， 编码格式默认为utf-8

        ```js
          console.log(buf2.toString('base64')) // 输出编码为base64的字符串
        ```
  ##### 2. 合并Buffer buffer.concat()
      ```js
        const buf3 = Buffer.concat([buf1,buf2])
        console.log(buf3) // 合并后的
      ```
#### 三， ES6 异步代码同步化
  ##### 1. 使用 promisify (promise)
  ```js
    // 将promisify 结构
    const { promisify } = require('util')
    const readFile = promisify(fs.readFile)
    async function asyncReanFile(){
      try{
        const data = await readFile('fileName')
        console.log(data)
      }catch(err){
        console.log(err)
      }
    }
  ```
  #### 2. 使用generator
  ```js
    function* read(){
      yield fs.readFile('fileName')
    }
    read().next().value.then(res=>{}).catch(err=>{})
  ```