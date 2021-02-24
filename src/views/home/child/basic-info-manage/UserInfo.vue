<template>
  <div>
    <Breadcrumb :dataList="breadcrumbList"></Breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8" class="add-user-col">
          <!-- 搜索功能需要每次搜索的时候将page重置为1 -->
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="userQuery.condition.keyword"
            clearable
            @change="changeUserData"
          >
            <el-button slot="append" icon="el-icon-search" @click="changeUserData"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userInfoList" border stripe v-loading="loading">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="用户名" prop="userName"></el-table-column>
        <el-table-column label="昵称" prop="displayName"></el-table-column>
        <el-table-column label="所属机构" prop="organization.name"></el-table-column>
        <el-table-column label="角色" prop="role">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.role == 1" type="danger">系统管理员</el-tag>
            <el-tag v-if="scope.row.role == 2" type="warning">单位管理员</el-tag>
            <el-tag v-if="scope.row.role == 4">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="170">
          <template slot-scope="scope">
            <!-- 下拉菜单 -->
            <el-dropdown
              @command="handleCommand"
              placement="bottom-start"
              @visible-change="getUserByid(scope)"
            >
              <el-button type="primary" size="mini">
                编辑
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="userInfo">修改信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button type="danger" size="mini" @click="deleteUser(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页效果 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userQuery.page"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="userQuery.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加dialog -->
    <el-dialog title="添加用户" :visible.sync="addlogVisible" width="30%" center @close="closeAdd">
      <el-form ref="addFormRef" label-width="110px" :rules="addRules" :model="addFrom">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addFrom.userName" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="displayName">
          <el-input v-model="addFrom.displayName" placeholder="请输入昵称" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addFrom.password"
            placeholder="请输入密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="addFrom.confirmPassword"
            placeholder="请输入密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="角色" required prop="role">
          <el-select placeholder="请选择" v-model="addFrom.role" clearable>
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织机构" prop="organizationId">
          <el-select placeholder="请选择" v-model="addFrom.organizationId" clearable>
            <el-option
              v-for="item in organInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserInfo" :loading="addUserLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改信息dialog -->
    <el-dialog title="编辑用户" :visible.sync="editlogVisible" width="30%" center>
      <el-form ref="editFormRef" label-width="110px" :rules="editRules" :model="editFrom">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editFrom.userName" clearable></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="displayName">
          <el-input v-model="editFrom.displayName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色" required prop="role">
          <el-select placeholder="请选择" v-model="editFrom.role" clearable>
            <el-option
              v-for="item in roleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织机构" prop="organizationId">
          <el-select placeholder="请选择" v-model="editFrom.organizationId" clearable>
            <el-option
              v-for="item in organInfoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser" :loading="editUserInfoLoading">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改密码dialog -->
    <el-dialog
      title="修改密码"
      :visible.sync="editPasswordlogVisible"
      width="30%"
      center
      @close="closeeditPassword"
    >
      <el-form
        ref="editPasswordFormRef"
        label-width="110px"
        :rules="editPasswordRules"
        :model="editPasswordFrom"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="editPasswordFrom.oldPassword" clearable></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="editPasswordFrom.newPassword" clearable></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="editPasswordFrom.confirmPassword" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPasswordlogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPassword" :loading="editPasswordLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Breadcrumb from 'common/Breadcrumb';
// 节流函数
import { throttle } from '@/utils/common';
// 事件总线
import bus from '@/components/common/bus';
export default {
  name: 'UserInfo',
  data() {
    // 自定义校验规则
    var checkPassword = (rule, value, cb) => {
      //验证机构名称是否合法
      const regPassword = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}/;
      if (regPassword.test(value)) {
        return cb();
      }
      cb(new Error('密码必须包含数字、大/小写字符、特殊符号且在8位以上'));
    };
    var checkConfirmPassword = (rule, value, cb) => {
      //验证机构名称是否合法
      const regPassword = this.addFrom.confirmPassword == this.addFrom.password ? true : false;
      if (regPassword) {
        return cb();
      }
      cb(new Error('两次输入密码不一致'));
    };
    var checkEditConfirmPassword = (rule, value, cb) => {
      //验证机构名称是否合法
      const regPassword =
        this.editPasswordFrom.confirmPassword == this.editPasswordFrom.newPassword ? true : false;
      if (regPassword) {
        return cb();
      }
      cb(new Error('两次输入密码不一致'));
    };
    return {
      getUserLoading: true,
      addUserLoading: false,
      editPasswordLoading: false,
      editUserInfoLoading: false,
      // 分页数据查询条件
      userQuery: {
        // 全局模糊查询条件
        condition: {
          keyword: '',
        },
        // 当前页数
        page: 1,
        // 一页上显示多少条
        size: 5,
      },
      userInfoList: [],
      organInfoList: [],
      roleList: [
        {
          value: 2,
          label: '单位管理员',
        },
        {
          value: 4,
          label: '普通用户',
        },
      ],
      total: 0,
      // 加载中loading
      loading: true,
      addFrom: {
        userName: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        organizationId: null,
        role: null,
      },
      viewFrom: {
        userName: '',
        organization: {},
        organizationId: null,
        password: '',
        displayName: '',
      },
      editFrom: {
        userName: '',
        displayName: '',
        organizationId: null,
        role: null,
      },
      editPasswordFrom: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      addlogVisible: false,
      viewlogVisible: false,
      editlogVisible: false,
      editPasswordlogVisible: false,
      breadcrumbList: ['基本信息管理', '用户信息管理'],
      // 验证规则
      addRules: {
        userName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 4,
            max: 16,
            message: '用户名必须为4位以上,16位以下',
            trigger: 'blur',
          },
        ],
        displayName: [
          {
            required: true,
            message: '请输入昵称',
            trigger: 'blur',
          },
          {
            min: 4,
            max: 16,
            message: '昵称必须为4位以上,16位以下',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            validator: checkPassword,
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          {
            validator: checkConfirmPassword,
            trigger: 'blur',
          },
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
      },
      editRules: {
        userName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 4,
            max: 16,
            message: '用户名必须为4位以上,16位以下',
            trigger: 'blur',
          },
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
        displayName: [
          {
            required: true,
            message: '请输入昵称',
            trigger: 'blur',
          },
          {
            min: 4,
            max: 16,
            message: '昵称必须为4位以上,16位以下',
            trigger: 'blur',
          },
        ],
      },
      editPasswordRules: {
        oldPassword: [{ required: true, message: '请输入原始密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            validator: checkPassword,
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          {
            validator: checkEditConfirmPassword,
            trigger: 'blur',
          },
        ],
      },
    };
  },
  props: {},
  methods: {
    async getUserData() {
      var query = this.userQuery.condition.keyword;
      var page = this.userQuery.page;
      var size = this.userQuery.size;
      const { data: res } = await this.$http.get(
        `/user/query?Condition.Keyword=${query}&Page=${page}&Size=${size}`
      );
      this.getUserLoading = false;
      if (res.errorCode) {
        this.$meessage.error(`${res.Message}`);
      } else {
        this.userInfoList = res.data.result;
        this.total = res.data.total;
        this.loading = false;
      }
    },
    //    <!-- 搜索功能需要每次搜索的时候将page重置为1 -->
    changeUserData() {
      // 将page重置为1
      this.userQuery.page = 1;
      this.getUserData();
    },
    async getOrganData() {
      const { data: res } = await this.$http.get('/organization/all');
      if (!res.errorCode) {
        this.organInfoList = res.data;
      }
    },
    handleSizeChange(newSize) {
      this.userQuery.size = newSize;
      this.getUserData();
    },
    handleCurrentChange(newPage) {
      this.userQuery.page = newPage;
      this.getUserData();
    },
    addUserInfo() {
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          this.addUserLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.addUserLoading = loading;
          });
          const { data: res } = await this.$http.post('/user/add', this.addFrom);
          if (!res.errorCode) {
            this.getUserData();
            this.addlogVisible = false;
            this.$message.success('添加用户成功');
          }
        }
      });
    },
    editUser() {
      this.$refs.editFormRef.validate(async val => {
        if (val) {
          this.editUserInfoLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.editUserInfoLoading = loading;
          });
          const { data: res } = await this.$http.post('/user/modifyuser', this.editFrom);
          if (!res.errorCode) {
            this.$message.success('更新数据成功');
            this.getUserData();
            this.editlogVisible = false;
          }
        }
      });
    },
    editPassword: throttle(function() {
      this.btnEditPassword();
    }, 3000),
    btnEditPassword() {
      this.$refs.editPasswordFormRef.validate(async val => {
        if (val) {
          this.editPasswordLoading = true;
          // 通过事件总线来获取axios响应拦截器中得loading数据,来控制本页面得loading值,
          // 如果直接使用this.loading,那么请求非200的时候按钮得disable会一直存在,为了防止请求非200导致解构赋值报错最好写在解构赋值前面
          bus.$on('loading', ({ loading }) => {
            this.editPasswordLoading = loading;
          });
          const { data: res } = await this.$http.post(
            '/user/modifypassword',
            this.editPasswordFrom
          );
          console.log(res);
          if (!res.errorCode) {
            this.editPasswordlogVisible = false;
            this.$message.success('修改密码成功');
          }
        }
      });
    },
    showAddUser() {
      this.addlogVisible = true;
    },
    async showViewInfo(scope) {
      const { data: res } = await this.$http.get(`/user/get?id=${scope.row.id}`);
      if (!res.errorCode) {
        this.viewFrom = res.data;
      }
      this.viewlogVisible = true;
    },
    async deleteUser(scope) {
      const confirmRlust = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch(err => err);
      if (confirmRlust == 'confirm') {
        const { data: res } = await this.$http.post(`/user/delete?id=${scope.row.id}`);
        if (!res.errorCode) {
          this.$message.success('删除用户成功');
          this.getUserData();
        }
      } else {
        this.$message.info('取消了删除');
      }
    },
    closeAdd() {
      this.$refs.addFormRef.resetFields();
    },
    closeeditPassword() {
      this.$refs.editPasswordFormRef.resetFields();
    },
    // 下拉框选择的是谁
    handleCommand(command) {
      if (command == 'userInfo') {
        this.editlogVisible = true;
      }
      if (command == 'password') {
        this.editPasswordlogVisible = true;
      }
    },
    //点击编辑时把数据赋值给editform
    async getUserByid(scope) {
      const { data: res } = await this.$http.get(`/user/get?id=${scope.row.id}`, scope.row.id);
      if (!res.errorCode) {
        this.editFrom = res.data;
        this.editPasswordFrom.id = res.data.id;
      }
    },
  },
  created() {
    this.getUserData();
    this.getOrganData();
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
.add-user-col {
  margin-right: 30px;
}
.el-dropdown {
  margin-right: 10px;
}
</style>
