// module.exports = {
//     baseUrl: './',
//     assetsDir: 'static',
//     productionSourceMap: false,
//     configureWebpack: {
//         resolve: {
//           alias: {
//             'components': '@/components',
//             'common': 'components/common',
//             'assets': '@/assets',
//             'network': '@/network',
//             'views': '@/views',
//           }
//         }
//       },
//     devServer: {
//         proxy: {
//             '/api':{
//                 target:'http://jsonplaceholder.typicode.com',
//                 changeOrigin:true,
//                 pathRewrite:{
//                     '^/api':''
//                 }
//             }
//         }
//     }
// }

module.exports = {
  // 打包时需要配置该三个选项
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV !== 'production',
  productionSourceMap: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      // 重定义路径
      alias: {
        components: '@/components',
        common: 'components/common',
        assets: '@/assets',
        network: '@/network',
        views: '@/views'
      }
    }
  },
  devServer: {
    open: false, //npm run server后是否自动打开项目
    port: '8080', //npm run server 的本地端口
    https: false,
    hotOnly: false,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_PATH, //环境变量控制访问地址
        // target:'https://usv.tongji.cq.cn/',   //'http://192.168.110.224:8766',  //访问的后端服务器地址    ----接口的前半段
        changeOrigin: true, //是否跨域
        pathRewrite: {
          // '^/api':'/api'   //路径重写 --作用不大,可以省略
        }
      }
    }
  }
};
