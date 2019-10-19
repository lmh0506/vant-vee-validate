export function isJSON (val) {
  if (typeof val !== 'string') {
    return false
  }
  try {
    const obj = JSON.parse(val)
    if (Object.prototype.toString.call(obj) === '[object Object]') {
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

export function isEmptyObject (obj) {
  for (var str in obj) {
    return false
  }
  return true
}
export function debounce (func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

export function format (date, fmt) {
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let key in o) {
    if ((new RegExp('(' + key + ')')).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? (o[key]) : ('00' + o[key]).substr(('' + o[key]).length))
    }
  }
  return fmt
}

export function formatImgList (imgStr) {
  if (!imgStr) return []
  let array = imgStr.split(';')
  let obj = []
  array.forEach(element => {
    element && obj.push({
      response: { data: { fileUrl: element } },
      url: element
    })
  })
  return obj
}

export function joinImgStr (imgArr) {
  let arr = []
  imgArr.forEach(item => {
    if (item.response && item.response.data && item.response.data.fileUrl) {
      arr.push(item.response.data.fileUrl)
    }
  })
  return arr.join(';')
}
/**
 * valiData 需要用call调用，eg: valiData.call(vm,{a: {cond: '', pro: ''}},params)  vm必须为vue实例
 * @param {Object} data 需要验证的数据
 * @param {*} context 执行上下文
 */
export function valiData (data, context) {
  function showToast (msg) {
    this.$createToast({
      txt: msg,
      type: 'error'
    }).show()
  }
  for (var key in data) {
    var value = context[key] != null ? context[key] : data[key].value
    // value = value || "";
    var message = data[key].pro || '请输入内容'
    var cond = data[key].cond
    var reg = data[key].reg
    var fn = data[key].fn
    var type = typeof value
    if ((type === 'string' && (value = value.trim()), cond && reg)) { throw new Error('reg和cond只能选择一个!') }
    if (fn) {
      if (!fn.call(context, value)) return showToast.call(this, message) && false
    } else if (cond) {
      // eslint-disable-next-line no-new-func
      if (!new Function('value', 'if(' + cond.replace(/\$\$/g, 'value') + '){return true;}return false;').call(context, value)) {
        return showToast.call(this, message) && false
      }
    } else {
      if (reg && !reg.test(value)) { return showToast.call(this, message) && false }
      if (
        (type === 'string' && value === '') ||
        (type === 'boolean' && value === false) ||
        (type === 'number' && value === 0)
      ) { return showToast.call(this, message) && false }
    }
  }
  return true
}
export function arrayDedup (arr, fn) {
  let result = []; let i = -1
  while (i++ < arr.length - 1) {
    if (!fn(result, arr[i])) {
      result.push(arr[i])
    }
  }
  return result
}

//  判断手机类型
export function judgeDeviceType () {
  var ua = window.navigator.userAgent.toLocaleLowerCase()
  var isIOS = /iphone|ipad|ipod/.test(ua)
  var isAndroid = /android/.test(ua)
  var isMiuiBrowser = /miuibrowser/.test(ua)

  return {
    isIOS: isIOS,
    isAndroid: isAndroid,
    isMiuiBrowser: isMiuiBrowser
  }
}
