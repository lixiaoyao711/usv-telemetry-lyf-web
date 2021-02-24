// import request from '../utils/request';

// export const fetchData = query => {
//     return request({
//         url: './table.json',
//         method: 'get',
//         params: query
//     });
// };

export  function returnMessage(message) {
    let errorMessage
    switch (message) {
        case 400:
            errorMessage = "请求错误"
            break;
        case 403:
            errorMessage = "请求错误"
            break;
        case 404:
            errorMessage = "请求错误,未找到资源"
            break;
        case 405:
            errorMessage = "请求方法未允许"
            break;
        case 408:
            errorMessage = "请求超时"
            break;
        case 500:
            errorMessage = "服务器出错"
            break;
        case 501:
            errorMessage = "网络未实现"
            break;
        case 502:
            errorMessage = "网络错误"
            break;
        case 503:
            errorMessage = "服务不可用"
            break;
        case 504:
            errorMessage = "网络超时"
            break;
        case 505:
            errorMessage = "http版本不支持该请求"
            break;
        default:
            errorMessage="网络出现问题,请稍后重试"
            break;
    }
    return errorMessage
}