(function (window, document) {
  const bady = document.getElementsByTagName("body")[0]
  // 添加鼠标特效
  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = '/js/fireworks.js'
  // scriptTag.src = 'https://blog-static.cnblogs.com/files/zouwangblog/mouse-click.js'
  bady.appendChild(scriptTag)
  // 添加canvas背景
  // const scriptBg = document.createElement('script')
  // scriptBg.type = 'text/javascript'
  // scriptBg.src = '/js/canvas-origin.js'
  // document.getElementsByTagName("main")[0].appendChild(scriptBg)

  const scriptrs = document.createElement('script')
  scriptrs.type = 'text/javascript'
  scriptrs.src = '/js/ribbon.js'
  bady.appendChild(scriptrs)

  // const scriptBack = document.createElement('script')
  // scriptTag.src = './background.js'
  // bady.appendChild(scriptBack)
})(window, document)