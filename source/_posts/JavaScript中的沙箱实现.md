---
title: 沙箱实现
tags: [javascript，前端]
index_img: /article-img/Fall.jpg
categories: webpack
date: 2023-03-05
mermaid: true
---
「时光不负，创作不停」
  <!--more-->

# 什么是constructor

  - JavaScript中constructor属性指向创建当前对象的构造函数，该属性是存在原型里的，且是不可靠的 JavaScript中constructor属性[2]

  ```js
    function test() {}
    const obj = new test()
    console.log(obj.hasOwnProperty('constructor')) // false
    console.log(obj.__proto__.hasOwnProperty('constructor')) // true
    console.log(obj.__proto__ === test.prototype) // true
    console.log(test.prototype.hasOwnProperty('constructor')) // true

    /** constructor是不可靠的 */

    function Foo() {}
    Foo.prototype = {}
    const foo = new Foo()
    console.log(foo.constructor === Object) // true，可以看出不是Foo了
  ```

  - 几个典型的constructor：
  ```js
    (async function(){})().constructor === Promise
    // 浏览器环境下
    this.constructor.constructor === Function
    window.constructor.constructor === Function

    // node环境下
    this.constructor.constructor === Function
    global.constructor.constructor === Function


  ```

  ## JS Proxy getPrototypeOf()
  > handler.getPrototypeOf()是一个代理方法，当读取代理对象的原型时，该方法就会被调用。语法：
  ```js
    const p = new Proxy(obj, {
      getPrototypeOf(target) { // target 被代理的目标对象。
        ...
      }
    })
  ```
  > 当 getPrototypeOf 方法被调用时，this 指向的是它所属的处理器对象，getPrototypeOf 方法的返回值必须是一个对象或者 null。
   在 JavaScript 中，有下面这五种操作（方法/属性/运算符）可以触发 JS 引擎读取一个对象的原型，也就是可以触发 getPrototypeOf() 代理方法的运行：
  ```js
    Object.getPrototypeOf()
    Reflect.getPrototypeOf()
    proto
    Object.prototype.isPrototypeOf()
    instanceof
  ```
  >如果遇到了下面两种情况，JS 引擎会抛出 TypeError 异常：
    - getPrototypeOf() 方法返回的不是对象也不是 null。 目标对象是不可扩展的，且 getPrototypeOf() 方法返回的原型不是目标对象本身的原型。
    基本用法：
  ```js
    const obj = {}
    const proto = {}
    const handler = {
      getPrototypeOf(target) {
        console.log(target === obj)   // true
        console.log(this === handler) // true
        return proto
      }
    }
    let p = new Proxy(obj, handler) // obj是被代理的对象，也就是handler.getPrototypeOf的target参数
    console.log(Object.getPrototypeOf(p) === proto)    // true
  ```
  > 5 种触发 getPrototypeOf 代理方法的方式
  ```js
    const obj = {}
    const p = new Proxy(obj, {
      getPrototypeOf(target) {
          return Array.prototype;
      }
    })
    console.log(
      Object.getPrototypeOf(p) === Array.prototype,  // true
      Reflect.getPrototypeOf(p) === Array.prototype, // true
      p.__proto__ === Array.prototype,               // true
      Array.prototype.isPrototypeOf(p),              // true
      p instanceof Array                             // true
    )
  ```
  > 两种异常的情况：
  ```js
    // getPrototypeOf() 方法返回的不是对象也不是 null
    const obj = {};
    const p = new Proxy(obj, {
        getPrototypeOf(target) {
            return "foo"
        }
    });
    Object.getPrototypeOf(p); // TypeError: "foo" is not an object or null    

    // 目标对象是不可扩展的，且 getPrototypeOf() 方法返回的原型不是目标对象本身的原型
    const obj = Object.preventExtensions({}); // obj不可扩展
    const p = new Proxy(obj, {
        getPrototypeOf(target) {
            return {};
        }
    })
    Object.getPrototypeOf(p) // TypeError: expected same prototype value   

    // 如果对上面的代码做如下的改造就没问题
    const obj = Object.preventExtensions({}) // obj不可扩展
    const p = new Proxy(obj, {
        getPrototypeOf(target) { // target就是上面的obj
            return obj.__proto__ // 返回的是目标对象本身的原型
        }
    })
    Object.getPrototypeOf(p) // 不报错
  ```
  # 一、跟浏览器宿主环境一致的沙箱实现

  ## 构建闭包环境
  >我们知道在 JavaScript 中的作用域（scope）只有全局作用域（global scope）、函数作用域（function scope）以及从 ES6 开始才有的块级作用域（block scope）。如果要将一段代码中的变量、函数等的定义隔离出来，受限于 JavaScript 对作用域的控制，只能将这段代码封装到一个 Function 中，通过使用 function scope 来达到作用域隔离的目的。也因为需要这种使用函数来达到作用域隔离的目的方式，于是就有 IIFE（立即调用函数表达式），这是一个被称为“自执行匿名函数”的设计模式 

  ```js
    (function foo(){
      const a = 1
      console.log(a)
    })()// 无法从外部访问变量 
    console.log(a) // 抛出错误："Uncaught ReferenceError: a is not defined"
    
  ```
  > 当函数变成立即执行的函数表达式时，表达式中的变量不能从外部访问，它拥有独立的词法作用域。不仅避免了外界访问 IIFE 中的变量，而且又不会污染全局作用域，弥补了 JavaScript 在 scope 方面的缺陷。一般常见于写插件和类库时，如 JQuery 当中的沙箱模式

  ```js
    (function (window) {
      var jQuery = function (selector, context) {
          return new jQuery.fn.init(selector, context)
      }
      jQuery.fn = jQuery.prototype = function () {
        //原型上的方法，即所有jQuery对象都可以共享的方法和属性
      }
      jQuery.fn.init.prototype = jQuery.fn
      window.jQeury = window.$ = jQuery //如果需要在外界暴露一些属性或者方法，可以将这些属性和方法加到window全局对象上去
    })(window)
  ```

  > 当将 IIFE 分配给一个变量，不是存储 IIFE 本身，而是存储 IIFE 执行后返回的结果。

  ```js
    const result = (function () {
      const name = "张三"
      return name
    })()
    console.log(result) // "张三"
  ```

  ## 原生浏览器对象的模拟
  > 模拟原生浏览器对象的目的是为了防止闭包环境，操作原生对象，篡改污染原生环境，完成模拟浏览器对象之前我们需要先关注几个不常用的 API。

  ### eval
  > eval 函数可将字符串转换为代码执行，并返回一个或多个值：
  ```js
    const b = eval("({name:'张三'})")
    console.log(b.name)
  ```
  > 由于 eval 执行的代码可以访问闭包和全局范围，因此就导致了代码注入的安全问题，因为代码内部可以沿着作用域链往上找，篡改全局变量，这是我们不希望的。
  ```js
    console.log(eval( this.window === window )); // true 
  ```

  > 补充几个点：
    性能&安全问题，一般不建议在实际业务代码中引入eval•辅助异步编程框架的windjs大量采用eval的写法来辅助编程，引发争议 专访 Wind.js 作者老赵（上）：缘由、思路及发展[11]•浏览器环境下，(0, eval)()比eval()的性能要好「目前已经不是了」
    ```js
      const times = 1000;
      const time1 = '直接引用'
      const time2 = '间接引用'

      let times1 = times
      console.time(time1)
      while(times1--) {
          eval(`199 + 200`)
      }
      console.timeEnd(time1)

      let times2 = times
      console.time(time2)
      while(times2--) {
          (0, eval)(`199 + 200`)
      }
      console.timeEnd(time2)
    ```

  ### new Function

  > Function构造函数创建一个新的 Function 对象。直接调用这个构造函数可用于动态创建函数。

  ```js
    new Function ([arg1[, arg2[, ...argN]],] functionBody)
  ```
  > arg1, arg2, ... argN 被函数使用的参数的名称必须是合法命名的。参数名称是一个有效的 JavaScript 标识符的字符串，或者一个用逗号分隔的有效字符串的列表，例如“×”，“theValue”，或“a,b”
  new Function()性能一般比eval要好，很多用到这块的前端框架都是用new Function()实现的，比如：Vue.js打开浏览器控制台后，new Function()的性能要慢一倍以上

  ### with
  > with 是 JavaScript 中一个关键字，扩展一个语句的作用域链。它允许半沙盒执行。那什么叫半沙盒？语句将某个对象添加到作用域链的顶部，如果在沙盒中有某个未使用命名空间的变量，跟作用域链中的某个属性同名，则这个变量将指向这个属性值。如果沒有同名的属性，则将拋出 ReferenceError。

  ```js
    // 严格模式下以下代码运行会有问题

    function sandbox(o) {
      with (o){
          //a=5; 
          c=2;
          d=3;
          console.log(a,b,c,d); // 0,1,2,3 //每个变量首先被认为是一个局部变量，如果局部变量与 obj 对象的某个属性同名，则这  个局部变量会指向 obj 对象属性。
      }
    }

    const f = {
        a:0,
        b:1
    }
    sandbox(f); 

    console.log(f);
    console.log(c,d); // 2,3 c、d被泄露到window对象上
  ```


  ## 基于 Proxy 实现的沙箱(ProxySandbox)
  > ES6 Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，属于一种“元编程”（meta programming）
  ```js

  function evalute(code,sandbox) {
    sandbox = sandbox || Object.create(null)
    const fn = new Function('sandbox', `with(sandbox){return (${code})}`)
    const proxy = new Proxy(sandbox, {
      has(target, key) {
        // 让动态执行的代码认为属性已存在
        return true
      }
    })
    return fn(proxy)
  }
    evalute('1+2') // 3
    evalute('console.log(1)') // Cannot read property 'log' of undefined
  ```
  > 我们知道无论 eval 还是 function，执行时都会把作用域一层一层向上查找，如果找不到会一直到 global，那么利用 Proxy 的原理就是，让执行了代码在 sandobx 中找的到，以达到「防逃逸」的目的。
  我们前面提到with在内部使用in运算符来计算变量，如果条件是 true，它将从沙盒中检索变量。理想状态下没有问题，但也总有些特例独行的存在，比如 Symbol.unscopables。
  Symbol 对象的 Symbol.unscopables 属性，指向一个对象。该对象指定了使用 with 关键字时，哪些属性会被 with 环境排除。
  ```js
    Array.prototype[Symbol.unscopables]
  ```
  > 由此我们的代码还需要修改如下：
  ```js
    function sandbox(code) {
    code = 'with (sandbox) {' + code + '}'
    const fn = new Function('sandbox', code)

    return function (sandbox) {
        const sandboxProxy = new Proxy(sandbox, {
            has(target, key) {
                return true
            },
            get(target, key) {
                if (key === Symbol.unscopables) return undefined
                return target[key]
            }
        })
        return fn(sandboxProxy)
    }
  }
  const test = {
      a: 1,
      log(){
          console.log('11111')
      }
  }
  const code = 'log(); console.log(a)' // 1111,TypeError: Cannot read property 'log' of undefinedsandbox(code)(test)
  ```


  ## 快照沙箱(SnapshotSandbox)
  > 快照沙箱实现来说比较简单，主要用于不支持 Proxy 的低版本浏览器，原理是基于diff来实现的,在子应用激活或者卸载时分别去通过快照的形式记录或还原状态来实现沙箱，snapshotSandbox 会污染全局 window。
  我们看下 qiankun 的 snapshotSandbox 的源码，这里为了帮助理解做部分精简及注释
  ```js
    function iter(obj, callbackFn) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          callbackFn(prop)
        }
      }
    }

    /**
     * 基于 diff 方式实现的沙箱，用于不支持 Proxy 的低版本浏览器
     */
      class SnapshotSandbox {
        constructor(name) {
          this.name = name;
          this.proxy = window;
          this.type = 'Snapshot';
          this.sandboxRunning = true;
          this.windowSnapshot = {};
          this.modifyPropsMap = {};
          this.active();
        }
          //激活
        active() {
            // 记录当前快照
          this.windowSnapshot = {};
          iter(window, (prop) => {
            this.windowSnapshot[prop] = window[prop];
          });
          // 恢复之前的变更
          Object.keys(this.modifyPropsMap).forEach((p) => {
            window[p] = this.modifyPropsMap[p];
          });
          this.sandboxRunning = true;
        }
          //还原
          inactive() {
              this.modifyPropsMap = {};
              iter(window, (prop) => {
                  if (window[prop] !== this.windowSnapshot[prop]) {
                      // 记录变更，恢复环境
                      this.modifyPropsMap[prop] = window[prop];
                      window[prop] = this.windowSnapshot[prop];
                  }
              });
              this.sandboxRunning = false;
          }
      }
    let sandbox = new SnapshotSandbox();
    //test
  ((window) => {
      window.name = '张三'
      window.age = 18
      console.log(window.name, window.age) //    张三,18
      sandbox.inactive() //    还原
      console.log(window.name, window.age) //    undefined,undefined
      sandbox.active() //    激活
      console.log(window.name, window.age) //    张三,18
  })(sandbox.proxy);
  ```
  ### legacySandBox
  > qiankun 框架 singular 模式下的 proxy 沙箱实现，为了便于理解，这里做了部分代码的精简和注释。
  ```js
    //legacySandBox
    const callableFnCacheMap = new WeakMap();

    function isCallable(fn) {
      if (callableFnCacheMap.has(fn)) {
        return true;
      }
      const naughtySafari = typeof document.all === 'function' && typeof document.all === 'undefined';
      const callable = naughtySafari ? typeof fn === 'function' && typeof fn !== 'undefined' : typeof fn ===
        'function';
      if (callable) {
        callableFnCacheMap.set(fn, callable);
      }
      return callable;
    };

    function isPropConfigurable(target, prop) {
      const descriptor = Object.getOwnPropertyDescriptor(target, prop);
      return descriptor ? descriptor.configurable : true;
    }

    function setWindowProp(prop, value, toDelete) {
      if (value === undefined && toDelete) {
        delete window[prop];
      } else if (isPropConfigurable(window, prop) && typeof prop !== 'symbol') {
        Object.defineProperty(window, prop, {
          writable: true,
          configurable: true
        });
        window[prop] = value;
      }
    }


    function getTargetValue(target, value) {
      /*
        仅绑定 isCallable && !isBoundedFunction && !isConstructable 的函数对象，如 window.console、window.atob 这类。目前没有完美的检测方式，这里通过 prototype 中是否还有可枚举的拓展方法的方式来判断
        @warning 这里不要随意替换成别的判断方式，因为可能触发一些 edge case（比如在 lodash.isFunction 在 iframe 上下文中可能 由于调用了 top window 对象触发的安全异常）
       */
      if (isCallable(value) && !isBoundedFunction(value) && !isConstructable(value)) {
        const boundValue = Function.prototype.bind.call(value, target);
        for (const key in value) {
          boundValue[key] = value[key];
        }
        if (value.hasOwnProperty('prototype') && !boundValue.hasOwnProperty('prototype')) {
          Object.defineProperty(boundValue, 'prototype', {
            value: value.prototype,
            enumerable: false,
            writable: true
          });
        }

        return boundValue;
      }

      return value;
    }

    /**
     * 基于 Proxy 实现的沙箱
     */
    class SingularProxySandbox {
      /** 沙箱期间新增的全局变量 */
      addedPropsMapInSandbox = new Map();
    
      /** 沙箱期间更新的全局变量 */
      modifiedPropsOriginalValueMapInSandbox = new Map();
    
      /** 持续记录更新的(新增和修改的)全局变量的 map，用于在任意时刻做 snapshot */
      currentUpdatedPropsValueMap = new Map();
    
      name;
    
      proxy;
    
      type = 'LegacyProxy';
    
      sandboxRunning = true;
    
      latestSetProp = null;
    
      active() {
        if (!this.sandboxRunning) {
          this.currentUpdatedPropsValueMap.forEach((v, p) => setWindowProp(p, v));
        }
    
        this.sandboxRunning = true;
      }
    
      inactive() {
        // console.log(' this.modifiedPropsOriginalValueMapInSandbox', this.modifiedPropsOriginalValueMapInSandbox)
        // console.log(' this.addedPropsMapInSandbox', this.addedPropsMapInSandbox)
        //删除添加的属性，修改已有的属性
        this.modifiedPropsOriginalValueMapInSandbox.forEach((v, p) => setWindowProp(p, v));
        this.addedPropsMapInSandbox.forEach((_, p) => setWindowProp(p, undefined, true));
    
        this.sandboxRunning = false;
      }
    
      constructor(name) {
        this.name = name;
        const {
          addedPropsMapInSandbox,
          modifiedPropsOriginalValueMapInSandbox,
          currentUpdatedPropsValueMap
        } = this;
    
        const rawWindow = window;
        //Object.create(null)的方式，传入一个不含有原型链的对象
        const fakeWindow = Object.create(null); 
    
        const proxy = new Proxy(fakeWindow, {
          set: (_, p, value) => {
            if (this.sandboxRunning) {
              if (!rawWindow.hasOwnProperty(p)) {
                addedPropsMapInSandbox.set(p, value);
              } else if (!modifiedPropsOriginalValueMapInSandbox.has(p)) {
                // 如果当前 window 对象存在该属性，且 record map 中未记录过，则记录该属性初始值
                const originalValue = rawWindow[p];
                modifiedPropsOriginalValueMapInSandbox.set(p, originalValue);
              }
    
              currentUpdatedPropsValueMap.set(p, value);
              // 必须重新设置 window 对象保证下次 get 时能拿到已更新的数据
              rawWindow[p] = value;
    
              this.latestSetProp = p;
    
              return true;
            }
    
            // 在 strict-mode 下，Proxy 的 handler.set 返回 false 会抛出 TypeError，在沙箱卸载的情况下应该忽略错误
            return true;
          },
    
          get(_, p) {
            //避免使用 window.window 或者 window.self 逃离沙箱环境，触发到真实环境
            if (p === 'top' || p === 'parent' || p === 'window' || p === 'self') {
              return proxy;
            }
            const value = rawWindow[p];
            return getTargetValue(rawWindow, value);
          },
    
          has(_, p) { //返回boolean
            return p in rawWindow;
          },
    
          getOwnPropertyDescriptor(_, p) {
            const descriptor = Object.getOwnPropertyDescriptor(rawWindow, p);
            // 如果属性不作为目标对象的自身属性存在，则不能将其设置为不可配置
            if (descriptor && !descriptor.configurable) {
              descriptor.configurable = true;
            }
            return descriptor;
          },
        });
    
        this.proxy = proxy;
      }
    }

    let sandbox = new SingularProxySandbox();

    ((window) => {
      window.name = '张三';
      window.age = 18;
      window.sex = '男';
      console.log(window.name, window.age,window.sex) //    张三,18,男
      sandbox.inactive() //    还原
      console.log(window.name, window.age,window.sex) //    张三,undefined,undefined
      sandbox.active() //    激活
      console.log(window.name, window.age,window.sex) //    张三,18,男
    })(sandbox.proxy); //test
  ```


  ### proxySandbox(多例沙箱)

  > 在 qiankun 的沙箱 proxySandbox 源码里面是对 fakeWindow 这个对象进行了代理，而这个对象是通过 createFakeWindow 方法得到的，这个方法是将 window 的 document、location、top、window 等等属性拷贝一份，给到 fakeWindow。
  ```js
    function createFakeWindow(global: Window) {
      // map always has the fastest performance in has check scenario
      // see https://jsperf.com/array-indexof-vs-set-has/23
      const propertiesWithGetter = new Map<PropertyKey, boolean>();
      const fakeWindow = {} as FakeWindow;

  /*
   copy the non-configurable property of global to fakeWindow
   see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor
   > A property cannot be reported as non-configurable, if it does not exists as an own property of the target object or if it exists as a configurable own property of the target object.
   */
  Object.getOwnPropertyNames(global)
    .filter((p) => {
      const descriptor = Object.getOwnPropertyDescriptor(global, p);
      return !descriptor?.configurable;
    })
    .forEach((p) => {
      const descriptor = Object.getOwnPropertyDescriptor(global, p);
      if (descriptor) {
        const hasGetter = Object.prototype.hasOwnProperty.call(descriptor, 'get');

        /*
         make top/self/window property configurable and writable, otherwise it will cause TypeError while get trap return.
         see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/get
         > The value reported for a property must be the same as the value of the corresponding target object property if the target object property is a non-writable, non-configurable data property.
         */
        if (
          p === 'top' ||
          p === 'parent' ||
          p === 'self' ||
          p === 'window' ||
          (process.env.NODE_ENV === 'test' && (p === 'mockTop' || p === 'mockSafariTop'))
        ) {
          descriptor.configurable = true;
          /*
           The descriptor of window.window/window.top/window.self in Safari/FF are accessor descriptors, we need to avoid adding a data descriptor while it was
           Example:
            Safari/FF: Object.getOwnPropertyDescriptor(window, 'top') -> {get: function, set: undefined, enumerable: true, configurable: false}
            Chrome: Object.getOwnPropertyDescriptor(window, 'top') -> {value: Window, writable: false, enumerable: true, configurable: false}
           */
          if (!hasGetter) {
            descriptor.writable = true;
          }
        }

        if (hasGetter) propertiesWithGetter.set(p, true);

        // freeze the descriptor to avoid being modified by zone.js
        // see https://github.com/angular/zone.js/blob/a5fe09b0fac27ac5df1fa746042f96f05ccb6a00/lib/browser/define-property.ts#L71
        rawObjectDefineProperty(fakeWindow, p, Object.freeze(descriptor));
      }
    });

  return {
    fakeWindow,
    propertiesWithGetter,
  };
  }
  ```
  > proxySandbox 由于是拷贝复制了一份 fakeWindow，不会污染全局 window，同时支持多个子应用同时加载。