---
title: websocket
tags: [网络通信, 前端]
index_img: /article-img/canvas.jpg
categories: 网络通讯协议
date: 2021-3-17
mermaid: true
---
### webSocket网络通讯
[webSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 是一种网络通信协议
<!-- more -->
#### 一， WebSocket 客户端
  在客户端，没有必要为 WebSockets 使用 JavaScript 库。实现 WebSockets 的 Web 浏览器将通过 WebSockets 对象公开所有必需的客户端功能(主要指支持 Html5 的浏览器)
  1. webScoket 工作原理 
    Web 浏览器和服务器都必须实现 WebSockets 协议来建立和维护连接。由于 WebSockets 连接长期存在，与典型的 HTTP 连接不同，对服务器有重要的影响。
    基于多线程或多进程的服务器无法适用于 WebSockets，因为它旨在打开连接，尽可能快地处理请求，然后关闭连接。任何实际的 WebSockets 服务器端实现都需要一个异步服务器。
##### 二， 客户端 API
  1. 创建webScoket对象
   ```js
      /**
       * @param url 指定连接的url
       * @param protocol 可选参数，指定可接受的子协议
      */
    const Scoket = new WebScoket(url, [protocol])
   ```
  2. WebSocket 属性

    | 属性 | 描述 |
    | --- | --- |
    | Socket.readyState | 只读属性 readyState 表示连接状态，可以是以下值：0 - 表示连接尚未建立。1 - 表示连接已建立，可以进行通信。2 - 表示连接正在进行关闭。3 - 表示连接已经关闭或者连接不能打开。 |
    | Socket.bufferedAmount | 只读属性 bufferedAmount 已被 send() 放入正在队列中等待传输，但是还没有发出的 UTF-8 文本字节数。 |
  3. WebSocket 事件

    | 事件 | 事件处理程序 | 事件描述 |
    | open | Socket.onopen | 连接建立时触发 |
    | message | Socket.onmessage | 客户端接收服务端数据时触发 |
    | error | Scoket.onerror | 连接发生错误时触发 |
    | close | Scoket.onclose | 连接关闭时触发 |

  4. WebSocket 方法
    | 方法 | 描述 |
    | Socket.send() | 使用连接发送数据 |
    | Socket.close() | 关闭连接 |

  5. 实例代码
  ```js
    // 初始化 WebScoket 对象
    const Scoket = new WebScoket('http://localhost:8080/Api')
    // 建立 连接成功触发事件
    Scoket.onopen = function() {
      // 使用 send() 方法发送数据
      Scoket.send('发送数据')
      console.log('数据发送中...')
    }
    // 接收服务端数据
    Scoket.onmessage = function(res) {
      let received_msg = res.data
      console.log(received_msg)
    }

    // 在需要时断开连接
    Scoket.onclose = function() {
      console.log('连接已关闭...')
    }
  ```