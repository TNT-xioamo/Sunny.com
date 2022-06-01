---
title: 一些Filter的特效
tags: [前端，CSS]
index_img: /article-img/v5.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-06-01
mermaid: true
---

「时光不负，创作不停」

  <!--more-->

## css3 的 filter

属性(滤镜)是用来定义元素（通常是 图片）的视觉效果的，其功能简单易用且强大，可以对网页中的图片进行类似 Photoshop 处理图片的效果，通过滤镜对图片进行处理，能使一张图片呈现各种不同的视觉效果。

### 单属性用法

filter: none | blur() | brightness() | contrast() | drop-shadow() | grayscale() | hue-rotate() | invert() | opacity() | saturate() | sepia() | url();

### 多属性

filter: blur(5px) opacity(0.8) brightness(0.8);

### 应用

- 电影谢幕效果

```css
<style>
  .title{
    margin: 20px;
    font-size: 25px;
  }
  .pic{
    height: 100%;
    width: 100%;
    position: absolute;
    background: url('./images/movies-picture1.jpeg') no-repeat;
    background-size: cover;
    animation: fade-away 4s linear forwards;
    /*animation-fill-mode forwards当动画完成后，保持最后一帧的状态 */
  }
  .text{
    position: absolute;
    line-height: 55px;
    color: #fff;
    font-size: 36px;
    text-align: center;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    filter: opacity(0);
    animation: show 4s cubic-bezier(.74,-0.1,.86,.83) forwards;
  }
  /* 背景图的明暗度动画 */
  @keyframes fade-away {
      30%{
          filter: brightness(1);
      }
      100%{
          filter: brightness(0);
      }
  }
  /* 文字的透明度动画 */
  @keyframes show{
      20%{
          filter: opacity(0);
      }
      100%{
          filter: opacity(1);
      }
  }
</style>
```

- 模糊效果
```css
  <style>
    .title{
        margin: 20px;
        font-size: 25px;
    }
    .cards{
        display: flex;
        justify-content: center;
    }
    .card{
        width: 300px;
        height: 400px;
        color: white;
        font-size: 20px;
        margin: 0 30px;
        padding: 0 20px;
    }
    .text{
        padding: 0 15px;
    }
    .card:hover{
        cursor: pointer;
    }


    .card:before{
        width: 300px;
        height: 400px;
        z-index: -1;
        content: '';
        position: absolute;
        background: url('./images/movies-picture1.jpeg') no-repeat center;
        background-size: cover;
        border-radius: 20px;
        transition: filter 200ms linear, transform 200ms linear;
    }
    /* 通过css选择器选出非hover的.card元素，给其伪类添加模糊、透明度和明暗度的滤镜  */
    .cards:hover > .card:not(:hover):before{
        filter: blur(5px) opacity(0.8)  brightness(0.8);
    }
    /* 对于hover的元素，其伪类增强饱和度，尺寸放大 */
    .card:hover:before{
        filter: saturate(2);
        transform: scale(1.05);
    }
  </style>
```

- 融合效果
```css
<style>
    .title{
        margin: 20px;
        font-size: 25px;
    }
    .container{
        margin: 50px auto;
        height: 140px;
        width: 400px;
        background: #fff;   /*给融合元素的父元素设置背景色*/
        display: flex;
        align-items: center;
        justify-content: center;
        filter: contrast(50);    /*给融合元素的父元素设置contrast*/
    }
    .circle{
        border-radius: 50%;
        filter: blur(10px);    /*给融合元素设置blur*/
    }
    .circle-1{
        height: 110px;
        width: 110px;
        background: #03a9f4;
    }
    .circle-2{
        height: 80px;
        width: 80px;
        background: #0000ff;
        transform: translate(-40px);
    }
</style>
```
- 融合效果之文字融合
```css
<style>
    .title{
        margin: 20px;
        font-size: 25px;
    }
    .container{
        margin-top: 50px;
        text-align: center;
        background-color: #000;
        filter: contrast(30);  /*父元素设置对比度*/
    }
    .text{
        font-size: 100px;
        letter-spacing: -40px;
        color: #fff;
        animation: move-letter 4s linear forwards;  /*forwards当动画完成后，保持最后一帧的状态*/
    }
    @keyframes move-letter{
        0% {
            letter-spacing: -40px;
            filter: blur(10px); /*子元素设置模糊度*/
        }
        50% {
            filter: blur(5px);
        }
        100% {
            letter-spacing: 15px;
            filter: blur(2px);
        }
    }
</style>
```

- 水波效果
```css
<style>
  .title{
      margin: 20px;
      font-size: 25px;
  }
  .container{
      height: 520px;
      width: 400px;
      display: flex;
      clip-path: inset(10px);
      flex-direction: column;
  }
  img{
      height: 50%;
      width: 100%;
  }
  .reflect {
      transform: scaleY(-1);
      /* 对模拟倒影的元素应用svg filter，url中对应的是上面svg filter的id */
      filter: url(#displacement-wave-filter);
  }
</style>
```