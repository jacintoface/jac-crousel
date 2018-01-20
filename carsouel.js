function Slider (params) {
  if (!params.el) {
    throw new Error('you must specify a el params')
  }
  if (params.el.tagName && params.el.nodeType) {
    this.el = el
  } else {
    this.el = document.querySelector(params.el)
  }
  this.init(params)
}

Slider.prototype.init = function (params) {
  console.log(params)
  this.options = Object.assign({}, {
    $ul: this.el.children[0],             //轮播图父组件
    $li: this.el.children[0].children,    //轮播项父组件
    lazyload: true,                       //懒加载
    beforeSlide: function () {},          //轮播之前触发的回调函数
    onSlide: function () {},              //每次轮播后执行的回调函数
    loop: true,                           //循环播放
    autoPlay: true,                       //自动轮播
    index: 0,                             //初始显示项
    delay: 4000,                          //轮播间隔
    ease: 'linear',                       //轮播动画
  }, params)
  
  //记录轮播图图片个数
  this.$length = this.options.$li.length
  
  //记录屏幕宽度
  this.$width = this.options.$ul.getBoundingClientRect().width
  
  // 当前显示的是第几张轮播图
  var index = this.options.index
  
  var that = this
  
  //调用轮播图开始之前的回调函数
  this.options.beforeSlide(this.options.$li[index], index)
  
  //如果只有一张图片，则不开启轮播
  if (this.$length <= 1) {
    if (that.options.lazyload) fnLazyload(that, index)
    return
  }
  
  //如果循环轮播，则克隆首尾节点
  if (that.options.loop) {
    fnCloneDom(that.options.$li)
  }
  
  /*
   * 懒加载图片
   * 需要注意 对于不循环轮播的情况 index 就是对应html中的图片index
   * 对于要循环轮播的情况，因为拷贝了节点，实际index为html中的图片index + 1
   * */
  if (that.options.lazyload) {
    fnLazyload(that, index)
    if (that.options.loop) {
      /*
       *
       * 对于loop，index + 1 才是对应的当前正在显示的html中的图片
       *
       * */
      fnLazyload(that, index + 1)
      fnLazyload(that, index + 2)
      if (index === that.$length - 1) {
        fnLazyload(that, 0)
        fnLazyload(that, 1)
      } else if (index === 0) {
        fnLazyload(that, that.$length)
        fnLazyload(that, that.$length + 1)
      }
    } else {
      if (index === 0) {
        fnLazyload(that, index + 1)
      } else if (index === that.$length - 1) {
        fnLazyload(that, index - 1)
      } else {
        fnLazyload(that, index + 1)
        fnLazyload(that, index - 1)
      }
    }
  }
  
  /*
   *
   * 初始化节点位置
   *
   * */
  fnInitPosition(that, index)
}

/*
 *
 * 设置懒加载图片, 如果需要加载图片，则
 *
 * */
function fnLazyload (el, index) {
  var li = el.options.$li[index]
  var target = li.querySelectorAll('[data-src]')
  if (target) {
    for (var i = 0, length = target.length; i < length; i++) {
      var ret = target[i]
      var srcAttr = ret.dataset.src
      if (ret.tagName.toUpperCase() === 'IMG') {
        ret.setAttribute('src', srcAttr)
      } else {
        ret.style.backgroundImage = srcAttr
      }
      ret.removeAttribute('data-src')
    }
  }
}

/*
 *
 * 向li节点收尾添加节点，帮助循环轮播
 *
 * */
function fnCloneDom (list) {
  var firstNode = list[0].cloneNode(true)
  var lastNode = list[list.length - 1].cloneNode(true)
  var parentNode = list[0].parentNode
  parentNode.insertBefore(lastNode, list[0])
  parentNode.appendChild(firstNode)
}

/*
 *
 * 初始化节点位置
 *
 * */
function fnInitPosition (that, index) {
  var width = that.$width
  fnTransition(that.options.$ul, 0, that)
  fnTranslate(that.options.$ul, -width * index)
  fnTransition(that.options.$li, 0, that)
  fnTranslate(that.options.$li, that)
}

/*
 *
 * 设置transitione
 *
 * */
function fnTransition (dom, time, el) {
  let transition = fnGetPrefix('transition')
  if (dom.length && dom.length > 0) {
    for (var i = 0, leng = dom.length; i < leng; i++) {
      dom[i].style[transition] = `all ${time}ms ${el.options.linear}`
    }
  } else {
    dom.style[transition] = `all ${time}ms ${el.options.linear}`
  }
}

/*
 *
 * 设置transform
 *
 * */
function fnTranslate (dom, distance) {
  let transform = fnGetPrefix('transform')
  if (dom.length && dom.length > 0) {
    for (var i = 0, leng = dom.length; i < leng; i++) {
      console.log(dom[i],transform,-distance * (i - 1))
      dom[i].style[transform] = `translate3d(${distance.$width * i}px, 0, 0)`
    }
  } else {
    dom.style[transform] = `translate3d(${distance}px, 0, 0)`
  }
}

/*
 *
 * 添加兼容前缀
 *
 * */
function fnGetPrefix (style) {
  var vendor = function () {
    
    let elementStyle = document.createElement('div').style
    
    var transform = {
      'webkit': 'webkitTransform',
      'Moz': 'MozTransform',
      'O': 'OTransform',
      'ms': 'msTransform',
      'standard': 'transform'
    }
    for (var key in transform) {
      if (elementStyle[transform[key]] !== undefined) {
        return key
      }
    }
  }()
  
  if (!style) {
    return
  }
  if (vendor === 'standard') {
    return style
  }
  return vendor + style.charAt(0).toUpperCase() + style.slice(1)
}


