// 项目发布阶段需要用到的babel插件
const prodPlugins=[]
// 发布阶段
if (process.env.NODE_ENV=='production') {
  console.log(process.env.NODE_ENV);
  // 如果处于发布阶段将transform-remove-console,push给prodPlugins.    ~~~~~需要先安装babel-plugin-transform-remove-console
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins:[
    // 发布产品时候的插件数组
    ...prodPlugins
    // 打包时解封
    // 'transform-remove-console'
  ]
}
