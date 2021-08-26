---
title: canvas 笔记
---


## canvas 笔记
  [canvas 教程](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
## 一， canvas基本使用
  ```js
    <canvas width="400" height="500" id="mycanvas">
       当前浏览器版本不支持，请升级浏览器
    </canvas>
  ```
  canvas 的标签属性，width 和 height 画布的宽度和高度。注意 canvas 的 width 和 height 不要用 css 的样式来设置，如果使用 css 的样式来设置，画布会失真，会变形 标签里面的文字是用来提示低版本浏览器 (IE6/7/8)
  
## 二，开发痛点

#### 1. 问题背景
      在uni-app中使用canvas 绘制海报，因图片跨域导致canvas画布污染
  ```js
    处理方法
    export function getImageBase64 (imgUrl) {
      return new Promise((resolve, reject) => {
        window.URL = window.URL ?? window.webkitURL
        var xhr = new XMLHttpRequest()
        xhr.open('get', imgUrl, true)
        // 至关重要
        xhr.responseType = 'blob'
        xhr.onload = function () {
          if (this.status == 200) {
            //得到一个blob对象
            var blob = this.response
            // 至关重要
            let oFileReader = new FileReader()
            oFileReader.onloadend = function (e) {
              // 此处拿到的已经是 base64的图片了
              let base64 = e.target.result
              resolve(base64)
            }
            oFileReader.readAsDataURL(blob)
            //====为了在页面显示图片，可以删除====
            var img = document.createElement('img')
            img.onload = function (e) {
              window.URL.revokeObjectURL(img.src) // 清除释放
            }
            let src = window.URL.createObjectURL(blob)
            img.src = src
            // document.getElementById("container1").appendChild(img);
            //====为了在页面显示图片，可以删除====
          }
        }
        xhr.send()
      })
    }

  ```
#### 2. 问题背景
    canvas 导出图片缺失部分绘制 canvas.toDataURL('image/jpg')
  ``` js
    处理方法 1:
     ctx.draw(true, ()=>{
       // 在此处进行回调处理
       // 此方法有时会失效，具体原因未找到 后续更新
       const canvas = document.getElementsByTagName('canvas')[0]
       this.url = canvas.toDataURL('image/jpg')
     })
    处理方法 2:
    setTimeout(()=>{
      // 在此处进行导出url
      canvas.toDataURL('image/jpg')
    },1000)
  ```
## 三，使用方法总结

  ```js
  /**
    * @description: 绘制正方形（可以定义圆角），并且有图片地址的话填充图片
    * @param {CanvasContext} ctx canvas上下文
    * @param {number} x 圆角矩形选区的左上角 x坐标
    * @param {number} y 圆角矩形选区的左上角 y坐标
    * @param {number} w 圆角矩形选区的宽度
    * @param {number} h 圆角矩形选区的高度
    * @param {number} r 圆角的半径
    * @param {String} url 图片的url地址
 */

  export function drawSquarePic(ctx, x, y, w, h, r, url) {
    ctx.save()
    ctx.beginPath()
    // 绘制左上角圆弧
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
    // 绘制border-top
    // 画一条线 x终点、y终点
    ctx.lineTo(x + w - r, y)
    // 绘制右上角圆弧
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
    // 绘制border-right
    ctx.lineTo(x + w, y + h - r)
    // 绘制右下角圆弧
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
    // 绘制左下角圆弧
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
    // 绘制border-left
    ctx.lineTo(x, y + r)
    // 填充颜色(需要可以自行修改)
    ctx.setFillStyle('#ffffff')
    ctx.fill()
    // 剪切，剪切之后的绘画绘制剪切区域内进行，需要save与restore 这个很重要 不然没办法保存
    ctx.clip()
    // 绘制图片
    return new Promise((resolve, reject) => {
      if (url) {
        // const regexp = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
        const handleUrl=(res)=>{
          ctx.drawImage(res.path, x, y, w, h)
          ctx.restore() //恢复之前被切割的canvas，否则切割之外的就没办法用
          ctx.draw(true)
          resolve()
        }
        const handleFail = (res) => {
          uni.showToast({
            title: '图片下载异常',
            duration: 2000,
            icon: 'none'
          })
          ctx.restore()
          ctx.draw(true)
          resolve()
        }
        uni.downloadFile({
          url: url,
	  			success(res) {
	  				if(res.statusCode !== 200) {
	  					handleFail(res)
	  				} else {
             handleUrl({path: res.tempFilePath})
	  				}
          },
          fail(res) {
            handleFail(res)
          }
         })
      } else {
        ctx.restore()
        ctx.draw(true)
        resolve()
      }
    })
  }


  /**
    * @description: 绘制文本时文本的总体高度
    * @param {Object} ctx canvas上下文
    * @param {String} text 需要输入的文本
    * @param {Number} x X轴起始位置
    * @param {Number} y Y轴起始位置
    * @param {Number} maxWidth 单行最大宽度
    * @param {Number} fontSize 字体大小
    * @param {String} color 字体颜色
    * @param {Number} lineHeight 行高
    * @param {String} textAlign 字体对齐方式
 */
  export function drawTextReturnH(
    ctx,
    text,
    x,
    y,
    maxWidth = 375,
    fontSize = 14,
    color = '#000',
    lineHeight = 30,
    textAlign = 'left',
  ) {
    ctx.save()
    if (textAlign) {
      ctx.setTextAlign(textAlign) //设置文本的水平对齐方式  ctx.setTextAlign这个可以兼容百度小程序 ，注意：ctx.textAlign百度小程序有问题
      switch (textAlign) {
        case 'center':
          x = getSystem().w / 2
          break
        case 'right':
          x = (getSystem().w - maxWidth) / 2 + maxWidth
          break
        case 'left':
          x = (getSystem().w - maxWidth) / 2
          break
        default:
          break
      }
    }
    let arrText = text.split('')
    let line = ''
    for (let n = 0; n < arrText.length; n++) {
      let testLine = line + arrText[n]
      ctx.font = fontSize + 'px sans-serif' //设置字体大小，注意：百度小程序 用ctx.setFontSize设置字体大小后，计算字体宽度会无效
      ctx.setFillStyle(color) //设置字体颜色
      let metrics = ctx.measureText(testLine) //measureText() 方法返回包含一个对象，该对象包含以像素计的指定字体宽度。
      let testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = arrText[n]
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, (arrText.length < 4 ? x + fontSize : x), y + lineHeight)
    ctx.draw(true) //本次绘制是否接着上一次绘制。即 reserve 参数为 false，则在本次调用绘制之前 native 层会先清空画布再继续绘制；若 reserve 参数为 true，则保留当前画布上的内容，本次调用 drawCanvas 绘制的内容覆盖在上面，默认 false。
  }
  ```

## 四，canvas 绘制功能
  | 方法/属性 | 描述 |
  | --- | --- |
  | fillStyle | 设置填充颜色 |
  | fillRect(x,y,width,height) | 方法绘制 “已填色” 的矩形。默认的填充颜色是黑色 |
  | strokeStyle	 | 设置边框颜色 |
  | strokeRect(x,y,width,height) | 方法绘制矩形边框。默认的填充颜色是黑色 |
  | clearRect(x,y,width,height) | 清除画布内容 |
  | globalAlpha | 设置当前透明度 |
### 4.1 绘制路径
  ```js
  // 创建路径
  ctx.beginPath()
  // 移动绘制点
  ctx.moveTo(100,100)
  // 描述行进路径
  ctx.lineTo(200,300)
  ctx.lineTo(300,230)
  ctx.lineTo(440,290)
  ctx.lineTo(380,50)
  // 封闭路径
  ctx.closePath()
  // 设置颜色
  ctx.strokeStyle="#fff"
  // 绘制不规则图形
  ctx.stroke()
  // 填充不规则图形
  ctx.fill()
  ```
### 4.2 绘制圆弧

  ```js
    arc(x, y, radius, startAngle, endAngle, anticlockwise)
  ```
  - x,y 为绘制圆弧所在圆上的圆心坐标
  - radius 为半径
  - startAngle 以及 endAngle 参数用弧度定义了开始以及结束的弧度。这些都是以 x 轴为基准
  - 参数 anticlockwise 为一个布尔值。为 true 时，是逆时针方向，否则顺时针方向。