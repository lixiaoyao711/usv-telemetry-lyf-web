<template>
  <!-- 计划中数个无人船信息展示 左边 -->
  <div class="ampm-Unmanned-ship-information-left">
    <el-table :data="tableData" style="width: 100%" highlight-current-row height="100%" @row-click="handleCurrentChange" ref="singleTable">
      <el-table-column type="index" width="50" label="索引"> </el-table-column>
      <el-table-column prop="displayName" label="姓名"> </el-table-column>
      <el-table-column prop="organization.name" label="地址" width="130"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ampm-Unmanned-ship-information-left',
  props: ['tableData'],
  data() {
    return {
      currentRow: null
    };
  },
  methods: {
    // 点击信息显示
    handleCurrentChange(val) {
      this.currentRow = val;
      // 点击获取当前计划的具体信息，用以传递信息
      if (val.id) {
        this.getShipIfor(val);
      } else {
        this.$message.error('当前信息没有无人船id');
      }
    },
    // 清除
    clearTable() {
      this.$refs.singleTable.setCurrentRow();
      this.currentRow = '';
    },
    // 点击后根据无人船的id进行信息显示
    async getShipIfor(row) {
      const { data: res } = await this.$http.get(`/plan/getexecutioncontext?usvId=${row.id}`);
      if (res.errorCode) {
        console.log(`正在查看一个无人船的具体信息`);
        this.$message.error(`${res.message}`);

        this.$emit('getcur', row);
      } else {
        // 获取到无人船具体信息，返回信息给父组件
        this.$emit('getcur', res.data);
      }
    },
    
  },
  created() {
  }
};
</script>

<style lang="less" scoped>
li {
  list-style: none;
}
// div通用样式设置
.information {
  position: absolute;
  top: 0;

  border-radius: 0 0 4px 4px;
  padding: 0;
  overflow: auto;
}
.ampm-Unmanned-ship-information-left {
  .information;
  left: 0;
  height: 280px;
  background: rgba(150, 150, 150, 0.5);
}
/deep/th .gutter {
  width: 0px !important;
}
/deep/.el-table__body {
  margin: 0;
}
/deep/tbody {
  width: 100%;
}
/deep/.el-table {
  background-color: transparent;
  color: #fff;
  margin: 0;
}
/deep/.el-table tr {
  color: #fff;
  background-color: rgba(150, 150, 150, 0.5);
}
/deep/.el-table tr:hover {
  color: #333;
}
/deep/.el-table th {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.3) !important;
}
/deep/.current-row {
  color: #333 !important;
  background-color: rgba(250, 250, 250, 0.2) !important;
}
</style>
