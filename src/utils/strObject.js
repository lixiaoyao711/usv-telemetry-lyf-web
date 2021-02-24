// 转换格式
export default function trun(str) {
  if (typeof str == 'string') {
    let location = { latitude: '', longitude: '' }
    let strs = str.split(',');
    location.latitude = strs[0];
    location.longitude = strs[1];
    return location
  } else if (typeof str == 'object') {
    if (str.latitude) {
      var objs = `${str.latitude},${str.longitude}`
    } else {
      var objs = `${str[1]},${str[0]}`
    }
    return objs
  }
}
