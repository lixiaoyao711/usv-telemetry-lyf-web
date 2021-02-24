//引入安装的signalr包<br>
import Vue from 'vue';
import store from '@/store/store.js'
import * as signalR from '@aspnet/signalr'
// 定期检查token是否过期
import { checkTokenTime } from '@/utils/common'
// 事件总线
import bus from "@/components/common/bus"

var callbackHandle = 0;
// 需要执行的函数集
let callbacks = new Map();
// 连接成功表示
var isconnected = false;

// 通过指定服务器和token 配置连接
let signal;
signal = new signalR.HubConnectionBuilder()　　　//服务器地址
  .withUrl(process.env.VUE_APP_API_BASE_PATH + '/events', { accessTokenFactory: () => window.localStorage.getItem('token') })
  .build()
// 表示获取数据可以开始，但是没有传入需要获取的类型和id
async function start(reconnect) {
  if (window.localStorage.getItem('token') && window.localStorage.getItem('token') != '' && !checkTokenTime(window.localStorage.getItem('tokenTime'), 0)) {
    try {
      // 建立连接
      await signal.start();
      console.log("SignalR Connected.");
        bus.$emit("Disconnect", {
    message:''
  })
      // 数据获取
      startStreaming([
        // 将服务器发送usvRuntimeInfoChanged事件的频率限制为0.5秒一次
        { eventName: 'usvRuntimeInfoChanged', samplingInterval: 0.5 },
        //{eventName: 'planExecutionStateChanged', samplingInterval: 0}
      ]);

      // 建立连接后马上执行一次获取到的函数（用于刷新后，数据马上连接）
      for (let cb of callbacks) {
        cb[1](reconnect)
      }
      isconnected = true
      store.commit('updateIsNetworkConnected',true)

    } catch (err) {
      console.log(err);
      // 如果在初试获取失败，则5秒后重连
      store.commit('updateIsNetworkConnected',false)

      setTimeout(() => {
        console.log('重连中,token正常');
        start(true)
      }, 5000)

    }
  } else {
    // 如果在初试获取失败，则5秒后重连

    store.commit('updateIsNetworkConnected',false)
    setTimeout(() => {
      console.log('重连中，token错误');
      start(true)
    }, 5000)
  }

};
// 关闭连接时回调
signal.onclose(() => {
  console.log('关闭连接时');
  bus.$emit("Disconnect", {
    message:'服务器连接已断开，正在尝试重连'
  })
  isconnected = false;
  store.commit('updateIsNetworkConnected',false)
  setTimeout(() => {
    console.log('重连中');
    start(true)
  }, 5000)
})

var stream;
let signalMap = new Map()
function startStreaming(streamingOptions) {
  stream = signal.stream("stream",streamingOptions);
  stream.subscribe(
    {
      next: (item) => {
        // 数据获取地点
        // console.log(signalMap);
        for (let val of signalMap) {
          if (val[1].eventName == item.eventName && val[1].resourceId == item.resourceId) {
            val[1].callback(item.data)
          }
        }
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        console.log("Stream completed.");
      }
    }
  );
}
// 直接开始连接
export function subscribe(e, id, callback) {
  return signal.invoke("subscribe", { eventName: e, resourceId: id }).then((codingId) => {

    signalMap.set(codingId, {
      'eventName': e,
      'resourceId': id,
      'callback': callback
    })
    return codingId
  });
}

// 直接开始所有连接
export function subscribeAll(arr) {
  return signal.invoke("subscribeAll", arr.map(eve => {
    return { eventName: eve.eventName, resourceId: eve.shipId,callback:eve.callback }
  })).then((codingId) => {
    for (const item of arr) {
    signalMap.set(codingId, {
      'eventName': item.eventName,
      'resourceId': item.shipId,
      'callback': item.callback
      })
    }
    return codingId
  })
}

// 更新token的函数
export function authenticate(token) {
  return signal.invoke("authenticate", token).catch(function (err) {
    return false
  })
}


// 关闭指定数据连接，每一次重新连接或有相应的编码返回，只有输入对应连接才会关闭
// 两种状况，一种客户端断线，不会有新的编码获取，第二种是服务器断线，会有新的编码获取
export function unsubscribe(subscribeId) {
  if (!subscribeId) {
    signal.invoke("unsubscribeAll").catch(function (err) {
      return console.error(err.toString());
    }).then(() => {
      signalMap.clear()
    });
  } else {
    signal.invoke("unsubscribe", subscribeId).catch(function (err) {
      return console.error(err.toString());
    }).then(() => {
      for (let val of subscribeId) {
        if (val) {
          signalMap.delete(val)
        }
      }
    });
  }
}

export function install() {
  // install方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
  start(false)
  Vue.prototype.signalr = signal
}



// 注册连接和重连成功后执行的回调函数，如果调用此函数时连接已建立，回调将会被立即执行一次。
// 返回值为用于删除重连回调的句柄。
export function connected(cb) {
  callbacks.set(++callbackHandle, cb);
  // 监测没有连接成功时，函数不会执行
  if (isconnected) {
    cb(false);
  }

  return callbackHandle;
}

// 删除已注册的重连回调。
export function unconnected(handle) {
  callbacks.delete(handle);
}

// 作用未知
export function getSubscriptions() {
  return signal.invoke("getSubscriptions")
}

// 在用户退出登录时调用logout确保退出登录时断开底层WebSocket
export function logout() {
  signal.stop();
}

// 使用方法
// getSubscriptions().then(data=>{console.log(data);})


/* const signalr = function () {
  var hub
  if (hub === undefined) {
    hub = signal
  }
  return hub
} */
//  自动重连
/* async function start () {
  try {
    await signal.start()
    console.log('connected')
  } catch (err) {
    console.log(err)
    setTimeout(() => start(), 5000)
  }
}

signal.onclose(async () => {
  await start()
}) *///将创建的signal赋值给Vue实例



