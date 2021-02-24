function ModifyDeg(time, transitionTime) {
  if (typeof time != 'number' && transitionTime) {
    console.log(String(value));
    return String(value);
  } else if (typeof value == 'number') {
    return `rotate(${time}deg)`
  }
}

// 180度到-180度正常转换,只能是transfom为只有rotate一个属性时使用，否则覆盖
export function rotate() {
  // 当前角度
  var reotate;
  // 上一次角度
  var oldRotate;
  // 修改角度对象，需要修改的角度，动画时间
  return function run(obj, deg, time, transitionTime) {
    // 当方位角小于0
    if (deg < 0) {
      reotate = 360 + deg;
    } else {
      reotate = deg;
    }
    // 当这是第一次获取方位角时
    if (!oldRotate && obj) {
      oldRotate = Math.abs(reotate);
      obj.style.transition = 'none 0s ease 0s';
      obj.style.transform = `rotate(${reotate}deg)`;
      return;
    }

    // 判断船体方位角旋转方式 （差值小于180 顺时针，大于180逆时针）
    if (Math.abs(oldRotate - reotate) >= 180) {
      if (reotate < 180) {
        reotate = 360 + reotate;
      } else {
        reotate = reotate - 360;
      }
    }

    // 绘制船体方位角
    if (obj) {
      obj.style.transition = 'transform ' + (time / 1000) + 's linear';
      obj.style.transform = `rotate(${reotate}deg)`;
    }

    //修改方位角的值，固定子360以内
    if (reotate > 360) {
      oldRotate = reotate % 360;
      let degs = oldRotate;
      setTimeout(() => {
        obj.style.transition = 'none 0s ease 0s';
        obj.style.transform = `rotate(${degs}deg)`;
      }, time);
    } else if (reotate < 0) {
      oldRotate = reotate + 360;
      let degs = oldRotate;
      setTimeout(() => {
        obj.style.transition = 'none 0s ease 0s';
        obj.style.transform = `rotate(${degs}deg)`;
      }, time);
    } else {
      oldRotate = reotate;
    }
  }
}