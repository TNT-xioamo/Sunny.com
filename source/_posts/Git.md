---
title: Git常用命令
tags: [Git, 版本控制]
index_img: /article-img/git.jpg
categories: 版本控制
date: 2021-08-27
---

## Git 常用命令

  <!--more-->
### 配置
```js
  ## 显示当前的Git配置
  $ git config --list
  ## 编辑Git配置文件
  $ git config -e [--global]

  ## 设置提交代码时的用户信息
  $ git config [--global] user.name "[name]"
  $ git config [--global] user.email "[email address]"
```

### 基础命令
  ``` 
    # 跟github建立链接（电脑里面要安装git)
    gitk 打开图形界面
    git clone 地址
    git status(看状态)
    git add.(提交)
    git commit -m '项目初始仓库' (提交到本地)
    git commit --amend  追加提交
    git push(提交到服务器）
    git push origin master -f 强制推送 or 我们只需加上 --rebase 参数然后再重新 push 一次即可
    git pull origin master (拉取)
    git push -u origin master  将本地的master分支推送到origin主机，同时指定origin为默认主机，后面就可以不加任何参数使用git push了。
    git fetch <远程主机名> <分支名> //这个命令将某个远程主机的更新全部取回本地
    git pull 


    git fetch origin
    git merge origin/master

    git pull --rebase 


    git fetch origin
    git rebase origin/master
    #合并方法更简单，更容易理解。但是很多时候我们更需要的是rebase
  ```
### 分支命令

  ```
    git checkout -b 名称 创建一个分支并切换
    git branch -d  名称  删除分支
    git branch -D  名称  强制删除
    git push origin --delete  名称 删除远程分支(慎用)
    git checkout 名称  切换分支
    git branch 查看当前目录下的所有分支
    git push origin dev 提交到dev分支
    git config branch.feature_20150713_hd-123.description 备注给分支添加备注信息
    git config branch.{branch_name}.description  查看
          安装  npm i -g git-br  插件
    git br 查看所有分支备注
    git checkout -t origin/远程分支名  拉取远程分支并切换到该分支
    git push -u origin (新创建的分支如果第一次push该分支后面需加-u origin是云端的别名 同时为云端也新建一个分支例如 goods_cate)
    git merge 其他分支的名字 合并其他分支的代码
    git rm -r --cached . 清缓存  (.gitignore 更新之后需要清缓存)
  ```