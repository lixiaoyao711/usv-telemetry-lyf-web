<template>
  <!-- 执行计划页面 -->
  <div class="actionplan" style="zIndex=1000">
    <actionPlanInfo :usvId="usvId" ref="actionPlanInfo"></actionPlanInfo>
  </div>
</template>

<script>
import actionPlanInfo from '@/components/plan/ActionPlan-info';

// 事件总线
import bus from '@/components/common/bus';
export default {
  name: 'actionplan',
  components: {
    actionPlanInfo
  },
  data() {
    return {
      usvId: this.$route.query.usvId,
      isOnLoad: false,
      DisconnectMessage: ''
    };
  },
  computed: {},
  methods: {
    // 强制销毁
    setDestroy() {
      this.$destroy();
    }
  },
  created() {
    console.log('actionplan创建中=============');
  },
  mounted() {
    if (!this.isOnLoad) {
      this.$refs.actionPlanInfo.createdRun();
    }
    bus.$on('Disconnect', ({ message }) => {
      this.DisconnectMessage = message;
    });
    bus.$on('setDestroy', data => {
      let fullUsvid = data.tagsList[data.index].path.slice(data.tagsList[data.index].path.indexOf('?') + 7);
      if (fullUsvid === this.usvId) {
        this.setDestroy();
      }
    });
  },
  // 销毁当前实例清除掉定时器
  destroyed() {
    console.log('actionplan销毁中=============');
  },

  activated() {
    if (this.isOnLoad) {
      this.$refs.actionPlanInfo.createdRun();
    } else {
      this.isOnLoad = !this.isOnLoad;
    }
  },

  watch: {
    DisconnectMessage() {
      if (this.DisconnectMessage) {
        this.$message.error(this.DisconnectMessage);
      }
      console.log(this.DisconnectMessage);
      this.DisconnectMessage = '';
    }
  }
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
.actionplan {
  width: 100%;
  height: 100%;
}
</style>
