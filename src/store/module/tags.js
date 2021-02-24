import router from '@/router/index'

export default {
  // vueX中的数据最好用commit在vueX中修改,可以实时追踪修改的值,否则vue调试工具不会记录state的变化，无法调试
  state: {
    VuexTagsList: [],
  },
  mutations: {
    // 关闭单个标签
    closeTags(state, playold) {
      const delItem = state.VuexTagsList.splice(playold.index, 1)[0];
      const item = state.VuexTagsList[playold.index] ? state.VuexTagsList[playold.index] : state.VuexTagsList[playold.index - 1];
      if (item) {
        delItem.path === playold.full && router.push(item.path);
      } else {
        router.push('/');
      }
    },
    // 关闭全部标签
    closeAll(state) {
      state.VuexTagsList.splice(0, state.VuexTagsList.length);
      router.push('/');
    },
    // 关闭其他标签
    closeOther(state, playold) {
      const curItem = state.VuexTagsList.filter(item => {
        return item.path == playold;
      });
      state.VuexTagsList.splice(0, state.VuexTagsList.length);
      state.VuexTagsList.push(curItem[0])
    },
    // 设置标签
    // 标签的meta属性在路由中设置,
    setTags(state, route) {
      // 当路径相同时不存入数组
      const isExist = state.VuexTagsList.some(item => {
        return item.path === route.fullPath;
      });
      if (!isExist) {
        // if (state.VuexTagsList.length >= 8) {
        //   state.VuexTagsList.shift();
        // }
        state.VuexTagsList.push({
          title: route.meta.title,
          path: route.fullPath,
          name: route.matched[1].components.default.name
        });
      }
      // if (state.VuexTagsList.length >= 8) {
      //   state.VuexTagsList.shift();
      // }
    },
    // 修改指定标签的title
    updateTagsTitle(state, route) {
      state.VuexTagsList.forEach((element, index) => {
        if (element.path === route.fullPath) {
          element.title = route.meta.title
        }
      });
    },
    // 监听遍历
    VueXForTags(state) {
      for (let i = 0; i < state.VuexTagsList.length; i++) {
        for (let x = i + 1; x < state.VuexTagsList.length; x++) {
          if (state.VuexTagsList[i].name == state.VuexTagsList[x].name) {
            // state.VuexTagsList.splice(i, 1);
            // console.log('名字相同了=======暂时不做操作');
          }
        }
      }
    },
    // 删除指定
    VueXSplice(state, playlod) {
      state.VuexTagsList.splice(playlod, 1)
    },
    // 停止计划退出删除指定
    VueXDeleteTags(state, playlod) {
      state.VuexTagsList.forEach((element, index) => {
        if (element.path === playlod) {
          // 删除后跳转到前面一个信息
          // router.push(state.VuexTagsList[index-1].path);
          let full = state.VuexTagsList[index].path
          this.commit('closeTags',{index,full})
          state.VuexTagsList.splice(index, 1)
        }
      });
      
    }
  },
  actions: {
    updateTagsTitleActions(context, route) {
      context.commit('updateTagsTitle', route)
    }
  }
}


