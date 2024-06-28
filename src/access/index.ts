import router from "@/router";
import store from "@/store";
import ACCESS_ENUM from "@/access/accessEnum";
import checkAccess from "@/access/checkAccess";

router.beforeEach(async (to, from, next) => {
  //TODO 每次浏览器刷新，就会把store中的数据清除，后续要改成持久化存储
  await store.dispatch("user/getLoginUser");
  console.log("登录用户信息", JSON.stringify(store.state.user.loginUser));
  const loginUser = store.state.user.loginUser;

  //如果之前没有登录过，自动登录
  if (!loginUser || !loginUser.userRole) {
    //加上await是为了等待用户登录成功之后，再执行后续的代码
    await store.dispatch("user/getLoginUser");
  }
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  // 要跳转的页面必须登录
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 如果没登录
    if (!loginUser || !loginUser.userRole) {
      next(`/user/login?redirect=${to.path}`);
      return;
    }
    //如果已经登录了，但是权限不足，，那么跳转到无权限页面
    if (!checkAccess(loginUser, needAccess)) {
      next("noAuth");
      return;
    }
  }
  next();
});
