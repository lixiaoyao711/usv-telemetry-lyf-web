<template>
  <div class="hello-ezuikit-js">
    <div id="video-container" ref="videoRef"></div>
  </div>
</template>

<script>
import EZUIKit from 'ezuikit-js';

export default {
  name: 'OnlineVideo',
  props: {
    autoplay: {
      type: Boolean,
      default: true,
    },
    msg: String,
    accessToken: String,
    url: String,
    template: {
      type: String,
      default: 'security',
    },
    width: {
      type: Number,
      default: 600,
    },
    height: {
      type: Number,
      default: 400,
    },
  },
  data() {
    return {
      player: null,
    };
  },
  methods: {
    showPlayer() {
      if (this.player) {
        this.player.stop();
        this.$refs.videoRef.innerHTML = '';
      }

      this.player = new EZUIKit.EZUIKitPlayer({
        autoplay: this.autoplay,
        id: 'video-container',
        accessToken: this.accessToken,
        url: this.url,
        template: this.template, // simple - 极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
        // 视频上方头部控件
        // header: ["capturePicture", "save", "zoom"], // 如果templete参数不为simple,该字段将被覆盖
        //plugin: ['talk'],                       // 加载插件，talk-对讲
        // 视频下方底部控件
        // footer: ["talk", "broadcast", "hd", "fullScreen"], // 如果template参数不为simple,该字段将被覆盖
        audio: 1, // 是否默认开启声音 0 - 关闭 1 - 开启
        // openSoundCallBack: data => console.log("开启声音回调", data),
        // closeSoundCallBack: data => console.log("关闭声音回调", data),
        // startSaveCallBack: data => console.log("开始录像回调", data),
        // stopSaveCallBack: data => console.log("录像回调", data),
        // capturePictureCallBack: data => console.log("截图成功回调", data),
        // fullScreenCallBack: data => console.log("全屏回调", data),
        // getOSDTimeCallBack: data => console.log("获取OSDTime回调", data),
        width: this.width,
        height: this.height,
      });
      // console.log("player",player);
      // player.stop(); // 方法调用示例，10秒后关闭视频
    },
    // 关闭监控
    colseVideo() {
      this.player.stop();
    },
    // 开启监控
    openVideo() {
      this.player.play();
    },
  },
  created() {},
  mounted() {},
  watch: {
    // 监听到token变化才渲染视频组件
    accessToken() {
      if (this.url && this.accessToken) {
        this.showPlayer();
      }
    },
    url() {
      if (this.url && this.accessToken) {
        this.showPlayer();
      }
    },
  },
};
</script>
