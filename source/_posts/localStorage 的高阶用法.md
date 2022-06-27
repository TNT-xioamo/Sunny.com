---
title: localStorage
tags: [js，前端]
index_img: /article-img/Fall.jpg
categories: 
date: 2022-06-27
mermaid: true
---
# localStorage 或 sessionStorage的一些高级用法
<!-- more -->
### 设计
    封装之前先梳理下所需功能，并要做成什么样，采用什么样的规范，部分主要代码片段是以 localStorage作为示例，最后会贴出完整代码的。可以结合项目自行优化，也可以直接使用。
```js
  // 区分存储类型 type
// 自定义名称前缀 prefix
// 支持设置过期时间 expire
// 支持加密可选，开发环境下未方便调试可关闭加密

// 支持数据加密 这里采用 crypto-js 加密 也可使用其他方式

// 判断是否支持 Storage isSupportStorage

// 设置 setStorage

// 获取 getStorage

// 是否存在 hasStorage

// 获取所有key getStorageKeys

// 根据索引获取key getStorageForIndex

// 获取localStorage长度 getStorageLength

// 获取全部 getAllStorage

// 删除 removeStorage

// 清空 clearStorage

//定义参数 类型 window.localStorage,window.sessionStorage,
const config = {
    type: 'localStorage', // 本地存储类型 localStorage/sessionStorage
    prefix: 'SDF_0.0.1', // 名称前缀 建议：项目名 + 项目版本
    expire: 1, //过期时间 单位：秒
    isEncrypt: true // 默认加密 为了调试方便, 开发过程中可以不加密
}

```

### 设置 setStorage
Storage 本身是不支持过期时间设置的，要支持设置过期时间，可以效仿 Cookie 的做法，setStorage(key,value,expire) 方法，接收三个参数，第三个参数就是设置过期时间的，用相对时间，单位秒，要对所传参数进行类型检查。可以设置统一的过期时间，也可以对单个值得过期时间进行单独配置。两种方式按需配置。
```js
  // 设置 setStorage
export const setStorage = (key,value,expire=0) => {
    if (value === '' || value === null || value === undefined) {
        value = null;
    }

    if (isNaN(expire) || expire < 1) throw new Error("Expire must be a number");

    expire = (expire?expire:config.expire) * 60000;
    let data = {
        value: value, // 存储值
        time: Date.now(), //存值时间戳
        expire: expire // 过期时间
    }

    window[config.type].setItem(key, JSON.stringify(data));
}
```

### 获取 getStorage
首先要对 key 是否存在进行判断，防止获取不存在的值而报错。对获取方法进一步扩展，只要在有效期内获取 Storage 值，就对过期时间进行续期，如果过期则直接删除该值。并返回 null
```js
  // 获取 getStorage
export const getStorage = (key) => {
    // key 不存在判断
    if (!window[config.type].getItem(key) || JSON.stringify(window[config.type].getItem(key)) === 'null'){
        return null;
    }

    // 优化 持续使用中续期
    const storage = JSON.parse(window[config.type].getItem(key));
    console.log(storage)
    let nowTime = Date.now();
    console.log(config.expire*6000 ,(nowTime - storage.time))
    // 过期删除
    if (storage.expire && config.expire*6000 < (nowTime - storage.time)) {
        removeStorage(key);
        return null;
    } else {
        // 未过期期间被调用 则自动续期 进行保活
        setStorage(key,storage.value);
        return storage.value;
    }
}
```

### 获取所有值
```js
// 获取全部 getAllStorage
export const getAllStorage = () => {
    let len = window[config.type].length // 获取长度
    let arr = new Array() // 定义数据集
    for (let i = 0; i < len; i++) {
        // 获取key 索引从0开始
        let getKey = window[config.type].key(i)
        // 获取key对应的值
        let getVal = window[config.type].getItem(getKey)
        // 放进数组
        arr[i] = { 'key': getKey, 'val': getVal, }
    }
    return arr
}
```

### 删除 removeStorage

```js
// 名称前自动添加前缀
const autoAddPrefix = (key) => {
    const prefix = config.prefix ? config.prefix + '_' : '';
    return  prefix + key;
}

// 删除 removeStorage
export const removeStorage = (key) => {
    window[config.type].removeItem(autoAddPrefix(key));
}
```

### 清空 clearStorage
```js
// 清空 clearStorage
export const clearStorage = () => {
    window[config.type].clear();
}
```
### 加密、解密
加密采用的是 crypto-js
```js
// 安装crypto-js
npm install crypto-js

// 引入 crypto-js 有以下两种方式
import CryptoJS from "crypto-js";
// 或者
const CryptoJS = require("crypto-js");
```
对 crypto-js 设置密钥和密钥偏移量,可以采用将一个私钥经 MD5 加密生成16位密钥获得。
```js
// 十六位十六进制数作为密钥
const SECRET_KEY = CryptoJS.enc.Utf8.parse("3333e6e143439161");
// 十六位十六进制数作为密钥偏移量
const SECRET_IV = CryptoJS.enc.Utf8.parse("e3bbe7e3ba84431a");
```
对加密方法进行封装
```js
/**
 * 加密方法
 * @param data
 * @returns {string}
 */
export function encrypt(data) {
  if (typeof data === "object") {
    try {
      data = JSON.stringify(data);
    } catch (error) {
      console.log("encrypt error:", error);
    }
  }
  const dataHex = CryptoJS.enc.Utf8.parse(data);
  const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString();
}
```
对解密方法进行封装
```js
/**
 * 解密方法
 * @param data
 * @returns {string}
 */
export function decrypt(data) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
  const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
    iv: SECRET_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}
```
在存储数据及获取数据中进行使用：
这里我们主要看下进行加密和解密部分，部分方法在下面代码段中并未展示，请注意，不能直接运行。

```js
const config = {
    type: 'localStorage', // 本地存储类型 sessionStorage
    prefix: 'SDF_0.0.1', // 名称前缀 建议：项目名 + 项目版本
    expire: 1, //过期时间 单位：秒
    isEncrypt: true // 默认加密 为了调试方便, 开发过程中可以不加密
}

// 设置 setStorage
export const setStorage = (key, value, expire = 0) => {
    if (value === '' || value === null || value === undefined) {
        value = null;
    }

    if (isNaN(expire) || expire < 0) throw new Error("Expire must be a number");

    expire = (expire ? expire : config.expire) * 1000;
    let data = {
        value: value, // 存储值
        time: Date.now(), //存值时间戳
        expire: expire // 过期时间
    }
    // 对存储数据进行加密 加密为可选配置
    const encryptString = config.isEncrypt ? encrypt(JSON.stringify(data)): JSON.stringify(data);
    window[config.type].setItem(autoAddPrefix(key), encryptString);
}

// 获取 getStorage
export const getStorage = (key) => {
    key = autoAddPrefix(key);
    // key 不存在判断
    if (!window[config.type].getItem(key) || JSON.stringify(window[config.type].getItem(key)) === 'null') {
        return null;
    }

    // 对存储数据进行解密
    const storage = config.isEncrypt ? JSON.parse(decrypt(window[config.type].getItem(key))) : JSON.parse(window[config.type].getItem(key));
    let nowTime = Date.now();
    
    // 过期删除
    if (storage.expire && config.expire * 6000 < (nowTime - storage.time)) {
        removeStorage(key);
        return null;
    } else {
        //  持续使用时会自动续期
        setStorage(autoRemovePrefix(key), storage.value);
        return storage.value;
    }
}
```

### 使用
使用的时候你可以通过 import 按需引入，也可以挂载到全局上使用，一般建议少用全局方式或全局变量，为后来接手项目继续开发维护的人，追查代码留条便捷之路！不要为了封装而封装，尽可能基于项目需求和后续的通用，以及使用上的便捷。比如获取全部存储变量，如果你项目上都未曾用到过，倒不如删减掉，留着过年也不见得有多香，不如为减小体积做点贡献！
```js
import {isSupportStorage, hasStorage, setStorage,getStorage,getStorageKeys,getStorageForIndex,getStorageLength,removeStorage,getStorageAll,clearStorage} from '@/utils/storage'
```

### 完整代码

废话不多说，直接上完整代码

```js
  /***
 * title: storage.js
 * Author: Gaby
 * Email: xxx@126.com
 * Time: 2022/6/1 17:30
 * last: 2022/6/2 17:30
 * Desc: 对存储的简单封装
 */
 
import CryptoJS from 'crypto-js';

// 十六位十六进制数作为密钥
const SECRET_KEY = CryptoJS.enc.Utf8.parse("3333e6e143439161");
// 十六位十六进制数作为密钥偏移量
const SECRET_IV = CryptoJS.enc.Utf8.parse("e3bbe7e3ba84431a");

// 类型 window.localStorage,window.sessionStorage,
const config = {
    type: 'localStorage', // 本地存储类型 sessionStorage
    prefix: 'SDF_0.0.1', // 名称前缀 建议：项目名 + 项目版本
    expire: 1, //过期时间 单位：秒
    isEncrypt: true // 默认加密 为了调试方便, 开发过程中可以不加密
}

// 判断是否支持 Storage
export const isSupportStorage = () => {
    return (typeof (Storage) !== "undefined") ? true : false
}

// 设置 setStorage
export const setStorage = (key, value, expire = 0) => {
    if (value === '' || value === null || value === undefined) {
        value = null;
    }

    if (isNaN(expire) || expire < 0) throw new Error("Expire must be a number");

    expire = (expire ? expire : config.expire) * 1000;
    let data = {
        value: value, // 存储值
        time: Date.now(), //存值时间戳
        expire: expire // 过期时间
    }
    
    const encryptString = config.isEncrypt 
    ? encrypt(JSON.stringify(data))
    : JSON.stringify(data);
    
    window[config.type].setItem(autoAddPrefix(key), encryptString);
}

// 获取 getStorage
export const getStorage = (key) => {
    key = autoAddPrefix(key);
    // key 不存在判断
    if (!window[config.type].getItem(key) || JSON.stringify(window[config.type].getItem(key)) === 'null') {
        return null;
    }

    // 优化 持续使用中续期
    const storage = config.isEncrypt 
    ? JSON.parse(decrypt(window[config.type].getItem(key))) 
    : JSON.parse(window[config.type].getItem(key));
    
    let nowTime = Date.now();

    // 过期删除
    if (storage.expire && config.expire * 6000 < (nowTime - storage.time)) {
        removeStorage(key);
        return null;
    } else {
        // 未过期期间被调用 则自动续期 进行保活
        setStorage(autoRemovePrefix(key), storage.value);
        return storage.value;
    }
}

// 是否存在 hasStorage
export const hasStorage = (key) => {
    key = autoAddPrefix(key);
    let arr = getStorageAll().filter((item)=>{
        return item.key === key;
    })
    return arr.length ? true : false;
}

// 获取所有key
export const getStorageKeys = () => {
    let items = getStorageAll()
    let keys = []
    for (let index = 0; index < items.length; index++) {
        keys.push(items[index].key)
    }
    return keys
}

// 根据索引获取key
export const getStorageForIndex = (index) => {
    return window[config.type].key(index)
}

// 获取localStorage长度
export const getStorageLength = () => {
    return window[config.type].length
}

// 获取全部 getAllStorage
export const getStorageAll = () => {
    let len = window[config.type].length // 获取长度
    let arr = new Array() // 定义数据集
    for (let i = 0; i < len; i++) {
        // 获取key 索引从0开始
        let getKey = window[config.type].key(i)
        // 获取key对应的值
        let getVal = window[config.type].getItem(getKey)
        // 放进数组
        arr[i] = {'key': getKey, 'val': getVal,}
    }
    return arr
}

// 删除 removeStorage
export const removeStorage = (key) => {
    window[config.type].removeItem(autoAddPrefix(key));
}

// 清空 clearStorage
export const clearStorage = () => {
    window[config.type].clear();
}

// 名称前自动添加前缀
const autoAddPrefix = (key) => {
    const prefix = config.prefix ? config.prefix + '_' : '';
    return  prefix + key;
}

// 移除已添加的前缀
const autoRemovePrefix = (key) => {
    const len = config.prefix ? config.prefix.length+1 : '';
    return key.substr(len)
    // const prefix = config.prefix ? config.prefix + '_' : '';
    // return  prefix + key;
}

/**
 * 加密方法
 * @param data
 * @returns {string}
 */
const encrypt = (data) => {
    if (typeof data === "object") {
        try {
            data = JSON.stringify(data);
        } catch (error) {
            console.log("encrypt error:", error);
        }
    }
    const dataHex = CryptoJS.enc.Utf8.parse(data);
    const encrypted = CryptoJS.AES.encrypt(dataHex, SECRET_KEY, {
        iv: SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString();
}

/**
 * 解密方法
 * @param data
 * @returns {string}
 */
const decrypt = (data) => {
    const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
    const str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const decrypt = CryptoJS.AES.decrypt(str, SECRET_KEY, {
        iv: SECRET_IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}
```