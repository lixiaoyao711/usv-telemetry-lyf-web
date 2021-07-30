import Vue from 'vue';

// 节流（高频事件触发，但在 n 秒内只会执行一次，所以节流会稀释函数的执行频率）
export function throttle(func, delay) {
  let prev = Date.now();
  return function(...args) {
    let now = Date.now();
    if (now - prev >= delay) {
      func.apply(this, args);
      prev = Date.now();
    }
  };
}

// 防抖函数(触发高频事件后 n 秒内函数只会执行一次，如果 n 秒内高频事件再次被触发，则重新计算时间)
export function debounce(fn, delay, flage) {
  let timeout = null;
  //  创建一个标记用来存放定时器的返回值
  return function(...args) {
    //  给闭包函数传参 判断是先执行一次函数后再执行延时

    // 每当用户输入的时候把前一个 setTimeout clear 掉
    if (timeout) clearTimeout(timeout);
    // 然后又创建一个新的 setTimeout, 这样就能保证interval 间隔内如果时间持续触发，就不会执行 fn 函数
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

//定时检查tokne是否过期
export const checkTokenTime = (expTime, checkTime) => {
  // 定时时候的时间
  let date = new Date();
  date = parseInt(date.getTime() / 1000);
  // 如果<=0证明过期了
  return expTime - date <= checkTime ? true : false;
};

// 小数点后保存6位
export function floatSix(str) {
  return parseFloat(str).toFixed(6);
}

// 转换格式
export function trun(str) {
  if (typeof str == 'string') {
    let location = { latitude: '', longitude: '' };
    let strs = str.split(',');
    location.latitude = parseFloat(strs[0]);
    location.longitude = parseFloat(strs[1]);
    return location;
  } else if (typeof str == 'object') {
    if (str.latitude) {
      var objs = `${str.latitude},${str.longitude}`;
    } else {
      var objs = `${str[1]},${str[0]}`;
    }
    return objs;
  }
}
// 显示boundsList格式转换(传入对象)
export function getBoundsList(port) {
  let boundsList = [];
  // // 取出港口数据进行过滤和展示
  let bounds = port.bounds.split(' ');
  for (const i in bounds) {
    let bound = bounds[i].split(',');
    Vue.set(boundsList, i, [bound[1], bound[0]]);
  }
  return boundsList;
}

// 转换回提交数据boundsList格式转换(传入boundsList)
export function postBoundsList(boundsList) {
  let bounds = '';
  // bounds格式转换
  for (const i in boundsList) {
    if (boundsList[i].Q) {
      bounds += `${boundsList[i].Q},${boundsList[i].R} `;
    } else {
      bounds += `${boundsList[i][1]},${boundsList[i][0]} `;
    }
  }
  // 删除多余的空格
  bounds = bounds.substr(0, bounds.length - 1);
  return bounds;
}

//航标范围
export function navPolyline(map, funPolyline, navaidFromArray, navaidToArray) {
  let fromLine = JSON.parse(JSON.stringify(navaidFromArray));
  let toLine = JSON.parse(JSON.stringify(navaidToArray));
  let back = [];

  // 循环清空之前的Polyline
  for (const removePolyline of funPolyline) {
    map.remove(removePolyline);
  }
  // 清空之前存在的数组,不然会覆盖
  funPolyline.length != 0 ? (funPolyline = []) : '';

  for (let x = 0; x < fromLine.length; x++) {
    for (let y = 0; y < toLine.length; y++) {
      // 相同路径
      if (fromLine[x].toString() == toLine[y].toString()) {
        let isflage = back.some(item => {
          return fromLine[x].toString() == item.toString();
        });
        // 将相同数据清除在原数组中清除掉 （不要影响原数组）
        if (!isflage) {
          back.push(fromLine[x]);
          fromLine.splice(x, 1);
          toLine.splice(y, 1);
          y--;
          // 当数组长度为零或者当前循环已经大于数组长度
          if (!fromLine.length || !toLine.length || x >= fromLine.length) {
            break;
          }
        }
      }
    }
  }
  // 折线操作
  function channelLine(createPolyline, lineColor, imgs) {
    let polyline = new AMap.Polyline({
      path: createPolyline, // 设置线覆盖物路径
      showDir: true,
      dirColor: imgs ? imgs : '#336688', // 方向标识符颜色
      strokeColor: lineColor ? lineColor : '#336688', // 线颜色
      strokeWeight: 4, // 线宽
      strokeOpacity: 1,
      // zIndex: 20,
    });
    funPolyline.push(polyline);
  }
  // 循环创建Polyline,3个数组都添加
  for (const createPolyline of fromLine) {
    channelLine(createPolyline, 'magenta', '#64FFDA');
  }
  for (const createPolyline of toLine) {
    channelLine([createPolyline[1], createPolyline[0]], 'cyan', '#ff6700');
  }
  for (const createPolyline of back) {
    let polyline = new AMap.Polyline({
      path: createPolyline, // 设置线覆盖物路径
      showDir: true,
      dirImg: require('../assets/img/ship-view/two.png'),
      dirColor: '#FFEB3B', // 方向标识符颜色
      strokeColor: 'darkgreen', // 线颜色
      strokeWeight: 4, // 线宽
      strokeOpacity: 1,
      // zIndex: 20,
    });
    funPolyline.push(polyline);
    // channelLine(createPolyline,undefined,canvasDir)
  }

  // 循环添加Polyline
  for (const addPolyline of funPolyline) {
    map.add(addPolyline);
  }
  return funPolyline;
}

// 时间戳转换成年月日，时分秒：
export function formatDate(value) {
  if (typeof value == 'undefined') {
    return '';
  } else {
    let date = new Date(parseInt(value));
    let y = date.getFullYear();
    let MM = date.getMonth() + 1;
    MM = MM < 10 ? '0' + MM : MM;
    let d = date.getDate();
    d = d < 10 ? '0' + d : d;
    let h = date.getHours();
    h = h < 10 ? '0' + h : h;
    let m = date.getMinutes();
    m = m < 10 ? '0' + m : m;
    let s = date.getSeconds();
    s = s < 10 ? '0' + s : s;
    return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
  }
}
//中国标准时间转换年月日
export function formatDateTime(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate();
  d = d < 10 ? '0' + d : d;
  var h = date.getHours();
  var minute = date.getMinutes();
  minute = minute < 10 ? '0' + minute : minute;
  return y + '-' + m + '-' + d;
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
}

// 计算时间(时间类型字符串-数值天数)
export function countTime(time, day) {
  time = new Date(time).getTime() / 1000;
  day = day * 86400;
  //中国标准时间转换年月日
  return formatDateTime(new Date((time - day) * 1000));
}

// 获取url中的参数并截取下来
export function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

// 生成随机的唯一id
export function guid() {
  return 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

import dd from 'gdt-jsapi';
// 判断当前页面是在钉钉、微信还是浏览器中打开
export const userAgentObj = () => {
  const ua = navigator.userAgent.toLowerCase();
  let isWeiXin = false,
    isDingTalk = false,
    isApp = false,
    obj = {};
  if (ua.match(/DingTalk/i) == 'dingtalk') {
    //用钉钉打开
    isDingTalk = true;
  } else if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    //用微信打开
    isWeiXin = true;
  } else {
    //用其他浏览器打开
    isApp = true;
  }
  obj.isWeiXin = isWeiXin;
  obj.isDingTalk = isDingTalk;
  obj.isApp = isApp;

  sessionStorage.setItem('userAgentObj', JSON.stringify(obj));
  return obj;
};
// 修改头部标题的函数-----兼容微信、钉钉和浏览器
export const ChangePageTitle = title => {
  let userAgentObj = JSON.parse(sessionStorage.getItem('userAgentObj')) || null;
  console.log('userAgentObj', userAgentObj);
  if (userAgentObj && userAgentObj.isDingTalk) {
    console.log('title是', title);
    //钉钉内
    dd.ready(function() {
      dd.biz.navigation.setTitle({
        title: title, //控制标题文本，空字符串表示显示默认文本
        onSuccess: function(result) {},
        onFail: function(err) {},
      });
    });
  } else {
    //微信或浏览器内
    // var $body = $('body');
    document.title = title; //普通浏览器用这一句就可以修改了
    // var $iframe = $('<iframe style="display: none"></iframe>');
    // $iframe
    //     .on('load', function() {
    //         setTimeout(function() {
    //             $iframe.off('load').remove();
    //         }, 0);
    //     })
    //     .appendTo($body);
  }
};

// //航标范围
// export function navPolyline(map, funPolyline, navaidFromArray, navaidToArray) {
//   let fromLine=""
//   let toLine=""
//   let back=""
//   // 循环清空之前的Polyline
//   for (const removePolyline of funPolyline) {
//     map.remove(removePolyline);
//   }
//   // 清空之前存在的数组,不然会覆盖
//   funPolyline.length != 0 ? (funPolyline = []) : '';
//   if (str == 'from') {
//     // 循环创建Polyline
//     for (const createPolyline of navaidFromArray) {
//       let polyline = new AMap.Polyline({
//         path: createPolyline, // 设置线覆盖物路径
//         showDir: true,
//         dirImg:require('../assets/img/login/Avatar.jpg'),
//         dirColor: '#64FFDA', // 方向标识符颜色
//         strokeColor: '#336688', // 线颜色
//         strokeWeight: 4, // 线宽
//         strokeOpacity: 1,
//         // zIndex: 20,
//       });
//       funPolyline.push(polyline);
//     }
//   }
//   if (str == 'to') {
//     // 循环创建Polyline
//     for (const createPolyline of navaidFromArray) {
//       let polyline = new AMap.Polyline({
//         path: [createPolyline[1], createPolyline[0]], // 设置线覆盖物路径
//         showDir: true,
//         dirColor: '#64FFDA',
//         strokeDasharray: [15, 15],
//         strokeColor: '#eb3b5a', // 线颜色
//         strokeWeight: 4, // 线宽
//         strokeOpacity: 1,
//         zIndex: 51,
//       });
//       funPolyline.push(polyline);
//     }
//   }
//   // 循环添加Polyline
//   for (const addPolyline of funPolyline) {
//     map.add(addPolyline);
//   }
//   return funPolyline;
// }
