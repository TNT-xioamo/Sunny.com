---
title: 斐波那契
tags: [typeScript]
index_img: /article-img/Cover.jpg
categories: 前端
date: 2023-10-13
---
# 不使用typescript的计算能力，而通过类型来推算斐波那契数列
  <!--more-->

# 斐波那契
  > 虽然大家都熟悉斐波那契了，还是简单的说说吧，一个知名的数学数列，地推方式如下
    - Fib(0) = 0
    - Fib(1) = 1
    - Fib(n) = Fib(n-1) + Fib(n-2)
  最后得出来的数列就是
    0, 1, 1, 2, 3, 5, 8, 13, 21, 34


# 斐波那契的实现

  >介绍完斐波那契后，再来看看 typescript 类型推算要解决核心点
  - 第 0 和第 1 个数返回自身
  - 某个数等于前两个数相加
  - 推算一个数需要循环或者递归得到前两个值
  - 输入的只能是数字，且不能是负数

  > 分析完我们再来看看 typescript 能够提供哪些，缺少哪些？

  ### 第一个问题：第 0 和第 1 个数返回自身
    - 这个满足，可以通过 extends 来实现
    ```ts
      type GetSelf<T> = T extends 0 | 1 ? T : never; // 测试
      type Test0 = GetSelf<0>; // 0
      type Test1 = GetSelf<1>; // 1
      type Test2 = GetSelf<2>; // never
    ```
  ### 第二个问题：某个数等于前两个数相加
    - 这个就开始麻烦了，因为 typesript 中是没有加法运算的，也就是说 1 + 2 = 的结果 typescript 并不知道，所以列一个 todo

    需要实现完整的加法

  ### 第三个问题：推算一个数需要循环或者递归得到前两个值
    看看 typescript 中模拟递归的写法呢，是有的，比如实现一个链表，这个类型它将会一直递归下去，因为没有结束循环

    ```ts
      type Node<T> = {
        val: T;
        next: Node<T>;
      };
    ```
    不过怎么跳出循环，另外我们需要的是一个值，而不是返回一个对象，再列一个 todo

    需要实现完整的递归

  ### 第四个问题：输入的只能是数字，且不能是负数

    > 输入的只能是数字，且不能是负数
  限定数字很好做，extends number 就可以判断了，判断负数呢？
    > 负数和正数有啥区别呢？
  负数多个符号显示，那改造成字符串后的长度和正数不等是吧，尝试

    ```ts
      type len1 = "123"["length"]; // number
      type len2 = number[]["length"]; // number;
      type len3 = [1, 2, 3]["length"]; // 3
      type len4 = [number, string, string]["length"]; // 3
    ```

    字符串和未定义的数组的长度竟然无法推算，看起来只有元组是可以的。

    负数比 0 小，可是 typescript 中没有比较大小的操作，再列一个 todo:

    - 需要实现非负数判断

  ### 结论
    我们可以解决第一个问题，同时得知可以通过 length 来获取元组长度。
    todo 如下：
      - 如何实现加法运算
      - 如何实现循环或者递归计算，并有跳出条件
      - 如何判断非负数


# 解决 todo
  ### +1 操作
  > 虽然上一轮大部分功能没有推算出来，但是得到一个有用的结论，元组是可以得到 length 的值。
    那 +1 操作 是不是可以理解成 PUSH 操作 后拿出 length 了？尝试

    ```ts
    type Push<T extends Array<number>, P extends number> = [...T, P];
    type arr1 = [1, 2];
    type arr2 = Push<arr1, 3>; // [1, 2, 3]
    type len1 = arr1["length"]; // 2
    type len2 = arr2["length"]; // 3
    ```
  确实实现了 +1 操作 ，加法应该是可以解决了，+n 就是循环 n 次，结束条件就是结果为 n。
  所以加法运算最后可以转成元组后计算长度，类似 JavaScript的Array(n).fill(0)，第一步实现 数字转 array

  ### 递归实现数字转 array
  > 需要循环自身，需要记录循环后的值，最后再条件达成后返回这个值，同理 fib(n) = fib(n-1) + fib(n-2) 也需要类似的递归实现。
    我们用 loop 来存递归操作，用result来存返回值，循环结束的条件是 数组的长度等于传入的值 ，而泛型返回的是一个对象，可以通过 key 去获取对应的 value

  ```ts
    type ArrOf<T extends number, P extends Array<0> = []> = {
      ["loop"]: ArrOf<T, [...P, 0]>;
      ["result"]: P;
    }[P["length"] extends T ? "result" : "loop"];

    type arrof1 = ArrOf<5>; // [0, 0, 0, 0, 0]

  ```
  因为我们需要递归后再跳出条件，最后返回值，所以可以构造一个对象后获取 key，而 key 就是跳出循环的关键，跳出循环的判断就是 元组的长度等于输入的数

  ### 加法运算

  > 基于以上，我们可以得到 add 的完整实现了
  ```ts
    type ADD<A extends number, B extends number> = [
      ...ArrOf<A>,
      ...ArrOf<B>
    ]["length"];

    type add1 = ADD<3, 4>; // 7
  ```
  虽然可以推算出结果，但是报了一个 warning
  ```xml
    A rest element type must be an array type.
  ```
  > 可能他推算不出来返回的是 array，所以需要我们声明 ArrOf 返回的数都是 array，类似 Array.from
  ```ts
    type ArrFrom<T> = T extends Array<T> ? T : T;

    type ADD<A extends number, B extends number> = [
      ...ArrFrom<ArrOf<A>>,
      ...ArrFrom<ArrOf<B>>
    ]["length"];
  ```
  加法和递归都被搞定了，接下来看看非负数的问题

  ### 非负数判断

  > 再重新看看之前的分析，负数有什么特殊的地方，负数多个符号显示，且符号固定是第一位

  ```ts
    type str11 = "abcde";
    type str12 = str11[0]; // string
  ```
  > 看来并不能通过下标来取巧，那我们只能获取第一位判断是否为 "-"号，这时候就需要用上 infer 占位来赋值变量并获取

  ```ts
    type getFirst<T extends string> = T extends `${infer P}${string}` ? P : T;

    type str11 = 'abcde';
    type str12 = getFirst<str11>; // a
  ```

  > 所以我们可以把数字转换字符串后求得符号，然后得出负数的判断，这里需要提前把传入的数字转成字符串，可以通过 模板字符串 来实现

  ```ts
    type FirstStr<T extends number> = `${T}` extends `${infer P}${string}` ? P : T;

    type isFu<T extends number> = FirstStr<T> extends '-' ? true : false;

    type isFu1 = isFu<0>; // false
    type isFu2 = isFu<12>; // false
    type isFu3 = isFu<-6>; // true
    type isFu4 = isFu<-0>; // true
  ```

  # 实现斐波那契

  ### 实现加法
  - 通过递归实现数字转元组
  - 两个元组合并到一个元组
  - 通过length求长度

  ```ts
    type ArrOf<T extends number, P extends Array<0> = []> = {
        ['loop']: ArrOf<T, [...P, 0]>;
        ['result']: P;
    }[P['length'] extends T ? 'result' : 'loop'];

    type ArrFrom<T> = T extends Array<T> ? T : T;

    type ADD<A extends number, B extends number> = [
        ...ArrFrom<ArrOf<A>>,
        ...ArrFrom<ArrOf<B>>
    ]['length'];

    type NumberFrom<T> = T extends number ? T : T & number;

    type ADD2<A extends number,
        B extends number
    > = NumberFrom<ADD<A, B>>;
  ```

  ### 实现非负数判断

  - 将输入的数字转字符串
  - 获取首位符号，判断是否等于符号 "-"
  ```ts
    type FirstStr<T extends number> = `${T}` extends `${infer P}${string}` ? P : T; // 添加负数判断
    type isFu<T extends number> = FirstStr<T> extends '-' ? true : false;
  ```

  ### 实现斐波那契函数

  - 第 0 和第 1 个数返回自身
  - 通过递归实现 Fib(n) = Fib(n-1) + Fib(n-2)
  ```ts
    type FIB<T extends number,
        A extends number = 0,
        B extends number = 1,
        N extends number = 0
    > = isFu<T> extends true
        ? never
        : T extends 0 | 1
    ? T
    : {
        ['loop']: FIB<T, B, ADD2<A, B>, ADD2<N, 1>>;
        ['result']: B;
    }[T extends ADD2<N, 1> ? 'result' : 'loop'];

  ```


