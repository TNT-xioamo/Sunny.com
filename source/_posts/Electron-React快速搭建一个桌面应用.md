---
title: 桌面端开发
tags: [React, MacOs]
index_img: /article-img/v3.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-08-31
mermaid: true
---
「时光不负，创作不停」
  <!--more-->

## 记录学习桌面开发
 > Electron 是一个由 GitHub 开发的开源库，通过将 Chromium) 和Node.js 组合并使用 HTML，CSS 和 JavaScript 进行构建 Mac，Windows，和 Linux 跨平台桌面应用程序。
 原理： 上面已将说了，Electron 通过将 Chromium 和 Node.js 组合到单个 runtime 中来实现的.

 > Chromium:
  Chromium 或许你没听说过，但是你一定听说过 chrome 吧！Chromium 是 Google 的开源浏览器，是 chrome 背后的那个不太稳定更新快的兄弟版，详情戳这里。

  ### 快速开发 main入口文件

  ```js
  // 引入electron并创建一个Browserwindow
    const { app, BrowserWindow } = require('electron')
    const path = require('path')
    const url = require('url')

    // 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
    let mainWindow

    function createWindow () {
    //创建浏览器窗口,宽高自定义具体大小你开心就好
    mainWindow = new BrowserWindow({width: 800, height: 600})

      /* 
       * 加载应用-----  electron-quick-start中默认的加载入口
        mainWindow.loadURL(url.format({
          pathname: path.join(__dirname, './build/index.html'),
          protocol: 'file:',
          slashes: true
        }))
      */
      // 加载应用----适用于 react 项目
      mainWindow.loadURL('http://localhost:3000/');

      // 打开开发者工具，默认不打开
      // mainWindow.webContents.openDevTools()

      // 关闭window时触发下列事件.
      mainWindow.on('closed', function () {
        mainWindow = null
      })
    }

    // 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
    app.on('ready', createWindow)

    // 所有窗口关闭时退出应用.
    app.on('window-all-closed', function () {
      // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('activate', function () {
       // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
      if (mainWindow === null) {
        createWindow()
      }
    })
 
// 你可以在这个脚本中续写或者使用require引入独立的js文件. 
  ```
  ### package 
  ```js
    {
      "name": "my-app",
      "version": "0.1.0",
      "private": true,
      "main": "main.js", // 这里 配置启动文件
      "homepage":".", // 这里
      "dependencies": {
        "electron": "^1.7.10",
        "react": "^16.2.0",
        "react-dom": "^16.2.0",
        "react-scripts": "1.1.0"
      },
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test --env=jsdom",
        "eject": "react-scripts eject",
        "electron-start": "electron ." // 这里 配置electron的start，区别于web端的start
      }
    }

  ```
  ### 自动更新
  > 说到更新，其实electron官方也给我们提供了它的更新方案，但是着实不是太好用，并且electron-builder官方也提供了相关的更新方案，也就是electron-updater，接下来我们需要修改一下main.js，让我们的应用能够在检测到新版本时自动完成应用的更新。
  我们打开main.js，在这个文件中加入如下代码：
  ```js
    ...
    const { autoUpdater } = require('electron-updater');
    ...
    
    ... other code
    
    // 定义返回给渲染层的相关提示文案
    const message = {
        error: '检查更新出错',
        checking: '正在检查更新……',
        updateAva: '检测到新版本，正在下载……',
        updateNotAva: '现在使用的就是最新版本，不用更新',
    };
    
    // 这里是为了在本地做应用升级测试使用
    if (isDev) {
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
    }
    
    // 主进程跟渲染进程通信
    const sendUpdateMessage = (text) => {
        // 发送消息给渲染进程
        mainWindow.webContents.send('message', text);
    };
    
    // 设置自动下载为false，也就是说不开始自动下载
    autoUpdater.autoDownload = false;
    // 检测下载错误
    autoUpdater.on('error', (error) => {
        sendUpdateMessage(`${message.error}:${error}`);
    });
    // 检测是否需要更新
    autoUpdater.on('checking-for-update', () => {
        sendUpdateMessage(message.checking);
    });
    // 检测到可以更新时
    autoUpdater.on('update-available', () => {
        // 这里我们可以做一个提示，让用户自己选择是否进行更新
        dialog.showMessageBox({
            type: 'info',
            title: '应用有新的更新',
            message: '发现新版本，是否现在更新？',
            buttons: ['是', '否']
        }).then(({ response }) => {
            if (response === 0) {
                // 下载更新
                autoUpdater.downloadUpdate();
                sendUpdateMessage(message.updateAva);
            }
        });
        
        // 也可以默认直接更新，二选一即可
        // autoUpdater.downloadUpdate();
        // sendUpdateMessage(message.updateAva);
    });
    // 检测到不需要更新时
    autoUpdater.on('update-not-available', () => {
        // 这里可以做静默处理，不给渲染进程发通知，或者通知渲染进程当前已是最新版本，不需要更新
        sendUpdateMessage(message.updateNotAva);
    });
    // 更新下载进度
    autoUpdater.on('download-progress', (progress) => {
        // 直接把当前的下载进度发送给渲染进程即可，有渲染层自己选择如何做展示
        mainWindow.webContents.send('downloadProgress', progress);
    });
    // 当需要更新的内容下载完成后
    autoUpdater.on('update-downloaded', () => {
        // 给用户一个提示，然后重启应用；或者直接重启也可以，只是这样会显得很突兀
        dialog.showMessageBox({
            title: '安装更新',
            message: '更新下载完毕，应用将重启并进行安装'
        }).then(() => {
            // 退出并安装应用
            setImmediate(() => autoUpdater.quitAndInstall());
        });
    });
    // 我们需要主动触发一次更新检查
    ipcMain.on('checkForUpdate', () => {
        // 当我们收到渲染进程传来的消息，主进程就就进行一次更新检查
        autoUpdater.checkForUpdates();
    });
    // 当前引用的版本告知给渲染层
    ipcMain.on('checkAppVersion', () => {
        mainWindow.webContents.send('version', app.getVersion());
    });
  ```
  > 写到这里，我们只完成了主进程的更新代码，而主进程的更新是需要通知到渲染层才能展示给用户看到的。前面我们也说了，electron12以后的版本不推荐直接在渲染层获取electron上的方法进行通信，那我们该如何在主进程和渲染进程之间进行通信以便展示我们的更新内容呢？
  还记得我们前面预留的preload.js吧！，前面我们也简单介绍了一下该文件，这个文件其实起到的一个作用就是作为一个中间桥梁，方便我们在渲染层使用electron相关的能力，同时又不会把node相关的操作能力暴露给渲染层，大大加强了我们应用的安全性，那么preload.js具体该怎么操作呢？下面的代码会详细的介绍。
  ```js
    const { contextBridge, ipcRenderer } = require('electron');
    const ipc = {
        render: {
            // 主进程发出的通知
            send: [],
            // 渲染进程发出的通知
            receive: [],
        },
    };
    // 通过contextBridge将electron注入到渲染进程的window上面，我们只需要访问window.electron，即可访问到相关的内容
    contextBridge.exposeInMainWorld('electron', {
        ipcRenderer,
        ipcRender: {
            // 主进程发送通知给渲染进程
            send: (channel, data) => {
                const validChannels = ipc.render.send;
                if (validChannels.includes(channel)) {
                  ipcRenderer.send(channel, data);
                }
            },
            // 渲染进程监听到主进程发来的通知，执行相关的操作
            receive: (channel, func) => {
                const validChannels = ipc.render.receive;
                if (validChannels.includes(channel)) {
                    ipcRenderer.on(`${channel}`, (event, ...args) => func(...args));
                }
            }
        }
    });
  ```
  > 由于我们无法直接在渲染进程中调用electron的ipcRenderer进行通信，所以我们只能借助preload.js这个第三方文件。
  最后我们再来说一下在渲染进程中如何进行更新操作。
  在React应用中，有一个app.js，在这个文件中，咱们可以做electron应用的自动更新检测，只需要在页面加载完毕后，渲染进程给主进程主动发送一个通知，主进程就会自动去检测当前版本以及线上版本是否相同，如果不同就会给渲染进程通知，告诉渲染进程有新版本可以进行更新，具体代码如下：
  ```js
    import React, { useState, useEffect } from 'react';
    const { ipcRender } = window.electron;

    const App = () => {
        // 页面上的提示信息
        const [text, setText] = useState('');
        // 当前应用版本信息
        const [version, setVersion] = useState('0.0.0');
        // 当前下载进度
        const [progress, setProgress] = useState(0);

        useEffect(() => {
            // 给主进程发通知，让主进程告诉我们当前应用的版本是多少
            ipcRender.send('checkAppVersion');
            // 接收主进程发来的通知，检测当前应用版本
            ipcRender.receive("version", (version) => {
                setVersion(version);
            });

            // 给主进程发通知，检测当前应用是否需要更新
            ipcRender.send('checkForUpdate');
            // 接收主进程发来的通知，告诉用户当前应用是否需要更新
            ipcRender.receive('message', data => {
                setText(data);
            });
            // 如果当前应用有新版本需要下载，则监听主进程发来的下载进度
            ipcRender.receive('downloadProgress', data => {
                const progress = parseInt(data.percent, 10);
                setProgress(progress);
            });
        }, []);

        return (
            <div>
                <p>current app version: {version}</p>
                <p>{text}</p>
                {progress ? <p>下载进度：{progress}%</p> : null}
            </div>
        )
    };

    export default App;
  ```
  > 上述的代码中，我们给主进程发通知，并且接收主进程发来的通知，由于前面说了我们无法直接发送，需要通过preload.js来进行一次转发，因此我们还需要修改一下preload.js以便我们的代码能够正常的运行。

  ```js
  // preload.js
    const ipc = {
        render: {
            // 主进程发出的通知
            send: ['checkForUpdate', 'checkAppVersion'],
            // 渲染进程发出的通知
            receive: ['version', 'downloadProgress'],
        },
    };
  ```
  > 只有在ipc对象中存在的通知，主进程才会接收到。
  写到这里，其实我们还差一步，那就是部署到服务器才能做应用的版本检测及更新，那么我们需要有一个自己的服务器吗？答案是否定的，当前你如果有自己的服务器也可以，只需要将打包后的文件上传到自己的服务器，并修改一下package.json中的相关配置，即可通过自己的服务器进行更新下载，但是我们这里选择使用GitHub Actions来进行自动更新和打包。
  我们打开package.json，在"build"配置中继续添加如下的配置信息：
  ```js
    "build": {
      ...other code
      "publish": [
          {
              "provider": "github",
              "owner": "你的GitHub用户名",
              "repo": "你的GitHub上的项目名称"
          }
      ]
    }
  ```

  ### 自动打包

  > 自动更新讲完了，但是目前为止还不能做到自动更新，因为应用还没有打包发到服务器上面去，自动更新其实是拉取远程的包，并判断本地应用的版本跟远程应用的版本是否一致，如果不一致才需要走自动更新的流程。前面我也说了我们需要用到GitHub Actions来做自动打包，那么GitHub Actions该怎么使用呢？大家可以看一下阮一峰老师的GitHub Actions 入门教程，里面有大概的介绍，我这里就不做过多的赘述，按照阮一峰老师的教程把基础的配置都做好，我们只需要添加对应的文件即可，在根路径下需要创建一个.github文件夹，然后需要在里面继续创建workflows文件夹，最后在workflows文件夹中创建一个执行文件build.yml，也可以叫其它任意名字，只要后缀是yml即可。具体的代码如下:
  ```js
    // build.yml
    name: Build

    on:
        push:
            branches:
              - master

    jobs:
        release:
            name: build and release electron app
            runs-on: ${{ matrix.os }}

        strategy:
            fail-fast: false
            matrix:
              os: [windows-latest, macos-latest, ubuntu-latest]

        steps:
            - name: Check out git repository
              uses: actions/checkout@v3.0.0

            - name: Install Node.js
              uses: actions/setup-node@v3.0.0
              with:
                node-version: "16"

            - name: Install Dependencies
              run: npm install

            - name: Build Electron App
              run: npm run dist
              env:
                GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}

            - name: Cleanup Artifacts for Windows
              if: matrix.os == 'windows-latest'
              run: |
                npx rimraf "dist/!(*.exe)"

            - name: Cleanup Artifacts for MacOS
              if: matrix.os == 'macos-latest'
              run: |
                npx rimraf "dist/!(*.dmg)"

            - name: upload artifacts
              uses: actions/upload-artifact@v3.0.0
              with:
                name: ${{ matrix.os }}
                path: dist

            - name: release
              uses: softprops/action-gh-release@v0.1.14
              if: startsWith(github.ref, 'refs/tags/')
              with:
                files: "dist/**"
              env:
                GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
  ```
  > 当我们把上述文件创建后，需要到GitHub上面创建一个项目，然后把我们这个项目的远程仓库指向我们刚刚在GitHub创建的项目即可。然后就可以执行代码的提交了，当代码提交到GitHub后，因为我们添加了自动的执行文件build.yml，当GitHub检测到在workflows中带有yml的文件后，就会自动执行里面的命令，从而帮助我们进行项目的打包。
  需要注意一点的是，我们需要把代码提交到master分支，GitHub才会自动帮我们进行打包，或者将上述代码中的branches下的master换成你自己的分支名称，当匹配到对应的分支名称后，就会自动进行打包。
  打包成功后，我们需要在GitHub中这个项目的右侧找到Releases，点击进入，我们会看到一个预发布的按钮，点击它进入到发布页面，添加上当前发布版本的更新内容，然后点击底部的确定按钮，最终应用就完成了自动的打包和发布。

