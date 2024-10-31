// initial state
import { StoreOptions } from "vuex";
import ACCESS_ENUM from "@/access/accessEnum";
import { UserControllerService } from "../../generated";
//TODO 每次浏览器刷新，就会把store中的数据清除，后续要改成持久化存储
export default {
  namespaced: true,
  state: () => ({
    loginUser: {
      userName: "",
      userRole: ACCESS_ENUM.NOT_LOGIN,
    },
  }),
  actions: {
    async getLoginUser({ commit, state }, payload) {
      // 从远程登录获取信息
      const res = await UserControllerService.getLoginUserUsingGet();
      if (res.code === 0) {
        commit("updateUser", res.data);
        localStorage.setItem("loginUser", JSON.stringify(res.data));
      } else {
        const user = {
          ...state.loginUser,
          userRole: ACCESS_ENUM.NOT_LOGIN,
        };
        commit("updateUser", user);
        localStorage.setItem("loginUser", JSON.stringify(user));
      }
    },
  },
  mutations: {
    updateUser(state, payload) {
      state.loginUser = payload;
    },
  },
} as StoreOptions<any>;
