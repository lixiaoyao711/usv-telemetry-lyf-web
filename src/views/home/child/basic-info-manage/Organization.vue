<template>
  <div>
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddOrganization">添加组织机构</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="organInfoList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="组织机构名称" prop="name"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="warning" size="mini" @click="showEditOrgan(scope)">编辑</el-button>
            <el-button type="primary" size="mini" @click="showViewInfo(scope)">查看</el-button>
            <el-button type="danger" size="mini" @click="deleteOrgan(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页效果 -->
    </el-card>
    <!-- 添加dialog -->
    <el-dialog
      title="添加组织机构"
      :visible.sync="addlogVisible"
      width="30%"
      center
      @close="closeAdd"
    >
      <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
        <el-form-item label="组织机构名称" prop="name">
          <el-input v-model="addFrom.name" placeholder="请输入组织机构名称" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrganInfo" :loading="addLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑dialog -->
    <el-dialog
      title="编辑组织机构"
      :visible.sync="editlogVisible"
      width="30%"
      center
      @close="closeEdit"
    >
      <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
        <el-form-item label="组织机构名称" prop="name">
          <el-input v-model="editFrom.name" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrgan" :loading="editOrganLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看dialog -->
    <el-dialog title="组织机构信息" :visible.sync="viewlogVisible" width="30%" center>
      <el-form ref="viewFormRef" label-width="110px" :model="viewFrom">
        <el-form-item label="组织机构名称" required>
          <el-input v-model="viewFrom.name" readonly></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="viewlogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Breadcrumb from 'common/Breadcrumb';

// 事件总线
import bus from '@/components/common/bus';

export default {
  name: 'Organization',
  data() {
    // 自定义校验规则
    var checkChinese = (rule, value, cb) => {
      //验证机构名称是否合法
      const regChinese = /^[\u4E00-\u9FA5]+$/;
      if (regChinese.test(value)) {
        return cb();
      }
      cb(new Error('请输入合法的组织机构名称'));
    };
    return {
      addLoading: false,
      editOrganLoading: false,
      value: '',
      editlogVisible: false,
      addlogVisible: false,
      viewlogVisible: false,
      breadcrumbList: ['基本信息管理', '组织机构管理'],
      organInfoList: [],
      addFrom: {
        name: '',
      },
      editFrom: {
        name: '',
      },
      viewFrom: {
        name: '',
      },
      // 验证规则
      addRules: {
        name: [
          { required: true, message: '请输入船只名称', trigger: 'blur' },
          {
            validator: checkChinese,
            trigger: 'blur',
          },
        ],
      },
      editRules: {
        name: [{ required: true, message: '请输入船只名称', trigger: 'blur' }],
      },
    };
  },
  props: {},
  methods: {
    async getOrgandata() {
      const { data: res } = await this.$http.get('/organization/all');
      // console.log(res);
      if (!res.errorCode) {
        this.organInfoList = res.data;
      }
    },
    showAddOrganization() {
      this.addlogVisible = true;
    },
    async showEditOrgan(scope) {
      const { data: res } = await this.$http.get(
        `/organization/get?id=${scope.row.id}`,
        scope.row.id
      );
      console.log(res);
      if (!res.errorCode) {
        this.editFrom = res.data;
      }
      this.editlogVisible = true;
    },
    async showViewInfo(scope) {
      const { data: res } = await this.$http.get(
        `/organization/get?id=${scope.row.id}`,
        scope.row.id
      );
      if (!res.errorCode) {
        this.viewFrom = res.data;
      }
      this.viewlogVisible = true;
    },
    addOrganInfo() {
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          this.addLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.addLoading = loading;
          });
          const { data: res } = await this.$http.post('/organization/add', this.addFrom);
          if (!res.errorCode) {
            this.$message.success('添加组织机构成功!');
            this.getOrgandata();
            this.addlogVisible = false;
          }
        }
      });
    },
    editOrgan() {
      this.$refs.editFormRef.validate(async val => {
        if (val) {
          this.editOrganLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.editOrganLoading = loading;
          });
          const { data: res } = await this.$http.post('/organization/update', this.editFrom);
          if (!res.errorCode) {
            this.$message.success('更新数据成功!');
            this.getOrgandata();
            this.editlogVisible = false;
          }
        }
      });
    },
    async deleteOrgan(scope) {
      const confirmRlust = await this.$confirm('此操作将永久删除该船只, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/organization/delete?id=${scope.row.id}`);
        if (!res.errorCode) {
          this.$message.success('删除成功!');
          this.getOrgandata();
        }
      } else {
        this.$message.info('取消了删除!');
      }
    },
    closeAdd() {
      this.$refs.addFormRef.resetFields();
    },
    closeEdit() {
      this.$refs.editFormRef.resetFields();
      this.editFrom = {};
    },
  },
  created() {
    this.getOrgandata();
  },
  components: {
    Breadcrumb,
  },
  computed: {},
  beforeMount() {},
  mounted() {},
  watch: {},
};
</script>
<style lang="less" scoped>
.el-col {
  margin-right: 30px;
}
</style>
