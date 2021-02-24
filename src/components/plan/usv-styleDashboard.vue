<template>
  <div class="usvStyleDashboard">
    <!-- 通过echats绘制方位角和瞬时的速度 -->
    <!-- 姿态仪方位角 -->
    <div class="usvStyleDashboard-yaw">
      <!-- 三角指针 -->
      <div class="yaw-instructions">
        <div class="yaw-instructions-div"></div>
      </div>
      <echatsCalibration :setmannedDeg="setmannedYawDeg" v-if="setmannedYawDeg" yaw="yaw"></echatsCalibration>
      <!-- <echatsCalibration :setmannedDeg="10"  yaw="yaw"></echatsCalibration> -->

    </div>
    <!-- 姿态仪俯仰角 -->
    <div class="usvStyleDashboard-pitch">
      <!-- 背景海天一色 -->
      <div id="usvStyleDashboard-pitch-style" class="usvStyleDashboard-pitch-style" ref="bgImgStyle">
        <!-- 仪表刻度 -->
        <div class="backgroundImg">
          <div class="backgroundImg-top">
            <div v-for="i in calibrationNumber / 2" :key="i" class="backgroundImg-listDiv">
              <span v-if="(i - 1) % 2 == 0">{{ (calibrationNumber / 2 + 1 - i) * 5 }}</span>
              <div
                :class="{
                  'backgroundImg-top-short': (i - 1) % 2 != 0,
                  'backgroundImg-top-long': (i - 1) % 2 == 0,
                  'backgroundImg-top-long3': (i - 1) % 4 == 0
                }"
              ></div>
              <span v-if="(i - 1) % 2 == 0">{{ (calibrationNumber / 2 + 1 - i) * 5 }}</span>
            </div>
          </div>

          <div class="backgroundImg-center">
            <div class="backgroundImg-center-line"></div>
          </div>

          <div class="backgroundImg-bottom">
            <div v-for="i in calibrationNumber / 2" :key="i" class="backgroundImg-listDiv">
              <span v-if="i % 2 == 0">{{ i * 5 }}</span>
              <div
                :class="{
                  'backgroundImg-top-short': i % 2 != 0,
                  'backgroundImg-top-long': i % 2 == 0,
                  'backgroundImg-top-long3': i % 4 == 0
                }"
              ></div>
              <span v-if="i % 2 == 0">{{ i * 5 }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 船体指示 -->
      <div class="usvShip" ref="usvShip">
        <div class="usvShip-left"></div>
        <div class="usvShip-right"></div>
      </div>
    </div>

    <!-- 姿态仪翻滚角 -->
    <div class="usvStyleDashboard-yaw">
      <!-- 三角指针 -->
      <div class="yaw-instructions">
        <div class="yaw-instructions-div"></div>
      </div>
      <div class="usvStyleDashboard-roll">
        <echatsCalibration :setmannedDeg="setmannedRollDeg" v-if="setmannedRollDeg"></echatsCalibration>
        <!-- <echatsCalibration :setmannedDeg="20"></echatsCalibration> -->

      </div>
    </div>
  </div>
</template>

<script>
import echatsCalibration from '@/components/plan/echatsCalibration';
export default {
  name: 'usvStyleDashboard',
  props: {
    // 船只瞬时速度
    setmanned: {
      type: Object
    }
  },
  components: {
    echatsCalibration
  },
  data() {
    return {
      setmannedYawDeg: null,
      setmannedRollDeg: null,
      // 刻度数据
      calibrationNumber: 72,
      calibrationHeight: 15
      // 角度改变
    };
  },
  methods: {
    // 俯仰角变化，数据改变
    // 根据获取的船信息进行图像操作
    usvTransform(obj) {
      let _this = this;
      let reotate, oldRotate;

      return function() {
        if (_this.setmanned) {
          // 当方位角小于0
          if (_this.setmanned.roll < 0) {
            reotate = 360 + _this.setmanned.roll;
          } else {
            reotate = _this.setmanned.roll;
          }
          // 当这是第一次获取方位角时
          if (oldRotate === '') {
            oldRotate = Math.abs(reotate);
            _this.$refs.usvShip.style.transform = 'perspective(800px) translate(-50%, -32%) rotateX(70deg) rotateY(' + reotate + 'deg)';
            return;
          }
          // 判断船体方位角旋转方式 （差值小于180 顺时针，大于180逆时针）
          if (Math.abs(oldRotate - reotate) > 180) {
            if (reotate <= 180) {
              reotate = 360 + reotate;
            } else {
              reotate = reotate - 360;
            }
          }
          // 绘制船体方位角

          _this.$refs.usvShip.style.transition = 'all 0.5s linear';
          // this.$refs.usvShip.style.transform = `rotate(${reotate}deg)`;

          _this.$refs.usvShip.style.transform = 'perspective(800px) translate(-50%, -32%) rotateX(70deg) rotateY(' + reotate + 'deg)';
          //修改方位角的值，固定子360以内
          if (reotate > 360) {
            oldRotate = reotate % 360;
            let deg = oldRotate;
            setTimeout(() => {
              _this.$refs.usvShip.style.transition = 'none';
              _this.$refs.usvShip.style.transform = 'perspective(800px) translate(-50%, -32%) rotateX(70deg) rotateY(' + deg + 'deg)';
            }, 100);
          } else if (reotate < 0) {
            oldRotate = reotate + 360;
            let deg = oldRotate;
            setTimeout(() => {
              _this.$refs.usvShip.style.transition = 'none';
              _this.$refs.usvShip.style.transform = 'perspective(800px) translate(-50%, -32%) rotateX(70deg) rotateY(' + deg + 'deg)';
            }, 100);
          } else {
            oldRotate = reotate;
          }
        }
      };
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick().then(() => {
      this.$refs.bgImgStyle.style.height = `${(this.calibrationNumber + 1) * this.calibrationHeight}px`;
    });
  },
  destroyed() {},
  watch: {
    setmanned: {
      handler() {
        this.setmannedYawDeg = this.setmanned.yaw;
        this.setmannedRollDeg = this.setmanned.roll;
        this.$refs.usvShip.style.transform =
          'perspective(800px) translate(-50%, -32%) rotateX(70deg) rotateY(' + this.setmanned.roll + 'deg)';
        // let fun = this.usvTransform();
        // fun();
        // 一个刻盘5度之间间隔15px左右
        this.$refs.bgImgStyle.style.marginTop = parseFloat(this.setmanned.pitch.toFixed(2)) * (15 / 5) + 'px';
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.usvStyleDashboard {
  width: 100%;
  height: 100%;
}
// 设置船只方位角和速度
.usvStyleDashboard-yaw {
  width: 100%;
  height: 45px;
  overflow: hidden;
  position: relative;
}
// 船只翻滚角
.usvStyleDashboard-roll {
  position: absolute;
  bottom: 0;
  width: 100%;
}
// 三角指示
.yaw-instructions {
  position: absolute;
  width: 10px;
  height: 10px;
  margin-left: 50%;
  transform: translateX(-50%);
}
.yaw-instructions > .yaw-instructions-div {
  border-style: solid;
  border-width: 10px 5px 0 5px;
  border-color: #333 transparent transparent transparent;
  width: 0px;
  height: 0px;
}

// 俯仰角
.usvStyleDashboard-pitch {
  box-sizing: border-box;
  position: relative;
  height: 200px;
  width: 200px;
  overflow: hidden;
  border-radius: 25px;
  background: #fff;
  color: #ccc;
}
// 刻度
.usvStyleDashboard-pitch-style {
  width: 100%;
  background: linear-gradient(180deg, #2a78cb 50%, #79661a 50%);
  position: absolute;
  top: 50%;
  transform: translateY(-50%) rotate(0deg);
  width: 100%;
  transition: all 1s linear;
}
.backgroundImg {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  transition: all 1s inherit;
}
.backgroundImg-listDiv,
.backgroundImg-center {
  // 每个div高20px，共计25个
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.backgroundImg-top-short,
.backgroundImg-top-long,
.backgroundImg-top-long2,
.backgroundImg-top-long3 {
  border-top: 1px solid #ccc;
}
.backgroundImg-center-line {
  border-top: 1px solid #fff;
  width: 100%;
}
.backgroundImg-top-short {
  width: 20%;
}

.backgroundImg-top-long {
  width: 30%;
}
.backgroundImg-top-long2 {
  width: 40%;
}
.backgroundImg-top-long3 {
  width: 50%;
}
.transparent {
  border: 1px solid transparent;
}
.usvShip {
  width: 30px;
  height: 37px;
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 0.8;
  transition: all 0.5s linear;
  transform-style: preserve-3d;
  transform: perspective(800px) translate(-50%, -32%) rotateX(70deg) rotateY(0deg);
}
.usvShip-left {
  width: 50%;
  height: 100%;
  transform: rotate(45deg);
  background: #fff;
  float: left;
}
.usvShip-right {
  width: 50%;
  height: 100%;
  transform: rotate(-45deg);
  background: #fff;
  float: left;
}
</style>
