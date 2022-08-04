---
title: web解决竞争条件
tags: [REACT, VUE]
index_img: /article-img/feather.jpg
categories: javaScript
date: new Date()
mermaid: true
---

「时光不负，创作不停」
  <!--more-->

# <font color="#0167ff">什么是竞争条件</font>

 > 竞争条件是指 应用程序依赖于一系列事件，但它们的顺序是不可控的，这很有可能发生在异步代码中，比如：
 ```js
  const post = () => {
    const { postId } = userParams<{postId: string}>()
    const [isLoading, setIsLoading] = useState(false)
    const [post, setPost] = useState<Post | null>(null)

    useEffect(() => {
      setIsLoading(true)
      fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`).then(response => {
        if (response.ok) return response.json()
        return Promise.reject()
      }).then((fetchedPost: Post)=> {
        setPost(fetchedPost)
      }).finally(() => {
        setIsLoading(false)
      })
    }, [postId])
    if (!post || isLoading) return (<div> loading...</div>)
    return (
      <div>
        <p>{post.id}<p>
        <p>{post.title}<p>
        <p>{post.body}<p>
      </div>
    )
  }
 ```
这块其实很简单，只是根据id去获取数据，并显示出来，但是在某些情况下会有问题：
1. 用户打开/posts/1查看一个数据，我们开始获取id为1的数据，有时候会有网络连接问题，数据还没加载出来
2. 这时候用户不等待第一个加载完成，直接将连接改为/posts/2，那么又开始获取id为2的数据，这次网络没有问题，直接使用
3. 但此时id为1的数据加载完成了，setPost(fetchedPost) 用id为1的数据覆盖当前状态，即使用户将页面切换到/posts/2，但内容却是ID是1的数据

> 对于上述的这个问题解决的直接办法是引入didCancel变量， React将在组件卸载是设置为true
```js
useEffect(() => {
  let didCancel = false
  setIsLoading(true)
  fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`).then(response => {
    if (response.ok) return response.json()
    return Promise.reject()
  }).then((fetchedPost: Post) => {
    if (!didCancel) setPost(fetchedPost)
  }).finally(() => {
    setIsLoading(false)
  })
  return () => {didCancel = true}
}, [postId])
```
虽然解决了问题，但是还不是最优化的方式，浏览器还是在等待第一次请求结果再去忽略，逻辑还是需要改善，那么可以使用AbortController

# <font color="#f58eaa">使用AbortController</font>
> 有了AbortController,便可以中止一个或多个请求，我们需要创建AbortController实例并在发出fetch使用
```js
  useEffect(() => {
    const abortController = new AbortController()
    setIsLoading(true)
    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      signal: abortController.signal
    }).then((response) => {
      if (response.ok) response.json()
      return Promise.reject()
    }).then((fetchedPost: Post) => {
      setPost(fetchedPost)
    }).finally(() => {
      setIsLoading(false)
    })
    return () => {
      abortController.abort()
    }
  }, [postId])
```

> 上面通过 fetch 选项传递 abortController.signal 这样浏览器可以在调用 abortController.abort() 时停止请求
具体过程: 
1. 用户打开/posts/1 查看第一篇文章，开始获取数据
2. 不等待第一个数据，用户将页面改为/posts/2
3. useEffect 在上一个数据之后清理病运行abortController.abort()
4. 接下来开始获取id为2的数据，网络正常，数据加载成功
5. 然后第一个数据永远不会完成加载，因为已经终止了请求
> 调用abortController.abort()是因为会导致fetch Promise 被 reject ，可能导致我们无法捕捉异常， 所以需要加catch进行捕获异常
# <font color="#bbf59f">使用AbortController取消其他Promise</font>
> 除了使用 调用abortController 取消请求之外，也可以在函数中使用它
```js
function wait(time) {
  return nwe Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
wait(3000).then(() => {
  console.dir('3秒已经过去')
})
```
> 可以修改等待函数易接受类似于fetch 函数的信号属性，需要利用信号调用abortController.reject() 发出abort事件
```js
  function wait(time, signal) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve()
      }, time)
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject()
      })
    })
  }
  // 现在需要传递信号属性来等待和中止Promise

  const abortController = new AbortController()
  setTimeout(() => {
    abortController.abort()
  }, 1000)
  wait(5000, abortController.signal).then(() => {
    console.dir('5秒已过')
  }).catch(_ => {
    console.dir('被中断了')
  })
```
