<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item,i) in dataList" :key="i">{{item}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>
<script>
export default {
  name: "Breadcrumb",
  data () {
    return {}
  },
  props: {
    dataList: Array,
  },
  methods: {},
  created () { },
  components: {},
  computed: {},
  beforeMount () { },
  mounted () { 
  },
  watch: {},
}
</script>
<style lang="less" scoped>
</style>
