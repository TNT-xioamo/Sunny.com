---
title: HTML转PDF并导出
tags: [面试，前端]
index_img: /article-img/v7.jpeg
banner_img: /img/sdqryn.png
categories:
date: 2022-05-24
mermaid: true
---

## <font color="#ef7060" size=4 face="">方案 一 </font>
  <!-- more -->
```
  window.print浏览器打印是一个非常成熟的东西，直接调用window.print或者document.execCommand('print')达到打印及保存效果
  Mac徽标键加p直接调用查看效果，windows可以ctrl+p查看效果

```

### 存在问题

- 样式调节
- 隐藏某些页面不相关内容
- A4 纸界面的适应

### 解决方案

- 媒介查询

```css
p {
  font-size: 12px;
}
@media print {
  p {
    font-size: 14px;
  }
}
// 隐藏部分内容
@media print {
  span {
    display: none;
  }
}
```

- 替换 body 内容

<font color="#ef7060" size=4 face="">根据 id 获取需要打印的节点 innderHTML，并将 body 内容进行替换，执行打印，打印完成后，还原 body 内容。</font>

```html
<body>
  <input type="button" value="打印此页面" onclick="printpage()" />
  <div id="printContent">打印内容</div>
  <script>
    function printpage() {
      let newstr = document.getElementById("printContent").innerHTML;
      let oldstr = document.body.innerHTML;
      document.body.innerHTML = newstr;
      window.print();
      document.body.innerHTML = oldstr;
      return false;
    }
  </script>
</body>
```

- 打印事件监听
  通过打印前事件<font color="#ef7060" size=4 face="">onbeforeprint</font>及打印后事件<font color="#ef7060" size=4 face="">onafterprint()</font> 进行打印元素的隐藏及展示

```js
window.onbeforeprint = function (event) {
  //隐藏无关元素
};
window.onafterprint = function (event) {
  //展示无关元素
};
```

## <font color="#ef7060" size=4 face="">方案 二 </font>

<font color="#ef7060" size=4 face=""> html2canvas + jspdf</font>使用 html2canvas 将使用 canvas 将页面转为 base64 图片流，并插入 jspdf 插件中，保存并下载 pdf。

直接上代码：

```js
// utils/htmlToPdf.js：导出页面为PDF格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  install(Vue, options) {
    // id-导出pdf的div容器；title-导出文件标题
    Vue.prototype.htmlToPdf = (id, title) => {
      const element = document.getElementById(`${id}`);
      const opts = {
        scale: 12, // 缩放比例，提高生成图片清晰度
        useCORS: true, // 允许加载跨域的图片
        allowTaint: false, // 允许图片跨域，和 useCORS 二者不可共同使用
        tainttest: true, // 检测每张图片已经加载完成
        logging: true, // 日志开关，发布的时候记得改成 false
      };

      html2Canvas(element, opts)
        .then((canvas) => {
          console.log(canvas)
          const contentWidth = canvas.width
          const contentHeight = canvas.height
          // 一页pdf显示html页面生成的canvas高度;
          const pageHeight = (contentWidth / 592.28) * 841.89;
          // 未生成pdf的html页面高度
          let leftHeight = contentHeight
          // 页面偏移
          let position = 0
          // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
          const imgWidth = 595.28;
          const imgHeight = (592.28 / contentWidth) * contentHeight
          const pageData = canvas.toDataURL("image/jpeg", 1.0)
          console.error(pageData)
          // a4纸纵向，一般默认使用；new JsPDF('landscape'); 横向页面
          const PDF = new JsPDF('', 'pt', 'a4')

          // 当内容未超过pdf一页显示的范围，无需分页
          if (leftHeight < pageHeight) {
            // addImage(pageData, 'JPEG', 左，上，宽度，高度)设置
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
          } else {
            // 超过一页时，分页打印（每页高度841.89）
            while (leftHeight > 0) {
              PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
              leftHeight -= pageHeight;
              position -= 841.89;
              if (leftHeight > 0) {
                PDF.addPage();
              }
            }
          }
          PDF.save(`${title}.pdf`);
        }).catch((error) => {
          console.log(error)
        })
    };
  },
};
```
