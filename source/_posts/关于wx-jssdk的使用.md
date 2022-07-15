---
title: 前端wx-jssdk
tags: [前端]
index_img: /article-img/v4.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-07-04
mermaid: true
---

「时光不负，创作不停」
  <!--more-->

  ### 一、前端wx-jssdk的使用

  #### 1. 导入包
    在main.ts (以vite+react项目中为例),为什么在main.ts中进行使用呢？其实在index.html文件中调用也是可以的，因为我要用到一些公共方法，并且保证要完成加载在线wx-jssdk包完后，再进行挂载等步，实现异步变同步处理更方便，就放在main.ts中。放在index.html 并保证异步变同步完全加载完wx-jssdk包就行，即：支持使用 AMD/CMD 标准模块加载方法加载
  ```js
    import React from 'react';
    import ReactDOM from 'react-dom';
    import { BrowserRouter } from 'react-router-dom';
    import App from './app';
    import { getEnv，WECHAT_ENV  } from '@/utils';
    //import '@/utils/setup.ts';
    //import '@/assets/css/reset.less';
    //import '@/assets/css/base.less';
    //import '@/assets/font/iconfont.css';

    const script = document.createElement('script');
    // @ts-ignore
    script.crossorigin = 'anonymous';
    const sdkVerion = getEnv() === WECHAT_ENV.qyWechat ? 'jweixin-1.2.0.js' : 'jweixin-1.6.0.js';
    // 开发环境和线上环境的wxsdk的路径有所区别
    // script.src = process.env.NODE_ENV === 'development' ? `./public/lib/${sdkVerion}` : `./lib/${sdkVerion}`;
    script.src = `https://res.wx.qq.com/open/js/${sdkVerion}`;
    script.onerror = () => {
      console.log('qy-wx-sdk:loadError');
    };

    script.onload = () => {
      console.log({ wx });
      ReactDOM.render(
        <BrowserRouter basename={`/${import.meta.env.VITE_APP_NAME}`}>
          <App />
        </BrowserRouter>,
        document.getElementById('root')
      );
    };
    document.head.appendChild(script);
  ```

  #### 2. 如何使用
    wx-jssdk提供了企微和微信环境下的一些方法进行使用：（[wx-jssdk的接口文档]https://qydev.weixin.qq.com/wiki/index.php?title=%E5%BE%AE%E4%BF%A1JS-SDK%E6%8E%A5%E5%8F%A3), [企业微信-wxjssdk](https://developer.work.weixin.qq.com/document/path/94313)）
  
    封装的 getTicket
  ```js
    import ajax from '@/utils/ajax';
    import { ConfigOptions, JSApiList } from 'wx-jssdk';
    import { getEnv，WECHAT_ENV  } from '@/utils';    

    // 普通签名
    export const getTicket = async (jsApiList, callback, isShowError = true, maxRequestCount = 3) => {
      // 开发+真机调试模式，要初始化JS_SDK 
      if (process.env.NODE_ENV === 'development' && !process.env.WX_JS_SDK_ENABLED) return;
      let url = '';
      // 如果是 iOS 设备，则使用第一次进入App时的 URL 去请求 wxConfig，不然的话会导致 iOS 中分享的链接描述信息或者图标不对
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent) && env === 2) {
        url = encodeURIComponent(localStorage.getItem('entryUrl'));// 有保存在localstorage中的页面路径
      } else {
        // console.log('签名地址=======================', window.location.href)
        url = encodeURIComponent(window.location.href);
      }
      const params = {
        appId: newAppId || appId,
        corpId: env === 2 ? authCorpId : currentCorpId,
        wechatType: env,
        jsUrl: url,
        agentId,
      };
      console.log('getTicket', `path=${location.pathname}  url=${decodeURIComponent(params.jsUrl)}`);
      try {
        const res = await ajax('getTicket', params, isShowError); // 后端定义的接口  这里的ajax是自定义的
        const { retdata = {} } = res;
        const { appId, noncestr, signature, timestamp, nextUpdateTime } = retdata;
        const obj = {
          debug: false, // 是否开启调试模式
          appId, // appid
          timestamp, // 时间戳
          nonceStr: noncestr, // 随机字符串
          signature, // 签名
          jsApiList,
          openTagList: ['wx-open-launch-weapp'],
        };
        if (env === 1) {
          obj.beta = true;
          obj.appId = currentCorpId;
        }
        wx.config(obj);
        wx.ready(function () {
          if (typeof callback === 'function') callback(jsApiList);
        });
        wx.error((res) => {
          console.log('%c zjs wx.error res:', 'color: #0e93e0;background: #aaefe5;', res);
          if (typeof callback === 'function' && maxRequestCount > 0) callback(new Error('error'));
        });
      } catch (e) {
        console.log('%c zjs getTicket err:', 'color: #0e93e0;background: #aaefe5;', e);
        setTimeout(() => {
          maxRequestCount > 0 && getTicket(jsApiList, callback, isShowError, --maxRequestCount);
        }, 1000);
      }
    };    

    // 企业微信下一些自建应用签名
    export const agentConfig = async (
      jsApiList: JSApiList[],
      callback: Function,
      shareUrl = '',
      isShowError = true,
      maxRequestCount = 3
    ) => {
      getTicket(
        [...jsApiList, 'agentConfig'],
        async (error: string) => {
          if (error === 'error') {
            // 过期或者签名错误 重新获取
            setTimeout(() => {
              maxRequestCount > 0 && agentConfig(jsApiList, callback, shareUrl, isShowError, --maxRequestCount);
            }, 1000);
          } else {
            const params = {
              type: WECHAT_ENV.qyWechat,
              jsUrl: window.location.href,
            };
            const res = await ajax({ api: 'getTicket', params });   

            const { retdata = {} } = res;
            const { corpId: corpid, noncestr: nonceStr, agentid, signature, timestamp }: any = retdata;   

            wx.checkJsApi({
              jsApiList: ['agentConfig'],
              success(res) {
                console.log(res);
              },
            });
            const obj = {
              corpid, // 必填，企业微信的corpid，必须与当前登录的企业一致
              agentid, // 必填，企业微信的应用id
              timestamp, // 必填，生成签名的时间戳
              nonceStr, // 必填，生成签名的随机串
              signature, // 必填，签名，见附录1
              jsApiList,
              // openTagList: ['wx-open-launch-weapp'],
              success: (res: ILooseStrObj) => {
                console.log('agentConfig ok', res);
                if (typeof callback === 'function') callback(jsApiList);
              },
              fail(res: ILooseStrObj) {
                console.log('agentConfig fail', res);
                if (typeof callback === 'function') callback('error');
              },
            };
            console.log('agentConfig obj', obj);
            wx.agentConfig(obj);
          }
        },
        shareUrl
      );
    };

  ```

    一些公用方法
  ```js
    export const WECHAT_ENV = {
      qyWechat: 1, // 企业微信
      wechat: 2, // 微信
    };
    // 判断当前是微信环境还是企业微信环境
    export const getEnv = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      // eslint-disable-next-line
      if (Boolean(ua.match(/MicroMessenger/i)) && Boolean(ua.match(/wxwork/i))) {
        // 企业微信
        // console.log('企业微信环境-1')
        return WECHAT_ENV.qyWechat;
        // eslint-disable-next-line
      } else if (Boolean(ua.match(/micromessenger/i))) {
        // 微信
        // console.log('微信环境-2')
        return WECHAT_ENV.wechat;
      }
    };

    // 判断是pc端还是移动端
    export const isPC = !/Android|webOS|iPhone|iPod|BlackBerry|SymbianOS|Windows Phone/i.test(navigator.userAgent);

    /**
     * [changeSearch description]
     * @param  {[type]} oldName 需要修改的search字段
     * @param  {[type]} newStr 替换的新串
     * @param  {[type]} url 当前要替换的link地址  不传默认是  window.location.search
     * @return {[type]}         [description]
     */
    export const changeSearch = (oldName: string, newStr: string, url: string) => {
      const jsonObj: any = searchToJson(url || window.location.search);
      if (!oldName) {
        return url;
      }
      jsonObj[oldName] = newStr;
      const linkUrl = url.split('?')[0] + jsonToSearch(jsonObj);
      return linkUrl;
    };

    /** 将url的search部分转化为json
     *  @param url:String -- url地址
     *  @param codeURI:Boolean -- 是否解码
     */
    export const searchToJson = (url = window.location.href, codeURI = false) => {
      let setUrl: string = url || '';
      const search = setUrl.split('?');
      let result = {};
      search.forEach((item, index) => {
        if (index !== 0) {
          result = item.split('&').reduce((obj, item) => {
            const arr = item.split('=');
            return { ...obj, [arr[0]]: codeURI ? decodeURIComponent(arr[1]) : arr[1] };
          }, result);
        }
      });
      return result;
    };

    // 获取url参数
    export const getUrlQueryString = (search: string, name: string) => {
      const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
      const r = search.substr(1).match(reg);
      if (r !== null) {
        return r[2];
      }
      return '';
    };

  ```

  ### 二：弃用系统自带的分享，自己写弹框，触发分享API

  #### 1. 转发：shareAppMessage，微信好友：shareWechatMessage，微信朋友圈：shareTimeline，这几个直接使用wx.invoke即可

  ```js

  // 微信好友
  const forwardWeChat = () => {
    const shareConfig = {
      title, // 分享标题
      desc, // 分享描述
      link: "linkUrl", // 分享链接
      imgUrl: "imgUrl" , // 分享封面
    };
    console.log('企微-微信好友 shareConfig', shareConfig);
    wx.invoke('shareWechatMessage', shareConfig, (res: any) => {
      console.log('企微分享微信好友-分享回调', res);
      if (res.err_msg === 'shareWechatMessage:ok') {
        //
      }
     });
 	};

  ```

  #### 2. 企微朋友圈：shareToExternalMoments，群发客户：shareToExternalContact；群发客户群：shareToExternalChat，比微信下多了agentConfig处理，是因为这三个api需要配置客户联系功能与版本
  ```js
  import { JSApiList } from 'wx-jssdk';
  import { agentConfig } from '@/utils/getTicket'
  // 群发客户群
  const groupShareGroup = async (e: any) => {
    const arrAgent: JSApiList[] = ['shareToExternalChat'];
    agentConfig(
      arrAgent,
      () => {
        wxInvokeShare('shareToExternalChat', {
          title, // 分享标题
          desc,
          link: "linkUrl", // 分享链接
          imgUrl:"imgUrl", // 分享封面
        });
      },
      linkUrl
    );
  };

  ```
  ### 三：禁用个人微信或企微右上角分享等功能

  - 企微：hiddenWxQyShareOption，使用API：wx.hideOptionMenu(), wx.showMenuItems()
  - 微信：hiddenWxShareOption ,使用：WeixinJSBridge.call('hideToolbar'); WeixinJSBridge.call('hideOptionMenu');

函数封装shareFuc、企微和个人微信系统分享等功能禁用封装
  ```js
    // @ts-nocheck
    import globalData from '@/config/globalData';
    import keyDict from '@/config/keyDict';
    import point from '@/config/point';
    import { changeSearch, getEnv, searchToJson, getUrlQueryString, isPC， WECHAT_ENV  } from '@/utils';//上面公用方法
    import ajax from '@/utils/ajax';
    import { getTicket } from '@/utils/getTicket';// 上面定义封装处理
    import { JSApiList } from 'wx-jssdk';

    interface IShareProps {
      title: string;
      desc: string;
      linkUrl: string;
      imgUrl: string;
      userId: string;
      cb?: () => void;
    }

    interface IShareFunProps {
      shareObj: IShareProps;
      jsApiList: JSApiList[];
      maxRequestCount: number;
    }

    /**
     * [shareFuc description]
     * @param  {[type]}  shareObj { title: 标题, desc: 描述, linkUrl: 分享地址（会对地址做拼接，默认不传为当前url）, imgUrl: 分享icon, staffId: 经理id，拼接给分享地址}
     * @param  {Array}   [jsApiList=[微信api]]
     * @return {Promise}                [description]
     * @param  {type}   maxRequestCount 最大失败请求次数，默认 为 3次
     */

    export const shareFuc = async (shareObj: IShareProps, jsApiList = [], maxRequestCount = 3) => {
      // console.log('shareObj===》', shareObj);

      const defaultJsApi: JSApiList[] = ['onMenuShareAppMessage', 'onMenuShareTimeline', 'getLocation', 'previewImage'];

      // 不支持在PC端微信使用js-sdk功能
      if (isPC) return;

      const ua = navigator.userAgent.match(/MicroMessenger\/([\d\\.]+)/i);
      const lowerWeChat = ua ? ua[1] < '6.7.2' : true;
      // 微信
      if (getEnv() === 2) {
        defaultJsApi.push('updateAppMessageShareData', 'updateTimelineShareData');
      }
      getTicket(
        [...defaultJsApi, ...jsApiList],
        async (error: string) => {
          if (error === 'error') {
            // 过期或者签名错误   重新获取
            setTimeout(() => {
              if (maxRequestCount > 0) {
                maxRequestCount = --maxRequestCount;
                shareFuc(shareObj, jsApiList, maxRequestCount);
              }
            }, 1000);
          } else {
            // 企业微信（微信）下隐藏部分不需要的菜单功能--如分享到同事吧，收藏，转发，微信，朋友圈
            if (getEnv() === 2) {
              wx.hideOptionMenu();
              wx.showMenuItems({
                menuList: [
                  'menuItem:copyUrl', // 复制链接
                ],
                // wx.hideMenuItems({
                //   menuList: [
                //     // 'menuItem:setFont', // 字体
                //     // 'menuItem:openWithSafari', // Safari
                //     // 'menuItem:share:email', // 邮件
                //     // 'menuItem:openWithQQBrowser', // QQBrowser
                //     // 'menuItem:share:appMessage', // 转发
                //     // 'menuItem:share:timeline', // 朋友圈
                //     // 'menuItem:share:wechat', // 微信
                //   ], // 要隐藏的菜单项
                // });
              });
            }
            const { title = '', desc = '', imgUrl = '', linkUrl, cb } = shareObj;
            // 个人微信处理
            if (getEnv() === 2) {
              // 分享给朋友
              if (wx.updateAppMessageShareData && !lowerWeChat) {
                wx.updateAppMessageShareData({
                  title, // 分享标题
                  desc, // 分享描述
                  link: linkUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                  imgUrl, // 分享图标
                  success: () => {
                    console.log('微信分享给朋友,新Api,没有成功回调');
                  },
                });
              } else {
                wx.onMenuShareAppMessage({
                  title, // 分享标题
                  desc, // 分享描述
                  link: linkUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                  imgUrl, // 分享图标
                  type: undefined, // 分享类型,music、video或link，不填默认为link
                  dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                  success: () => {
                    // 用户点击了分享后执行的回调函数
                    console.log('微信分享给朋友,旧Api');
                  },
                });
              }
              // 分享给朋友圈
              if (wx.updateTimelineShareData && !lowerWeChat) {
                wx.updateTimelineShareData({
                  title, // 分享标题
                  link: linkUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                  imgUrl, // 分享图标
                  success: () => {
                    // 设置成功
                    console.log('微信分享给朋友圈,新Api');
                  },
                });
              } else {
                wx.onMenuShareTimeline({
                  title, // 分享标题
                  link: linkUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                  imgUrl, // 分享图标
                  success: () => {
                    // 设置成功
                    console.log('微信分享给朋友圈,旧Api');
                  },
                });
              }
            } else {
              // 企业微信
              wx.onMenuShareAppMessage({
                title, // 分享标题
                desc, // 分享描述
                link: linkUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl, // 分享图标
                success: () => {},
                cancel: () => {},
              });
              wx.onMenuShareTimeline({
                title, // 分享标题
                link: linkUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl, // 分享图标
                success: () => {
                  // 设置成功
                  console.log('企业微信分享给朋友圈,旧Api');
                },
                cancel: () => {
                  // 用户取消分享后执行的回调函数
                  console.log('企业微信分享给朋友圈,旧Api,cancel');
                },
              });
            }

            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            cb && cb();
          }
        },
        shareObj.linkUrl,
        false,
        maxRequestCount
      );
    };

    /**
     * 禁止企业微信右上角分享（新版本企微是下方）
     * **/
    let wxConfigTimer: number;
    export const hiddenWxQyShareOption = () => {
      if (getEnv() === WECHAT_ENV.qyWechat) {
        wxConfigTimer && clearTimeout(wxConfigTimer);
        wxConfigTimer = window.setTimeout(() => {
          getTicket([], () => {
            console.log('企业微信环境屏蔽右上角分享');
            wx.hideOptionMenu();
            wx.showMenuItems({
              menuList: ['menuItem:copyUrl'], //保留复制链接
            });
          });
        }, 200);
      }
    };

    /** 禁止微信右上角分享按钮 */
    export const hiddenWxShareOption = () => {
      if (getEnv() === WECHAT_ENV.wechat) {
        console.log('禁用微信右上角分享和状态栏');
        if (typeof WeixinJSBridge === 'undefined') {
          // 这个可以禁用安卓系统的右上角分享     （只针对微信端）
          document.addEventListener(
            'WeixinJSBridgeReady',
            function () {
              WeixinJSBridge.call('hideToolbar');
              WeixinJSBridge.call('hideOptionMenu');
            },
            false
          );
        } else {
          // 这个可以禁用ios系统的右上角分享      （只针对微信端）
          WeixinJSBridge.call('hideToolbar');
          WeixinJSBridge.call('hideOptionMenu');
        }
      }
    };

  ```
  
  