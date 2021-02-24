<template>
  <!-- 执行计划页面 -->
  <div class="ViewRunStatus" style="zIndex=1000">
    <actionPlanInfo :planId="planId" :usvId="usvId" :routePath="routePath"></actionPlanInfo>
  </div>
</template>

<script>
import actionPlanInfo from '@/components/plan/ActionPlan-info';
export default {
  name: 'ViewRunStatus',
  components: {
    actionPlanInfo
  },
  data() {
    return {
      // 传入的id值
      planId: this.$route.query.planId,
      usvId: this.$route.query.usvId,
      routePath: this.$route.query.routePath,
    };
  },
  computed: {},
  methods: {},
  created() {
    console.log(this.usvId);
  },
  mounted() {
    // console.log(this.$route.fullPath);
  },
  // 销毁当前实例清除掉定时器
  destroyed() {
    console.log('被销毁了');
  },

  watch: {}
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
.ViewRunStatus {
  width: 100%;
  height: 100%;
}
</style>
