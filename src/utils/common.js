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
