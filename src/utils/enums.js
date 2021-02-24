let UsvStates = new Map([
    [0, "离线"], 
    [1, "空闲"],
    [2, "手动巡航"],
    [3, "自动巡航"],
    [4, "返航"],
    [5, "锁定"]
]);

let PlanStates = new Map([
    [0, "已创建"], 
    [1, "就绪"],
    [2, "巡航中"],
    [3, "返航中"],
    [4, "已完成"]
]);

let ReturnModes = new Map([
    [1, "直线返航"], 
    [2, "原路返航"],
]);

let ChannelRouters = new Map([
    [0, "自动规划"], 
    [1, "手动规划"],
]);
      // 多条船只显示不同的颜色数组
let strokeColorList = new Map([
    [0,'#ff3838'],
    [1,'#2ecc71'],
    [2,'#2980b9'],
    [3,'#16a085'],
    [4,'#8e44ad'],
    [5,'#2c3e50'],
    [6,'#f1c40f'],
    [7,'#e74c3c'],
    [8,'#67e6dc'],
    [9,'#3d3d3d']

])

let colorArray = new Map([
    ['A','#f44336bb'],
    ['B','#E91E63bb'],
    ['C','#9C27B0bb'],
    ['D','#673AB7bb'],
    ['E','#3F51B5bb'],
    ['F','#2196F3bb'],
    ['G','#03A9F4bb'],
    ['H','#00BCD4bb'],
    ['I','#009688bb'],
    ['J','#4CAF50bb'],
    ['K','#8BC34Abb'],
    ['L','#CDDC39bb'],
    ['M','#546E7Abb'],
    ['N','#FFC107bb'],
    ['O','#FF9800bb'],
    ['P','#FF5722bb'],
    ['Q','#795548bb'],
    ['R','#9E9E9Ebb'],
    ['S','#607D8Bbb'],
    ['T','#FF80ABbb'],
    ['U','#AEEA00bb'],
    ['V','#18FFFFbb'],
    ['W','#B388FFbb'],
    ['X','#004D40bb'],
    ['Y','#E65100bb'],
    ['Z','#FFEB3Bbb'],
  ]);

export default {
    usvState: val => UsvStates.get(val),
    planState: val => PlanStates.get(val),
    channelRouter:val=>ChannelRouters.get(val),
    returnMode: val => ReturnModes.get(val),
    strokeColorList:val=>strokeColorList.get(val),
    colorArray:val=>colorArray.get(val)

};