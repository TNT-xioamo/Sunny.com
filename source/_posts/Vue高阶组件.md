---
title: VUE高阶组件
tags: [前端, Vue]
index_img: /article-img/v2.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-09-08
mermaid: true
---

「时光不负，创作不停」
  <!--more-->

  ## 高阶组件是什么？
  > 一个函数接受一个组件为参数，返回一个函数执行后的包装组件。

  ### 在 React 中
  > 在 React 中， 组件其实就是一堆函数. Class, 所以高阶组件会用到<font color="#66b787" size=4 face="">装饰器</font>语法实现，因为装饰器本质是接收一个Class,返回一个新的Class，
    在react的世界里 高阶组件就是 a(Class) => new Class
    但是React 17版本后加入了memo，使用了hook，所以我们可以借鉴react的思想使用高阶函数完成高阶组件的，并在Vue中使用
  ### 在Vue 中
  > 在 Vue 中，组件是一个对象，所以高阶组件就是一个函数接受一个对象，返回一个新的包装好的对象。
    类比到 Vue 的世界里，高阶组件就是 a(object) => new object
  ### 智能组件和木偶组件
  > 如果你还不知道 <font color="#66b787" size=4 face="">木偶</font>  组件和  <font color="#66b787" size=4 face="">智能</font> 组件的概念，我来给你简单的讲一下，这是 React 社区里一个很成熟的概念了
   <font color="#66b787" size=4 face="">木偶</font> 组件： 就像一个牵线木偶一样，只根据外部传入的 props 去渲染相应的视图，而不管这个数据是从哪里来的。
   <font color="#66b787" size=4 face="">智能</font> 组件: 一般包在 木偶 组件的外部，通过请求等方式获取到数据，传入给 木偶 组件，控制它的渲染。

  ## 实现我们的想法
  根据上面的理论，我们的大致思路是这样的：
    - 高阶组件接收 木偶 组件 和 请求的方法作为参数，ps: (奇技淫巧的写法就是可以当个参数传递进来，结束后在利用垃圾回收机制进行重置)
    - 在 mounted 生命周期中请求到数据
    - 把请求的数据通过 props 传递给 木偶组件。
  既然思路有了，那么 我们的需求是实现请求管理 <font color="#66b787" size=4 face="">HOC</font>,  先定义接收两个参数, 给 <font color="#66b787" size=4 face="">HOC</font> 起个名字就叫  <font color="#66b787" size=4 face="">withPromise</font>
  
  并且  <font color="#66b787" size=4 face="">loading、error</font>  等状态，还有  <font color="#2080ff" size=4 face="">加载中、加载错误</font>  等对应的视图，我们都要在 <font color="#66b787" size=4 face="">新返回的包装组件</font>，也就是下面的函数中 return 的那个新的对象 中定义好。
  ```js
    const withPromise = (wrapped, promiseFunc) => {
      return {
        name: 'with-promise',
        data() {
          return {
            loading: false,
            error: false,
            result: null
          }
        },
        async mounted() {
          this.loading = true
          try {
            const result = await promiseFn().finally(() => { this.loading = false })
            this.result = result
          }
          catch (err) {
            throw new Error(`typeErr: ${err}`)
          }
          finally {}
        }
      }
    }
  ```
  > 1. 参数 wrapped 也就是需要被包裹的组件对象
  > 2. promiseFunc 也就是请求对应的函数，需要返回一个Promise
    看起来是不是已经完成了，但是.vue文件 就不能写template模版了，那么可以换一种思想，利用render函数（ps: 不得不佩服这个学室内艺术和艺术史的尤大大是真的强的离谱）
    当然脚手架项目可以直接使用jsx或者tsx，会更加贴合react的开发思想
    在这个render函数只需要把 wrapped  也就是木偶组件给包裹起来就好了
  这样便形成了<font color="#66b787" size=4 face="">智能组件获取数据 -> 木偶组件消费数据</font> 这样的数据流

  ```js
    const withPromise = (wrapped, promiseFn) => {
      return {
        data() { ... },
        async mounted() { ... },
        render(h) {
          return h(wrapped, {
            props: {
              ...
            }
          })
        }
      }
    }
  ```
  > 到这里其实已经差不多了，现在声明一下木偶组件
<font color="#66b787" size=4 face="">逻辑与视图分离思想</font>
  ```js
    const view = {
      template: `
        <span>
          <span>{{ result?.['name'] }}</span>
        </span>
      `,
      props: ['loading', 'result'], // {}
    }
  ```
  > 我们用 withPromise 包裹这个 view 组件。

  ```js
    const request = (time = 1000) => {
      return new Promise((resolve) => {
        // window.timeout 
        setTimeout(() => { resolve({ name: 'Stark' }) }, time)
      })
    }
    const hoc = withPromise(view, request)
  ```

  > 到这里就可以使用父组件渲染了
  ```xml
    <div id="app"><hoc /></div>
    <script>
      const hoc = withPromise(view, request)
      new Vue({
        el: 'app',
        components: { hoc }
      })
    </script>
  ```
  > 最后加上 加载中 和加载失败的状态

  ```js
    const withPromise = (wrapped, promiseFn) => {
      return {
        data() { ... },
        async mounted() { ... },
        render(h) {
          const args = {
            props: {
              result: this.result,
              loading: this.loading,
            }
          }

          const wrapper = h("div", [
            h(wrapped, args),
            this.loading ? h("span", ["加载中……"]) : null,
            this.error ? h("span", ["加载错误"]) : null,
          ])

          return wrapper
        },
      }
    }

  ```
  ### 完善一下(因为有bug)
    在特定情况下双向绑定，比如input输入框，或者进度条拖动的情况下可能数据无法更新，例如：

  ```js
    const h = this.$createElement
    const content = h(input, {
      props: { value: this.myValue},
      on: {
        input: (value) => {
          if(new.target) throw new Error("cat't invoke with 'new' ")
          this.myValue = value
        }
      }
    })
  ```
  > 那这个时候就可以进行魔改vue配置来规避报错和数据双向绑定，例如：

  ```js
    const h = this.$createElement
    const content = h(input, {
      props: { value: this.myValue},
      on: {
        input: (value) => {
          if(new.target) throw new Error("cat't invoke with 'new' ")
          const bakSilent = Vue.config.silent
          Vue.config.silent = true
          content.componentInstance.value = value
          this.myValue = value
          Vue.config.silent = bakSilent
        }
      }
    })
  ```

  ## 继承组件
  > 为啥要写继承呢，就是为了炫技, 啊……其实不是的，是因为el-table的一个bug(三个月前 boFeng已经修复了在最新版本 )，其中使用了节流导致表头不跟手，所以我便使用了奇技淫巧
  直接上代码吧
  ```js
    <script type="text/babel">
      import { Table } from 'element-ui'
      import { debounce, throttle } from 'throttle-debounce'
      import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
      export default {
        extends: Table,
        methods: {
          syncPostion: function () {
            const { scrollLeft, scrollTop, offsetWidth, scrollWidth } = this.bodyWrapper
            const { headerWrapper, footerWrapper, fixedBodyWrapper, rightFixedBodyWrapper } = this.$refs
            if (headerWrapper) headerWrapper.scrollLeft = scrollLeft
            if (footerWrapper) footerWrapper.scrollLeft = scrollLeft
            if (fixedBodyWrapper) fixedBodyWrapper.scrollTop = scrollTop
            if (rightFixedBodyWrapper) rightFixedBodyWrapper.scrollTop = scrollTop
            const maxScrollLeftPosition = scrollWidth - offsetWidth - 1;
            if (scrollLeft >= maxScrollLeftPosition) {
              this.scrollPosition = 'right'
            } else if (scrollLeft === 0) {
              this.scrollPosition = 'left'
            } else {
              this.scrollPosition = 'middle'
            }
          },
          throttleSyncPostion: throttle(16, function() {
            this.syncPostion()
          }),
           onScroll: function (evt) {
            let raf = window.requestAnimationFrame
            if (!raf) {
              this.throttleSyncPostion()
            } else {
              raf(this.syncPostion)
            }
          },
          bindEvents: function () {
          this.bodyWrapper.addEventListener('scroll', this.onScroll, { passive: true })
            if (this.fit) { addResizeListener(this.$el, this.resizeListener) }
          }
        }
      }
    </script>
  ```








