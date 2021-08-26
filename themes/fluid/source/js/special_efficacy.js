(function (window, document) {
  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = '/js/fireworks.js'
  // scriptTag.src = 'https://blog-static.cnblogs.com/files/zouwangblog/mouse-click.js'
  document.getElementsByTagName("body")[0].appendChild(scriptTag)
})(window, document)