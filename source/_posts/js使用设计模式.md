---
title: js 设计模式
tags: [javaScript]
index_img: /article-img/Cover.jpg
categories: 前端
date: 2023-01-03
---

  「时光不负，创作不停」
  <!--more-->
  # 设计模式简介

  > 设计模式代表了最佳的实践，通常被有经验的面向对象的软件开发人员所采用。设计模式是软件开发人员在软件开发过程中面临的一般问题的解决方案。这些解决方案是众多软件开发人员经过相当长的一段时间的试验和错误总结出来的。

  # 设计模式原则
  - <font color="#74cdde" size=3 face=""> 「S – Single Responsibility Principle 单一职责原则」 </font>

    -  一个程序只做好一件事
    - 如果功能过于复杂就拆分开，每个部分保持独立

  -  <font color="#74cdde" size=3 face=""> 「 O – OpenClosed Principle 开放/封闭原则 」 </font> 

    - 对扩展开放，对修改封闭
    - 增加需求时，扩展新代码，而非修改已有代码
  
  - <font color="#74cdde" size=3 face=""> 「 L – Liskov Substitution Principle 里氏替换原则 」 </font> 

    - 子类能覆盖父类
    - 父类能出现的地方子类就能出现
  
  -  <font color="#74cdde" size=3 face=""> 「 I – Interface Segregation Principle 接口隔离原则 」 </font>

    - 保持接口的单一独立
    - 类似单一职责原则，这里更关注接口
  
  - <font color="#74cdde" size=3 face=""> 「 D – Dependency Inversion Principle 依赖倒转原则 」 </font>

    - 面向接口编程，依赖于抽象而不依赖于具体
    - 使用方只关注接口而不关注具体类的实现
  
  ## SO体现较多，举个栗子：（比如Promise）

    - 单一职责原则：每个then中的逻辑只做好一件事
    - 开放封闭原则（对扩展开放，对修改封闭）：如果新增需求，扩展then

    - 再举个栗子：
    ```js
    let checkType=function(str, type) {
      switch (type) {
          case 'email':
              return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str)
          case 'mobile':
              return /^1[3|4|5|7|8][0-9]{9}$/.test(str);
          case 'tel':
              return /^(0\d{2,3}-\d{7,8})(-\d{1,4})?$/.test(str);
          default:
              return true;
      }
    }

    ```
    > 以下有两个问题
    - 如果想添加其他规则就得在函数里面增加 case 。添加一个规则就修改一次！这样违反了开放-封闭原则（对扩展开放，对修改关闭）。而且这样也会导致整个 API 变得臃肿，难维护。（代码规范不得超过80行）
    - 比如A需要添加一个金额的校验，B需要一个日期的校验，但是金额的校验只在A需要，日期的校验只在B需要。如果一直添加 case 。就是导致A把只在B需要的校验规则也添加进去，造成不必要的开销。B也同理。

    > 进行改造
    
    ```js
      let checkType = (() => {
        let rules = {
          email(str) {
            return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(str)
          },
          mobile(str){
            return /^1[3|4|5|7|8][0-9]{9}$/.test(str)
          }
        }

        // 暴露接口提供扩展
        return {
          // 校验
          check(str, type){
            return rules[type]?rules[type](str):false;
          },
          // 扩展规则
          addRule(type,fn){
            rules[type] = fn
          }
        }
      })

      // 如何使用
      console.log(checkType.check('18729321052','mobile'))

      // 添加规则
      checkType.addRule('money',function (str) {
        return /^[0-9]+(.[0-9]{2})?$/.test(str)
      })
      // 使用添加的规则
      console.log(checkType.check('18.36','money'))

    ```

    ## 设计模式分类（23种设计模式）

    - 创建型
      - 单例模式
      - 原型模式
      - 工厂模式
      - 抽象工厂模式
      - 建造者模式
    - 结构型
      - 适配器模式
      - 装饰器模式
      - 代理模式
      - 外观模式
      - 桥接模式
      - 组合模式
      - 享元模式
    - 行为型
      - 观察者模式
      - 迭代器模式
      - 策略模式
      - 模板方法模式
      - 职责链模式
      - 命令模式
      - 备忘录模式
      - 状态模式
      - 访问者模式
      - 中介者模式
      - 解释器模式

    ### 工厂模式
    > 工厂模式定义一个用于创建对象的接口，这个接口由子类决定实例化哪一个类。该模式使一个类的实例化延迟到了子类。而子类可以重写接口方法以便创建的时候指定自己的对象类型。

    > 举个 🌰
    ```js
      class Product {
        constructor(name) {
          this.name = name
        }
        init() {
          console.log('init')
        }
        fun() {
          console.log('fun')
        }
      }
      class Factory {
        create(name) {
          return new Product(name)
        }
      }
      // use
      let factory = new Factory()
      let p = factory.create('p1')
      p.init()
      p.fun()
    ```
    > 单独适用场景
    - 如果你不想让某个子系统与较大的那个对象之间形成强耦合，而是想运行时从许多子系统中进行挑选的话，那么工厂模式是一个理想的选择
    - 将new操作简单封装，遇到new的时候就应该考虑是否用工厂模式；
    - 需要依赖具体环境创建不同实例，这些实例都有相同的行为,这时候我们可以使用工厂模式，简化实现的过程，同时也可以减少每种对象所需的代码量，有利于消除对象间的耦合，提供更大的灵活性
    > 举个 🌰 ，我们熟悉的jquery

    ```js
    class jQuery {
        constructor(selector) {
            super(selector)
        }
        add() {
            
        }
    // 此处省略API
    }

    window.$ = function(selector) {
      return new jQuery(selector)
    }
    ```
  > 再举个🌰， VUE的异步组件
  - 在大型应用中，我们可能需要将应用分割成小一些的代码块，并且只在需要的时候才从服务器加载一个模块，为了简化，Vue 允许以一个工厂函数的方式定义组件， 这个工厂函数会异步解析组件定义。Vue 只有在这个组件需要被渲染的时候才会触发该工厂函数，且会把结果缓存起来供未来重渲染。（不得不说这个学室内艺术和艺术史的 尤小右 ，真的好强）例如：

  ```js
    Vue.component('async-example', function (resolve, reject) {
      setTimeout(function () {
        // 向 `resolve` 回调传递组件定义
        resolve({
          template: '<div>I am async!</div>'
        })
      }, 1000)
    })

  ```
  ### 状态模式
  > 允许一个对象在其内部状态改变的时候改变它的行为，对象看起来似乎修改了它的类
  ```javascript
    // 状态 （弱、强、关）
    class State {
        constructor(state) {
            this.state = state
        }
        handle(context) {
            console.log(`this is ${this.state} light`)
            context.setState(this)
        }
    }
    class Context {
        constructor() {
            this.state = null
        }
        getState() {
            return this.state
        }
        setState(state) {
            this.state = state
        }
    }
    // test 
    let context = new Context()
    let weak = new State('weak')
    let strong = new State('strong')
    let off = new State('off')

    // 弱
    weak.handle(context)
    console.log(context.getState())

    // 强
    strong.handle(context)
    console.log(context.getState())

    // 关
    off.handle(context)
    console.log(context.getState())
  ```

  > 单独适用场景
    - 一个对象的行为取决于它的状态，并且它必须在运行时刻根据状态改变它的行为
    - 一个操作中含有大量的分支语句，而且这些分支语句依赖于该对象的状态

  ### 策略模式
  > 定义一系列算法，把它们一个个封装起来，并且使它们可以互相替换

  - 举个 🌰
  ```xml
    <html>
    <head>
        <title>策略模式-校验表单</title>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
    </head>
    <body>
        <form id = "registerForm" method="post" action="http://xxxx.com/api/register">
            用户名：<input type="text" name="userName">
            密码：<input type="text" name="password">
            手机号码：<input type="text" name="phoneNumber">
            <button type="submit">提交</button>
        </form>
        <script type="text/javascript">
            // 策略对象
            const strategies = {
              isNoEmpty: function (value, errorMsg) {
                if (value === '') {
                  return errorMsg;
                }
              },
              isNoSpace: function (value, errorMsg) {
                if (value.trim() === '') {
                  return errorMsg;
                }
              },
              minLength: function (value, length, errorMsg) {
                if (value.trim().length < length) {
                  return errorMsg;
                }
              },
              maxLength: function (value, length, errorMsg) {
                if (value.length > length) {
                  return errorMsg;
                }
              },
              isMobile: function (value, errorMsg) {
                if (!/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[7]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(value)) {
                  return errorMsg;
                }                
              }
            }

            // 验证类
            class Validator {
              constructor() {
                this.cache = []
              }
              add(dom, rules) {
                for(let i = 0, rule; rule = rules[i++];) {
                  let strategyAry = rule.strategy.split(':')
                  let errorMsg = rule.errorMsg
                  this.cache.push(() => {
                    let strategy = strategyAry.shift()
                    strategyAry.unshift(dom.value)
                    strategyAry.push(errorMsg)
                    return strategies[strategy].apply(dom, strategyAry)
                  })
                }
              }
              start() {
                for(let i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
                  let errorMsg = validatorFunc()
                  if (errorMsg) {
                    return errorMsg
                  }
                }
              }
            }

            // 调用代码
            let registerForm = document.getElementById('registerForm')

            let validataFunc = function() {
              let validator = new Validator()
              validator.add(registerForm.userName, [{
                strategy: 'isNoEmpty',
                errorMsg: '用户名不可为空'
              }, {
                strategy: 'isNoSpace',
                errorMsg: '不允许以空白字符命名'
              }, {
                strategy: 'minLength:2',
                errorMsg: '用户名长度不能小于2位'
              }])
              validator.add(registerForm.password, [ {
                strategy: 'minLength:6',
                errorMsg: '密码长度不能小于6位'
              }])
              validator.add(registerForm.phoneNumber, [{
                strategy: 'isMobile',
                errorMsg: '请输入正确的手机号码格式'
              }])
              return validator.start()
            }

            registerForm.onsubmit = function() {
              let errorMsg = validataFunc()
              if (errorMsg) {
                alert(errorMsg)
                return false
              }
            }
        </script>
    </body>
    </html>
  ```
  > 单独适用场景
    - 如果在一个系统里面有许多类，它们之间的区别仅在于它们的'行为'，那么使用策略模式可以动态地让一个对象在许多行为中选择一种行为。
    - 一个系统需要动态地在几种算法中选择一种。
    - 表单验证
  > 优点
    - 利用组合、委托、多态等技术和思想，可以有效的避免多重条件选择语句
    - 提供了对开放-封闭原则的完美支持，将算法封装在独立的strategy中，使得它们易于切换，理解，易于扩展
    - 利用组合和委托来让Context拥有执行算法的能力，这也是继承的一种更轻便的代替方案
  > 缺点
    - 会在程序中增加许多策略类或者策略对象
    - 要使用策略模式，必须了解所有的strategy，必须了解各个strategy之间的不同点，这样才能选择一个合适的strategy
  
  ### 享元模式
  > 运用共享技术有效地支持大量细粒度对象的复用。系统只使用少量的对象，而这些对象都很相似，状态变化很小，可以实现对象的多次复用。由于享元模式要求能够共享的对象必须是细粒度对象，因此它又称为轻量级模式，它是一种对象结构型模式

  - 举个 🌰

  ```javascript
    let examCarNum = 0         // 驾考车总数
    /* 驾考车对象 */
    class ExamCar {
        constructor(carType) {
            examCarNum++
            this.carId = examCarNum
            this.carType = carType ? '手动档' : '自动档'
            this.usingState = false    // 是否正在使用
        }

        /* 在本车上考试 */
        examine(candidateId) {
            return new Promise((resolve => {
                this.usingState = true
                console.log(`考生- ${ candidateId } 开始在${ this.carType }驾考车- ${ this.carId } 上考试`)
                setTimeout(() => {
                    this.usingState = false
                    console.log(`%c考生- ${ candidateId } 在${ this.carType }驾考车- ${ this.carId } 上考试完毕`, 'color:#f40')
                    resolve()                       // 0~2秒后考试完毕
                }, Math.random() * 2000)
            }))
        }
    }

    /* 手动档汽车对象池 */
    ManualExamCarPool = {
        _pool: [],                  // 驾考车对象池
        _candidateQueue: [],        // 考生队列

        /* 注册考生 ID 列表 */
        registCandidates(candidateList) {
            candidateList.forEach(candidateId => this.registCandidate(candidateId))
        },

        /* 注册手动档考生 */
        registCandidate(candidateId) {
            const examCar = this.getManualExamCar()    // 找一个未被占用的手动档驾考车
            if (examCar) {
                examCar.examine(candidateId)           // 开始考试，考完了让队列中的下一个考生开始考试
                  .then(() => {
                      const nextCandidateId = this._candidateQueue.length && this._candidateQueue.shift()
                      nextCandidateId && this.registCandidate(nextCandidateId)
                  })
            } else this._candidateQueue.push(candidateId)
        },

        /* 注册手动档车 */
        initManualExamCar(manualExamCarNum) {
            for (let i = 1; i <= manualExamCarNum; i++) {
                this._pool.push(new ExamCar(true))
            }
        },

        /* 获取状态为未被占用的手动档车 */
        getManualExamCar() {
            return this._pool.find(car => !car.usingState)
        }
    }

    ManualExamCarPool.initManualExamCar(3)          // 一共有3个驾考车
    ManualExamCarPool.registCandidates([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])  // 10个考生来考试
  ```
    > 单独使用场景
    - 文件上传需要创建多个文件实例的时候
    - 如果一个应用程序使用了大量的对象，而这些大量的对象造成了很大的存储开销时就应该考虑使用享元模式
    > 优点
    - 大大减少对象的创建，降低系统的内存，使效率提高。
    > 缺点
    - 提高了系统的复杂度，需要分离出外部状态和内部状态，而且外部状态具有固有化的性质， 不应该随着内部状态的变化而变化，否则会造成系统的混乱 (微应用沙箱天然分离)
