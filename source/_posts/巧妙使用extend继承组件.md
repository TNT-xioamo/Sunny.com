---
title: 巧妙使用继承组件
tags: [vue, element-ui]
index_img: /article-img/v1.jpg
categories: 前端
date: 2022-11-13
comments: true
mermaid: true
---
「时光不负，创作不停」
  <!--more-->
### 用于继承的span
```vue
<template>
  <span class="cell">{{ cellValue }}</span>
</template>

<script>
export default {
  props: {
    cellValue: {
      type: String | Number,
      default: "",
    },
  },
};
</script>
```

### 用于继承的input
```vue
<template>
  <div class="cell">
    <el-input
      ref="elInputRef"
      size="mini"
      v-model.trim="cellValue"
      @blur="blurFn"
    ></el-input>
  </div>
</template>

<script>
export default {
  props: {
    cellValue: {
      type: String | Number,
      default: "",
    },
    saveRowData: Function, // 外部，传递进来一个函数，当这个el-input失去焦点的时候，通过此函数通知外部
    cellDom: Node, // 单元格dom
    row: Object, // 单元格所在行数据
    property: String, // 单元格的key
  },
  mounted() {
    // 用户双击后，让其处于获取焦点的状态
    this.$refs.elInputRef.focus();
  },
  methods: {
    blurFn() {
      // 失去焦点，再抛出去，通知外部
      this.saveRowData({
        cellValue: this.cellValue,
        cellDom: this.cellDom,
        row: this.row,
        property: this.property,
      });
    },
  },
};
</script>

<style>
.cell {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0 8px;
}
</style>
```

### data.js
```js

import Vue from "vue";
import definedInput from "./input.vue";
import definedSpan from "./span.vue";

const inputC = Vue.extend(definedInput);
const spanC = Vue.extend(definedSpan);

export default {
    inputC,
    spanC,
}
```


### 完整代码
```vue
<template>
  <div id="app">
    <el-table
      @cell-dblclick="dblclick"
      :cell-class-name="cellClassName"
      height="480"
      :data="tableData"
      border
    >
      <el-table-column align="center" type="index" label="序号" width="50">
      </el-table-column>
      <el-table-column align="center" prop="name" label="姓名" width="100">
      </el-table-column>
      <el-table-column align="center" prop="age" label="年龄" width="100">
      </el-table-column>
      <el-table-column align="center" prop="home" label="家乡">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
// 引入继承组件对象，可取其身上的inputC构造函数、或spanC构造函数生成组件dom
import extendComponents from "./threeC/data";
export default {
  data() {
    return {
      tableData: [
        {
          name: "孙悟空",
          age: 500,
          home: "花果山水帘洞",
        },
        {
          name: "猪八戒",
          age: 88,
          home: "高老庄",
        },
        {
          name: "沙和尚",
          age: 1000,
          home: "通天河",
        },
      ],
      /**
       * 存一份旧的值，用于校验是否发生变化，是否修改
       * */
      oldCellValue: null,
    };
  },
  methods: {
    cellClassName({ row, column, rowIndex, columnIndex }) {
      row.index = rowIndex; // 自定义指定一个索引，下方能够用到
    },
    dblclick(row, column, cell, event) {
      // 1. 序号列单元格不允许编辑，别的列单元格可以编辑
      if (column.label == "序号") {
        this.$message({
          type: "warning",
          message: "序号列不允许编辑",
        });
        return;
      }
      // 2. 存一份旧的单元格的值
      this.oldCellValue = row[column.property];
      // 3. 然后把单元格的值，作为参数传递给实例化的input组件
      let cellValue = row[column.property];
      // 4. 实例化组件以后，带着参数，再挂载到对应位置
      new extendComponents.inputC({
        propsData: {
          // 使用propsData对象传递参数，子组件在props中可以接收到
          cellValue: cellValue, // 传递单元格的值
          saveRowData: this.saveRowData, // 传递回调函数用于保存行数据，组件中可以触发之
          cellDom: cell, // 传递这个dom元素
          row: row, // 传递双击的行的数据
          property: column.property, // 传递双击的是哪个字段
        },
      }).$mount(cell.children[0]); // 5. $mount方法，用于将某个dom挂载到某个dom上
    },
    /**
     * 失去焦点的时候有以下操作
     *    1. 校验新值是否等于原有值，若等于，说明用户未修改，就不发请求。若不等于就发请求，然后更新tableData数据
     *    2. 然后使用$mount方法，挂载一个新的span标签dom在页面上，即恢复原样，而span标签也是实例化的哦
     * */
    saveRowData(params) {
      console.log("继承的子组件传递过来的数据", params);
      // 1. 看看用户是否修改了
      if (params.cellValue == this.oldCellValue) {
        console.log("未修改数据，不用发请求");
      } else {
        params.row[params.property] = params.cellValue;
        // 这里模拟一下发了请求，得到最新表体数据以后，更新tableData
        setTimeout(() => {
          //        给那个数组的     第几项            修改为什么值
          this.$set(this.tableData, params.row.index, params.row);
        }, 300);
      }
      // 2. 恢复dom节点成为原来的样子，有下面两种方式

      /**
       * 方式一：使用官方推荐的$mount去挂载到某个节点上，上方也是
       * */
      new extendComponents.spanC({
        propsData: {
          cellValue: params.cellValue,
        },
      }).$mount(params.cellDom.children[0]);

      /**
       * 方式二：使用原生js去清空原节点内容，同时再添加子元素
       * */
      // let span = document.createElement("span"); // 创建一个span标签
      // span.innerHTML = params.cellValue; // 指定span标签的内容的值
      // span.classList.add("cell"); // 给span标签添加class为cell
      // params.cellDom.innerHTML = ""; // 清空刚操作的input标签的内容
      // params.cellDom.appendChild(span); // 再把span标签给追加上去，恢复原样
    },
  },
};
</script>

<style lang="less" scoped>
#app {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  padding: 50px;
}
</style>

```