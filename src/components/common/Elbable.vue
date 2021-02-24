<template>
  <div>
    <el-table :data="dataList" border stripe>
      <el-table-column type="index" label="#"></el-table-column>

      <el-table-column v-for="(item,i) in typeList" :key="i" :label="item" :prop="propsData[i]"></el-table-column>
      <!-- <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="warning" size="mini" @click="showEditShip(scope)">编辑</el-button>
          <el-button type="primary" size="mini" @click="showViewInfo(scope)">查看</el-button>
          <el-button type="danger" size="mini" @click="deleteShip(scope)">删除</el-button>
        </template>
      </el-table-column>-->
    </el-table>
  </div>
</template>
<script>
export default {
  name: "Elbable",
  data () {
    return {
      propsData: []
    }
  },
  props: {
    dataList: Array,
    typeList: Array
  },
  methods: {
    // 取出数据的属性
    getProps () {
      this.propsData = Object.keys(this.dataList[0])
    }
  },
  created () {
    this.getProps()
  },
  components: {},
  computed: {},
  beforeMount () { },
  mounted () { },
  watch: {},
}
</script>
<style lang="less" scoped>
</style>
